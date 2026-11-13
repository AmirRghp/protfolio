import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import MobileGamepad, { GAME_CONTROL_PROFILES } from "./MobileGamepad";
import { pressKey, releaseKey } from "@/features/arcade/utils/arcadeData";

describe("MobileGamepad component & input bridge", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders directional D-Pad buttons when showDpad is true (tetris, snake, deparkanoid)", () => {
    const tetrisHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="tetris" onSelectMenu={() => {}} />,
    );
    expect(tetrisHtml).toContain('aria-label="D-Pad Up"');
    expect(tetrisHtml).toContain('aria-label="D-Pad Down"');
    expect(tetrisHtml).toContain('aria-label="D-Pad Left"');
    expect(tetrisHtml).toContain('aria-label="D-Pad Right"');
    expect(tetrisHtml).toContain("ROTATE");
    expect(tetrisHtml).toContain("HARD DROP");
    expect(tetrisHtml).toContain("HOLD");

    const snakeHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="snake" onSelectMenu={() => {}} />,
    );
    expect(snakeHtml).toContain('aria-label="D-Pad Up"');
    expect(snakeHtml).toContain("START");

    const deparkanoidHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="deparkanoid" onSelectMenu={() => {}} />,
    );
    expect(deparkanoidHtml).toContain('aria-label="D-Pad Left"');
    expect(deparkanoidHtml).toContain("LAUNCH");
  });

  it("hides D-Pad directional buttons and renders contextual action buttons when showDpad is false (flappy, pixelrun)", () => {
    const flappyHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="flappy" onSelectMenu={() => {}} />,
    );
    expect(flappyHtml).not.toContain('aria-label="D-Pad Up"');
    expect(flappyHtml).toContain("FLAP");

    const pixelRunHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="pixelrun" onSelectMenu={() => {}} />,
    );
    expect(pixelRunHtml).not.toContain('aria-label="D-Pad Up"');
    expect(pixelRunHtml).toContain("JUMP");
    expect(pixelRunHtml).toContain("SLIDE");
  });

  it("defines control profiles for all 5 mobile canvas games", () => {
    expect(Object.keys(GAME_CONTROL_PROFILES)).toEqual([
      "flappy",
      "deparkanoid",
      "pixelrun",
      "snake",
      "tetris",
    ]);
  });

  it("dispatches keydown on pressKey with navigator.vibrate(10) and keyup on releaseKey", () => {
    const dispatchedEvents: Array<{ type: string; key: string; code: string }> = [];
    const mockWindow = {
      dispatchEvent: vi.fn((event: Event & { key?: string; code?: string }) => {
        dispatchedEvents.push({
          type: event.type,
          key: event.key ?? "",
          code: event.code ?? "",
        });
        return true;
      }),
    };
    const vibrateSpy = vi.fn();

    vi.stubGlobal("window", mockWindow);
    vi.stubGlobal("navigator", { vibrate: vibrateSpy });

    pressKey(" ", "Space");
    expect(mockWindow.dispatchEvent).toHaveBeenCalledTimes(1);
    expect(dispatchedEvents[0]).toEqual({
      type: "keydown",
      key: " ",
      code: "Space",
    });
    expect(vibrateSpy).toHaveBeenCalledWith(10);

    releaseKey(" ", "Space");
    expect(mockWindow.dispatchEvent).toHaveBeenCalledTimes(2);
    expect(dispatchedEvents[1]).toEqual({
      type: "keyup",
      key: " ",
      code: "Space",
    });
  });

  it("renders MENU and PAUSE controls cleanly across both carousel and active gameplay states", () => {
    const idleHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="tetris" isPlaying={false} onSelectMenu={() => {}} onTogglePause={() => {}} />,
    );
    expect(idleHtml).toContain('aria-label="Return to arcade game menu"');
    expect(idleHtml).toContain('aria-label="Pause or resume game"');

    const activeHtml = renderToStaticMarkup(
      <MobileGamepad activeGameId="tetris" isPlaying={true} onSelectMenu={() => {}} onTogglePause={() => {}} />,
    );
    expect(activeHtml).toContain('aria-label="Pause or resume game"');
  });
});
