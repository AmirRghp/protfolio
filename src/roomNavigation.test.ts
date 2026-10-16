import { describe, expect, it } from "vitest";
import { initialRoomNavigation, roomNavigationReducer } from "./roomNavigation";

describe("room navigation", () => {
  it("selects each destination and returns to the overview", () => {
    for (const destination of ["monitor", "board", "arcade"] as const) {
      const focused = roomNavigationReducer(initialRoomNavigation, { type: "navigate", destination });
      expect(focused.destination).toBe(destination);
      expect(roomNavigationReducer(focused, { type: "navigate", destination: "room" })).toEqual(initialRoomNavigation);
    }
  });

  it("only keeps a valid selected project while the board is active", () => {
    const board = roomNavigationReducer(initialRoomNavigation, { type: "navigate", destination: "board" });
    const selected = roomNavigationReducer(board, { type: "select-project", projectId: "enterprise-knowledge-copilot" });

    expect(selected.selectedProjectId).toBe("enterprise-knowledge-copilot");
    expect(roomNavigationReducer(selected, { type: "navigate", destination: "monitor" }).selectedProjectId).toBeNull();
    expect(roomNavigationReducer(board, { type: "select-project", projectId: "missing-project" })).toBe(board);
    expect(roomNavigationReducer(initialRoomNavigation, { type: "select-project", projectId: "enterprise-knowledge-copilot" })).toBe(initialRoomNavigation);
  });

  it("replaces the current destination on quick selection", () => {
    const board = roomNavigationReducer(initialRoomNavigation, { type: "navigate", destination: "board" });
    const selected = roomNavigationReducer(board, { type: "select-project", projectId: "enterprise-knowledge-copilot" });
    const arcade = roomNavigationReducer(selected, { type: "navigate", destination: "arcade" });

    expect(arcade).toEqual({ destination: "arcade", selectedProjectId: null });
  });
});
