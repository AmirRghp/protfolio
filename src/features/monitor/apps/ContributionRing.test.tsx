import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContributionRing from "./ContributionRing";
import { formatTooltipDate, type ContributionDay } from "./githubContributions";

const mockDays: ContributionDay[] = Array.from({ length: 364 }, (_, i) => ({
  date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`,
  count: i === 363 ? 5 : i % 3,
  level: ((i === 363 ? 2 : i % 3) % 5) as 0 | 1 | 2 | 3 | 4,
}));

describe("ContributionRing", () => {
  it("renders the SVG ring container and coordinate viewBox", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={150} contributions={mockDays} autoPlay={false} />,
    );

    expect(html).toContain("<svg");
    expect(html).toContain('viewBox="0 0 320 320"');
    expect(html).toContain("Round the year contribution graph");
  });

  it("renders all 52 weeks with 7 days each as SVG paths", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={150} contributions={mockDays} autoPlay={false} />,
    );

    const cellMatches = html.match(/data-cell="true"/g);
    expect(cellMatches).not.toBeNull();
    expect(cellMatches?.length).toBe(364); // 52 * 7 = 364
  });

  it("renders streak metric in the center of the ring", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={393} contributions={mockDays} autoPlay={false} />,
    );

    expect(html).toContain("STREAK");
    expect(html).toContain("d</text>"); // e.g. 1d or 4d
  });

  it("renders total contributions count and label in the meta section", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={393} contributions={mockDays} autoPlay={false} />,
    );

    expect(html).toContain("393");
    expect(html).toContain("CONTRIBUTIONS");
  });

  it("renders replay button with accessible label", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={393} contributions={mockDays} autoPlay={false} />,
    );

    expect(html).toContain("REPLAY");
    expect(html).toContain("aria-label=\"Replay contribution sweep animation\"");
  });

  it("renders month labels around the perimeter", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={393} contributions={mockDays} autoPlay={false} />,
    );

    expect(html).toContain("JAN");
  });

  it("renders the animated sweep hand when autoPlay is true", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={393} contributions={mockDays} autoPlay={true} />,
    );

    expect(html).toContain("sweepHand");
    expect(html).toContain("sweepTip");
  });

  it("omits the sweep hand when autoPlay is false", () => {
    const html = renderToStaticMarkup(
      <ContributionRing total={393} contributions={mockDays} autoPlay={false} />,
    );

    expect(html).not.toContain("sweepHand");
  });

  it("formats tooltip date deterministically without timezone offset", () => {
    expect(formatTooltipDate("2026-01-01")).toBe("Jan 1, 2026");
    expect(formatTooltipDate("2025-11-05")).toBe("Nov 5, 2025");
    expect(formatTooltipDate("")).toBe("");
  });
});
