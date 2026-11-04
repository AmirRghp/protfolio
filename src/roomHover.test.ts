import { describe, expect, it } from "vitest";
import { backCursorHintPosition, hotspotHintPosition } from "./roomHover";

const tooltip = { width: 120, height: 28 };
const viewport = { width: 1440, height: 900 };

describe("hotspot hint placement", () => {
  it("places the label below and to the right of the cursor", () => {
    expect(hotspotHintPosition({ clientX: 700, clientY: 400 }, tooltip, viewport)).toEqual({
      x: 714,
      y: 418,
    });
  });

  it("keeps the whole label inside every viewport corner", () => {
    const corners = [
      { clientX: 0, clientY: 0 },
      { clientX: viewport.width, clientY: 0 },
      { clientX: 0, clientY: viewport.height },
      { clientX: viewport.width, clientY: viewport.height },
    ];

    for (const corner of corners) {
      const position = hotspotHintPosition(corner, tooltip, viewport);
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.x + tooltip.width).toBeLessThanOrEqual(viewport.width);
      expect(position.y + tooltip.height).toBeLessThanOrEqual(viewport.height);
    }
  });

  it("clamps the label in a narrow viewport", () => {
    expect(hotspotHintPosition(
      { clientX: 310, clientY: 690 },
      { width: 96, height: 24 },
      { width: 320, height: 700 },
    )).toEqual({ x: 212, y: 664 });
  });
});

describe("back cursor hint placement", () => {
  const backTooltip = { width: 80, height: 24 };

  it("places the [Go Back] label below and to the right of the cursor", () => {
    expect(backCursorHintPosition({ clientX: 300, clientY: 200 }, backTooltip, viewport)).toEqual({
      x: 312,
      y: 216,
    });
  });

  it("keeps the [Go Back] label clamped within the viewport margin", () => {
    const corner = { clientX: viewport.width, clientY: viewport.height };
    const position = backCursorHintPosition(corner, backTooltip, viewport);
    expect(position.x + backTooltip.width).toBeLessThanOrEqual(viewport.width - 10);
    expect(position.y + backTooltip.height).toBeLessThanOrEqual(viewport.height - 10);
  });
});
