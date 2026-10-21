// Source and CC BY attribution: public/assets/models/ATTRIBUTION.md
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { Box3, Group, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

assert.ok(process.argv[2], "Usage: node scripts/prepare-curved-monitor.mjs /path/to/original/computer_monitor_lowpoly_model.glb");
const bytes = await readFile(process.argv[2]);
assert.equal(createHash("sha256").update(bytes).digest("hex"), "d0d35e23ecca18038c9b9ed0ddadab2b1a849f882d0f2ddf09084871a9ac10a1", "Use the reviewed, licensed source GLB");
const { scene } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const screen = scene.getObjectByName("Object_4");
assert.ok(screen instanceof Mesh, "The source model must expose its display mesh as Object_4");

// The room composition was built around a monitor of this height standing on the desk at y = 1.9.
const TARGET_HEIGHT = 2.987;
const TARGET_BASE_Y = 1.9;
const TARGET_SCREEN_X = -0.25;
const TARGET_SCREEN_Z = -0.25;

const nativeSize = new Box3().setFromObject(scene).getSize(new Vector3());
scene.scale.setScalar(TARGET_HEIGHT / nativeSize.y);
const bounds = new Box3().setFromObject(scene);
const screenCenter = new Box3().setFromObject(screen).getCenter(new Vector3());
scene.position.set(TARGET_SCREEN_X - screenCenter.x, TARGET_BASE_Y - bounds.min.y, TARGET_SCREEN_Z - screenCenter.z);
scene.updateMatrixWorld(true);

/**
 * The source atlas places the display in a sub rectangle whose axes run across the screen, so the
 * display UV is remapped from the real left/right and bottom/top of the mesh instead of being assumed.
 */
function remapDisplayUv(geometry) {
  const uv = geometry.attributes.uv;
  const positions = geometry.attributes.position;
  const world = new Box3().setFromBufferAttribute(positions);
  const min = world.min;
  const size = world.getSize(new Vector3());

  const samples = [];
  for (let i = 0; i < uv.count; i++) {
    samples.push({
      u: uv.getX(i),
      v: uv.getY(i),
      x: (positions.getX(i) - min.x) / (size.x || 1),
      y: (positions.getY(i) - min.y) / (size.y || 1),
    });
  }

  const fit = (axis, target) => {
    let best = { axis, target, error: Infinity, slope: 0, offset: 0 };
    for (const candidate of ["u", "v"]) {
      const source = samples.map((sample) => sample[candidate]);
      const goal = samples.map((sample) => sample[target]);
      const meanSource = source.reduce((sum, value) => sum + value, 0) / source.length;
      const meanGoal = goal.reduce((sum, value) => sum + value, 0) / goal.length;
      let covariance = 0;
      let variance = 0;
      for (let index = 0; index < source.length; index++) {
        covariance += (source[index] - meanSource) * (goal[index] - meanGoal);
        variance += (source[index] - meanSource) ** 2;
      }
      const slope = variance === 0 ? 0 : covariance / variance;
      const offset = meanGoal - slope * meanSource;
      const error = goal.reduce((sum, value, index) => sum + (value - (slope * source[index] + offset)) ** 2, 0);
      if (error < best.error) best = { axis: candidate, target, error, slope, offset };
    }
    return best;
  }

  const horizontal = fit("u", "x");
  const vertical = fit("v", "y");
  assert.ok(horizontal.error < 0.01, "The display UV must map onto the width of the screen");
  assert.ok(vertical.error < 0.01, "The display UV must map onto the height of the screen");

  // The display UV is rebuilt from the real left/right and bottom/top of the mesh, so the atlas
  // orientation of the source model cannot flip the projected desktop.
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(
      i,
      (positions.getX(i) - min.x) / (size.x || 1),
      (positions.getY(i) - min.y) / (size.y || 1),
    );
  }
  uv.needsUpdate = true;
}

const root = new Group();
root.name = "Monitor";
root.userData = {
  ...scene.userData,
  title: "Computer Monitor Lowpoly Model",
  author: "Marco Zakaria (https://sketchfab.com/marcoZakaria)",
  source: "https://sketchfab.com/3d-models/computer-monitor-lowpoly-model-1d4ee42eda804b02b05b63721921c1d7",
  license: "CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)",
  changes: "Scaled and placed on the desk; transforms baked; display UV remapped to 0-1; screen recoloured.",
};

const names = new Map([
  ["Object_4", "MonitorScreen"],
  ["Object_5", "MonitorBody"],
  ["Object_7", "MonitorStand"],
  ["Object_9", "MonitorBase"],
]);

let triangles = 0;
scene.traverse((object) => {
  if (!(object instanceof Mesh)) return;
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
  const material = object.material.clone();
  const mesh = new Mesh(geometry, material);
  mesh.name = names.get(object.name) ?? object.name;
  if (mesh.name === "MonitorScreen") {
    // The HTML desktop is projected on this surface, so the physical screen stays a neutral dark panel.
    remapDisplayUv(geometry);
    material.color.set("#0a1622");
    material.emissive.set("#000000");
    material.emissiveIntensity = 0;
    material.roughness = 0.55;
    material.metalness = 0.1;
  }
  triangles += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
  root.add(mesh);
});
assert.equal(triangles, 1002);
assert.equal(root.children.length, 4);

globalThis.FileReader ??= class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};
const result = await new GLTFExporter().parseAsync(root, { binary: true, trs: false });
const loaded = await new GLTFLoader().parseAsync(result, "");
const size = new Box3().setFromObject(loaded.scene).getSize(new Vector3());
const display = loaded.scene.getObjectByName("MonitorScreen");
assert.ok(display instanceof Mesh);
assert.ok(Math.abs(size.y - TARGET_HEIGHT) < 0.001);
assert.ok(Math.abs(size.x - 4.361) < 0.01, `Unexpected monitor width ${size.x}`);
const displayBounds = new Box3().setFromObject(display);
assert.ok(Math.abs(displayBounds.min.y - 2.685) < 0.01, `Unexpected display bottom ${displayBounds.min.y}`);
assert.ok(Math.abs(displayBounds.max.y - 4.823) < 0.01, `Unexpected display top ${displayBounds.max.y}`);
assert.ok(Math.abs(displayBounds.getCenter(new Vector3()).x - TARGET_SCREEN_X) < 0.001);
assert.ok(Math.abs(displayBounds.getCenter(new Vector3()).z - TARGET_SCREEN_Z) < 0.001);
const output = new URL("../public/assets/models/curved-monitor.glb", import.meta.url);
await writeFile(output, Buffer.from(result));
console.log(
  `${output.pathname}: ${size.toArray().map((n) => n.toFixed(3)).join(" × ")} m, ${result.byteLength} bytes, ${triangles} triangles, display ${displayBounds.getSize(new Vector3()).toArray().map((n) => n.toFixed(3)).join(" × ")}`,
);
