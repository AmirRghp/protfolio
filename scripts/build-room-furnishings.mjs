// Project-authored geometry, without third-party meshes or textures. Rebuild with: node scripts/build-room-furnishings.mjs
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// The installed exporter uses FileReader when assembling a binary GLB in Node.
globalThis.FileReader ??= class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const wood = new THREE.MeshStandardMaterial({ color: "#89552e", roughness: 0.68 });
const boardEdge = new THREE.MeshStandardMaterial({ color: "#51321d", roughness: 0.82 });
const boardFace = new THREE.MeshStandardMaterial({ color: "#91603b", roughness: 0.9 });
const casing = new THREE.MeshStandardMaterial({ color: "#11181b", roughness: 0.42, metalness: 0.42 });
const screenSeat = new THREE.MeshStandardMaterial({ color: "#17303b", roughness: 0.55 });
const stand = new THREE.MeshStandardMaterial({ color: "#272c2d", roughness: 0.62, metalness: 0.3 });

function panel(name, width, height, depth, radius, material) {
  const bevel = 0.02;
  const halfWidth = width / 2 - bevel;
  const halfHeight = height / 2 - bevel;
  const shape = new THREE.Shape();
  shape.moveTo(-halfWidth + radius, -halfHeight);
  shape.lineTo(halfWidth - radius, -halfHeight);
  shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius);
  shape.lineTo(halfWidth, halfHeight - radius);
  shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight);
  shape.lineTo(-halfWidth + radius, halfHeight);
  shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius);
  shape.lineTo(-halfWidth, -halfHeight + radius);
  shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight);
  const innerDepth = depth - bevel * 2;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: innerDepth, bevelEnabled: true, bevelThickness: bevel,
    bevelSize: bevel, bevelSegments: 2, curveSegments: 4,
  });
  geometry.translate(0, 0, -innerDepth / 2);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  return mesh;
}

const root = new THREE.Group();
root.name = "RoomFurnishings";

const shelves = new THREE.Group();
shelves.name = "EmptyShelves";
for (const [index, y] of [5.45, 4.2].entries()) {
  const shelf = panel(`Shelf${index + 1}`, 2.8, 0.52, 0.16, 0.035, wood);
  shelf.rotation.x = -Math.PI / 2;
  shelf.position.set(2.55, y, -1.16);
  shelves.add(shelf);
}
root.add(shelves);

const board = new THREE.Group();
board.name = "ProjectBoard";
board.position.set(-3.5, 3.65, -1.18);
board.scale.set(1.45, 1, 1);
board.add(panel("BoardFrame", 4.7, 3.25, 0.16, 0.055, boardEdge));
const face = panel("BoardFace", 4.5, 3.05, 0.06, 0.025, boardFace);
face.position.z = 0.115;
board.add(face);
root.add(board);

const desk = new THREE.Group();
desk.name = "Desk";
const top = panel("DeskTop", 11.6, 2.2, 0.18, 0.08, wood);
top.rotation.x = -Math.PI / 2;
top.position.set(0, 1.8, 0.2);
desk.add(top);
const frontEdge = panel("DeskFrontEdge", 11.48, 0.11, 0.08, 0.025, boardEdge);
frontEdge.position.set(0, 1.72, 1.29);
desk.add(frontEdge);
root.add(desk);

const monitor = new THREE.Group();
monitor.name = "Monitor";
const body = panel("MonitorBody", 5.1, 2.9, 0.16, 0.075, casing);
body.position.set(-0.25, 3.25, -0.35);
monitor.add(body);
const seat = panel("ScreenSeat", 4.8, 2.6, 0.02, 0.018, screenSeat);
seat.position.set(-0.25, 3.25, -0.25);
monitor.add(seat);
const neck = panel("MonitorNeck", 0.15, 0.4, 0.16, 0.03, stand);
neck.position.set(-0.25, 2.15, -0.35);
monitor.add(neck);
const foot = panel("MonitorFoot", 0.8, 0.45, 0.06, 0.06, stand);
foot.rotation.x = -Math.PI / 2;
foot.position.set(-0.25, 1.92, -0.25);
monitor.add(foot);
root.add(monitor);

const result = await new GLTFExporter().parseAsync(root, { binary: true, trs: false });
const glb = Buffer.from(result);
assert.equal(glb.toString("ascii", 0, 4), "glTF");
assert.equal(glb.readUInt32LE(4), 2);
assert.equal(glb.readUInt32LE(8), glb.length);

const loaded = await new GLTFLoader().parseAsync(result, "");
for (const name of ["DeskTop", "BoardFrame", "BoardFace", "Shelf1", "Shelf2", "MonitorBody", "ScreenSeat", "MonitorFoot"]) {
  assert.ok(loaded.scene.getObjectByName(name), `Missing ${name} in exported GLB`);
}
const bounds = new THREE.Box3().setFromObject(loaded.scene);
const size = bounds.getSize(new THREE.Vector3());
assert.ok(size.x > 12 && size.x < 13 && size.y > 3.7 && size.y < 4 && size.z > 2.5 && size.z < 3);
const loadedScreen = loaded.scene.getObjectByName("ScreenSeat");
const screenBounds = new THREE.Box3().setFromObject(loadedScreen);
assert.ok(Math.abs(screenBounds.getCenter(new THREE.Vector3()).x + 0.25) < 0.01);
assert.ok(Math.abs(screenBounds.getCenter(new THREE.Vector3()).y - 3.25) < 0.01);

const output = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/models/room-furnishings.glb");
await mkdir(dirname(output), { recursive: true });
await writeFile(output, glb);
process.stdout.write(`${output}: ${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)} m, ${glb.length} bytes\n`);
