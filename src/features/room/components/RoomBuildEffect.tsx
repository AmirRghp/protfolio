import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Group,
  LinearFilter,
  LineSegments,
  Mesh,
  Object3D,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import type { RoomBuildItemGroup, RoomBuildState } from "@/features/room/utils/roomBuildAnimation";

const edgesCache = new WeakMap<BufferGeometry, BufferGeometry>();
const _tempBox = new Box3();

function getCachedEdgesGeometry(geometry: BufferGeometry, thresholdAngle: number): BufferGeometry {
  let cached = edgesCache.get(geometry);
  if (!cached) {
    cached = new EdgesGeometry(geometry, thresholdAngle);
    edgesCache.set(geometry, cached);
  }
  return cached;
}

export function classifyRoomObjectGroup(object: Object3D): RoomBuildItemGroup | null {
  let current: Object3D | null = object;
  while (current) {
    const name = current.name || "";
    if (name === "focus-hotspot") return null;
    if (name === "ArcadeMachine" || name === "EmptyShelves" || name === "Shelf1" || name === "Shelf2") {
      return "shelvesAndArcade";
    }
    if (name === "MonitorBody" || name === "MonitorScreen" || name.includes("Monitor")) {
      return "monitor";
    }
    if (name === "MousePad" || name === "CompactKeyboard" || name === "ComputerMouse") {
      return "peripherals";
    }
    if (name === "CoffeeMug" || name === "OiiaCat" || name === "BatmanFigure") {
      return "props";
    }
    if (name === "Desk" || name === "DeskTop" || name === "DeskFrontEdge" || name === "RoomFurnishings") {
      return "architecture";
    }
    current = current.parent;
  }
  return "architecture";
}

function createSurfaceOccluderMaterial(worldMinY: number, worldMaxY: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uGroupProgress: { value: 0 },
      uMinY: { value: worldMinY },
      uMaxY: { value: worldMaxY },
    },
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uGroupProgress;
      uniform float uMinY;
      uniform float uMaxY;
      varying vec3 vWorldPos;

      void main() {
        if (uGroupProgress <= 0.001) discard;
        float span = max(0.05, uMaxY - uMinY);
        float normY = clamp((vWorldPos.y - uMinY) / span, 0.0, 1.0);
        float activeLimit = uGroupProgress * 1.14;
        if (normY > activeLimit) discard;

        // Rising 3D laser construction slice right at the active extrusion front
        float sliceDist = abs(normY - activeLimit);
        float activeSlice = (uGroupProgress > 0.02 && uGroupProgress < 0.97)
          ? smoothstep(0.09, 0.0, sliceDist)
          : 0.0;
        float laserLine = (uGroupProgress > 0.02 && uGroupProgress < 0.97)
          ? smoothstep(0.024, 0.003, sliceDist) * 0.72
          : 0.0;

        // Radial 3D distance from the workspace focal hub (curved monitor & desk center)
        vec3 focalHub = vec3(-1.15, 2.85, 0.45);
        float radialDist = length((vWorldPos - focalHub) * vec3(0.11, 0.14, 0.11));
        float worldCoord = clamp(radialDist * 0.75 + (vWorldPos.y * 0.04) + 0.12, 0.02, 0.98);

        gl_FragColor = vec4(laserLine, max(uGroupProgress * 0.5, activeSlice), worldCoord, 1.0);
      }
    `,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

function createWireframeLineMaterial(worldMinY: number, worldMaxY: number, depthBias: number = 0.0008): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uGroupProgress: { value: 0 },
      uMinY: { value: worldMinY },
      uMaxY: { value: worldMaxY },
      uIntensity: { value: 1.0 },
      uDepthBias: { value: depthBias },
    },
    vertexShader: `
      uniform float uDepthBias;
      varying vec3 vWorldPos;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPosition.xyz;
        vec4 clipPos = projectionMatrix * viewMatrix * worldPosition;
        clipPos.z -= uDepthBias * clipPos.w;
        gl_Position = clipPos;
      }
    `,
    fragmentShader: `
      uniform float uGroupProgress;
      uniform float uMinY;
      uniform float uMaxY;
      uniform float uIntensity;
      varying vec3 vWorldPos;

      void main() {
        if (uGroupProgress <= 0.001) discard;
        float span = max(0.05, uMaxY - uMinY);
        float normY = clamp((vWorldPos.y - uMinY) / span, 0.0, 1.0);
        float activeLimit = uGroupProgress * 1.12;
        if (normY > activeLimit) discard;

        float sliceDist = abs(normY - activeLimit);
        float activeSlice = (uGroupProgress > 0.02 && uGroupProgress < 0.97)
          ? smoothstep(0.12, 0.0, sliceDist)
          : 0.0;

        vec3 focalHub = vec3(-1.15, 2.85, 0.45);
        float radialDist = length((vWorldPos - focalHub) * vec3(0.11, 0.14, 0.11));
        float worldCoord = clamp(radialDist * 0.75 + (vWorldPos.y * 0.04) + 0.12, 0.02, 0.98);

        gl_FragColor = vec4(uIntensity, max(uGroupProgress * 0.5, activeSlice), worldCoord, 1.0);
      }
    `,
    depthTest: true,
    depthWrite: false,
  });
}

/**
 * Builds bespoke 3D spatial calibration geometry tailored to the AI Engineer study room:
 * - Precision desk drafting sub-grid + fiducial crosshairs (+) at y = 1.908
 * - Back-wall horizon datum lines & angled neural vector rays from the monitor core
 * - 3D target-lock corner brackets ([ ]) framing the Curved Monitor, Batman shelf, Mug, and Oiia Cat
 */
function createSupplementaryCadGeometry(): {
  architectureGeo: BufferGeometry;
  shelvesGeo: BufferGeometry;
  peripheralsGeo: BufferGeometry;
} {
  const archVerts: number[] = [];
  const pushSeg = (
    arr: number[],
    x1: number,
    y1: number,
    z1: number,
    x2: number,
    y2: number,
    z2: number,
  ) => {
    arr.push(x1, y1, z1, x2, y2, z2);
  };

  const pushCrosshairXZ = (arr: number[], cx: number, y: number, cz: number, arm: number) => {
    pushSeg(arr, cx - arm, y, cz, cx + arm, y, cz);
    pushSeg(arr, cx, y, cz - arm, cx, y, cz + arm);
  };

  const pushCrosshairXY = (arr: number[], cx: number, cy: number, z: number, arm: number) => {
    pushSeg(arr, cx - arm, cy, z, cx + arm, cy, z);
    pushSeg(arr, cx, cy - arm, z, cx, cy + arm, z);
  };

  const pushCornerBrackets3D = (
    arr: number[],
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    minZ: number,
    maxZ: number,
    len: number,
  ) => {
    const xs = [minX, maxX];
    const ys = [minY, maxY];
    const zs = [minZ, maxZ];
    for (const x of xs) {
      const dx = x === minX ? len : -len;
      for (const y of ys) {
        const dy = y === minY ? len : -len;
        for (const z of zs) {
          const dz = z === minZ ? len : -len;
          pushSeg(arr, x, y, z, x + dx, y, z);
          pushSeg(arr, x, y, z, x, y + dy, z);
          pushSeg(arr, x, y, z, x, y, z + dz);
        }
      }
    }
  };

  // 1. Back-wall architectural datum horizons & vertical axes with fiducial crosshairs (+)
  const wallZ = -1.392;
  for (const y of [1.91, 3.42, 4.20, 5.45]) {
    pushSeg(archVerts, -5.9, y, wallZ, 5.9, y, wallZ);
  }
  for (const x of [-3.85, -1.42, 0.42, 1.96, 2.95]) {
    pushSeg(archVerts, x, 1.91, wallZ, x, 6.85, wallZ);
  }

  // Wall fiducial crosshairs (+) at datum intersections
  for (const [wx, wy] of [
    [-3.85, 3.42],
    [-3.85, 5.45],
    [-1.42, 5.45],
    [0.42, 3.42],
    [0.42, 5.45],
    [2.95, 5.45],
  ]) {
    pushCrosshairXY(archVerts, wx, wy, wallZ + 0.003, 0.11);
  }

  // 2. Crisp DeskTop perimeter, front apron, and precision tabletop drafting sub-grid (y = 1.912)
  const deskTopY = 1.910;
  const deskBotY = 1.712;
  pushSeg(archVerts, -5.78, deskTopY, -0.89, 2.95, deskTopY, -0.89);
  pushSeg(archVerts, -5.74, deskTopY, 3.79, 2.94, deskTopY, 3.79);
  pushSeg(archVerts, -5.74, deskBotY, 3.79, 2.94, deskBotY, 3.79);
  pushSeg(archVerts, 2.95, deskTopY, -0.89, 2.95, deskTopY, 3.79);
  pushSeg(archVerts, 2.95, deskBotY, -0.89, 2.95, deskBotY, 3.79);
  pushSeg(archVerts, 2.94, deskBotY, 3.79, 2.94, deskTopY, 3.79);

  // Tabletop calibration grid lines & crosshairs (+) across the desk plane
  const gridY = 1.912;
  for (const z of [0.25, 1.35, 2.65, 3.42]) {
    pushSeg(archVerts, -5.2, gridY, z, 2.88, gridY, z);
  }
  for (const x of [-4.1, -1.42, 0.32, 1.80, 2.62]) {
    pushSeg(archVerts, x, gridY, -0.75, x, gridY, 3.68);
  }
  for (const [gx, gz] of [
    [-4.1, 1.35],
    [-4.1, 2.65],
    [0.32, 0.25],
    [0.32, 2.65],
    [1.80, 0.25],
    [1.80, 2.65],
    [2.62, 1.35],
    [2.62, 2.65],
  ]) {
    pushCrosshairXZ(archVerts, gx, gridY + 0.001, gz, 0.09);
  }

  const architectureGeo = new BufferGeometry();
  architectureGeo.setAttribute("position", new BufferAttribute(new Float32Array(archVerts), 3));

  // 3. Wall shelves perimeter & 3D Computer-Vision Target-Lock Brackets around Batman Figure
  const shelfVerts: number[] = [];
  const sCenterX = -0.59 + 2.55 * 0.86;
  const sHalfW = (2.8 * 0.86) / 2;
  const sLeft = sCenterX - sHalfW;
  const sRight = sCenterX + sHalfW;
  const sBackZ = -1.40;
  const sFrontZ = -0.90;
  for (const y of [4.2, 5.45]) {
    for (const dy of [-0.075, 0.075]) {
      const sy = y + dy;
      pushSeg(shelfVerts, sLeft, sy, sFrontZ, sRight, sy, sFrontZ);
      pushSeg(shelfVerts, sLeft, sy, sBackZ, sRight, sy, sBackZ);
      pushSeg(shelfVerts, sLeft, sy, sBackZ, sLeft, sy, sFrontZ);
      pushSeg(shelfVerts, sRight, sy, sBackZ, sRight, sy, sFrontZ);
    }
    pushSeg(shelfVerts, sLeft, y - 0.075, sFrontZ, sLeft, y + 0.075, sFrontZ);
    pushSeg(shelfVerts, sRight, y - 0.075, sFrontZ, sRight, y + 0.075, sFrontZ);
  }
  // 3D Target-Lock bounding brackets around the Batman Figure on the lower shelf ([0.92, 4.28, -1.12])
  pushCornerBrackets3D(shelfVerts, 0.58, 1.26, 4.30, 5.24, -1.32, -0.88, 0.12);

  const shelvesGeo = new BufferGeometry();
  shelvesGeo.setAttribute("position", new BufferAttribute(new Float32Array(shelfVerts), 3));

  // 4. MousePad rounded CAD perimeter & 3D Target-Lock brackets for Mug ([0.72, 1.906, 1.35]) & Oiia Cat ([1.80, 1.906, 1.65])
  const periphVerts: number[] = [];
  const padCx = -1.55;
  const padCy = 1.911;
  const padCz = 1.76;
  const cosR = Math.cos(0.32);
  const sinR = Math.sin(0.32);
  const addRectLoop = (halfW: number, halfD: number, yOff: number) => {
    const corners: [number, number][] = [
      [-halfW, -halfD],
      [halfW, -halfD],
      [halfW, halfD],
      [-halfW, halfD],
    ];
    for (let i = 0; i < 4; i++) {
      const [lx1, lz1] = corners[i];
      const [lx2, lz2] = corners[(i + 1) % 4];
      const wx1 = padCx + lx1 * cosR + lz1 * sinR;
      const wz1 = padCz - lx1 * sinR + lz1 * cosR;
      const wx2 = padCx + lx2 * cosR + lz2 * sinR;
      const wz2 = padCz - lx2 * sinR + lz2 * cosR;
      pushSeg(periphVerts, wx1, padCy + yOff, wz1, wx2, padCy + yOff, wz2);
    }
  };
  addRectLoop(1.94, 0.94, 0.002);
  addRectLoop(1.89, 0.89, 0.010);

  // Target-lock 3D corner brackets around the Coffee Mug and Oiia Cat on the right side of the desk
  pushCornerBrackets3D(periphVerts, 0.42, 1.06, 1.92, 2.52, 1.06, 1.64, 0.09);
  pushCornerBrackets3D(periphVerts, 1.44, 2.16, 1.92, 2.52, 1.30, 2.00, 0.10);

  const peripheralsGeo = new BufferGeometry();
  peripheralsGeo.setAttribute("position", new BufferAttribute(new Float32Array(periphVerts), 3));

  return { architectureGeo, shelvesGeo, peripheralsGeo };
}

type SyncedEntry = {
  source: Mesh;
  occluder: Mesh;
  wireframe: LineSegments | null;
  group: RoomBuildItemGroup;
  localBox: Box3;
  occluderMat: ShaderMaterial;
  wireMat: ShaderMaterial | null;
};

export class RoomBlueprintPipeline {
  readonly target: WebGLRenderTarget;
  readonly blueprintScene: Scene;
  private entries: SyncedEntry[] = [];
  private supplementaryGroup: Group;
  private supplementaryMats: { group: RoomBuildItemGroup; mat: ShaderMaterial }[] = [];
  private supplementaryGeos: BufferGeometry[] = [];
  private trackedMeshCount = -1;
  private clearColorBackup = new Color();

  constructor(width: number, height: number) {
    this.target = new WebGLRenderTarget(Math.max(1, width), Math.max(1, height), {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
      depthBuffer: true,
    });
    this.blueprintScene = new Scene();
    this.blueprintScene.matrixWorldAutoUpdate = false;
    this.supplementaryGroup = new Group();
    this.supplementaryGroup.renderOrder = 2;
    this.blueprintScene.add(this.supplementaryGroup);
    this.initSupplementaryCadLines();
  }

  private initSupplementaryCadLines() {
    const { architectureGeo, shelvesGeo, peripheralsGeo } = createSupplementaryCadGeometry();
    this.supplementaryGeos.push(architectureGeo, shelvesGeo, peripheralsGeo);

    const archMat = createWireframeLineMaterial(1.6, 7.2, 0.00018);
    archMat.uniforms.uIntensity.value = 0.56;
    const archLines = new LineSegments(architectureGeo, archMat);
    archLines.renderOrder = 2;
    archLines.frustumCulled = false;

    const shelvesMat = createWireframeLineMaterial(4.0, 5.6, 0.00025);
    shelvesMat.uniforms.uIntensity.value = 0.88;
    const shelvesLines = new LineSegments(shelvesGeo, shelvesMat);
    shelvesLines.renderOrder = 2;
    shelvesLines.frustumCulled = false;

    const periphMat = createWireframeLineMaterial(1.85, 2.60, 0.00025);
    periphMat.uniforms.uIntensity.value = 0.90;
    const periphLines = new LineSegments(peripheralsGeo, periphMat);
    periphLines.renderOrder = 2;
    periphLines.frustumCulled = false;

    this.supplementaryGroup.add(archLines, shelvesLines, periphLines);
    this.supplementaryMats.push(
      { group: "architecture", mat: archMat },
      { group: "shelvesAndArcade", mat: shelvesMat },
      { group: "peripherals", mat: periphMat },
    );
  }

  setSize(width: number, height: number) {
    this.target.setSize(Math.max(1, width), Math.max(1, height));
  }

  syncWithScene(sourceScene: Scene) {
    const candidateMeshes: Mesh[] = [];
    sourceScene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;
      if (!obj.visible) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (mat && mat.transparent && mat.opacity < 0.85) return;
      const group = classifyRoomObjectGroup(obj);
      if (!group) return;
      candidateMeshes.push(obj);
    });

    if (candidateMeshes.length === this.trackedMeshCount) {
      return;
    }
    this.trackedMeshCount = candidateMeshes.length;

    for (const entry of this.entries) {
      this.blueprintScene.remove(entry.occluder);
      if (entry.wireframe) this.blueprintScene.remove(entry.wireframe);
      entry.occluderMat.dispose();
      entry.wireMat?.dispose();
    }
    this.entries = [];

    for (const mesh of candidateMeshes) {
      const group = classifyRoomObjectGroup(mesh) ?? "architecture";
      const triCount = mesh.geometry.index
        ? mesh.geometry.index.count / 3
        : (mesh.geometry.attributes.position?.count ?? 0) / 3;

      // Ultra-dense organic meshes (> 11k tris: batman.glb, oiia-cat.glb, mouse-pad.glb)
      // get their crisp 1px contours directly from the GPU Sobel pass on tDiffuse without
      // re-rasterizing 82k triangles in the secondary blueprint pass.
      if (triCount > 11000) {
        continue;
      }

      if (!mesh.geometry.boundingBox) {
        mesh.geometry.computeBoundingBox();
      }
      const localBox = (mesh.geometry.boundingBox ?? new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1))).clone();

      const occluderMat = createSurfaceOccluderMaterial(0, 5);
      const occluder = new Mesh(mesh.geometry, occluderMat);
      occluder.renderOrder = 0;
      occluder.matrixAutoUpdate = false;
      occluder.frustumCulled = false;
      this.blueprintScene.add(occluder);

      let wireframe: LineSegments | null = null;
      let wireMat: ShaderMaterial | null = null;
      if (mesh.name !== "BackWall" && triCount > 0) {
        const threshold =
          group === "architecture"
            ? 18
            : group === "monitor"
              ? 20
              : 25;
        const edgesGeo = getCachedEdgesGeometry(mesh.geometry, threshold);
        if ((edgesGeo.attributes.position?.count ?? 0) > 0) {
          wireMat = createWireframeLineMaterial(0, 5, 0.00012);
          wireframe = new LineSegments(edgesGeo, wireMat);
          wireframe.renderOrder = 1;
          wireframe.matrixAutoUpdate = false;
          wireframe.frustumCulled = false;
          this.blueprintScene.add(wireframe);
        }
      }

      this.entries.push({
        source: mesh,
        occluder,
        wireframe,
        group,
        localBox,
        occluderMat,
        wireMat,
      });
    }
  }

  render(gl: WebGLRenderer, sourceScene: Scene, camera: Object3D, buildState: RoomBuildState) {
    sourceScene.updateMatrixWorld(true);
    this.syncWithScene(sourceScene);

    for (const entry of this.entries) {
      const groupProg = buildState.itemProgress[entry.group];
      _tempBox.copy(entry.localBox).applyMatrix4(entry.source.matrixWorld);
      const minY = Number.isFinite(_tempBox.min.y) ? _tempBox.min.y : 0;
      const maxY = Number.isFinite(_tempBox.max.y) ? Math.max(minY + 0.08, _tempBox.max.y) : 5;

      entry.occluder.matrix.copy(entry.source.matrixWorld);
      entry.occluder.matrixWorld.copy(entry.source.matrixWorld);
      entry.occluderMat.uniforms.uGroupProgress.value = groupProg;
      entry.occluderMat.uniforms.uMinY.value = minY;
      entry.occluderMat.uniforms.uMaxY.value = maxY;

      if (entry.wireframe && entry.wireMat) {
        entry.wireframe.matrix.copy(entry.source.matrixWorld);
        entry.wireframe.matrixWorld.copy(entry.source.matrixWorld);
        entry.wireMat.uniforms.uGroupProgress.value = groupProg;
        entry.wireMat.uniforms.uMinY.value = minY;
        entry.wireMat.uniforms.uMaxY.value = maxY;
      }
    }

    for (const item of this.supplementaryMats) {
      item.mat.uniforms.uGroupProgress.value = buildState.itemProgress[item.group];
    }

    const prevTarget = gl.getRenderTarget();
    gl.getClearColor(this.clearColorBackup);
    const prevClearAlpha = gl.getClearAlpha();

    gl.setRenderTarget(this.target);
    gl.setClearColor(0x000000, 0.0);
    gl.clear(true, true, false);
    gl.render(this.blueprintScene, camera as never);

    gl.setClearColor(this.clearColorBackup, prevClearAlpha);
    gl.setRenderTarget(prevTarget);
  }

  dispose() {
    for (const entry of this.entries) {
      entry.occluderMat.dispose();
      entry.wireMat?.dispose();
    }
    for (const item of this.supplementaryMats) {
      item.mat.dispose();
    }
    for (const geo of this.supplementaryGeos) {
      geo.dispose();
    }
    this.target.dispose();
  }
}

export function createRoomBuildShaderPass(blueprintTexture: WebGLRenderTarget["texture"]): ShaderPass {
  const pass = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      tBlueprint: { value: null },
      uResolution: { value: new Vector2(1440, 900) },
      uPixelScale: { value: 11.0 },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uWireframeStrength: { value: 0 },
      uDitherStrength: { value: 0 },
      uRevealProgress: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform sampler2D tBlueprint;
      uniform vec2 uResolution;
      uniform float uPixelScale;
      uniform float uTime;
      uniform float uProgress;
      uniform float uWireframeStrength;
      uniform float uDitherStrength;
      uniform float uRevealProgress;
      varying vec2 vUv;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float luma(vec3 c) {
        return dot(c, vec3(0.299, 0.587, 0.114));
      }

      void main() {
        vec4 litColor = texture2D(tDiffuse, vUv);
        if (uRevealProgress >= 0.999) {
          gl_FragColor = litColor;
          return;
        }

        // 1. Quantized matrix cell coordinates with sub-cell micro-framing
        float cellPx = max(6.0, uPixelScale);
        vec2 cellCoord = floor(gl_FragCoord.xy / cellPx);
        vec2 cellLocalUv = fract(gl_FragCoord.xy / cellPx);
        vec2 cellCenterUv = clamp((cellCoord + 0.5) * cellPx / uResolution, 0.001, 0.999);

        // Micro-framed LED matrix cell shape: 1px dark technical gap around each tile + bright inner core
        float borderGap = 1.0 / cellPx;
        float tileMask = step(borderGap, cellLocalUv.x) * step(borderGap, cellLocalUv.y)
                       * step(cellLocalUv.x, 1.0 - borderGap) * step(cellLocalUv.y, 1.0 - borderGap);
        vec2 tileCenterDist = abs(cellLocalUv - 0.5);
        float corePip = step(max(tileCenterDist.x, tileCenterDist.y), 0.22);

        vec4 cellBp = texture2D(tBlueprint, cellCenterUv);
        float cellSliceEnergy = cellBp.g;
        float cellWorldRadial = cellBp.b;
        float cellBuilt = cellBp.a;

        float cellHash = hash21(cellCoord);
        float timeStep = floor(uTime * 9.0);
        float cellShimmer = hash21(cellCoord + vec2(timeStep * 13.7, timeStep * 7.3));

        // 2. Concentric 3D Spatial Sonar Pulse + Harmonic Interference Wave
        float aspect = uResolution.x / max(1.0, uResolution.y);
        vec2 p = (cellCenterUv - vec2(0.41, 0.52)) * vec2(aspect, 1.0);
        float screenRadial = length(p);

        // Outward-expanding 3D spatial sonar rings from the monitor/desk hub
        float sonarPhase1 = cellWorldRadial * 19.0 - uTime * 3.8 + sin(p.x * 4.5 + p.y * 3.0) * 0.55;
        float sonarPhase2 = screenRadial * 14.0 - cellWorldRadial * 9.0 + uTime * 2.9;
        float ring1 = pow(max(0.0, sin(sonarPhase1)), 6.0);
        float ring2 = pow(max(0.0, cos(sonarPhase2)), 8.0) * 0.78;

        // Active 3D-printing extrusion burst right along the rising item slice
        float extrusionBurst = smoothstep(0.52, 0.98, cellSliceEnergy) * 0.85;

        float waveEnvelope = (ring1 + ring2 + extrusionBurst) * step(0.02, cellBuilt) * uDitherStrength;

        // Matrix dither activation with quantized slate-to-cyan-to-orchid palette
        float ditherMask = step(mix(0.30, 0.90, cellHash), waveEnvelope) * tileMask;
        float rawShade = clamp((waveEnvelope - cellHash * 0.22) * 0.96 + cellShimmer * 0.22, 0.0, 1.0);
        float qLevel = (floor(rawShade * 5.0) + 1.0) / 6.0;

        // Deep nocturnal void base (#020309) with bi-chromatic cyber-slate, ice-cyan, and electric-orchid dither tiles
        vec3 voidBg = vec3(0.008, 0.012, 0.032);
        vec3 slateTile = vec3(0.38, 0.45, 0.58);
        vec3 cyanTile = vec3(0.32, 0.84, 0.98);
        vec3 orchidTile = vec3(0.78, 0.50, 0.98);
        float spectralMix = clamp(cellCenterUv.x * 0.65 + (1.0 - cellCenterUv.y) * 0.35 + sin(uTime * 1.6) * 0.15, 0.0, 1.0);
        vec3 accentHue = mix(cyanTile, orchidTile, spectralMix);

        // High-energy cells & rising construction slices shift toward glowing cyan/orchid with a bright center pip
        float chromaFactor = clamp(smoothstep(0.55, 0.95, qLevel) * 0.55 + extrusionBurst * 0.65, 0.0, 1.0);
        vec3 tileTint = mix(slateTile, accentHue, chromaFactor);
        vec3 activeTileColor = tileTint * (qLevel * 0.68 + corePip * qLevel * 0.26);
        vec3 ditherBlockColor = mix(voidBg, activeTileColor, ditherMask);

        // 3. Full-resolution 1px CAD wireframe edges + GPU Sobel contours + 3D Laser Extrusion Slice
        vec4 bp = texture2D(tBlueprint, vUv);
        vec2 texel = 1.0 / uResolution;

        float tl = luma(texture2D(tDiffuse, vUv + texel * vec2(-1.0,  1.0)).rgb);
        float tc = luma(texture2D(tDiffuse, vUv + texel * vec2( 0.0,  1.0)).rgb);
        float tr = luma(texture2D(tDiffuse, vUv + texel * vec2( 1.0,  1.0)).rgb);
        float ml = luma(texture2D(tDiffuse, vUv + texel * vec2(-1.0,  0.0)).rgb);
        float mr = luma(texture2D(tDiffuse, vUv + texel * vec2( 1.0,  0.0)).rgb);
        float bl = luma(texture2D(tDiffuse, vUv + texel * vec2(-1.0, -1.0)).rgb);
        float bc = luma(texture2D(tDiffuse, vUv + texel * vec2( 0.0, -1.0)).rgb);
        float br = luma(texture2D(tDiffuse, vUv + texel * vec2( 1.0, -1.0)).rgb);

        float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
        float gy = -tl - 2.0 * tc - tr + bl + 2.0 * bc + br;
        float lumaEdge = smoothstep(0.10, 0.28, sqrt(gx * gx + gy * gy));

        float wL = texture2D(tBlueprint, vUv + texel * vec2(-1.0, 0.0)).b;
        float wR = texture2D(tBlueprint, vUv + texel * vec2( 1.0, 0.0)).b;
        float wU = texture2D(tBlueprint, vUv + texel * vec2( 0.0, 1.0)).b;
        float wD = texture2D(tBlueprint, vUv + texel * vec2( 0.0,-1.0)).b;
        float depthEdge = smoothstep(0.015, 0.045, abs(wR - wL) + abs(wU - wD));

        // High-poly props (Batman, OiiaCat) fade in during the props window (0.35..0.56) inside their 3D target brackets
        float lumaPropsGate = smoothstep(0.34, 0.56, uProgress) * bp.a;
        float combinedEdge = clamp(bp.r + max(lumaEdge * 0.86 * lumaPropsGate, depthEdge * 0.95 * bp.a), 0.0, 1.0);

        // Color the wireframe: crisp ice-white (#eef8ff) on built edges, glowing electric cyan/orchid on the active 3D laser slice
        float pixelLaserCrest = smoothstep(0.55, 0.98, bp.g);
        vec3 wireBaseColor = vec3(0.93, 0.97, 1.0);
        vec3 wireLaserColor = mix(vec3(0.22, 0.86, 1.0), vec3(0.92, 0.48, 1.0), clamp(vUv.x * 0.8 + (1.0 - vUv.y) * 0.3, 0.0, 1.0));
        vec3 wireColor = mix(wireBaseColor, wireLaserColor, pixelLaserCrest * 0.82);

        // 4. Radial 3D Materialization Wave from Workspace Hub + Prismatic Matrix Frontier
        float spatialOrder = screenRadial * 0.62 + cellWorldRadial * 0.38;
        float waveFront = uRevealProgress * 1.48 - spatialOrder;
        float revealMetric = waveFront - (cellHash - 0.5) * 0.18;

        // Wireframe dissolves cleanly into the expanding radial frontier
        float localWireFade = 1.0 - smoothstep(-0.22, -0.02, waveFront);
        float finalWireAlpha = combinedEdge * uWireframeStrength * localWireFade;

        vec3 wireframeStageColor = mix(ditherBlockColor, wireColor, finalWireAlpha);

        if (uRevealProgress <= 0.001) {
          gl_FragColor = vec4(wireframeStageColor, 1.0);
          return;
        }

        // Prismatic matrix frontier band where quantized tiles synthesize the room's neon lighting
        float frontierBand = exp(-pow(waveFront * 6.2, 2.0));
        float frontierCellOn = step(mix(0.22, 0.84, cellHash), frontierBand) * tileMask;
        vec3 cellLitColor = texture2D(tDiffuse, cellCenterUv).rgb;
        float cellLum = luma(cellLitColor);
        float qFrontier = (floor(clamp(cellLum * 1.5 + cellShimmer * 0.25, 0.0, 1.0) * 5.0) + 1.0) / 6.0;
        vec3 synthesizedTile = mix(accentHue * 0.65, cellLitColor * 1.45 + accentHue * 0.28, 0.65) * (qFrontier * 0.85 + corePip * 0.25);
        vec3 preRevealColor = mix(wireframeStageColor, synthesizedTile, frontierCellOn * frontierBand);

        // Behind the frontier (revealMetric >= 0.0), lock in the full-resolution lit 3D room
        float isRevealed = step(0.0, revealMetric);
        vec3 finalColor = mix(preRevealColor, litColor.rgb, isRevealed);

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
  });

  // Assign render-target texture after ShaderPass construction because UniformsUtils.clone()
  // inside ShaderPass strips WebGLRenderTarget textures.
  pass.uniforms.tBlueprint.value = blueprintTexture;
  return pass;
}
