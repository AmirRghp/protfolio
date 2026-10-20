import { describe, expect, it } from "vitest";
import { roomCameraDistance } from "./roomCamera";

describe("fixed room framing", () => {
  it("fits the desk width and required scene height at every target viewport", () => {
    const tangent = Math.tan((40 * Math.PI) / 360);
    for (const [width, height] of [[320, 800], [375, 800], [768, 900], [1024, 900], [1440, 900]]) {
      const aspect = width / height;
      const distance = roomCameraDistance(aspect);
      const visibleHeightAtFront = 2 * (distance - 1.3) * tangent;
      expect(visibleHeightAtFront).toBeGreaterThan(4);
      expect(visibleHeightAtFront * aspect).toBeGreaterThan(11.6);
    }
  });

  it("moves back for a narrow frame without changing the view direction", () => {
    expect(roomCameraDistance(1)).toBeGreaterThan(roomCameraDistance(16 / 9));
  });
});
