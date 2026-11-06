import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Group, Box3, Mesh, Texture, TextureLoader, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  calculateCatBounce,
  calculateHoverHeight,
  calculateMorphInfluence,
  calculatePartyLight,
  calculateShadowProperties,
  calculateShortestAngleDiff,
  calculateSpinVelocity,
} from "./oiiaCatLogic";
import {
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
    expect(scaledHeight).toBeGreaterThan(0.40);
    expect(scaledHeight).toBeLessThan(0.55);

    // Raw model bounding min y
    expect(bounds.min.y).toBeLessThan(0.05);
    expect(bounds.min.y).toBeGreaterThan(-0.20);
  });

  it("grounds assembled cat paws flat on the tabletop surface at DESK_SURFACE_Y without sinking", async () => {
    const gltf = await loadCatAsset();

    // Construct the exact scene hierarchy used in OiiaCat.tsx
    const rootGroup = new Group();
    rootGroup.position.set(1.85, DESK_SURFACE_Y, 1.25);

    const modelGroup = new Group();
    modelGroup.rotation.set(0, CAT_REST_ROTATION_Y, 0);
    rootGroup.add(modelGroup);

    const model = gltf.scene;
    model.position.set(0, CAT_MODEL_OFFSET_Y, CAT_MODEL_OFFSET_Z);
    model.scale.set(CAT_SCALE, CAT_SCALE, CAT_SCALE);
    modelGroup.add(model);

    rootGroup.updateMatrixWorld(true);

    const worldBounds = new Box3().setFromObject(model);

    // The bottom of the cat's paws must touch DESK_SURFACE_Y (1.906) within 0.005 units
    expect(worldBounds.min.y).toBeCloseTo(DESK_SURFACE_Y, 2);
    expect(worldBounds.min.y).toBeGreaterThanOrEqual(DESK_SURFACE_Y - 0.005);
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

    const reducedBounce = calculateCatBounce(1.0, 0.5, true, true, true);
    expect(reducedBounce.bounceY).toBe(0);

    // On-beat bounce during normal dance
    const beatPeriod = 60 / 160; // 0.375s
    const midBeat = beatPeriod * 0.5; // Sine wave peaks at mid phase (PI/2)
    const bounceMid = calculateCatBounce(midBeat, 0.8, false, true, false);
    expect(bounceMid.bounceY).toBeGreaterThan(0.02);

    // Drop phase bounce is higher
    const dropBounce = calculateCatBounce(midBeat, 0.8, true, true, false);
    expect(dropBounce.bounceY).toBeGreaterThan(bounceMid.bounceY);
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
    expect(CAT_SCALE).toBe(0.70);
    expect(CAT_REST_ROTATION_Y).toBe(-0.15);
  });
});
