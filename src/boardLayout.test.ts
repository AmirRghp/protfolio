import { describe, expect, it } from "vitest";
import { boardCardLayout } from "./boardLayout";

describe("project board layout", () => {
  it("places three cards in a centered fixed row", () => {
    expect(boardCardLayout(3)).toEqual([
      { position: [-0.84, 0, 0.2], rotation: [0, 0, -0.035] },
      { position: [0, 0, 0.2], rotation: [0, 0, 0] },
      { position: [0.84, 0, 0.2], rotation: [0, 0, 0.035] },
    ]);
  });

  it("keeps twenty cards inside a deterministic five-by-four grid", () => {
    const layout = boardCardLayout(20);

    expect(layout).toHaveLength(20);
    expect(layout).toEqual(boardCardLayout(20));
    expect(layout[0].position).toEqual([-1.68, 1.02, 0.2]);
    expect(layout[19].position).toEqual([1.68, -1.02, 0.2]);
  });

  it("returns no cards for an empty board", () => {
    expect(boardCardLayout(0)).toEqual([]);
  });
});
