import { describe, expect, it } from "vitest";
import { ROOM_TRANSITION_SECONDS, roomCameraDistance, roomParallaxOffset } from "./roomCamera";

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

  it("gives the camera travel enough time to read as a move", () => {
    expect(ROOM_TRANSITION_SECONDS).toBeGreaterThanOrEqual(0.6);
    expect(ROOM_TRANSITION_SECONDS).toBeLessThanOrEqual(0.8);
  });

  it("moves back for a narrow frame without changing the view direction", () => {
    expect(roomCameraDistance(1)).toBeGreaterThan(roomCameraDistance(16 / 9));
  });

  it("limits idle pointer movement and keeps its center neutral", () => {
    expect(roomParallaxOffset(0, 0)).toEqual({ x: 0, y: 0 });
    expect(roomParallaxOffset(1, 1)).toEqual({ x: 0.12, y: 0.06 });
    expect(roomParallaxOffset(-2, -3)).toEqual({ x: -0.12, y: -0.06 });
  });
});
