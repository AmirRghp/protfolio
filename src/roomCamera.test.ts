import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  MONITOR_YAW,
  ROOM_FOV,
  ROOM_OVERVIEW_CAMERA_Y,
  ROOM_OVERVIEW_TARGET_Y,
  ROOM_TRANSITION_SECONDS,
  dampValue,
  easeCameraTransition,
  monitorScreenPose,
  roomCameraDistance,
  roomOverviewPose,
  roomParallaxOffset,
  roomParallaxTargetOffset,
  stepIdleParallax,
} from "./roomCamera";

describe("fixed room framing", () => {
  it("zooms closer to the desk while fitting the tilted monitor and arcade across target viewports", () => {
    const tangent = Math.tan((40 * Math.PI) / 360);
    for (const [width, height] of [[320, 800], [375, 800], [768, 900], [1024, 900], [1440, 900]]) {
      const aspect = width / height;
      const distance = roomCameraDistance(aspect);
      const visibleHeightAtFront = 2 * (distance - 1.3) * tangent;
      expect(visibleHeightAtFront).toBeGreaterThan(3.4);
      expect(visibleHeightAtFront * aspect).toBeGreaterThan(8.5);
    }
    expect(roomCameraDistance(1440 / 900)).toBeLessThan(9.5);
  });

  it("shifts the monitor left and tilts it toward the right while keeping it and the arcade in frame", () => {
    const screenPose = monitorScreenPose();
    const [monitorX, monitorY, monitorZ] = screenPose.center;
    const [rightX, , rightZ] = screenPose.right;
    const monitorHalfHeight = 2.136 / 2;
    const monitorHalfWidth = 4.231 / 2;

    expect(MONITOR_YAW).toBeGreaterThan(0.35);
    expect(monitorX).toBeLessThan(-1.5);
    expect(screenPose.normal[0]).toBeGreaterThan(0.35);

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
      expect(deskFront.y).toBeLessThan(project(monitorX, monitorY - monitorHalfHeight, monitorZ).y);

      const anchors: [number, number, number][] = [
        [monitorX, monitorY, monitorZ],
        [4.35, 3.55, 0],
      ];
      for (const [x, y, z] of anchors) {
        const point = project(x, y, z);
        expect(Math.abs(point.x)).toBeLessThan(1);
        expect(Math.abs(point.y)).toBeLessThan(1);
      }

      for (const signX of [-1, 1]) {
        for (const signY of [-1, 1]) {
          const corner = project(
            monitorX + signX * monitorHalfWidth * rightX,
            monitorY + signY * monitorHalfHeight,
            monitorZ + signX * monitorHalfWidth * rightZ,
          );
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
    expect(roomParallaxTargetOffset({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(roomParallaxTargetOffset({ x: 0.24, y: 0.12 })).toEqual({
      x: 0.24 * 1.15,
      y: 0.12 * 0.85,
    });
  });

  it("smoothly damps pointer parallax with spring velocity and settles cleanly without overshoot", () => {
    const target = roomParallaxOffset(1, -1);
    let state = { x: 0, y: 0, vx: 0, vy: 0 };

    // First frame accelerates gently from zero velocity rather than jumping a large step.
    const first = stepIdleParallax(state, target, 1 / 60);
    expect(first.x).toBeGreaterThan(0);
    expect(first.x).toBeLessThan(target.x * 0.25);
    expect(first.vx).toBeGreaterThan(0);
    expect(first.settled).toBe(false);

    // Second frame moves further than the first because velocity builds smoothly.
    const second = stepIdleParallax(first, target, 1 / 60);
    expect(second.x - first.x).toBeGreaterThan(first.x);

    // Converges cleanly without overshooting the target.
    state = second;
    for (let i = 0; i < 45; i++) {
      state = stepIdleParallax(state, target, 1 / 60);
      expect(state.x).toBeLessThanOrEqual(target.x);
      expect(state.y).toBeGreaterThanOrEqual(target.y);
    }
    expect(state.x).toBe(target.x);
    expect(state.y).toBe(target.y);

    // Returning to neutral center settles within 280ms.
    let resetState = stepIdleParallax(state, { x: 0, y: 0 }, 1 / 60);
    for (let i = 1; i < 17; i++) {
      resetState = stepIdleParallax(resetState, { x: 0, y: 0 }, 1 / 60);
    }
    expect(resetState.x).toBe(0);
    expect(resetState.y).toBe(0);
    expect(resetState.settled).toBe(true);
  });

  it("eases camera transitions smoothly with zero slope at both endpoints", () => {
    expect(easeCameraTransition(0)).toBe(0);
    expect(easeCameraTransition(0.5)).toBe(0.5);
    expect(easeCameraTransition(1)).toBe(1);
    expect(easeCameraTransition(0.05)).toBeLessThan(0.01);
    expect(dampValue(0.24, 0.24, 0, 0.12, 1 / 60).settled).toBe(true);
  });
});
