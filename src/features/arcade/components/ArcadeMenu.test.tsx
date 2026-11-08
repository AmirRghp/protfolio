import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ArcadeMenu from "./ArcadeMenu";
import { ARCADE_GAMES, ARCADE_GAME_URL } from "./arcadeData";

describe("ArcadeMenu component", () => {
  it("renders all 6 games and shows Crash Bandicoot with Play option", () => {
    const html = renderToStaticMarkup(<ArcadeMenu active={true} onExit={() => {}} />);

    expect(html).toContain("Crash Bandicoot");
    expect(html).toContain("Pixel Run");
    expect(html).toContain("Cyber Tetris");
    expect(html).toContain("Snake Grid");
    expect(html).toContain("Deparkanoid");
    expect(html).toContain("Cyber Flappy");

    // Check Play game button
    expect(html).toContain("Play game");
    expect(html).toContain("CLOSE [ESC]");
    expect(html).toContain("ARCADE V1.0");
  });

  it("includes all 6 games in the ARCADE_GAMES dataset with appropriate statuses", () => {
    expect(ARCADE_GAMES).toHaveLength(6);

    const crash = ARCADE_GAMES.find((g) => g.id === "crash");
    expect(crash).toBeDefined();
    expect(crash?.playable).toBe(true);
    expect(crash?.badge).toBe("PLAY");

    const pixelrun = ARCADE_GAMES.find((g) => g.id === "pixelrun");
    expect(pixelrun).toBeDefined();
    expect(pixelrun?.playable).toBe(true);
    expect(pixelrun?.badge).toBe("PLAY");
    expect(pixelrun?.title).toBe("Pixel Run");

    const tetris = ARCADE_GAMES.find((g) => g.id === "tetris");
    expect(tetris?.playable).toBe(true);
    expect(tetris?.badge).toBe("PLAY");

    const snake = ARCADE_GAMES.find((g) => g.id === "snake");
    expect(snake?.playable).toBe(true);
    expect(snake?.badge).toBe("PLAY");

    const deparkanoid = ARCADE_GAMES.find((g) => g.id === "deparkanoid");
    expect(deparkanoid?.playable).toBe(true);
    expect(deparkanoid?.badge).toBe("PLAY");

    const flappy = ARCADE_GAMES.find((g) => g.id === "flappy");
    expect(flappy).toBeDefined();
    expect(flappy?.playable).toBe(true);
    expect(flappy?.badge).toBe("PLAY");
  });

  it("defines the authentic PS1FUN crash bandicoot url", () => {
    expect(ARCADE_GAME_URL).toBe("https://www.ps1fun.com/play/crash-bandicoot/1212");
  });
});
