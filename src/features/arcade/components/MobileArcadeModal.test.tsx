import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import MobileArcadeModal from "./MobileArcadeModal";
import { MOBILE_ARCADE_GAMES } from "@/features/arcade/utils/arcadeData";

describe("MobileArcadeModal component", () => {
  it("does not render when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <MobileArcadeModal isOpen={false} onClose={() => {}} />,
    );
    expect(html).toBe("");
  });

  it("displays the 5 native Canvas games in carousel mode and excludes Crash Bandicoot when open", () => {
    expect(MOBILE_ARCADE_GAMES).toHaveLength(5);

    const html = renderToStaticMarkup(
      <MobileArcadeModal isOpen={true} onClose={() => {}} />,
    );

    expect(html).toContain("NEON POCKET");
    expect(html).toContain("✕ CLOSE");
    expect(html).toContain('aria-label="Mute arcade audio"');
    expect(html).toContain('data-mode="carousel"');

    // Verify all 5 native Canvas games appear in the carousel selector
    expect(html).toContain("Pixel Run");
    expect(html).toContain("Cyber Tetris");
    expect(html).toContain("Snake Grid");
    expect(html).toContain("Deparkanoid");
    expect(html).toContain("Cyber Flappy");

    // Verify Crash Bandicoot is not a selectable tab in the 5-game carousel
    expect(html).not.toContain(">Crash Bandicoot<");
    expect(html).toContain("▶ START GAME");
  });

  it("switches to full-bleed gameplay mode and adapts MobileGamepad when a game is active", () => {
    const onClose = vi.fn();
    const html = renderToStaticMarkup(
      <MobileArcadeModal
        isOpen={true}
        onClose={onClose}
        initialGameId="tetris"
        initialPlaying={true}
      />,
    );

    expect(html).toContain('data-mode="playing"');
    expect(html).toContain('data-testid="mobile-arcade-gameplay"');
    expect(html).toContain("<canvas");
    // Gamepad adapts to tetris controls
    expect(html).toContain("ROTATE");
    expect(html).toContain("HARD DROP");
    expect(html).toContain("HOLD");
  });
});
