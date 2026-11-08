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

async function loadBatmanAsset() {
  (globalThis as Record<string, unknown>).self ??= globalThis;
  const bytes = await readFile(new URL("../../../../public/assets/models/batman.glb", import.meta.url));
  return new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
}

describe("BatmanFigure asset and model structure", () => {
  it("loads batman.glb cleanly and contains expected collectible mesh parts", async () => {
    const gltf = await loadBatmanAsset();
    expect(gltf.scene).toBeDefined();

    const bounds = new Box3().setFromObject(gltf.scene);
    const size = bounds.getSize(new Vector3());

    // Raw unscaled dimensions: height ~1.31, width ~0.93, depth ~0.80
    expect(size.y).toBeGreaterThan(1.2);
    expect(size.y).toBeLessThan(1.4);
    expect(size.x).toBeGreaterThan(0.8);
    expect(size.x).toBeLessThan(1.1);
    expect(size.z).toBeGreaterThan(0.7);
    expect(size.z).toBeLessThan(0.9);

    let meshCount = 0;
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh) {
        meshCount++;
        expect(obj.geometry.attributes.position).toBeDefined();
      }
    });

    expect(meshCount).toBe(13);
  });

  it("scales to fit within shelf vertical clearance with generous headroom", async () => {
    const gltf = await loadBatmanAsset();
    const bounds = new Box3().setFromObject(gltf.scene);
    const rawHeight = bounds.getSize(new Vector3()).y;

    const scale = 0.686;
    const scaledHeight = rawHeight * scale;

    // Clearance between lower shelf top (4.28) and upper shelf bottom (5.37) is 1.09
    const shelfClearance = 5.37 - 4.28;
    expect(scaledHeight).toBeLessThan(shelfClearance);
    expect(scaledHeight).toBeGreaterThan(0.7);

    // Leaves headroom under top shelf
    const headroom = shelfClearance - scaledHeight;
    expect(headroom).toBeGreaterThan(0.15);
  });
});
