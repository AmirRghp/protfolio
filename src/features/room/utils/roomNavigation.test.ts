import { describe, expect, it } from "vitest";
import { initialRoomNavigation, roomNavigationReducer } from "./roomNavigation";

describe("room navigation", () => {
  it("selects each destination and returns to the overview", () => {
    for (const destination of ["monitor", "arcade"] as const) {
      const focused = roomNavigationReducer(initialRoomNavigation, { type: "navigate", destination });
      expect(focused.destination).toBe(destination);
      expect(roomNavigationReducer(focused, { type: "navigate", destination: "room" })).toEqual(initialRoomNavigation);
    }
  });

  it("replaces the current destination on quick selection", () => {
    const monitor = roomNavigationReducer(initialRoomNavigation, { type: "navigate", destination: "monitor" });
    const arcade = roomNavigationReducer(monitor, { type: "navigate", destination: "arcade" });

    expect(arcade).toEqual({ destination: "arcade" });
  });

  it("returns same state if navigating to existing destination", () => {
    const monitor = roomNavigationReducer(initialRoomNavigation, { type: "navigate", destination: "monitor" });
    expect(roomNavigationReducer(monitor, { type: "navigate", destination: "monitor" })).toBe(monitor);
  });
});
