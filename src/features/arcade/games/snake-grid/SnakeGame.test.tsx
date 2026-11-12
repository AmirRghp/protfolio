import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import SnakeGame from "./SnakeGame";
import {
  CELL_SIZE,
  GAME_H,
  GAME_W,
  GRID_COLS,
  GRID_ROWS,
  HUD_ROWS,
  SNAKE_LEVELS,
  TOTAL_SNAKE_LEVELS,
  buildWallsForLevel,
  getSafeSpawnPosition,
  isInSnake,
  isWall,
  bindSnakeWindowListeners,
  type Point,
  type SnakeInputState,
} from "./snakeLevels";

describe("SnakeGame 5-Level Campaign Configuration", () => {
  it("defines exactly 5 distinct levels", () => {
    expect(TOTAL_SNAKE_LEVELS).toBe(5);
    expect(SNAKE_LEVELS).toHaveLength(5);

    const levelNumbers = SNAKE_LEVELS.map((lvl) => lvl.levelNumber);
    expect(levelNumbers).toEqual([1, 2, 3, 4, 5]);
  });

  it("scales difficulty progressively via food targets and speed", () => {
    for (let i = 0; i < TOTAL_SNAKE_LEVELS - 1; i++) {
      const cur = SNAKE_LEVELS[i];
      const next = SNAKE_LEVELS[i + 1];

      // Next level requires more foods to clear
      expect(next.foodTarget).toBeGreaterThan(cur.foodTarget);

      // Next level has faster tick rate (smaller delay)
      expect(next.tickDelayMs).toBeLessThan(cur.tickDelayMs);

      // Next level awards equal or more bonus points
      expect(next.bonusPoints).toBeGreaterThanOrEqual(cur.bonusPoints);
    }
  });

  it("enables golden bonus food specifically on levels 3, 4, and 5", () => {
    expect(SNAKE_LEVELS[0].hasBonusFood).toBe(false);
    expect(SNAKE_LEVELS[1].hasBonusFood).toBe(false);
    expect(SNAKE_LEVELS[2].hasBonusFood).toBe(true);
    expect(SNAKE_LEVELS[3].hasBonusFood).toBe(true);
    expect(SNAKE_LEVELS[4].hasBonusFood).toBe(true);

    expect(SNAKE_LEVELS[2].bonusFoodPoints).toBeGreaterThan(0);
    expect(SNAKE_LEVELS[3].bonusFoodPoints).toBeGreaterThan(0);
    expect(SNAKE_LEVELS[4].bonusFoodPoints).toBeGreaterThan(0);
  });

  it("ensures each level map matches 44 columns by 30 rows", () => {
    SNAKE_LEVELS.forEach((level) => {
      expect(level.map).toHaveLength(GRID_ROWS);
      level.map.forEach((row, rowIndex) => {
        expect(
          row.length,
          `Level ${level.levelNumber} row ${rowIndex} length`
        ).toBe(GRID_COLS);
      });
    });
  });

  it("extracts walls within active arena grid bounds", () => {
    for (let i = 0; i < TOTAL_SNAKE_LEVELS; i++) {
      const walls = buildWallsForLevel(i);
      expect(walls.length).toBeGreaterThan(0);

      walls.forEach((w) => {
        expect(w.x).toBeGreaterThanOrEqual(0);
        expect(w.x).toBeLessThan(GRID_COLS);
        expect(w.y).toBeGreaterThanOrEqual(HUD_ROWS);
        expect(w.y).toBeLessThan(GRID_ROWS);
      });
    }
  });

  it("identifies wall and snake collisions correctly", () => {
    const testWalls: Point[] = [
      { x: 0, y: 2 },
      { x: 10, y: 10 },
    ];
    expect(isWall({ x: 0, y: 2 }, testWalls)).toBe(true);
    expect(isWall({ x: 10, y: 10 }, testWalls)).toBe(true);
    expect(isWall({ x: 5, y: 5 }, testWalls)).toBe(false);

    const testSnake: Point[] = [
      { x: 20, y: 15 },
      { x: 19, y: 15 },
      { x: 18, y: 15 },
    ];
    expect(isInSnake({ x: 20, y: 15 }, testSnake)).toBe(true);
    expect(isInSnake({ x: 19, y: 15 }, testSnake)).toBe(true);
    expect(isInSnake({ x: 25, y: 15 }, testSnake)).toBe(false);
  });

  it("spawns food strictly on unoccupied interior cells", () => {
    const walls = buildWallsForLevel(0);
    const snake: Point[] = [
      { x: 22, y: 15 },
      { x: 21, y: 15 },
      { x: 20, y: 15 },
    ];

    for (let trial = 0; trial < 50; trial++) {
      const foodPos = getSafeSpawnPosition(snake, walls);
      expect(foodPos.x).toBeGreaterThan(0);
      expect(foodPos.x).toBeLessThan(GRID_COLS - 1);
      expect(foodPos.y).toBeGreaterThan(HUD_ROWS);
      expect(foodPos.y).toBeLessThan(GRID_ROWS - 1);

      expect(isWall(foodPos, walls)).toBe(false);
      expect(isInSnake(foodPos, snake)).toBe(false);
    }
  });

  it("verifies grid and pixel dimensions alignment", () => {
    expect(GRID_COLS * CELL_SIZE).toBe(GAME_W);
    expect(GRID_ROWS * CELL_SIZE).toBe(GAME_H);
  });

  it("renders SnakeGame component to static markup without crashing", () => {
    const html = renderToStaticMarkup(<SnakeGame />);
    expect(html).toContain("<canvas");
    expect(html).toContain('aria-label="Snake Grid arcade game"');
  });

  it("reacts to global window keydown events for directional controls and action", () => {
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

    const state: SnakeInputState = {
      mode: "READY",
      dir: { x: 1, y: 0 },
      inputQueue: [],
      lastTick: 0,
    };

    let exited = false;
    const cleanup = bindSnakeWindowListeners(
      mockWindow as unknown as Pick<Window, "addEventListener" | "removeEventListener">,
      () => state,
      { onExit: () => { exited = true; } }
    );

    // Dispatch ArrowUp on window while READY -> transitions to RUNNING and sets upward direction
    mockWindow.dispatchEvent({ type: "keydown", key: "ArrowUp", preventDefault: () => {} });
    expect(state.mode).toBe("RUNNING");
    expect(state.dir).toEqual({ x: 0, y: -1 });

    // Dispatch ArrowLeft while RUNNING -> queues turn
    mockWindow.dispatchEvent({ type: "keydown", key: "ArrowLeft", preventDefault: () => {} });
    expect(state.inputQueue).toEqual([{ x: -1, y: 0 }]);

    // Dispatch 'p' while RUNNING -> toggles to PAUSED, and again -> resumes to RUNNING
    mockWindow.dispatchEvent({ type: "keydown", key: "p", preventDefault: () => {} });
    expect(state.mode).toBe("PAUSED");
    mockWindow.dispatchEvent({ type: "keydown", key: "p", preventDefault: () => {} });
    expect(state.mode).toBe("RUNNING");

    // Dispatch Escape -> triggers exit callback
    mockWindow.dispatchEvent({ type: "keydown", key: "Escape", preventDefault: () => {} });
    expect(exited).toBe(true);

    cleanup();
    expect(listeners["keydown"]).toHaveLength(0);
    expect(listeners["keyup"]).toHaveLength(0);
  });
});
