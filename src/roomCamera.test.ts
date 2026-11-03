import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  ROOM_FOV,
  ROOM_OVERVIEW_CAMERA_Y,
  ROOM_OVERVIEW_TARGET_Y,
  ROOM_TRANSITION_SECONDS,
  dampValue,
  easeCameraTransition,
  roomCameraDistance,
  roomOverviewPose,
  roomParallaxOffset,
  roomParallaxTargetOffset,
  stepDeskPropSway,
  stepIdleParallax,
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
    expect(roomParallaxTargetOffset({ x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(roomParallaxTargetOffset({ x: 0.24, y: 0.12 })).toEqual({
      x: 0.24 * 0.22,
      y: 0.12 * 0.18,
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

  it("sways the keyboard and mouse with distinct spring inertia and settles cleanly to rest", () => {
    const target = roomParallaxOffset(1, 1);
    let kbState = { x: 0, y: 0, vx: 0, vy: 0 };
    let mouseState = { x: 0, y: 0, vx: 0, vy: 0 };

    const kbStep1 = stepDeskPropSway("keyboard", kbState, target, 1 / 60);
    const mouseStep1 = stepDeskPropSway("mouse", mouseState, target, 1 / 60);

    // The lighter mouse responds faster and glides further than the heavier mechanical keyboard.
    expect(Math.abs(mouseStep1.sway.dx)).toBeGreaterThan(Math.abs(kbStep1.sway.dx));
    expect(Math.abs(mouseStep1.sway.dYaw)).toBeGreaterThan(0);
    expect(Math.abs(kbStep1.sway.dRoll)).toBeGreaterThan(0);

    kbState = kbStep1.state;
    mouseState = mouseStep1.state;
    for (let i = 0; i < 45; i++) {
      kbState = stepDeskPropSway("keyboard", kbState, target, 1 / 60).state;
      mouseState = stepDeskPropSway("mouse", mouseState, target, 1 / 60).state;
    }

    // Returning to neutral center settles both props to exact zero sway within 280ms.
    let kbReturn = stepDeskPropSway("keyboard", kbState, { x: 0, y: 0 }, 1 / 60);
    let mouseReturn = stepDeskPropSway("mouse", mouseState, { x: 0, y: 0 }, 1 / 60);
    for (let i = 0; i < 16; i++) {
      kbReturn = stepDeskPropSway("keyboard", kbReturn.state, { x: 0, y: 0 }, 1 / 60);
      mouseReturn = stepDeskPropSway("mouse", mouseReturn.state, { x: 0, y: 0 }, 1 / 60);
    }
    expect(kbReturn.state.settled).toBe(true);
    expect(mouseReturn.state.settled).toBe(true);
    expect(kbReturn.sway).toEqual({ dx: 0, dz: 0, dPitch: 0, dYaw: 0, dRoll: 0 });
    expect(mouseReturn.sway).toEqual({ dx: 0, dz: 0, dPitch: 0, dYaw: 0, dRoll: 0 });
  });
});


