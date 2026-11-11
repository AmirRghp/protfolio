import { useEffect, useState } from "react";
import fallbackData from "./githubContributionsFallback.json";

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  date: string;
  count: number;
  level: ContributionLevel;
};

export type ContributionCell = {
  date: string;
  count: number;
  level: ContributionLevel;
  weekIndex: number;
  dayIndex: number;
};

export type ContributionWeek = {
  weekIndex: number;
  days: ContributionCell[];
};

export type MonthLabel = {
  month: string;
  weekIndex: number;
  angle: number;
};

export const GITHUB_USERNAME = "AmirRghp";
export const GITHUB_CACHE_KEY = "portfolio_github_contributions_v1";
export const GITHUB_CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

export type CachedContributions = {
  timestamp: number;
  total: number;
  contributions: ContributionDay[];
};

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  if (typeof globalThis !== "undefined" && (globalThis as unknown as { localStorage?: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

const FETCH_TIMEOUT_MS = 8000;

export function getStoredContributions(): { data: CachedContributions; isFresh: boolean } | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(GITHUB_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedContributions>;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.total !== "number" ||
      !Array.isArray(parsed.contributions)
    ) {
      return null;
    }
    const sanitized: ContributionDay[] = [];
    for (const item of parsed.contributions) {
      if (!item || typeof item !== "object" || typeof item.date !== "string") {
        return null;
      }
      const count = Number(item.count ?? 0);
      const level = Math.min(Math.max(Number(item.level ?? 0), 0), 4) as ContributionLevel;
      if (Number.isNaN(count) || Number.isNaN(level)) {
        return null;
      }
      sanitized.push({ date: item.date, count, level });
    }
    const timestamp = typeof parsed.timestamp === "number" ? parsed.timestamp : 0;
    const isFresh = Date.now() - timestamp < GITHUB_CACHE_TTL_MS;
    return {
      data: {
        timestamp,
        total: parsed.total,
        contributions: sanitized,
      },
      isFresh,
    };
  } catch {
    return null;
  }
}

export function saveStoredContributions(total: number, contributions: ContributionDay[]): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    const payload: CachedContributions = {
      timestamp: Date.now(),
      total,
      contributions,
    };
    storage.setItem(GITHUB_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or disabled exceptions
  }
}

export function getFallbackContributions(): { total: number; contributions: ContributionDay[] } {
  const total = fallbackData.total?.lastYear ?? 393;
  const rawContributions = (fallbackData.contributions ?? []) as Array<{ date?: string; count?: number; level?: number }>;
  const contributions: ContributionDay[] = rawContributions.map((item) => ({
    date: item.date ?? "",
    count: item.count ?? 0,
    level: Math.min(Math.max(item.level ?? 0, 0), 4) as ContributionLevel,
  }));
  return { total, contributions };
}

export async function fetchContributions(
  username = GITHUB_USERNAME,
  fetchFn: typeof fetch = typeof fetch !== "undefined" ? fetch : (undefined as unknown as typeof fetch),
): Promise<{ total: number; contributions: ContributionDay[] }> {
  if (!fetchFn) {
    return getFallbackContributions();
  }
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : null;
  try {
    const encodedUser = encodeURIComponent(username.trim());
    const url = `https://github-contributions-api.jogruber.de/v4/${encodedUser}?y=last`;
    const res = controller ? await fetchFn(url, { signal: controller.signal }) : await fetchFn(url);
    if (!res.ok) {
      throw new Error(`API returned HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      total?: { lastYear?: number };
      contributions?: Array<{ date?: string; count?: number; level?: number }>;
    };
    if (!json || !Array.isArray(json.contributions) || json.contributions.length === 0) {
      throw new Error("Invalid contributions payload");
    }

    const contributions: ContributionDay[] = json.contributions.map((item) => ({
      date: String(item.date ?? ""),
      count: Number(item.count ?? 0),
      level: Math.min(Math.max(Number(item.level ?? 0), 0), 4) as ContributionLevel,
    }));

    const total = typeof json.total?.lastYear === "number"
      ? json.total.lastYear
      : contributions.reduce((sum, d) => sum + d.count, 0);

    saveStoredContributions(total, contributions);
    return { total, contributions };
  } catch {
    const cached = getStoredContributions();
    if (cached) {
      return { total: cached.data.total, contributions: cached.data.contributions };
    }
    return getFallbackContributions();
  } finally {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
  }
}

export const MONTH_NAMES_SHORT = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;
export const MONTH_NAMES_TITLE = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

export function parseDateParts(dateStr: string): { year: number; month: number; day: number; weekday: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) return null;
  const [year, month, day] = parts;
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  if (isNaN(utcDate.getTime())) return null;
  return { year, month, day, weekday: utcDate.getUTCDay() };
}

export function formatTooltipDate(dateStr: string): string {
  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr;
  const monthName = MONTH_NAMES_TITLE[parts.month - 1];
  return `${monthName} ${parts.day}, ${parts.year}`;
}

export function formatBestDayDate(dateStr: string): string {
  const parts = parseDateParts(dateStr);
  if (!parts) return dateStr;
  const monthName = MONTH_NAMES_TITLE[parts.month - 1] ?? "";
  return `${parts.day} ${monthName} ${parts.year}`;
}

export function clampUnit(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val));
}

export function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export function resolveSkylineAnimationElapsed(params: {
  now: number;
  startTime: number | null;
  isIntersecting: boolean;
  prefersReduced: boolean;
}): { elapsed: number; nextStartTime: number | null; shouldScheduleNextFrame: boolean } {
  const { now, startTime, isIntersecting, prefersReduced } = params;

  if (prefersReduced) {
    return { elapsed: Infinity, nextStartTime: startTime, shouldScheduleNextFrame: false };
  }

  if (startTime === null) {
    if (!isIntersecting) {
      return { elapsed: 0, nextStartTime: null, shouldScheduleNextFrame: false };
    }
    return { elapsed: 0, nextStartTime: now, shouldScheduleNextFrame: true };
  }

  const elapsed = Math.max(0, now - startTime);
  return {
    elapsed,
    nextStartTime: startTime,
    shouldScheduleNextFrame: elapsed < 4200,
  };
}

export function calculateStreaks(days: ContributionDay[]): { activeStreak: number; longestStreak: number } {
  if (!days || days.length === 0) return { activeStreak: 0, longestStreak: 0 };

  const realDays = days.filter((d) => Boolean(d.date));
  if (realDays.length === 0) return { activeStreak: 0, longestStreak: 0 };

  let longestStreak = 0;
  let running = 0;
  for (const day of realDays) {
    if (day.count > 0) {
      running++;
      if (running > longestStreak) longestStreak = running;
    } else {
      running = 0;
    }
  }

  let activeStreak = 0;
  const lastIndex = realDays.length - 1;
  const lastDay = realDays[lastIndex];

  let startIndex = lastIndex;
  if (lastDay && lastDay.count === 0 && lastIndex > 0) {
    startIndex = lastIndex - 1;
  }

  for (let i = startIndex; i >= 0; i--) {
    if (realDays[i].count > 0) {
      activeStreak++;
    } else {
      break;
    }
  }

  return { activeStreak, longestStreak };
}

export function buildContributionMatrix(days: ContributionDay[], weeksCount = 52): ContributionWeek[] {
  const totalDaysNeeded = weeksCount * 7;
  const realDays = days.filter((d) => Boolean(d.date));

  let alignedDays: ContributionDay[];

  if (realDays.length === 0) {
    alignedDays = Array.from({ length: totalDaysNeeded }, () => ({
      date: "",
      count: 0,
      level: 0,
    }));
  } else {
    const lastDay = realDays[realDays.length - 1];
    const lastParts = parseDateParts(lastDay.date);
    const lastWeekday = lastParts ? lastParts.weekday : 6;

    // Pad trailing days to complete the final week up to Saturday (day 6)
    const trailingPadCount = (6 - lastWeekday + 7) % 7;
    const trailingPadding: ContributionDay[] = Array.from({ length: trailingPadCount }, () => ({
      date: "",
      count: 0,
      level: 0,
    }));

    const daysWithTrailing = [...realDays, ...trailingPadding];

    if (daysWithTrailing.length >= totalDaysNeeded) {
      alignedDays = daysWithTrailing.slice(-totalDaysNeeded);
    } else {
      const leadingPadCount = totalDaysNeeded - daysWithTrailing.length;
      const leadingPadding: ContributionDay[] = Array.from({ length: leadingPadCount }, () => ({
        date: "",
        count: 0,
        level: 0,
      }));
      alignedDays = [...leadingPadding, ...daysWithTrailing];
    }
  }

  const weeks: ContributionWeek[] = [];
  for (let w = 0; w < weeksCount; w++) {
    const weekDays: ContributionCell[] = [];
    for (let d = 0; d < 7; d++) {
      const item = alignedDays[w * 7 + d];
      weekDays.push({
        date: item.date,
        count: item.count,
        level: item.level,
        weekIndex: w,
        dayIndex: d,
      });
    }
    weeks.push({ weekIndex: w, days: weekDays });
  }

  return weeks;
}

export function calculateMonthLabels(
  weeks: ContributionWeek[],
  startAngleRad: number,
  totalAngleRad: number,
): MonthLabel[] {
  type MonthSpan = { month: string; startWeek: number; endWeek: number };
  const spans: MonthSpan[] = [];
  const seenMonths = new Set<string>();
  let currentSpan: MonthSpan | null = null;
  const weekStep = totalAngleRad / Math.max(weeks.length, 1);

  for (let w = 0; w < weeks.length; w++) {
    const week = weeks[w];
    for (const day of week.days) {
      if (!day.date) continue;
      const parts = parseDateParts(day.date);
      if (!parts) continue;
      const monthStr = MONTH_NAMES_SHORT[parts.month - 1];

      if (!currentSpan || currentSpan.month !== monthStr) {
        if (!seenMonths.has(monthStr)) {
          seenMonths.add(monthStr);
          currentSpan = { month: monthStr, startWeek: w, endWeek: w };
          spans.push(currentSpan);
        }
      } else {
        currentSpan.endWeek = w;
      }
      break;
    }
  }

  return spans.map((span) => {
    const midWeek = (span.startWeek + span.endWeek) / 2;
    const angle = startAngleRad + (midWeek + 0.5) * weekStep;
    return {
      month: span.month,
      weekIndex: Math.round(midWeek),
      angle,
    };
  });
}

export function formatContributionDateRange(days: ContributionDay[]): string {
  const realDays = days.filter((d) => Boolean(d.date));
  if (realDays.length === 0) return "LAST YEAR";
  const first = realDays[0].date;
  const last = realDays[realDays.length - 1].date;

  const p1 = parseDateParts(first);
  const p2 = parseDateParts(last);
  if (!p1 || !p2) return "LAST YEAR";

  const m1 = MONTH_NAMES_SHORT[p1.month - 1];
  const m2 = MONTH_NAMES_SHORT[p2.month - 1];

  return `${m1} ${p1.year} TO ${m2} ${p2.year}`;
}

const FAILURE_RETRY_COOLDOWN_MS = 60_000;

export function useContributions(username = GITHUB_USERNAME) {
  const [data, setData] = useState<{ total: number; contributions: ContributionDay[] }>(() => {
    const cached = getStoredContributions();
    if (cached) {
      return { total: cached.data.total, contributions: cached.data.contributions };
    }
    return getFallbackContributions();
  });

  useEffect(() => {
    let unmounted = false;
    let lastAttemptAt = 0;

    const checkAndUpdate = () => {
      const now = Date.now();
      if (now - lastAttemptAt < FAILURE_RETRY_COOLDOWN_MS) {
        return;
      }
      const cached = getStoredContributions();
      if (!cached || !cached.isFresh) {
        lastAttemptAt = now;
        fetchContributions(username).then((result) => {
          if (!unmounted && result) {
            setData(result);
          }
        }).catch(() => {
          // Safe to ignore network failures; fallback / stale cache is already rendered
        });
      }
    };

    checkAndUpdate();

    const intervalId = setInterval(checkAndUpdate, 30 * 60 * 1000);

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkAndUpdate();
      }
    };

    if (typeof document !== "undefined" && document.addEventListener) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    return () => {
      unmounted = true;
      clearInterval(intervalId);
      if (typeof document !== "undefined" && document.removeEventListener) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
    };
  }, [username]);

  return data;
}
