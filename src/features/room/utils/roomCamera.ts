export const ROOM_FOV = 40;

/** Overview camera height; raised to look down across the zoomed-in desktop workspace. */
export const ROOM_OVERVIEW_CAMERA_Y = 4.45;

/** The overview aims below eye level so the tabletop in front of the monitor fills the lower frame. */
export const ROOM_OVERVIEW_TARGET_Y = 2.95;

/** Leftward shift and rightward yaw angle (radians) for the curved monitor on the desk. */
export const MONITOR_SCENE_POSITION: [number, number, number] = [-1.35, 0, 0.22];
export const MONITOR_YAW = 0.48;

/**
 * Computes the world-space center, outward normal vector, and tangent right vector
 * of the curved monitor screen display surface.
 *
 * Evaluates the 3D affine transformation applying Euler Y-axis rotation (yaw $\theta = 0.48$ rad):
 * $$x' = p_x + x_{\text{local}} \cos\theta + z_{\text{local}} \sin\theta$$
 * $$y' = p_y + y_{\text{local}}$$
 * $$z' = p_z - x_{\text{local}} \sin\theta + z_{\text{local}} \cos\theta$$
 * with normal vector $\mathbf{n} = [\sin\theta, 0, \cos\theta]$ and right vector $\mathbf{r} = [\cos\theta, 0, -\sin\theta]$.
 *
 * @returns Object with world-space `center`, `normal`, and `right` 3D coordinate tuples
 */
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

/**
 * Calculates optimal camera distance from the desk overview target based on viewport aspect ratio.
 * Fits both vertical and horizontal bounds using trigonometric frustum projection:
 * `distance = max(halfHeight / tan(halfFov), halfWidth / (tan(halfFov) * aspect)) * margin + padding`.
 *
 * @param aspect Viewport aspect ratio (width / height)
 * @returns Camera distance along the Z-axis in world units
 */
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
 * World-space center and normal of the tilted arcade screen surface.
 */
export const ARCADE_SCREEN_CENTER: [number, number, number] = [4.4811, 3.0615, 0.6833];
export const ARCADE_SCREEN_NORMAL: [number, number, number] = [0, 0.1259, 0.9920];
export const ARCADE_SCREEN_WIDTH = 2.1633;
export const ARCADE_SCREEN_HEIGHT = 1.8824;

/**
 * Computes the optimal camera position and target orientation for the arcade cabinet focus state.
 *
 * Positions the camera along the outward surface normal $\mathbf{n}$ at a distance
 * calculated via frustum projection trigonometry:
 * $$d = \max\left(\frac{W}{2 \tan(\text{FOV}/2) \cdot \text{aspect}}, \frac{H}{2 \tan(\text{FOV}/2)}\right) \cdot 1.08$$
 * ensuring the arcade CRT screen completely fills the viewport while keeping the joystick controls visible.
 *
 * @param aspect Viewport aspect ratio (width / height)
 * @returns Object with camera world `position` and look-at `target` coordinate tuples
 */
export function arcadeFocusPose(aspect: number) {
  const halfFov = (ROOM_FOV * Math.PI) / 360;
  const tangent = Math.tan(halfFov);
  const distance = Math.max(
    ARCADE_SCREEN_WIDTH / (2 * tangent * aspect),
    ARCADE_SCREEN_HEIGHT / (2 * tangent),
  ) * 1.08;

  return {
    position: [
      ARCADE_SCREEN_CENTER[0] + ARCADE_SCREEN_NORMAL[0] * distance,
      ARCADE_SCREEN_CENTER[1] + ARCADE_SCREEN_NORMAL[1] * distance,
      ARCADE_SCREEN_CENTER[2] + ARCADE_SCREEN_NORMAL[2] * distance,
    ] as [number, number, number],
    target: ARCADE_SCREEN_CENTER,
  };
}

/**
 * Cursor-driven camera offset in the overview, calibrated to PRD R15 limits (±0.24, ±0.12)
 * so elements remain in view without clipping across tablet and desktop viewports.
 */
export function roomParallaxOffset(x: number, y: number) {
  return {
    x: Math.max(-1, Math.min(1, x)) * 0.24,
    y: Math.max(-1, Math.min(1, y)) * 0.12,
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
 * Evaluates a critically-damped second-order spring (SmoothDamp / maath damp)
 * governing camera and pointer motion without overshooting or instantaneous velocity jumps.
 *
 * Implements the closed-form implicit solution to the harmonic oscillator differential equation:
 * $$\ddot{x} + 2\omega \dot{x} + \omega^2(x - x_{\text{target}}) = 0, \quad \omega = \frac{2}{\tau}$$
 * approximated via the rational Padé polynomial:
 * $$\exp(-\omega \Delta t) \approx \frac{1}{1 + \omega \Delta t + 0.48(\omega \Delta t)^2 + 0.235(\omega \Delta t)^3}$$
 *
 * @param current Current scalar value
 * @param target Target scalar destination
 * @param velocity Current scalar velocity (modified by spring acceleration)
 * @param smoothTime Time constant $\tau$ in seconds (approximate time to reach target)
 * @param delta Time step $\Delta t$ elapsed since previous frame in seconds
 * @param eps Convergence epsilon below which values snap to target and settle
 * @returns Object containing the integrated `value`, updated `velocity`, and boolean `settled` flag
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
 *
 * @param state Current parallax position and velocity state {x, y, vx, vy}
 * @param target Target parallax offset {x, y}
 * @param delta Time elapsed since previous frame in seconds
 * @param smoothTime Optional custom smoothing time constant (defaults based on return state)
 * @returns Updated parallax state with `settled` boolean
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
 * Quintic smootherstep easing polynomial for 3D camera focus transitions:
 * $$S_2(t) = 6t^5 - 15t^4 + 10t^3$$
 *
 * Provides $C^2$ continuity with zero first and second derivatives at both boundaries:
 * $$S_2'(0) = S_2''(0) = S_2'(1) = S_2''(1) = 0$$
 * completely eliminating acceleration jerk at the start and end of camera movements.
 *
 * @param progress Normalized transition progress $t \in [0, 1]$
 * @returns Smooth $C^2$ eased factor in range $[0, 1]$
 */
export function easeCameraTransition(progress: number): number {
  const t = Math.max(0, Math.min(1, progress));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
