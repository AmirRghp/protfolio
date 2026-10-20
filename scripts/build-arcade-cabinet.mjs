// Project-authored geometry, without third-party meshes or textures. Rebuild with: node scripts/build-arcade-cabinet.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";
import process from "node:process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

// Three's exporter uses FileReader to assemble its binary GLB; Node exposes Blob but not FileReader.
globalThis.FileReader ??= class {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.();
  }
};

const root = new THREE.Group();
root.name = "ArcadeCabinet";

const materials = {
  case: new THREE.MeshStandardMaterial({ color: "#47372b", roughness: 0.76 }),
  edge: new THREE.MeshStandardMaterial({ color: "#242628", roughness: 0.68, metalness: 0.42 }),
  bezel: new THREE.MeshStandardMaterial({ color: "#101719", roughness: 0.42, metalness: 0.58 }),
  screen: new THREE.MeshStandardMaterial({ color: "#246070", emissive: "#174452", emissiveIntensity: 0.55, roughness: 0.28 }),
  marquee: new THREE.MeshStandardMaterial({ color: "#d39a4c", emissive: "#a35c20", emissiveIntensity: 0.35, roughness: 0.45 }),
  buttonRed: new THREE.MeshStandardMaterial({ color: "#b95134", roughness: 0.38 }),
  buttonGold: new THREE.MeshStandardMaterial({ color: "#d3a14b", roughness: 0.38 }),
};

function box(name, size, position, material, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  root.add(mesh);
  return mesh;
}

function cylinder(name, radius, height, position, material, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  root.add(mesh);
  return mesh;
}

const profile = new THREE.Shape();
profile.moveTo(-0.46, 0);
profile.lineTo(0.46, 0);
profile.lineTo(0.39, 1.43);
profile.lineTo(-0.39, 1.43);
profile.closePath();
const cabinet = new THREE.Mesh(
  new THREE.ExtrudeGeometry(profile, { depth: 0.68, bevelEnabled: true, bevelSegments: 1, bevelSize: 0.025, bevelThickness: 0.025 }),
  materials.case,
);
cabinet.name = "TaperedCabinetBody";
cabinet.position.y = 0.16;
cabinet.position.z = -0.34;
root.add(cabinet);

box("Base", [0.96, 0.16, 0.78], [0, 0.08, 0.02], materials.edge);
box("ScreenBezel", [0.61, 0.49, 0.075], [0, 1.28, 0.37], materials.bezel, [-0.12, 0, 0]);
box("Screen", [0.49, 0.36, 0.02], [0, 1.29, 0.416], materials.screen, [-0.12, 0, 0]);
box("MarqueeHousing", [0.78, 0.28, 0.12], [0, 1.75, 0.34], materials.edge);
box("BlankMarquee", [0.58, 0.15, 0.025], [0, 1.75, 0.412], materials.marquee);
box("ControlDeck", [0.75, 0.075, 0.34], [0, 0.99, 0.52], materials.edge, [0.2, 0, 0]);

cylinder("JoystickBase", 0.085, 0.035, [-0.22, 1.06, 0.54], materials.bezel, [0.2, 0, 0]);
cylinder("JoystickStem", 0.022, 0.13, [-0.22, 1.14, 0.54], materials.edge, [0.2, 0, 0]);
const joystick = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), materials.buttonRed);
joystick.name = "JoystickKnob";
joystick.position.set(-0.22, 1.21, 0.54);
root.add(joystick);
[-0.04, 0.12, 0.28].forEach((x, index) => cylinder(
  `ActionButton${index + 1}`,
  0.045,
  0.04,
  [x, 1.08, 0.57],
  index === 1 ? materials.buttonRed : materials.buttonGold,
  [0.2, 0, 0],
));

box("CoinDoor", [0.34, 0.27, 0.035], [0, 0.43, 0.365], materials.bezel);
box("CoinSlot", [0.09, 0.018, 0.012], [0, 0.48, 0.389], materials.marquee);
[-0.27, 0.27].forEach((x, index) => cylinder("Speaker" + (index + 1), 0.055, 0.018, [x, 1.08, 0.385], materials.edge, [Math.PI / 2, 0, 0]));

const output = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/models/arcade-cabinet.glb");
await mkdir(dirname(output), { recursive: true });
const result = await new GLTFExporter().parseAsync(root, { binary: true, trs: false });
await writeFile(output, Buffer.from(result));

const bounds = new THREE.Box3().setFromObject(root);
const size = bounds.getSize(new THREE.Vector3());
const triangles = root.children.reduce((sum, object) => sum + (object.isMesh ? object.geometry.index?.count / 3 || object.geometry.attributes.position.count / 3 : 0), 0);
if (bounds.min.y < -0.001 || size.y < 1.8 || size.y > 2 || triangles < 500) {
  throw new Error("Arcade cabinet bounds or geometry are outside the intended range.");
}
const glb = Buffer.from(result);
if (glb.toString("ascii", 0, 4) !== "glTF" || glb.readUInt32LE(4) !== 2 || glb.readUInt32LE(8) !== glb.length) {
  throw new Error("Three.js did not produce a valid binary glTF 2.0 file.");
}
process.stdout.write(`${output}: ${size.x.toFixed(3)} × ${size.y.toFixed(3)} × ${size.z.toFixed(3)} m, ${triangles} triangles, ${result.byteLength} bytes\n`);
