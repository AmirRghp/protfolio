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

export function roomParallaxOffset(x: number, y: number) {
  return {
    x: Math.max(-1, Math.min(1, x)) * 0.12,
    y: Math.max(-1, Math.min(1, y)) * 0.06,
  };
}
