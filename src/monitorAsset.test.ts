import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { Box3, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

async function loadAsset(name: string) {
  const bytes = await readFile(new URL(`../public/assets/models/${name}`, import.meta.url));
  return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
}

test("the monitor rests on the desk and exposes a flat front facing display with full UVs", async () => {
  const { scene } = await loadAsset("curved-monitor.glb");
  const bounds = new Box3().setFromObject(scene);
  expect(bounds.min.y).toBeCloseTo(1.9, 3);
  expect(bounds.getSize(new Vector3()).x).toBeCloseTo(4.361, 3);
  expect(bounds.getSize(new Vector3()).y).toBeCloseTo(2.987, 3);

  const screen = scene.getObjectByName("MonitorScreen");
  expect(screen).toBeInstanceOf(Mesh);
  if (!(screen instanceof Mesh)) throw new Error("Missing MonitorScreen mesh");
  const screenBounds = new Box3().setFromObject(screen);
  const size = screenBounds.getSize(new Vector3());

  expect(screenBounds.getCenter(new Vector3()).x).toBeCloseTo(-0.25, 3);
  expect(screenBounds.getCenter(new Vector3()).z).toBeCloseTo(-0.25, 3);
  expect(screenBounds.getCenter(new Vector3()).y).toBeCloseTo(3.754, 2);
  expect(size.x).toBeCloseTo(4.231, 3);
  expect(size.y).toBeCloseTo(2.136, 3);
  // The prepared display is a flat panel, so the desktop can be projected onto it without a gap.
  expect(size.z).toBeCloseTo(0, 4);

  const uv = screen.geometry.attributes.uv;
  const positions = screen.geometry.attributes.position;
  for (let i = 0; i < uv.count; i++) {
    expect(uv.getX(i)).toBeCloseTo((positions.getX(i) - screenBounds.min.x) / size.x, 5);
    expect(uv.getY(i)).toBeCloseTo((positions.getY(i) - screenBounds.min.y) / size.y, 5);
  }
  for (const component of ["getX", "getY"] as const) {
    const values = Array.from({ length: uv.count }, (_, i) => uv[component](i));
    expect(Math.min(...values)).toBeCloseTo(0, 5);
    expect(Math.max(...values)).toBeCloseTo(1, 5);
  }

  const normals = screen.geometry.attributes.normal;
  expect(Array.from({ length: normals.count }, (_, i) => normals.getZ(i)).every((z) => z > 0.9)).toBe(true);

  // The physical panel stays a neutral dark surface behind the projected desktop.
  expect(screen.material.color.getHexString()).toBe("0a1622");
  expect(screen.material.emissive.getHexString()).toBe("000000");
});

test("the monitor model keeps its own body, stand and base meshes", async () => {
  const { scene } = await loadAsset("curved-monitor.glb");
  for (const name of ["MonitorScreen", "MonitorBody", "MonitorStand", "MonitorBase"]) {
    expect(scene.getObjectByName(name)).toBeDefined();
  }
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
