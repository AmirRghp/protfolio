import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildContributionMatrix,
  calculateMonthLabels,
  calculateStreaks,
  fetchContributions,
  formatContributionDateRange,
  getFallbackContributions,
  getStoredContributions,
  GITHUB_CACHE_KEY,
  GITHUB_CACHE_TTL_MS,
  saveStoredContributions,
  type ContributionDay,
} from "./githubContributions";

function createMockStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
}

const mockStorage = createMockStorage();
(globalThis as unknown as { localStorage: Storage }).localStorage = mockStorage;

describe("githubContributions data layer", () => {
  beforeEach(() => {
    mockStorage.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    mockStorage.clear();
    vi.restoreAllMocks();
  });

  describe("calculateStreaks", () => {
    it("handles empty dataset", () => {
      const { activeStreak, longestStreak } = calculateStreaks([]);
      expect(activeStreak).toBe(0);
      expect(longestStreak).toBe(0);
    });

    it("calculates active and longest streaks correctly", () => {
      const days: ContributionDay[] = [
        { date: "2026-01-01", count: 0, level: 0 },
        { date: "2026-01-02", count: 3, level: 1 },
        { date: "2026-01-03", count: 5, level: 2 },
        { date: "2026-01-04", count: 1, level: 1 }, // 3 days streak
        { date: "2026-01-05", count: 0, level: 0 },
        { date: "2026-01-06", count: 2, level: 1 },
        { date: "2026-01-07", count: 4, level: 2 }, // 2 days active
      ];

      const { activeStreak, longestStreak } = calculateStreaks(days);
      expect(longestStreak).toBe(3);
      expect(activeStreak).toBe(2);
    });

    it("preserves active streak when today is zero but yesterday has contributions", () => {
      const days: ContributionDay[] = [
        { date: "2026-01-01", count: 0, level: 0 },
        { date: "2026-01-02", count: 2, level: 1 },
        { date: "2026-01-03", count: 4, level: 2 },
        { date: "2026-01-04", count: 0, level: 0 }, // Today hasn't had commits yet
      ];

      const { activeStreak } = calculateStreaks(days);
      expect(activeStreak).toBe(2);
    });

    it("resets active streak to zero if both today and yesterday are zero", () => {
      const days: ContributionDay[] = [
        { date: "2026-01-01", count: 2, level: 1 },
        { date: "2026-01-02", count: 0, level: 0 },
        { date: "2026-01-03", count: 0, level: 0 },
      ];

      const { activeStreak } = calculateStreaks(days);
      expect(activeStreak).toBe(0);
    });

    it("correctly computes active streak even when trailing empty placeholder days are present", () => {
      const days: ContributionDay[] = [
        { date: "2026-01-01", count: 2, level: 1 },
        { date: "2026-01-02", count: 3, level: 2 },
        { date: "", count: 0, level: 0 }, // placeholder padding day
        { date: "", count: 0, level: 0 }, // placeholder padding day
      ];

      const { activeStreak } = calculateStreaks(days);
      expect(activeStreak).toBe(2);
    });
  });

  describe("buildContributionMatrix", () => {
    it("creates 52 weeks with 7 days each and aligns dayIndex to weekdays", () => {
      const fallback = getFallbackContributions();
      const matrix = buildContributionMatrix(fallback.contributions, 52);
      expect(matrix).toHaveLength(52);
      for (const week of matrix) {
        expect(week.days).toHaveLength(7);
        for (let d = 0; d < 7; d++) {
          expect(week.days[d].dayIndex).toBe(d);
        }
      }
      expect(matrix[0].days[0].dayIndex).toBe(0); // Sunday
      expect(matrix[0].days[6].dayIndex).toBe(6); // Saturday
    });

    it("pads with empty days if input is fewer than 364 days and aligns weekday to dayIndex", () => {
      // 2026-05-01 is a Friday (weekday = 5)
      const mockDays: ContributionDay[] = [
        { date: "2026-05-01", count: 4, level: 2 },
      ];

      const matrix = buildContributionMatrix(mockDays, 52);
      expect(matrix).toHaveLength(52);
      expect(matrix[0].days[0].date).toBe("");
      expect(matrix[51].days[5].count).toBe(4);
      expect(matrix[51].days[5].date).toBe("2026-05-01");
      expect(matrix[51].days[6].date).toBe(""); // Saturday is trailing pad
    });
  });

  describe("formatContributionDateRange", () => {
    it("formats uppercase month and year range deterministically", () => {
      const days: ContributionDay[] = [
        { date: "2025-11-02", count: 0, level: 0 },
        { date: "2026-11-05", count: 7, level: 1 },
      ];

      const range = formatContributionDateRange(days);
      expect(range).toBe("NOV 2025 TO NOV 2026");
    });
  });

  describe("calculateMonthLabels", () => {
    it("identifies exactly 12 unique months across 52 weeks without duplicate top labels", () => {
      const fallback = getFallbackContributions();
      const matrix = buildContributionMatrix(fallback.contributions, 52);
      const labels = calculateMonthLabels(matrix, 0, Math.PI * 2);
      const months = labels.map((l) => l.month);

      expect(months).toHaveLength(12);
      expect(new Set(months).size).toBe(12);
      expect(months).toContain("NOV");
      expect(months).toContain("DEC");
      expect(months).toContain("JAN");
      expect(months).toContain("FEB");
      expect(months).toContain("OCT");
    });
  });

  describe("storage and cache TTL", () => {
    it("reads and writes cached contributions correctly", () => {
      saveStoredContributions(42, [{ date: "2026-01-01", count: 5, level: 2 }]);
      const cached = getStoredContributions();

      expect(cached).not.toBeNull();
      expect(cached?.isFresh).toBe(true);
      expect(cached?.data.total).toBe(42);
      expect(cached?.data.contributions).toHaveLength(1);
    });

    it("flags cache as stale after 4 hours TTL", () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      saveStoredContributions(100, []);

      // Advance by 4 hours + 1 second
      vi.setSystemTime(now + GITHUB_CACHE_TTL_MS + 1000);

      const cached = getStoredContributions();
      expect(cached).not.toBeNull();
      expect(cached?.isFresh).toBe(false);
      expect(cached?.data.total).toBe(100);
    });

    it("returns null if cache is empty or corrupt", () => {
      mockStorage.setItem(GITHUB_CACHE_KEY, "invalid-json");
      expect(getStoredContributions()).toBeNull();
    });
  });

  describe("fetchContributions", () => {
    it("fetches and saves live data when API succeeds", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          total: { lastYear: 393 },
          contributions: [
            { date: "2026-11-04", count: 8, level: 1 },
            { date: "2026-11-05", count: 7, level: 1 },
          ],
        }),
      });

      const result = await fetchContributions("AmirRghp", mockFetch as unknown as typeof fetch);
      expect(result.total).toBe(393);
      expect(result.contributions).toHaveLength(2);

      const stored = getStoredContributions();
      expect(stored?.data.total).toBe(393);
    });

    it("falls back to bundled data if API fails and cache is empty", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network Error"));
      const result = await fetchContributions("AmirRghp", mockFetch as unknown as typeof fetch);

      expect(result.total).toBeGreaterThan(0);
      expect(result.contributions.length).toBeGreaterThan(0);
    });
  });

  describe("getFallbackContributions", () => {
    it("loads bundled fallback dataset", () => {
      const fallback = getFallbackContributions();
      expect(fallback.total).toBe(393);
      expect(fallback.contributions.length).toBeGreaterThanOrEqual(364);
    });
  });
});
