export const ROOM_FOV = 40;

/** Overview camera height; high enough to look over the monitor onto the desk. */
export const ROOM_OVERVIEW_CAMERA_Y = 5;

/** The overview aims below eye level so the tabletop in front of the monitor stays in frame. */
export const ROOM_OVERVIEW_TARGET_Y = 3.2;

/**
 * How long the camera takes to travel between two room destinations. The close monitor view and
 * the room overview are far apart, and a short travel reads as a jump instead of a camera move.
 */
export const ROOM_TRANSITION_SECONDS = 0.7;

export function roomCameraDistance(aspect: number) {
  // Fit the 11.6-unit room width at z=1.3, the old desk front. The deeper front lip (z=3.7)
  // may crop at the sides on wide frames; the three destinations stay inside the frame.
  const halfFov = (ROOM_FOV * Math.PI) / 360;
  return Math.max(2 / Math.tan(halfFov), 5.8 / (Math.tan(halfFov) * aspect)) * 1.08 + 1.3;
}

/** The fixed overview pose: raised, gently pitched down, with the aspect-dependent distance. */
export function roomOverviewPose(aspect: number) {
  return {
    position: [0, ROOM_OVERVIEW_CAMERA_Y, roomCameraDistance(aspect)] as [number, number, number],
    target: [0, ROOM_OVERVIEW_TARGET_Y, 0] as [number, number, number],
  };
}

/**
 * The room overview is pitched down over a deep desk, so the old shallow-frame amount read as
 * almost flat. These limits put roughly a percent of foreground travel at the frame corners while
 * keeping the destinations and the scene edges inside the approved R13 frame.
 */
export function roomParallaxOffset(x: number, y: number) {
  return {
    x: Math.max(-1, Math.min(1, x)) * 0.24,
    y: Math.max(-1, Math.min(1, y)) * 0.12,
  };
}

/**
 * Subtle look-at target shift paired with the camera position parallax so the view turns gently
 * into the cursor movement instead of sliding on a flat plane.
 */
export function roomParallaxTargetOffset(offset: { x: number; y: number }) {
  return {
    x: offset.x * 0.22,
    y: offset.y * 0.18,
  };
}

/** Smooth-damp time constant while tracking the pointer inside the room overview. */
export const ROOM_PARALLAX_SMOOTH_TIME = 0.12;

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
  eps = 0.0004,
): { value: number; velocity: number; settled: boolean } {
  const tau = Math.max(0.0001, smoothTime);
  const omega = 2 / tau;
  const velocityEps = eps * Math.max(4, omega * 1.5);
  if (Math.abs(target - current) <= eps && Math.abs(velocity) <= velocityEps) {
    return { value: target, velocity: 0, settled: true };
  }
  const dt = Math.min(Math.max(delta, 1 / 240), 0.1);
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

