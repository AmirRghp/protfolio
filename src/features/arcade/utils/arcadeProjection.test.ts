import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  ARCADE_SCREEN_SURFACE,
  arcadeOverlayLayout,
  projectedArcadeSize,
} from "./arcadeProjection";
import { arcadeFocusPose } from "./roomCamera";
import { applyHomography, projectToCanvas } from "./monitorProjection";

describe("arcade screen projection", () => {
  const viewport = { width: 1440, height: 900 };
  const aspect = viewport.width / viewport.height;
  const pose = arcadeFocusPose(aspect);
  const camera = new PerspectiveCamera(40, aspect, 0.1, 100);
  camera.position.set(...pose.position);
  camera.lookAt(new Vector3(...pose.target));
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  it("calculates positive projected dimensions for the arcade screen", () => {
    const size = projectedArcadeSize(camera, viewport);
    expect(size.width).toBeGreaterThan(900);
    expect(size.width).toBeLessThan(1300);
    expect(size.height).toBeGreaterThan(700);
    expect(size.height).toBeLessThan(900);
  });

  it("generates a valid CSS matrix3d transform mapping local quad to screen corners", () => {
    const local = { width: 680, height: 760 };
    const layout = arcadeOverlayLayout(camera, viewport, ARCADE_SCREEN_SURFACE, local);

    expect(layout.transform).toMatch(/^matrix3d\(/);
    expect(layout.transform).not.toContain("NaN");
    expect(layout.transform).not.toContain("undefined");

    const [bottomLeft, bottomRight, topRight, topLeft] = ARCADE_SCREEN_SURFACE.corners.map((corner) =>
      projectToCanvas(camera, viewport, corner),
    );

    // Verify homography maps local corners to projected screen points
    const mappedTopLeft = applyHomography(layout.homography, { x: 0, y: 0 });
    const mappedTopRight = applyHomography(layout.homography, { x: local.width, y: 0 });
    const mappedBottomRight = applyHomography(layout.homography, { x: local.width, y: local.height });
    const mappedBottomLeft = applyHomography(layout.homography, { x: 0, y: local.height });

    expect(mappedTopLeft.x).toBeCloseTo(topLeft.x, 1);
    expect(mappedTopLeft.y).toBeCloseTo(topLeft.y, 1);
    expect(mappedTopRight.x).toBeCloseTo(topRight.x, 1);
    expect(mappedTopRight.y).toBeCloseTo(topRight.y, 1);
    expect(mappedBottomRight.x).toBeCloseTo(bottomRight.x, 1);
    expect(mappedBottomRight.y).toBeCloseTo(bottomRight.y, 1);
    expect(mappedBottomLeft.x).toBeCloseTo(bottomLeft.x, 1);
    expect(mappedBottomLeft.y).toBeCloseTo(bottomLeft.y, 1);
  });
});
