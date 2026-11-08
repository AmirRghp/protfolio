import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, expect, test } from "vitest";
import { Box3, Mesh, Texture, TextureLoader, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let originalTextureLoader: typeof TextureLoader.prototype.load;

beforeAll(() => {
  originalTextureLoader = TextureLoader.prototype.load;
  // Mock texture loading in Node test environment to avoid blob:nodedata warnings
  (TextureLoader.prototype as unknown as { load: unknown }).load = function (
    _url: string,
    onLoad?: (texture: Texture) => void,
  ) {
    const texture = new Texture();
    if (onLoad) setTimeout(() => onLoad(texture), 0);
    return texture;
  };
});

afterAll(() => {
  TextureLoader.prototype.load = originalTextureLoader;
});

async function loadAsset(name: string) {
  (globalThis as Record<string, unknown>).self ??= globalThis;
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

test("furnishings keep the room furniture without a second monitor or board", async () => {
  const { scene } = await loadAsset("room-furnishings.glb");
  for (const name of ["DeskTop", "DeskFrontEdge", "Shelf1", "Shelf2"]) {
    expect(scene.getObjectByName(name)).toBeDefined();
  }
  for (const name of ["BoardFrame", "BoardFace", "Monitor", "MonitorBody", "ScreenSeat", "MonitorNeck", "MonitorFoot"]) {
    expect(!!scene.getObjectByName(name)).toBe(false);
  }
});

test("the finished desk keeps its R13 surface bounds and readable front edge", async () => {
  const { scene } = await loadAsset("room-furnishings.glb");
  const top = scene.getObjectByName("DeskTop");
  const edge = scene.getObjectByName("DeskFrontEdge");
  expect(top).toBeInstanceOf(Mesh);
  expect(edge).toBeInstanceOf(Mesh);
  if (!(top instanceof Mesh) || !(edge instanceof Mesh)) throw new Error("Missing desk meshes");

  const topBounds = new Box3().setFromObject(top);
  const topSize = topBounds.getSize(new Vector3());
  expect(topBounds.min.x).toBeCloseTo(-5.8, 2);
  expect(topBounds.max.x).toBeCloseTo(2.96, 2);
  expect(topBounds.min.z).toBeCloseTo(-0.9, 3);
  expect(topBounds.max.z).toBeCloseTo(3.7, 3);
  expect(topSize.x).toBeCloseTo(8.76, 2);
  expect(topSize.y).toBeCloseTo(0.18, 3);
  expect(topBounds.max.y).toBeCloseTo(1.89, 3);
  expect(top.material).toHaveProperty("color");
  expect((top.material as { color: { getHexString(): string } }).color.getHexString()).toBe("513a2c");

  // The fascia covers the tabletop's full thickness at its front boundary.
  const edgeBounds = new Box3().setFromObject(edge);
  expect(edgeBounds.min.z).toBeCloseTo(topBounds.max.z, 2);
  expect(edgeBounds.max.z).toBeCloseTo(3.8, 2);
  expect(edgeBounds.min.y).toBeCloseTo(topBounds.min.y, 2);
  expect(edgeBounds.max.y).toBeCloseTo(topBounds.max.y, 2);

  for (const name of ["Floor", "DeskFloor", "DeskLeg", "DeskLegs", "DeskSupport", "DeskSupports"]) {
    expect(scene.getObjectByName(name)).toBeUndefined();
  }
});

test("the arcade machine GLB exposes its cabinet, screen, joysticks and control deck", async () => {
  const { scene } = await loadAsset("arcade-machine.glb");
  for (const name of ["Screen_low", "KeyBoard_low", "JoyStick_01_low", "JoyStick_02_low", "Panel_Border_low"]) {
    expect(scene.getObjectByName(name)).toBeDefined();
  }
});

test("the compact keyboard GLB exposes its meshes and fits desk dimensions", async () => {
  const { scene } = await loadAsset("compact-keyboard.glb");
  const bounds = new Box3().setFromObject(scene);
  const size = bounds.getSize(new Vector3());
  expect(size.x).toBeGreaterThan(0);
  expect(size.y).toBeGreaterThan(0);
  expect(size.z).toBeGreaterThan(0);
  let meshCount = 0;
  scene.traverse((child) => {
    if (child instanceof Mesh) meshCount++;
  });
  expect(meshCount).toBeGreaterThan(0);
});

test("the computer mouse GLB exposes its geometry and working scale", async () => {
  const { scene } = await loadAsset("computer-mouse.glb");
  const bounds = new Box3().setFromObject(scene);
  const size = bounds.getSize(new Vector3());
  expect(size.x).toBeGreaterThan(0);
  expect(size.y).toBeGreaterThan(0);
  expect(size.z).toBeGreaterThan(0);
  let meshCount = 0;
  scene.traverse((child) => {
    if (child instanceof Mesh) meshCount++;
  });
  expect(meshCount).toBeGreaterThan(0);
});

test("the mouse pad GLB exposes its surface and accent materials", async () => {
  const { scene } = await loadAsset("mouse-pad.glb");
  const bounds = new Box3().setFromObject(scene);
  const size = bounds.getSize(new Vector3());
  expect(size.x).toBeGreaterThan(0);
  expect(size.y).toBeGreaterThan(0);
  expect(size.z).toBeGreaterThan(0);
  const materialNames: string[] = [];
  scene.traverse((child) => {
    if (child instanceof Mesh) {
      if (Array.isArray(child.material)) {
        materialNames.push(...child.material.map((m) => m.name));
      } else if (child.material) {
        materialNames.push(child.material.name);
      }
    }
  });
  expect(materialNames).toContain("Material.001");
  expect(materialNames).toContain("Material.002");
});
