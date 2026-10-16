export const ROOM_FOV = 40;

export function roomCameraDistance(aspect: number) {
  // Fit a 12 × 6 room with 8% breathing room, measured at its nearest geometry.
  const halfFov = (ROOM_FOV * Math.PI) / 360;
  return Math.max(3 / Math.tan(halfFov), 6 / (Math.tan(halfFov) * aspect)) * 1.08 + 2.5;
}
