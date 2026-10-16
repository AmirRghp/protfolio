import { describe, expect, it } from "vitest";
import { roomCameraDistance } from "./roomCamera";

describe("fixed room framing", () => {
  it("fits the room width and height at every target viewport", () => {
    const tangent = Math.tan((40 * Math.PI) / 360);
    for (const width of [320, 375, 768, 1024, 1440]) {
      const aspect = width / Math.max(240, width * 9 / 16);
      const distance = roomCameraDistance(aspect);
      const visibleHeightAtFront = 2 * (distance - 2.5) * tangent;
      expect(visibleHeightAtFront).toBeGreaterThan(6);
      expect(visibleHeightAtFront * aspect).toBeGreaterThan(12);
    }
  });

  it("moves back for a narrow frame without changing the view direction", () => {
    expect(roomCameraDistance(1)).toBeGreaterThan(roomCameraDistance(16 / 9));
  });
});
