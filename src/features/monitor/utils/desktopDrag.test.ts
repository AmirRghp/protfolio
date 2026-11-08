import { describe, expect, it } from "vitest";
import { clampWindowRect, maximizedWindowRect, moveWindowRect, type WindowRect } from "./desktopDrag";

const bounds = { width: 1000, height: 600, top: 30 };

describe("desktop window geometry", () => {
  it("keeps a window inside the desktop and below the status bar", () => {
    const rect: WindowRect = { x: 120, y: 80, width: 500, height: 300 };

    expect(clampWindowRect({ ...rect, x: -200, y: -200 }, bounds)).toEqual({ ...rect, x: 0, y: 30 });
    expect(clampWindowRect({ ...rect, x: 900, y: 500 }, bounds)).toEqual({ ...rect, x: 500, y: 300 });
    expect(clampWindowRect(rect, bounds)).toEqual(rect);
  });

  it("shrinks a window that no longer fits after the desktop gets smaller", () => {
    const rect: WindowRect = { x: 600, y: 300, width: 400, height: 300 };

    expect(clampWindowRect(rect, { width: 320, height: 240, top: 24 })).toEqual({
      x: 0,
      y: 24,
      width: 320,
      height: 216,
    });
  });

  it("fills the workspace below the status bar when it is maximized", () => {
    expect(maximizedWindowRect(bounds)).toEqual({ x: 0, y: 30, width: 1000, height: 570 });
  });

  it("moves a window by a delta and clamps the destination", () => {
    const rect: WindowRect = { x: 100, y: 100, width: 300, height: 200 };

    expect(moveWindowRect(rect, 40, 25, bounds)).toEqual({ ...rect, x: 140, y: 125 });
    expect(moveWindowRect(rect, 5000, 5000, bounds)).toEqual({ ...rect, x: 700, y: 400 });
    expect(moveWindowRect(rect, -5000, -5000, bounds)).toEqual({ ...rect, x: 0, y: 30 });
  });
});
