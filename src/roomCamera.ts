export const ROOM_FOV = 40;

export function roomCameraDistance(aspect: number) {
  // Fit the 11.6-unit desk width with 8% breathing room at its front edge.
  const halfFov = (ROOM_FOV * Math.PI) / 360;
  return Math.max(2 / Math.tan(halfFov), 5.8 / (Math.tan(halfFov) * aspect)) * 1.08 + 1.3;
}
