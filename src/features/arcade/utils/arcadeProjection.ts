import { Vector3, type Camera } from "three";
import {
  homographyToCssMatrix,
  projectToCanvas,
  solveHomography,
  type Homography,
} from "@/features/monitor/utils/monitorProjection";

export type ArcadeSurface = {
  /** Corners in world space: bottom-left, bottom-right, top-right, top-left. */
  corners: [Vector3, Vector3, Vector3, Vector3];
};

/**
 * World-space quad corners of the arcade cabinet screen (`Screen_low`),
 * positioned at [4.495, 1.95, 0.35] with scale [3.35, 3.50, 2.75] and yaw -PI/2.
 * The quad spans the exact full screen surface from Y = 2.1278 to Y = 3.9952,
 * completely filling the physical CRT screen bezel without bottom gaps.
 */
export const ARCADE_SCREEN_SURFACE: ArcadeSurface = {
  corners: [
    new Vector3(3.3994, 2.1278, 0.8018), // Bottom-Left
    new Vector3(5.5627, 2.1278, 0.8018), // Bottom-Right
    new Vector3(5.5627, 3.9952, 0.5648), // Top-Right
    new Vector3(3.3994, 3.9952, 0.5648), // Top-Left
  ],
};

export const ARCADE_SCREEN_CENTER = new Vector3(4.4811, 3.0615, 0.6833);
export const ARCADE_SCREEN_NORMAL = new Vector3(0, 0.1259, 0.9920);
export const ARCADE_SCREEN_WIDTH = 2.1633;
export const ARCADE_SCREEN_HEIGHT = 1.8824;

export type ArcadeOverlayLayout = {
  /** CSS `matrix3d(...)` that maps the local overlay rectangle onto the projected arcade screen. */
  transform: string;
  homography: Homography;
};

/**
 * Computes the projected bounding dimensions (width and height in screen pixels)
 * of the 3D arcade cabinet CRT screen quad, projected into 2D viewport coordinates.
 *
 * Each 3D corner is transformed from world space into normalized device coordinates (NDC)
 * via the camera's view-projection matrix, then converted to viewport canvas pixels.
 * The average width and height of the perspective quad are calculated using Euclidean distance.
 *
 * @param camera Active Three.js perspective camera
 * @param viewport Viewport dimensions {width, height} in CSS pixels
 * @param surface 3D surface quad corners in world coordinates (defaults to ARCADE_SCREEN_SURFACE)
 * @returns Projected dimensions {width, height} clamped to minimum playable bounds (320x360)
 */
export function projectedArcadeSize(
  camera: Camera,
  viewport: { width: number; height: number },
  surface: ArcadeSurface = ARCADE_SCREEN_SURFACE,
): { width: number; height: number } {
  const [bottomLeft, bottomRight, topRight, topLeft] = surface.corners.map((corner) =>
    projectToCanvas(camera, viewport, corner),
  );
  const bottomWidth = Math.hypot(bottomRight.x - bottomLeft.x, bottomRight.y - bottomLeft.y);
  const topWidth = Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y);
  const leftHeight = Math.hypot(topLeft.x - bottomLeft.x, topLeft.y - bottomLeft.y);
  const rightHeight = Math.hypot(topRight.x - bottomRight.x, topRight.y - bottomRight.y);
  return {
    width: Math.max(320, Math.round((bottomWidth + topWidth) / 2)),
    height: Math.max(360, Math.round((leftHeight + rightHeight) / 2)),
  };
}

/**
 * Calculates the 3x3 projective homography transformation mapping a 2D DOM element
 * of size `local` (e.g. an HTML5 game canvas overlay) exactly onto the 4 projected
 * world-space corners of the tilted 3D arcade CRT screen.
 *
 * 1. Projects all 4 world-space corners through the camera frustum onto the 2D canvas viewport.
 * 2. Solves the 8-DOF Direct Linear Transformation (DLT) system relating local quad coordinates
 *    `[0,0]`, `[w,0]`, `[w,h]`, `[0,h]` to screen target points `[TL, TR, BR, BL]`.
 * 3. Serializes the resulting homography into a hardware-accelerated CSS `matrix3d(...)` string.
 *
 * @param camera Active Three.js perspective camera
 * @param viewport Viewport dimensions {width, height} in CSS pixels
 * @param surface 3D arcade screen corners in world coordinates
 * @param local Local unprojected pixel dimensions of the overlay {width, height}
 * @returns Object containing the CSS matrix3d transform string and the row-major 3x3 homography tuple
 */
export function arcadeOverlayLayout(
  camera: Camera,
  viewport: { width: number; height: number },
  surface: ArcadeSurface,
  local: { width: number; height: number },
): ArcadeOverlayLayout {
  const [bottomLeft, bottomRight, topRight, topLeft] = surface.corners.map((corner) =>
    projectToCanvas(camera, viewport, corner),
  );

  const homography = solveHomography(
    [
      { x: 0, y: 0 },
      { x: local.width, y: 0 },
      { x: local.width, y: local.height },
      { x: 0, y: local.height },
    ],
    [topLeft, topRight, bottomRight, bottomLeft],
  );

  return {
    transform: homographyToCssMatrix(homography),
    homography,
  };
}
