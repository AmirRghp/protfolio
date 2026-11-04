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
 * positioned at [4.495, 1.95, 0.35] with scale [3.35, 3.50, 2.75] and yaw -PI/2.
 * The bottom edge sits at Y = 2.4400 to clear the joystick heads (highest Y = 2.2926)
 * with a generous safety margin and a wide ~4:3 aspect ratio (2.16 x 1.56).
 */
export const ARCADE_SCREEN_SURFACE: ArcadeSurface = {
  corners: [
    new Vector3(3.3994, 2.4400, 0.7891), // Bottom-Left
    new Vector3(5.5627, 2.4400, 0.7891), // Bottom-Right
    new Vector3(5.5627, 3.9800, 0.5670), // Top-Right
    new Vector3(3.3994, 3.9800, 0.5670), // Top-Left
  ],
};

export const ARCADE_SCREEN_CENTER = new Vector3(4.4811, 3.2100, 0.6781);
export const ARCADE_SCREEN_NORMAL = new Vector3(0, 0.1427, 0.9898);
export const ARCADE_SCREEN_WIDTH = 2.1633;
export const ARCADE_SCREEN_HEIGHT = 1.5559;

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
