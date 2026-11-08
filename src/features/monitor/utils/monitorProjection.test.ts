import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { Mesh, PerspectiveCamera, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  applyHomography,
  homographyToCssMatrix,
  invertHomography,
  monitorOverlayLayout,
  readMonitorSurface,
  solveHomography,
  type Point,
} from "./monitorProjection";

async function loadMonitorScene() {
  const bytes = await readFile(new URL("../../../../public/assets/models/curved-monitor.glb", import.meta.url));
  const { scene } = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
  scene.updateMatrixWorld(true);
  return scene;
}

function focusCamera(width: number, height: number) {
  const camera = new PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(-0.25, 3.754, 4.4648);
  camera.lookAt(new Vector3(-0.25, 3.754, -0.25));
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();
  return camera;
}

describe("homography", () => {
  it("maps every source point onto its target", () => {
    const source: Point[] = [
      { x: 0, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 120 },
      { x: 0, y: 120 },
    ];
    const target: Point[] = [
      { x: 18, y: 4 },
      { x: 196, y: 0 },
      { x: 210, y: 116 },
      { x: 2, y: 120 },
    ];

    const homography = solveHomography(source, target);

    for (const [index, point] of source.entries()) {
      const mapped = applyHomography(homography, point);
      expect(mapped.x).toBeCloseTo(target[index].x, 6);
      expect(mapped.y).toBeCloseTo(target[index].y, 6);
    }
  });

  it("inverts a homography back to the source points", () => {
    const source: Point[] = [
      { x: 0, y: 0 },
      { x: 120, y: 0 },
      { x: 120, y: 90 },
      { x: 0, y: 90 },
    ];
    const target: Point[] = [
      { x: 10, y: 6 },
      { x: 130, y: 0 },
      { x: 124, y: 96 },
      { x: 0, y: 90 },
    ];

    const homography = solveHomography(source, target);
    const inverse = invertHomography(homography);

    for (const [index, point] of target.entries()) {
      const mapped = applyHomography(inverse, point);
      expect(mapped.x).toBeCloseTo(source[index].x, 6);
      expect(mapped.y).toBeCloseTo(source[index].y, 6);
    }
  });

  it("rejects a degenerate point configuration", () => {
    expect(() => solveHomography(
      [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }],
    )).toThrow();
  });

  it("writes the CSS matrix in the column-major order the browser expects", () => {
    expect(homographyToCssMatrix([2, 0, 10, 0, 3, 20, 0, 0, 1])).toBe(
      "matrix3d(2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 10, 20, 0, 1)",
    );
  });
});

describe("monitor screen surface", () => {
  it("measures the flat display corners and its outline from the model", async () => {
    const scene = await loadMonitorScene();
    const screen = scene.getObjectByName("MonitorScreen");
    if (!(screen instanceof Mesh)) throw new Error("Missing MonitorScreen mesh");

    const surface = readMonitorSurface(screen.geometry, screen.matrixWorld);

    expect(surface.corners).toHaveLength(4);
    expect(surface.boundary.length).toBeGreaterThan(8);

    // The corners come from the display rectangle, not from the rounded outline of the panel.
    const [bottomLeft, bottomRight, topRight, topLeft] = surface.corners;
    expect(bottomLeft.x).toBeCloseTo(-2.366, 3);
    expect(bottomRight.x).toBeCloseTo(1.866, 3);
    expect(bottomLeft.y).toBeCloseTo(2.686, 3);
    expect(topLeft.y).toBeCloseTo(4.822, 3);
    expect(topLeft.x).toBeCloseTo(bottomLeft.x, 6);
    expect(topRight.x).toBeCloseTo(bottomRight.x, 6);
    expect(bottomLeft.z).toBeCloseTo(-0.25, 6);
    expect(topLeft.z).toBeCloseTo(-0.25, 6);
  });

  it("places the overlay on the projected screen and clips it to the projected outline", async () => {
    const scene = await loadMonitorScene();
    const screen = scene.getObjectByName("MonitorScreen");
    if (!(screen instanceof Mesh)) throw new Error("Missing MonitorScreen mesh");
    const surface = readMonitorSurface(screen.geometry, screen.matrixWorld);
    const camera = focusCamera(1440, 800);
    const local = { width: 986, height: 498 };

    const layout = monitorOverlayLayout(camera, { width: 1440, height: 800 }, surface, local);
    const corners = [
      { x: 0, y: 0 },
      { x: local.width, y: 0 },
      { x: local.width, y: local.height },
      { x: 0, y: local.height },
    ].map((point) => applyHomography(layout.homography, point));

    // The screen fills the view: its outline stays within a few pixels of the canvas centre.
    const centre = corners.reduce((sum, point) => ({ x: sum.x + point.x / 4, y: sum.y + point.y / 4 }), { x: 0, y: 0 });
    expect(Math.abs(centre.x - 720)).toBeLessThan(5);
    expect(Math.abs(centre.y - 400)).toBeLessThan(5);

    // The display is flat and the camera faces it, so the overlay keeps no keystone.
    const topWidth = corners[1].x - corners[0].x;
    const bottomWidth = corners[2].x - corners[3].x;
    expect(bottomWidth).toBeCloseTo(topWidth, 1);

    const clipPoints = layout.clipPath
      .replace("polygon(", "")
      .replace(")", "")
      .split(", ")
      .map((pair) => pair.split(" ").map((value) => Number(value.replace("px", ""))) as [number, number]);
    expect(clipPoints.length).toBe(surface.boundary.length);
    for (const [index, clipPoint] of clipPoints.entries()) {
      const mapped = applyHomography(layout.homography, { x: clipPoint[0], y: clipPoint[1] });
      const boundary = surface.boundary[index];
      const projected = boundary.clone().project(camera);
      expect(mapped.x).toBeCloseTo((projected.x * 0.5 + 0.5) * 1440, 4);
      expect(mapped.y).toBeCloseTo((-projected.y * 0.5 + 0.5) * 800, 4);
    }
  });

  it("reports that a flat display does not dip into the overlay", async () => {
    const scene = await loadMonitorScene();
    const screen = scene.getObjectByName("MonitorScreen");
    if (!(screen instanceof Mesh)) throw new Error("Missing MonitorScreen mesh");
    const surface = readMonitorSurface(screen.geometry, screen.matrixWorld);
    const camera = focusCamera(1440, 800);

    const layout = monitorOverlayLayout(camera, { width: 1440, height: 800 }, surface, { width: 986, height: 498 });

    // The prepared display is flat, so no screen edge dips into the overlay and the status bar
    // can sit flush with the top of the panel.
    expect(layout.sagTop).toBeCloseTo(0, 3);
    expect(layout.sagBottom).toBeCloseTo(0, 3);
  });
});
