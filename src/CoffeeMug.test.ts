import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Box3, Mesh, Texture, TextureLoader, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let originalTextureLoader: typeof TextureLoader.prototype.load;

beforeAll(() => {
  originalTextureLoader = TextureLoader.prototype.load;
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

async function loadCupAsset() {
  (globalThis as Record<string, unknown>).self ??= globalThis;
  const bytes = await readFile(new URL("../public/assets/models/cup.glb", import.meta.url));
  return new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
}

describe("CoffeeMug asset and model structure", () => {
  it("loads cup.glb cleanly and rests flat within proportional tabletop bounds", async () => {
    const gltf = await loadCupAsset();
    expect(gltf.scene).toBeDefined();

    const bounds = new Box3().setFromObject(gltf.scene);
    const size = bounds.getSize(new Vector3());

    // Original cup dimensions before scale ~2.2:
    // height ~0.162, width ~0.210 with handle, depth ~0.150
    expect(size.y).toBeGreaterThan(0.15);
    expect(size.y).toBeLessThan(0.20);
    expect(size.x).toBeGreaterThan(0.18);
    expect(size.x).toBeLessThan(0.25);
    expect(size.z).toBeGreaterThan(0.13);
    expect(size.z).toBeLessThan(0.18);

    // Bottom of the cup rests at y >= 0
    expect(bounds.min.y).toBeGreaterThanOrEqual(0);
    expect(bounds.min.y).toBeLessThan(0.01);
  });

  it("contains mesh geometry with normal and texture attributes", async () => {
    const gltf = await loadCupAsset();
    let meshCount = 0;

    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        meshCount++;
        expect(obj.geometry.attributes.position).toBeDefined();
        expect(obj.geometry.attributes.normal).toBeDefined();
        expect(obj.geometry.attributes.uv).toBeDefined();
        expect(obj.geometry.attributes.position.count).toBeGreaterThan(500);
      }
    });

    expect(meshCount).toBeGreaterThanOrEqual(1);
  });
});
