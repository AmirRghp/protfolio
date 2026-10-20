import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { Box3, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

async function loadAsset(name: string) {
  const bytes = await readFile(new URL(`../public/assets/models/${name}`, import.meta.url));
  return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
}

test("curved monitor rests on the desk and exposes a front-facing, curved screen with full UVs", async () => {
  const { scene } = await loadAsset("curved-monitor.glb");
  const bounds = new Box3().setFromObject(scene);
  expect(bounds.min.y).toBeCloseTo(1.9, 3);
  expect(bounds.getSize(new Vector3()).x).toBeCloseTo(5.1, 3);
  const screen = scene.getObjectByName("MonitorScreen");
  expect(screen).toBeInstanceOf(Mesh);
  if (!(screen instanceof Mesh)) throw new Error("Missing MonitorScreen mesh");
  const screenBounds = new Box3().setFromObject(screen);
  const size = screenBounds.getSize(new Vector3());
  expect(screenBounds.getCenter(new Vector3()).x).toBeCloseTo(-0.25, 3);
  expect(size.x / size.y).toBeGreaterThan(1.9);
  expect(size.x / size.y).toBeLessThan(2.1);
  expect(size.z).toBeGreaterThan(0.3);
  const uv = screen.geometry.attributes.uv;
  const positions = screen.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    expect(uv.getX(i)).toBeCloseTo((positions.getX(i) - screenBounds.min.x) / size.x, 5);
  }
  for (const component of ["getX", "getY"] as const) {
    const values = Array.from({ length: uv.count }, (_, i) => uv[component](i));
    expect(Math.min(...values)).toBeCloseTo(0, 5);
    expect(Math.max(...values)).toBeCloseTo(1, 5);
  }
  const normals = screen.geometry.attributes.normal;
  expect(Array.from({ length: normals.count }, (_, i) => normals.getZ(i)).every((z) => z > 0.9)).toBe(true);
});

test("furnishings keep the room furniture without a second monitor", async () => {
  const { scene } = await loadAsset("room-furnishings.glb");
  for (const name of ["DeskTop", "BoardFrame", "BoardFace", "Shelf1", "Shelf2"]) {
    expect(scene.getObjectByName(name)).toBeDefined();
  }
  for (const name of ["Monitor", "MonitorBody", "ScreenSeat", "MonitorNeck", "MonitorFoot"]) {
    expect(!!scene.getObjectByName(name)).toBe(false);
  }
});
