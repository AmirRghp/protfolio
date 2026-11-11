import { describe, expect, it } from "vitest";
import {
  computeColumnGuides,
  computeLoaderProgress,
  computeScannerLinePercent,
  isBlueprintBoxActive,
  LOADER_TEXT_THRESHOLD,
  type BlueprintBox,
} from "./portfolioLoaderUtils";

describe("portfolioLoaderUtils", () => {
  it("computes quadratic ease-in-out loader progress from 0 to 100", () => {
    expect(computeLoaderProgress(0, 3200, true)).toBe(0);
    expect(computeLoaderProgress(1600, 3200, true)).toBe(50);
    expect(computeLoaderProgress(3200, 3200, true)).toBe(100);
  });

  it("caps progress at 92 while document is not yet ready", () => {
    expect(computeLoaderProgress(3200, 3200, false)).toBe(92);
    expect(computeLoaderProgress(3200, 3200, true)).toBe(100);
  });

  it("activates blueprint boxes sequentially across the 4..76 progress window", () => {
    expect(isBlueprintBoxActive(0, 0, 10)).toBe(false);
    expect(isBlueprintBoxActive(4, 0, 10)).toBe(true);
    expect(isBlueprintBoxActive(40, 5, 11)).toBe(true);
    expect(isBlueprintBoxActive(75, 9, 10)).toBe(false);
    expect(isBlueprintBoxActive(76, 9, 10)).toBe(true);
    expect(LOADER_TEXT_THRESHOLD).toBe(86);
  });

  it("computes scanner beam vertical percentage from progress", () => {
    expect(computeScannerLinePercent(0)).toBe(0);
    expect(computeScannerLinePercent(43)).toBe(50);
    expect(computeScannerLinePercent(100)).toBe(100);
  });

  it("computes vertical column guides from the widest scanned box", () => {
    expect(computeColumnGuides([])).toBeNull();

    const boxes: BlueprintBox[] = [
      { kind: "text", x: 120, y: 20, w: 180, h: 24, label: "NAV // 01" },
      { kind: "media", x: 100, y: 64, w: 1240, h: 600, label: "VIEWPORT // ASCII_CORE" },
      { kind: "text", x: 140, y: 180, w: 520, h: 60, label: "IDENTITY // H1" },
    ];
    expect(computeColumnGuides(boxes)).toEqual({ l: 100, r: 1340 });
  });
});
