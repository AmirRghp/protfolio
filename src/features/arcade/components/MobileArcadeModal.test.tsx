import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import MobileArcadeModal from "./MobileArcadeModal";
import {
  ARCADE_HIGH_SCORE_KEYS,
  MOBILE_ARCADE_GAMES,
  readArcadeHighScore,
  saveArcadeHighScore,
} from "@/features/arcade/utils/arcadeData";

describe("MobileArcadeModal component", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does not render when isOpen is false", () => {
    const html = renderToStaticMarkup(
      <MobileArcadeModal isOpen={false} onClose={() => {}} />,
    );
    expect(html).toBe("");
  });

  it("displays the 5 native Canvas games with complete ARIA tabpanel wiring when open", () => {
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

    // Verify ARIA tablist/tab/tabpanel semantics and roving tabindex
    expect(html).toContain('id="mobile-arcade-tab-pixelrun"');
    expect(html).toContain('aria-controls="mobile-arcade-tabpanel"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('id="mobile-arcade-tabpanel"');
    expect(html).toContain('aria-labelledby="mobile-arcade-tab-pixelrun"');

    // Verify Crash Bandicoot is not a selectable tab in the 5-game carousel
    expect(html).not.toContain(">Crash Bandicoot<");
    expect(html).toContain("▶ START GAME");
  });

  it("persists and reads high scores for all 5 mobile canvas games including Deparkanoid", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
      },
    });

    for (const game of MOBILE_ARCADE_GAMES) {
      expect(ARCADE_HIGH_SCORE_KEYS[game.id]).toBeTruthy();
      expect(readArcadeHighScore(game.id)).toBe(0);
      expect(saveArcadeHighScore(game.id, 420)).toBe(420);
      expect(readArcadeHighScore(game.id)).toBe(420);
      // Lower score never overwrites existing high score
      expect(saveArcadeHighScore(game.id, 150)).toBe(420);
      expect(readArcadeHighScore(game.id)).toBe(420);
    }
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
