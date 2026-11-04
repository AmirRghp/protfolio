import { Vector3, type Camera } from "three";
import {
  homographyToCssMatrix,
  projectToCanvas,
  solveHomography,
  type Homography,
} from "./monitorProjection";

export type ArcadeSurface = {
  /** Corners in world space: bottom-left, bottom-right, top-right, top-left. */
  corners: [Vector3, Vector3, Vector3, Vector3];
};

/**
 * World-space quad corners of the arcade cabinet screen (`Screen_low`),
 * positioned at [4.22, 1.95, 0.35] with scale [2.75, 3.75, 2.75] and yaw -PI/2.
 */
export const ARCADE_SCREEN_SURFACE: ArcadeSurface = {
  corners: [
    new Vector3(3.3206, 2.1405, 0.8018), // Bottom-Left
    new Vector3(5.0965, 2.1405, 0.8018), // Bottom-Right
    new Vector3(5.0965, 4.1412, 0.5648), // Top-Right
    new Vector3(3.3206, 4.1412, 0.5648), // Top-Left
  ],
};

export type ArcadeOverlayLayout = {
  /** CSS `matrix3d(...)` that maps the local overlay rectangle onto the projected arcade screen. */
  transform: string;
  homography: Homography;
};

/**
 * The size of the projected arcade screen quad in screen pixels, computed from the current camera.
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
 * Calculates the CSS homography transform that maps an element of size `local` exactly onto
 * the projected 3D arcade screen corners.
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
