export const ROOM_FOV = 40;

/** Overview camera height; raised to look down across the zoomed-in desktop workspace. */
export const ROOM_OVERVIEW_CAMERA_Y = 4.45;

/** The overview aims below eye level so the tabletop in front of the monitor fills the lower frame. */
export const ROOM_OVERVIEW_TARGET_Y = 2.95;

/** Leftward shift and rightward yaw angle (radians) for the curved monitor on the desk. */
export const MONITOR_SCENE_POSITION: [number, number, number] = [-1.35, 0, 0.22];
export const MONITOR_YAW = 0.48;

/** Computes the world-space center and outward normal of the tilted monitor display surface. */
export function monitorScreenPose() {
  const [px, py, pz] = MONITOR_SCENE_POSITION;
  const cos = Math.cos(MONITOR_YAW);
  const sin = Math.sin(MONITOR_YAW);
  const localX = -0.25;
  const localY = 3.754;
  const localZ = -0.25;
  return {
    center: [
      px + localX * cos + localZ * sin,
      py + localY,
      pz - localX * sin + localZ * cos,
    ] as [number, number, number],
    normal: [sin, 0, cos] as [number, number, number],
    right: [cos, 0, -sin] as [number, number, number],
  };
}

/**
 * How long the camera takes to travel between two room destinations. The close monitor view and
 * the room overview are far apart, and a short travel reads as a jump instead of a camera move.
 */
export const ROOM_TRANSITION_SECONDS = 0.7;

export function roomCameraDistance(aspect: number) {
  // Zoomed-in framing closer to the desk so the angled monitor, desk peripherals, and arcade
  // fill the viewport with generous headroom for smooth cursor-driven camera panning.
  const halfFov = (ROOM_FOV * Math.PI) / 360;
  return Math.max(2.62 / Math.tan(halfFov), 4.42 / (Math.tan(halfFov) * aspect)) * 1.03 + 0.92;
}

/** The fixed overview pose: raised, gently pitched down, with the aspect-dependent distance. */
export function roomOverviewPose(aspect: number) {
  return {
    position: [0, ROOM_OVERVIEW_CAMERA_Y, roomCameraDistance(aspect)] as [number, number, number],
    target: [0, ROOM_OVERVIEW_TARGET_Y, 0] as [number, number, number],
  };
}

/**
 * Cursor-driven camera offset in the zoomed-in overview, giving a lush horizontal and vertical
 * glide across the desk similar to the Shopify BFCM 2025 interactive scene.
 */
export function roomParallaxOffset(x: number, y: number) {
  return {
    x: Math.max(-1, Math.min(1, x)) * 0.56,
    y: Math.max(-1, Math.min(1, y)) * 0.24,
  };
}

/**
 * Coordinated look-at target shift paired with the camera position parallax so the view pans
 * and gently turns into the cursor movement across the workspace.
 */
export function roomParallaxTargetOffset(offset: { x: number; y: number }) {
  return {
    x: offset.x * 1.15,
    y: offset.y * 0.85,
  };
}

/** Smooth-damp time constant while tracking the pointer inside the room overview. */
export const ROOM_PARALLAX_SMOOTH_TIME = 0.135;

/** Faster smooth-damp time constant when returning to the neutral center around controls or blur. */
export const ROOM_PARALLAX_RETURN_SMOOTH_TIME = 0.05;

export type IdleParallaxState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

/**
 * Critically-damped second-order spring (SmoothDamp / maath damp) so pointer changes accelerate
 * smoothly from the current velocity instead of jerking on the first frame.
 */
export function dampValue(
  current: number,
  target: number,
  velocity: number,
  smoothTime: number,
  delta: number,
  eps = 0.0008,
): { value: number; velocity: number; settled: boolean } {
  const tau = Math.max(0.0001, smoothTime);
  const omega = 2 / tau;
  const velocityEps = eps * Math.max(4, omega * 1.5);
  if (Math.abs(target - current) <= eps && Math.abs(velocity) <= velocityEps) {
    return { value: target, velocity: 0, settled: true };
  }
  const dt = Math.min(Math.max(delta, 1 / 240), 0.5);
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (velocity + omega * change) * dt;
  const nextVelocity = (velocity - omega * temp) * exp;
  const nextValue = target + (change + temp) * exp;
  if (target - current > 0 === nextValue > target) {
    return { value: target, velocity: 0, settled: true };
  }
  if (Math.abs(target - nextValue) <= eps && Math.abs(nextVelocity) <= velocityEps) {
    return { value: target, velocity: 0, settled: true };
  }
  return { value: nextValue, velocity: nextVelocity, settled: false };
}

/**
 * Advances the 2D idle camera parallax state by one frame using critically-damped spring physics.
 */
export function stepIdleParallax(
  state: IdleParallaxState,
  target: { x: number; y: number },
  delta: number,
  smoothTime?: number,
): IdleParallaxState & { settled: boolean } {
  const isReturningToCenter = target.x === 0 && target.y === 0;
  const effectiveSmoothTime =
    smoothTime ?? (isReturningToCenter ? ROOM_PARALLAX_RETURN_SMOOTH_TIME : ROOM_PARALLAX_SMOOTH_TIME);
  const stepX = dampValue(state.x, target.x, state.vx, effectiveSmoothTime, delta);
  const stepY = dampValue(state.y, target.y, state.vy, effectiveSmoothTime, delta);
  return {
    x: stepX.value,
    y: stepY.value,
    vx: stepX.velocity,
    vy: stepY.velocity,
    settled: stepX.settled && stepY.settled,
  };
}

/**
 * Quintic smootherstep easing for intentional camera focus transitions, eliminating acceleration
 * discontinuities at the start and end of a move.
 */
export function easeCameraTransition(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Slightly heavier spring time constant for the mechanical keyboard's secondary sway. */
export const ROOM_KEYBOARD_SWAY_SMOOTH_TIME = 0.145;

/** Lighter, more agile spring time constant for the mouse's secondary sway. */
export const ROOM_MOUSE_SWAY_SMOOTH_TIME = 0.105;

export type DeskPropSway = {
  dx: number;
  dz: number;
  dPitch: number;
  dYaw: number;
  dRoll: number;
};

/**
 * Advances the spring state for a desk peripheral (keyboard or mouse) and computes its subtle
 * positional and rotational sway from both spring displacement and instantaneous velocity.
 */
export function stepDeskPropSway(
  prop: "keyboard" | "mouse",
  state: IdleParallaxState,
  target: { x: number; y: number },
  delta: number,
): { state: IdleParallaxState & { settled: boolean }; sway: DeskPropSway } {
  const isReturningToCenter = target.x === 0 && target.y === 0;
  const activeSmoothTime =
    prop === "keyboard" ? ROOM_KEYBOARD_SWAY_SMOOTH_TIME : ROOM_MOUSE_SWAY_SMOOTH_TIME;
  const nextState = stepIdleParallax(
    state,
    target,
    delta,
    isReturningToCenter ? ROOM_PARALLAX_RETURN_SMOOTH_TIME : activeSmoothTime,
  );
  return {
    state: nextState,
    sway: deskPropSwayTransform(prop, nextState),
  };
}

/**
 * Maps a peripheral's spring displacement and velocity into subtle tabletop translation and
 * gasket-like micro-tilt so the keyboard and mouse feel tactile as the camera moves.
 */
export function deskPropSwayTransform(
  prop: "keyboard" | "mouse",
  state: IdleParallaxState,
): DeskPropSway {
  if (state.x === 0 && state.y === 0 && state.vx === 0 && state.vy === 0) {
    return { dx: 0, dz: 0, dPitch: 0, dYaw: 0, dRoll: 0 };
  }
  if (prop === "keyboard") {
    return {
      dx: state.x * 0.18,
      dz: -state.y * 0.22,
      dPitch: state.y * 0.08 + state.vy * 0.02,
      dYaw: state.x * 0.14 + state.vx * 0.015,
      dRoll: -state.x * 0.06 - state.vx * 0.018,
    };
  }
  return {
    dx: state.x * 0.28,
    dz: -state.y * 0.32,
    dPitch: state.y * 0.1 + state.vy * 0.025,
    dYaw: -state.x * 0.22 - state.vx * 0.022,
    dRoll: -state.x * 0.08 - state.vx * 0.022,
  };
}


