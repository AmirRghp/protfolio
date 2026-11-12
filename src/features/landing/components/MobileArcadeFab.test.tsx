import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MobileArcadeFab from "./MobileArcadeFab";
import { computeAssistiveSnapPosition } from "../utils/mobileFabUtils";

describe("MobileArcadeFab AssistiveTouch Glisse button", () => {
  it("renders circular GlisseButton in icon-only mode with accessible label", () => {
    const onClick = vi.fn();
    const html = renderToStaticMarkup(<MobileArcadeFab onClick={onClick} />);

    expect(html).toContain('data-testid="mobile-arcade-fab"');
    expect(html).toContain('aria-label="Play Arcade · 5 Games"');
    expect(html).toContain('data-icon="only"');
    expect(html).toContain("lg-button");
    expect(html).toContain("lg-glass");
    expect(html).toContain("<svg");
  });

  it("computes clamped drag coordinates and snaps to nearest left or right screen edge", () => {
    // Dragged onto left half of a 375x812 mobile screen
    const leftResult = computeAssistiveSnapPosition(80, 320, 375, 812, 58);
    expect(leftResult.clamped).toEqual({ x: 80, y: 320 });
    expect(leftResult.snapped.dockSide).toBe("left");
    expect(leftResult.snapped.x).toBe(14);
    expect(leftResult.snapped.y).toBe(320);

    // Dragged onto right half of a 768x1024 tablet screen
    const rightResult = computeAssistiveSnapPosition(520, 600, 768, 1024, 64);
    expect(rightResult.clamped).toEqual({ x: 520, y: 600 });
    expect(rightResult.snapped.dockSide).toBe("right");
    expect(rightResult.snapped.x).toBe(768 - 64 - 14);
    expect(rightResult.snapped.y).toBe(600);

    // Clamps out-of-bounds top/bottom/side positions safely
    const outOfBounds = computeAssistiveSnapPosition(-50, 10, 375, 812, 58);
    expect(outOfBounds.clamped.x).toBe(14);
    expect(outOfBounds.clamped.y).toBe(76);
  });
});
