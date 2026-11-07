import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Group, Box3, Mesh, Texture, TextureLoader, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  calculateCatBounce,
  calculateHoverHeight,
  calculateMonitorRaveColor,
  calculateMorphInfluence,
  calculatePartyLight,
  calculateRaveLightingState,
  calculateShadowProperties,
  calculateShortestAngleDiff,
  calculateSpinVelocity,
  createLoafShadowTexture,
  PARTY_COLORS,
} from "./oiiaCatLogic";
import {
  CAT_MODEL_OFFSET_X,
  CAT_MODEL_OFFSET_Y,
  CAT_MODEL_OFFSET_Z,
  CAT_REST_ROTATION_Y,
  CAT_SCALE,
  DESK_SURFACE_Y,
} from "./OiiaCat";

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

async function loadCatAsset() {
  (globalThis as Record<string, unknown>).self ??= globalThis;
  const bytes = await readFile(new URL("../public/assets/models/oiia-cat.glb", import.meta.url));
  return new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
}

describe("OiiaCat 3D asset structure", () => {
  it("loads oiia-cat.glb cleanly and contains morph targets for loaf mode", async () => {
    const gltf = await loadCatAsset();
    expect(gltf.scene).toBeDefined();

    let catMesh: Mesh | null = null;
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh && obj.morphTargetInfluences) {
        catMesh = obj;
      }
    });

    expect(catMesh).not.toBeNull();
    expect(catMesh!.morphTargetInfluences).toBeDefined();
    expect(catMesh!.morphTargetInfluences!.length).toBeGreaterThanOrEqual(1);

    // Verify morph target geometry attribute exists
    const morphPositions = catMesh!.geometry.morphAttributes.position;
    expect(morphPositions).toBeDefined();
    expect(morphPositions?.length).toBeGreaterThanOrEqual(1);
  });

  it("scales and rests appropriately within desk bounds", async () => {
    const gltf = await loadCatAsset();
    const bounds = new Box3().setFromObject(gltf.scene);
    const size = bounds.getSize(new Vector3());

    // Original unscaled size: ~0.44 width, ~0.68 height, ~1.35 length
    expect(size.y).toBeGreaterThan(0.60);
    expect(size.y).toBeLessThan(0.75);

    // Scaled dimensions on desk:
    const scaledHeight = size.y * CAT_SCALE;
    expect(scaledHeight).toBeGreaterThan(0.85);
    expect(scaledHeight).toBeLessThan(1.05);

    // Raw model bounding min y
    expect(bounds.min.y).toBeLessThan(0.05);
    expect(bounds.min.y).toBeGreaterThan(-0.20);
  });

  it("grounds assembled cat paws flat on the tabletop surface at DESK_SURFACE_Y without sinking", async () => {
    const gltf = await loadCatAsset();

    // Construct the exact scene hierarchy used in OiiaCat.tsx
    const rootGroup = new Group();
    rootGroup.position.set(1.80, DESK_SURFACE_Y, 1.65);

    const modelGroup = new Group();
    modelGroup.rotation.set(0, CAT_REST_ROTATION_Y, 0);
    rootGroup.add(modelGroup);

    const model = gltf.scene;
    model.position.set(CAT_MODEL_OFFSET_X, CAT_MODEL_OFFSET_Y, CAT_MODEL_OFFSET_Z);
    model.scale.set(CAT_SCALE, CAT_SCALE, CAT_SCALE);
    modelGroup.add(model);

    rootGroup.updateMatrixWorld(true);

    let catMesh: Mesh | null = null;
    gltf.scene.traverse((obj) => {
      if (obj instanceof Mesh) catMesh = obj;
    });
    catMesh!.morphTargetInfluences![0] = 0;

    const pos = catMesh!.geometry.attributes.position;
    let minY = Infinity;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      catMesh!.localToWorld(v);
      if (v.y < minY) minY = v.y;
    }

    // The bottom of the cat's paws must touch DESK_SURFACE_Y (1.906) with sub-millimeter precision
    expect(minY).toBeCloseTo(DESK_SURFACE_Y, 2);
    expect(minY).toBeGreaterThanOrEqual(DESK_SURFACE_Y - 0.005);
  });
});

describe("OiiaCat animation and dance logic", () => {
  it("calculates spin velocity for ramp-up, drop, and reduced-motion", () => {
    // Reduced motion must always be a gentle slow spin
    const reducedSpin = calculateSpinVelocity(5.0, true, true);
    expect(reducedSpin).toBeCloseTo(0.45);

    // Ramp up in normal motion
    const earlySpin = calculateSpinVelocity(0.5, false, false);
    const midSpin = calculateSpinVelocity(5.0, false, false);
    expect(earlySpin).toBeLessThan(midSpin);

    // Rave drop mode spin speed (4.5 rotations/sec = 9 * PI rad/s)
    const dropSpin = calculateSpinVelocity(35.0, true, false);
    expect(dropSpin).toBeCloseTo(Math.PI * 2 * 4.5);
    expect(dropSpin).toBeGreaterThan(midSpin);
  });

  it("smoothly interpolates morph target between standing and loaf", () => {
    // Tucking into loaf (dancing = true)
    let morph = calculateMorphInfluence(0.0, true, 0.1, 3.0);
    expect(morph).toBeCloseTo(0.3);

    morph = calculateMorphInfluence(0.9, true, 0.1, 3.0);
    expect(morph).toBe(1.0); // Clamped at 1.0

    // Unfolding back to standing (dancing = false)
    morph = calculateMorphInfluence(1.0, false, 0.1, 3.0);
    expect(morph).toBeCloseTo(0.7);

    morph = calculateMorphInfluence(0.1, false, 0.1, 3.0);
    expect(morph).toBe(0.0); // Clamped at 0.0
  });

  it("calculates hover elevation and reduced motion restrictions", () => {
    expect(calculateHoverHeight(0, false, false, false)).toBe(0);

    // Hover during normal dance
    const normalHover = calculateHoverHeight(4.0, false, true, false);
    expect(normalHover).toBeGreaterThan(0.02);

    // Peak hover during drop
    const dropHover = calculateHoverHeight(40.0, true, true, false);
    expect(dropHover).toBe(0.085);
    expect(dropHover).toBeGreaterThan(normalHover);

    // Prefers-reduced-motion stays at a modest steady height
    const reducedHover = calculateHoverHeight(40.0, true, true, true);
    expect(reducedHover).toBe(0.02);
  });

  it("calculates rhythmic cat bounce and wobble with 160 BPM cadence", () => {
    // Idle or reduced motion has zero bounce/tilt
    const idleBounce = calculateCatBounce(1.0, 0.5, false, false, false);
    expect(idleBounce.bounceY).toBe(0);
    expect(idleBounce.tiltX).toBe(0);
    expect(idleBounce.tiltZ).toBe(0);

    const reducedBounce = calculateCatBounce(1.0, 0.5, true, true, true);
    expect(reducedBounce.bounceY).toBe(0);
    expect(reducedBounce.tiltX).toBe(0);
    expect(reducedBounce.tiltZ).toBe(0);

    // On-beat bounce during normal dance: strictly vertical, zero off-axis wobble
    const beatPeriod = 60 / 160; // 0.375s
    const midBeat = beatPeriod * 0.5; // Sine wave peaks at mid phase (PI/2)
    const bounceMid = calculateCatBounce(midBeat, 0.8, false, true, false);
    expect(bounceMid.bounceY).toBeGreaterThan(0.02);
    expect(bounceMid.tiltX).toBe(0);
    expect(bounceMid.tiltZ).toBe(0);

    // Drop phase bounce is higher: strictly vertical, zero off-axis wobble
    const dropBounce = calculateCatBounce(midBeat, 0.8, true, true, false);
    expect(dropBounce.bounceY).toBeGreaterThan(bounceMid.bounceY);
    expect(dropBounce.tiltX).toBe(0);
    expect(dropBounce.tiltZ).toBe(0);
  });

  it("generates an elongated loaf contact shadow texture with smooth AO gradient", () => {
    const texture = createLoafShadowTexture();
    expect(texture).toBeDefined();
    expect(texture.image.width).toBe(128);
    expect(texture.image.height).toBe(256);

    expect(texture.image.data).toBeDefined();
    const data = texture.image.data!;
    const width = 128;
    const height = 256;

    const getPixel = (x: number, y: number) => {
      const idx = (y * width + x) * 4;
      return {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
      };
    };

    // Center core: dense dark ambient occlusion
    const core = getPixel(64, 128);
    expect(core.r).toBe(9);
    expect(core.g).toBe(7);
    expect(core.b).toBe(6);
    expect(core.a).toBe(255);

    // Spine along loaf length: remains dense at y=88 and y=168
    const topSpine = getPixel(64, 88);
    const bottomSpine = getPixel(64, 168);
    expect(topSpine.a).toBeGreaterThan(200);
    expect(bottomSpine.a).toBeGreaterThan(200);

    // Boundary decay: reaches 0 outside the capsule
    expect(getPixel(0, 128).a).toBe(0);
    expect(getPixel(127, 128).a).toBe(0);
    expect(getPixel(64, 0).a).toBe(0);
    expect(getPixel(64, 255).a).toBe(0);

    // Measure non-zero span along X (width) and Y (length)
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (getPixel(x, y).a > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    const spanX = maxX - minX;
    const spanY = maxY - minY;

    // Conforms to elongated loaf footprint (aspect ratio > 1.8), not a flat circle
    expect(spanY / spanX).toBeGreaterThan(1.8);
    texture.dispose();
  });

  it("adapts contact shadow scale and opacity dynamically based on hover", () => {
    const groundedShadow = calculateShadowProperties(0.0);
    expect(groundedShadow.scale).toBe(1.0);
    expect(groundedShadow.opacity).toBeCloseTo(0.46);

    const elevatedShadow = calculateShadowProperties(0.085);
    // Shadow expands and becomes more diffuse when floating
    expect(elevatedShadow.scale).toBeGreaterThan(groundedShadow.scale);
    expect(elevatedShadow.opacity).toBeLessThan(groundedShadow.opacity);
    expect(elevatedShadow.opacity).toBeGreaterThanOrEqual(0.18);
  });

  it("calculates party lighting with bass-reactive pulse and reduced motion safety", () => {
    // When idle, light is turned off
    const idleLight = calculatePartyLight(0, 0, false, false, false);
    expect(idleLight.intensity).toBe(0);

    // When dancing in reduced motion, steady soft light
    const reducedLight = calculatePartyLight(10, 0.9, true, true, true);
    expect(reducedLight.intensity).toBe(1.2);
    expect(reducedLight.color).toBe("#38bdf8");

    // When dancing in normal mode, responds to bass and drop
    const normalLight = calculatePartyLight(10, 0.8, false, true, false);
    expect(normalLight.intensity).toBeGreaterThan(2.0);

    const dropLight = calculatePartyLight(35, 0.8, true, true, false);
    expect(dropLight.intensity).toBeGreaterThan(normalLight.intensity);
  });

  it("calculates full-room disco rave lighting with neon color cycling and kick pulses", () => {
    // Normal kick pulse at beat 0
    const raveBeat0 = calculateRaveLightingState(0.0, 0.8);
    expect(PARTY_COLORS).toContain(raveBeat0.wallLeftColor);
    expect(PARTY_COLORS).toContain(raveBeat0.wallRightColor);
    expect(raveBeat0.wallLeftColor).not.toBe(raveBeat0.wallRightColor);
    expect(raveBeat0.wallIntensity).toBeGreaterThan(4.5);
    expect(raveBeat0.shelf1LIntensity).toBeGreaterThan(5.5);
    expect(raveBeat0.backgroundColor).toBe("#160b2e"); // Hard kick > 0.5 triggers neon background flash

    // Soft kick (< 0.5) retains default nocturnal background
    const raveSoftKick = calculateRaveLightingState(0.0, 0.2);
    expect(raveSoftKick.backgroundColor).toBe("#080614");

    // Colors cycle across 160 BPM beats (beat period = 0.375s)
    const raveBeat1 = calculateRaveLightingState(0.38, 0.8);
    expect(raveBeat1.wallLeftColor).not.toBe(raveBeat0.wallLeftColor);

    // Shelf LEDs alternate on 320 BPM sub-beats (sub-beat period = 0.1875s)
    const subBeat0 = calculateRaveLightingState(0.05, 0.8);
    const subBeat1 = calculateRaveLightingState(0.05 + 0.19, 0.8);
    expect(subBeat0.shelf1LColor).not.toBe(subBeat1.shelf1LColor);
  });

  it("calculates shortest-path angular difference avoiding 360-degree reverse spins", () => {
    // Current at 6.20 rad (close to 2*PI), target at -0.15 rad (or 6.133 rad)
    // Shortest path is only ~ -0.067 rad, not -6.35 rad!
    const wrapDiff = calculateShortestAngleDiff(6.20, -0.15);
    expect(wrapDiff).toBeCloseTo(-0.0668, 3);
    expect(Math.abs(wrapDiff)).toBeLessThan(0.1);

    // Current after many spins: 100.0 radians
    const largeSpinDiff = calculateShortestAngleDiff(100.0, -0.15);
    expect(Math.abs(largeSpinDiff)).toBeLessThanOrEqual(Math.PI);

    // Target and current identical
    expect(calculateShortestAngleDiff(-0.15, -0.15)).toBeCloseTo(0);

    // Half turn away (boundary)
    const halfTurn = calculateShortestAngleDiff(0, Math.PI);
    expect(Math.abs(Math.abs(halfTurn) - Math.PI)).toBeLessThan(0.001);
  });

  it("defines standard desk placement constants", () => {
    expect(DESK_SURFACE_Y).toBe(1.906);
    expect(CAT_SCALE).toBe(1.40);
    expect(CAT_REST_ROTATION_Y).toBe(0.45);
    expect(CAT_MODEL_OFFSET_X).toBeCloseTo(0.006 * 1.40);
    expect(CAT_MODEL_OFFSET_Y).toBeCloseTo(0.01101 * 1.40);
    expect(CAT_MODEL_OFFSET_Z).toBeCloseTo(-0.059 * 1.40);
  });

  it("calculates solid monitor rave background color synchronized with beats", () => {
    // At beat 0 (0.0s)
    const color0 = calculateMonitorRaveColor(0.0);
    expect(PARTY_COLORS).toContain(color0);

    // At beat 1 (0.38s)
    const color1 = calculateMonitorRaveColor(0.38);
    expect(PARTY_COLORS).toContain(color1);
    expect(color1).not.toBe(color0);

    // Reduced motion returns steady deep color
    expect(calculateMonitorRaveColor(0.0, true)).toBe("#1e1b4b");
    expect(calculateMonitorRaveColor(0.38, true)).toBe("#1e1b4b");
  });
});
