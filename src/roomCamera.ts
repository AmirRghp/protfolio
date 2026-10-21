export const ROOM_FOV = 40;

/**
 * How long the camera takes to travel between two room destinations. The close monitor view and
 * the room overview are far apart, and a short travel reads as a jump instead of a camera move.
 */
export const ROOM_TRANSITION_SECONDS = 0.7;

export function roomCameraDistance(aspect: number) {
  // Fit the 11.6-unit desk width with 8% breathing room at its front edge.
  const halfFov = (ROOM_FOV * Math.PI) / 360;
  return Math.max(2 / Math.tan(halfFov), 5.8 / (Math.tan(halfFov) * aspect)) * 1.08 + 1.3;
}

export function roomParallaxOffset(x: number, y: number) {
  return {
    x: Math.max(-1, Math.min(1, x)) * 0.12,
    y: Math.max(-1, Math.min(1, y)) * 0.06,
  };
}
