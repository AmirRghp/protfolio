import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  ROOM_FOV,
  ROOM_OVERVIEW_CAMERA_Y,
  ROOM_OVERVIEW_TARGET_Y,
  ROOM_TRANSITION_SECONDS,
  roomCameraDistance,
  roomOverviewPose,
  roomParallaxOffset,
} from "./roomCamera";

describe("fixed room framing", () => {
  it("fits the room anchors and the desk width behind the new front lip at every target viewport", () => {
    const tangent = Math.tan((40 * Math.PI) / 360);
    for (const [width, height] of [[320, 800], [375, 800], [768, 900], [1024, 900], [1440, 900]]) {
      const aspect = width / height;
      const distance = roomCameraDistance(aspect);
      const visibleHeightAtFront = 2 * (distance - 1.3) * tangent;
      expect(visibleHeightAtFront).toBeGreaterThan(4);
      expect(visibleHeightAtFront * aspect).toBeGreaterThan(11.6);
    }
  });

  it("raises and pitches the overview down, keeping the tabletop and all three destinations in frame", () => {
    const monitorY = 3.754;
    const monitorHalfHeight = 2.136 / 2;
    const monitorHalfWidth = 4.231 / 2;

    for (const [width, height] of [[768, 900], [1024, 768], [1440, 900], [1920, 905]]) {
      const aspect = width / height;
      const pose = roomOverviewPose(aspect);
      expect(pose.position[1]).toBe(ROOM_OVERVIEW_CAMERA_Y);
      expect(pose.target[1]).toBe(ROOM_OVERVIEW_TARGET_Y);
      expect(pose.position[1]).toBeGreaterThan(pose.target[1]);

      const camera = new PerspectiveCamera(ROOM_FOV, aspect, 0.1, 100);
      camera.position.set(...pose.position);
      camera.lookAt(new Vector3(...pose.target));
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();

      const project = (x: number, y: number, z: number) => new Vector3(x, y, z).project(camera);
      const deskFront = project(0, 1.8, 3.7);
      expect(Math.abs(deskFront.x)).toBeLessThan(1);
      expect(Math.abs(deskFront.y)).toBeLessThan(1);
      // The free surface sits between the monitor base and the bottom of the frame.
      expect(deskFront.y).toBeLessThan(project(-0.25, monitorY - monitorHalfHeight, -0.25).y);

      const anchors: [number, number, number][] = [
        [-3.5, 3.65, -1.18],
        [-0.25, monitorY, -0.25],
        [4.35, 3.55, 0],
      ];
      for (const [x, y, z] of anchors) {
        const point = project(x, y, z);
        expect(Math.abs(point.x)).toBeLessThan(1);
        expect(Math.abs(point.y)).toBeLessThan(1);
      }

      for (const x of [-0.25 - monitorHalfWidth, -0.25 + monitorHalfWidth]) {
        for (const y of [monitorY - monitorHalfHeight, monitorY + monitorHalfHeight]) {
          const corner = project(x, y, -0.25);
          expect(Math.abs(corner.x)).toBeLessThan(1);
          expect(Math.abs(corner.y)).toBeLessThan(1);
        }
      }
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
    expect(roomParallaxOffset(1, 1)).toEqual({ x: 0.24, y: 0.12 });
    expect(roomParallaxOffset(-2, -3)).toEqual({ x: -0.24, y: -0.12 });
  });
});
