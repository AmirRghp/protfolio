import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Deparkanoid from "./Deparkanoid";
import {
  BRICK_H,
  BRICK_W,
  buildBricksForLevel,
  DEPARKANOID_LEVELS,
  GAME_H,
  GAME_W,
  TOTAL_LEVELS,
  bindDeparkanoidWindowListeners,
  type DeparkanoidInputState,
} from "./deparkanoidLevels";

describe("Deparkanoid 5 Levels Configuration", () => {
  it("defines exactly 5 distinct levels", () => {
    expect(TOTAL_LEVELS).toBe(5);
    expect(DEPARKANOID_LEVELS).toHaveLength(5);

    const levelNumbers = DEPARKANOID_LEVELS.map((lvl) => lvl.levelNumber);
    expect(levelNumbers).toEqual([1, 2, 3, 4, 5]);
  });

  it("ensures each level map has 11 columns per row and valid dimensions", () => {
    DEPARKANOID_LEVELS.forEach((level) => {
      expect(level.map.length).toBeGreaterThan(0);
      expect(level.map.length).toBeLessThanOrEqual(16);

      level.map.forEach((row, rowIndex) => {
        expect(
          row.length,
          `Level ${level.levelNumber} row ${rowIndex} should have 11 columns`
        ).toBe(11);
      });
    });
  });

  it("builds valid bricks for every level within game boundaries", () => {
    for (let i = 0; i < TOTAL_LEVELS; i++) {
      const bricks = buildBricksForLevel(i);
      expect(bricks.length).toBeGreaterThan(0);

      bricks.forEach((brick) => {
        expect(brick.w).toBe(BRICK_W);
        expect(brick.h).toBe(BRICK_H);
        expect(brick.x).toBeGreaterThanOrEqual(0);
        expect(brick.x + brick.w).toBeLessThanOrEqual(GAME_W);
        expect(brick.y).toBeGreaterThanOrEqual(0);
        expect(brick.y + brick.h).toBeLessThanOrEqual(GAME_H);
        expect(brick.points).toBeGreaterThan(0);
        expect(brick.c).toBeTruthy();
      });
    }
  });

  it("scales launch speed progressively across the 5 levels", () => {
    for (let i = 0; i < TOTAL_LEVELS - 1; i++) {
      expect(DEPARKANOID_LEVELS[i + 1].launchSpeed).toBeGreaterThan(
        DEPARKANOID_LEVELS[i].launchSpeed
      );
    }
  });

  it("renders Deparkanoid component to static markup without crashing", () => {
    const html = renderToStaticMarkup(<Deparkanoid />);
    expect(html).toContain("<canvas");
    expect(html).toContain('aria-label="Deparkanoid arcade game"');
  });

  it("reacts to global window keydown and keyup events for paddle movement and ball launch", () => {
    const listeners: Record<string, Array<(e: KeyboardEvent) => void>> = {};
    const mockWindow = {
      addEventListener: (type: string, fn: EventListenerOrEventListenerObject) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(fn as (e: KeyboardEvent) => void);
      },
      removeEventListener: (type: string, fn: EventListenerOrEventListenerObject) => {
        listeners[type] = (listeners[type] || []).filter((item) => item !== fn);
      },
      dispatchEvent: (event: { type: string; key: string; preventDefault: () => void }) => {
        for (const fn of listeners[event.type] || []) {
          fn(event as unknown as KeyboardEvent);
        }
        return true;
      },
    };

    const state: DeparkanoidInputState = {
      left: false,
      right: false,
    };

    let launched = false;
    let pausedCount = 0;
    const cleanup = bindDeparkanoidWindowListeners(
      mockWindow as unknown as Pick<Window, "addEventListener" | "removeEventListener">,
      () => state,
      {
        onPrimaryAction: () => { launched = true; },
        onTogglePause: () => { pausedCount += 1; },
      }
    );

    mockWindow.dispatchEvent({ type: "keydown", key: "ArrowLeft", preventDefault: () => {} });
    expect(state.left).toBe(true);

    mockWindow.dispatchEvent({ type: "keyup", key: "ArrowLeft", preventDefault: () => {} });
    expect(state.left).toBe(false);

    mockWindow.dispatchEvent({ type: "keydown", key: "ArrowRight", preventDefault: () => {} });
    expect(state.right).toBe(true);

    mockWindow.dispatchEvent({ type: "keydown", key: " ", preventDefault: () => {} });
    expect(launched).toBe(true);

    mockWindow.dispatchEvent({ type: "keydown", key: "p", preventDefault: () => {} });
    expect(pausedCount).toBe(1);

    cleanup();
    expect(listeners["keydown"]).toHaveLength(0);
    expect(listeners["keyup"]).toHaveLength(0);
  });
});
