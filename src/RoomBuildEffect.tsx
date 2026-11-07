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
import type { RoomBuildItemGroup, RoomBuildState } from "./roomBuildAnimation";

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
        float activeLimit = uGroupProgress * 1.15;
        if (normY > activeLimit) discard;

        float worldCoord = clamp(
          (vWorldPos.x * 0.07 + vWorldPos.y * 0.10 - vWorldPos.z * 0.08) + 0.50,
          0.02,
          0.98
        );

        gl_FragColor = vec4(0.0, uGroupProgress, worldCoord, 1.0);
      }
    `,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

function createWireframeLineMaterial(worldMinY: number, worldMaxY: number): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      uGroupProgress: { value: 0 },
      uMinY: { value: worldMinY },
      uMaxY: { value: worldMaxY },
      uIntensity: { value: 1.0 },
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
      uniform float uIntensity;
      varying vec3 vWorldPos;

      void main() {
        if (uGroupProgress <= 0.001) discard;
        float span = max(0.05, uMaxY - uMinY);
        float normY = clamp((vWorldPos.y - uMinY) / span, 0.0, 1.0);
        if (normY > uGroupProgress * 1.12) discard;

        float worldCoord = clamp(
          (vWorldPos.x * 0.07 + vWorldPos.y * 0.10 - vWorldPos.z * 0.08) + 0.50,
          0.02,
          0.98
        );

        gl_FragColor = vec4(uIntensity, uGroupProgress, worldCoord, 1.0);
      }
    `,
    depthTest: true,
    depthWrite: false,
  });
}

/**
 * Builds clean architectural & item contour lines for surfaces whose smooth bevels or
 * single-quad geometry need explicit CAD edges (back wall architectural panels,
 * desk top perimeter, under-shelf LED channels, and the neon-bordered mousepad).
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

  // Back wall architectural framing lines (matching basement.studio wall panel divisions)
  const wallZ = -1.385;
  for (const x of [-5.8, -2.9, 0.0, 2.96, 5.8]) {
    pushSeg(archVerts, x, 1.8, wallZ, x, 7.5, wallZ);
  }
  for (const y of [1.89, 4.2, 5.45, 7.2]) {
    pushSeg(archVerts, -6.2, y, wallZ, 6.2, y, wallZ);
  }

  // Crisp DeskTop perimeter and front apron edges
  const deskTopY = 1.892;
  const deskBotY = 1.712;
  // Back edge along wall
  pushSeg(archVerts, -5.78, deskTopY, -0.89, 2.95, deskTopY, -0.89);
  // Front edge facing viewer
  pushSeg(archVerts, -5.74, deskTopY, 3.79, 2.94, deskTopY, 3.79);
  pushSeg(archVerts, -5.74, deskBotY, 3.79, 2.94, deskBotY, 3.79);
  // Right-side cutout edge next to the Arcade Cabinet (x = 2.95)
  pushSeg(archVerts, 2.95, deskTopY, -0.89, 2.95, deskTopY, 3.79);
  pushSeg(archVerts, 2.95, deskBotY, -0.89, 2.95, deskBotY, 3.79);
  pushSeg(archVerts, 2.94, deskBotY, 3.79, 2.94, deskTopY, 3.79);

  const architectureGeo = new BufferGeometry();
  architectureGeo.setAttribute("position", new BufferAttribute(new Float32Array(archVerts), 3));

  // Wall shelves perimeter & under-shelf LED bar CAD lines
  // EmptyShelves has position [-0.59, 0, 0] and scale [0.86, 1, 1] applied to shelves at x=2.55, w=2.8
  const shelfVerts: number[] = [];
  const sCenterX = -0.59 + 2.55 * 0.86; // ~1.603
  const sHalfW = (2.8 * 0.86) / 2; // ~1.204
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
  const shelvesGeo = new BufferGeometry();
  shelvesGeo.setAttribute("position", new BufferAttribute(new Float32Array(shelfVerts), 3));

  // MousePad rounded CAD perimeter & inner border at [-1.55, 1.898, 1.76], rotY = 0.32
  const periphVerts: number[] = [];
  const padCx = -1.55;
  const padCy = 1.898;
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
  addRectLoop(1.89, 0.89, 0.012);

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
    this.blueprintScene.add(this.supplementaryGroup);
    this.initSupplementaryCadLines();
  }

  private initSupplementaryCadLines() {
    const { architectureGeo, shelvesGeo, peripheralsGeo } = createSupplementaryCadGeometry();
    this.supplementaryGeos.push(architectureGeo, shelvesGeo, peripheralsGeo);

    const archMat = createWireframeLineMaterial(1.6, 7.6);
    archMat.uniforms.uIntensity.value = 0.88;
    const archLines = new LineSegments(architectureGeo, archMat);
    archLines.frustumCulled = false;

    const shelvesMat = createWireframeLineMaterial(4.0, 5.6);
    shelvesMat.uniforms.uIntensity.value = 0.95;
    const shelvesLines = new LineSegments(shelvesGeo, shelvesMat);
    shelvesLines.frustumCulled = false;

    const periphMat = createWireframeLineMaterial(1.85, 2.05);
    periphMat.uniforms.uIntensity.value = 0.96;
    const periphLines = new LineSegments(peripheralsGeo, periphMat);
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
          wireMat = createWireframeLineMaterial(0, 5);
          wireframe = new LineSegments(edgesGeo, wireMat);
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

        // 1. Quantized square pixel block coordinates (matching basement.studio ~11px squares)
        float cellPx = max(6.0, uPixelScale);
        vec2 cellCoord = floor(gl_FragCoord.xy / cellPx);
        vec2 cellCenterUv = clamp((cellCoord + 0.5) * cellPx / uResolution, 0.001, 0.999);

        vec4 cellBp = texture2D(tBlueprint, cellCenterUv);
        float cellGroupProgress = cellBp.g;
        float cellWorldCoord = cellBp.b;
        float cellBuilt = cellBp.a;

        float cellHash = hash21(cellCoord);
        float timeStep = floor(uTime * 8.0);
        float cellShimmer = hash21(cellCoord + vec2(timeStep * 13.7, timeStep * 7.3));

        // 2. Narrow, curved 3D surface pixelated grayscale dither wave ribbons (00:02 - 00:04)
        float aspect = uResolution.x / max(1.0, uResolution.y);
        vec2 p = (cellCenterUv - 0.5) * vec2(aspect, 1.0);

        float phase1 = cellWorldCoord * 16.0 + p.x * 3.8 - p.y * 2.6 - uTime * 3.4;
        float phase2 = cellWorldCoord * 12.0 - p.x * 4.5 - p.y * 3.2 + uTime * 2.7;
        // High exponent keeps the dither waves confined to sleek narrow ribbons like basement.studio
        float ribbon1 = pow(max(0.0, sin(phase1)), 7.0);
        float ribbon2 = pow(max(0.0, cos(phase2)), 8.0) * 0.85;

        // Focused construction wave right when an item group is actively drawing in
        float buildCrest = (cellGroupProgress > 0.04 && cellGroupProgress < 0.92)
          ? pow(sin(cellGroupProgress * 3.14159), 2.0) * 0.45
          : 0.0;

        float waveEnvelope = (ribbon1 + ribbon2 + buildCrest) * step(0.02, cellBuilt) * uDitherStrength;

        // Only cells inside the wave ribbon that pass the hash threshold light up as gray squares
        float ditherMask = step(mix(0.32, 0.92, cellHash), waveEnvelope);
        float rawShade = clamp((waveEnvelope - cellHash * 0.25) * 0.95 + cellShimmer * 0.2, 0.0, 1.0);
        float quantizedGray = (floor(rawShade * 5.0) + 1.0) / 6.0 * 0.54 * ditherMask;
        vec3 ditherBlockColor = vec3(quantizedGray);

        // 3. Full-resolution 1px white CAD wireframe edges + GPU Sobel silhouette/crease edges
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

        float propsMask = max(bp.a, smoothstep(0.32, 0.52, uProgress));
        float combinedEdge = clamp(bp.r + max(lumaEdge * 0.85, depthEdge * 0.95) * propsMask, 0.0, 1.0);

        // 4. Sweeping pixelated dither materialization frontier (00:05 -> 00:06 in reference)
        float spatialOrder = length(p * vec2(0.70, 0.92)) * 0.54 + (1.0 - cellCenterUv.y) * 0.32 + (1.0 - cellWorldCoord) * 0.14;
        float waveFront = uRevealProgress * 1.46 - spatialOrder;
        float revealMetric = waveFront - (cellHash - 0.5) * 0.18;

        // Wireframe dissolves cleanly into the incoming pixelated frontier band
        float localWireFade = 1.0 - smoothstep(-0.22, -0.02, waveFront);
        float finalWireAlpha = combinedEdge * uWireframeStrength * localWireFade;

        vec3 wireframeStageColor = mix(ditherBlockColor, vec3(0.97, 0.98, 1.0), finalWireAlpha);

        if (uRevealProgress <= 0.001) {
          gl_FragColor = vec4(wireframeStageColor, 1.0);
          return;
        }

        // Narrow pixelated dither wave band right along the materialization frontier (frame 00:05)
        float frontierBand = exp(-pow(waveFront * 6.5, 2.0));
        float frontierCellOn = step(mix(0.25, 0.85, cellHash), frontierBand);
        vec3 cellLitColor = texture2D(tDiffuse, cellCenterUv).rgb;
        float frontierGray = (floor(clamp(luma(cellLitColor) * 1.5 + cellShimmer * 0.25, 0.0, 1.0) * 5.0) + 1.0) / 6.0 * 0.68;
        vec3 preRevealColor = mix(wireframeStageColor, vec3(frontierGray), frontierCellOn * frontierBand);

        // Behind the frontier (revealMetric >= 0.0), reveal the full-resolution lit 3D room
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
