// Source and CC BY 4.0 attribution: public/assets/models/ATTRIBUTION.md
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { Box3, Group, Mesh, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

assert.ok(process.argv[2], "Usage: node scripts/prepare-curved-monitor.mjs /path/to/original/curved_monitor.glb");
const bytes = await readFile(process.argv[2]);
assert.equal(createHash("sha256").update(bytes).digest("hex"), "00904f31c4a942fb4fbd2f6a35b693ce39b62e055e960046c01e6982cffac8c0", "Use the reviewed, licensed source GLB");
const { scene } = await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), "");
const screen = scene.getObjectByName("Curved_Monitor_MAT_Screen_0");
assert.ok(screen instanceof Mesh);

// Match the existing monitor width and desk contact; its native forward axis is +X.
scene.rotation.y = -Math.PI / 2;
scene.scale.setScalar(5.1 / new Box3().setFromObject(scene).getSize(new Vector3()).x);
const bounds = new Box3().setFromObject(scene);
const screenCenter = new Box3().setFromObject(screen).getCenter(new Vector3());
scene.position.set(-0.25 - screenCenter.x, 1.9 - bounds.min.y, -0.25 - screenCenter.z);
scene.updateMatrixWorld(true);

const root = new Group();
root.name = "CurvedMonitor";
root.userData = {
  ...scene.userData,
  title: "Curved Monitor",
  author: "Arnau Rocher Alcayde",
  source: "https://sketchfab.com/3d-models/curved-monitor-5aeacd0cc5f649a4b92ce90bca6917e7",
  license: "https://creativecommons.org/licenses/by/4.0/",
  changes: "Baked orientation, uniform scale and placement; renamed meshes; remapped screen UVs; adjusted materials.",
};
let triangles = 0;
scene.traverse((object) => {
  if (!(object instanceof Mesh)) return;
  const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
  const material = object.material.clone();
  const mesh = new Mesh(geometry, material);
  mesh.name = object === screen ? "MonitorScreen" : object.name.startsWith("Peana") ? "MonitorStand" : "MonitorBody";
  material.color.set(object === screen ? "#17303b" : "#263136");
  material.roughness = object === screen ? 0.55 : 0.5;
  material.metalness = object === screen ? 0 : 0.28;
  if (object === screen) {
    // The source atlas distorts text; project full UVs across the screen, respecting its tilt.
    const uv = geometry.attributes.uv;
    const normals = geometry.attributes.normal;
    const forward = new Vector3();
    for (let i = 0; i < normals.count; i++) {
      if (normals.getZ(i) > forward.z) forward.fromBufferAttribute(normals, i);
    }
    const vertical = new Vector3(0, forward.z, -forward.y).normalize();
    const positions = geometry.attributes.position;
    const us = Array.from({ length: uv.count }, (_, i) => positions.getX(i));
    const vs = Array.from({ length: uv.count }, (_, i) => new Vector3().fromBufferAttribute(positions, i).dot(vertical));
    const minU = Math.min(...us), minV = Math.min(...vs);
    const width = Math.max(...us) - minU, height = Math.max(...vs) - minV;
    assert.ok(width > 0 && height > 0);
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (us[i] - minU) / width, (vs[i] - minV) / height);
  }
  triangles += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
  root.add(mesh);
});
assert.equal(triangles, 1188);
assert.equal(root.children.length, 3);

globalThis.FileReader ??= class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};
const result = await new GLTFExporter().parseAsync(root, { binary: true, trs: false });
const loaded = await new GLTFLoader().parseAsync(result, "");
const size = new Box3().setFromObject(loaded.scene).getSize(new Vector3());
assert.ok(loaded.scene.getObjectByName("MonitorScreen") instanceof Mesh);
assert.ok(Math.abs(size.x - 5.1) < 0.001);
const output = new URL("../public/assets/models/curved-monitor.glb", import.meta.url);
await writeFile(output, Buffer.from(result));
console.log(`${output.pathname}: ${size.toArray().map((n) => n.toFixed(3)).join(" × ")} m, ${result.byteLength} bytes, ${triangles} triangles`);
