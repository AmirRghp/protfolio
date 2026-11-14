export type DomeProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
  alt: string;
  description: string;
  architecture: string;
  techStack: string[];
  highlights: string[];
  githubUrl: string;
};

export type DomeLayout = {
  cardWidth: number;
  cardHeight: number;
  strideX: number;
  strideY: number;
  cols: number;
  rows: number;
  spanX: number;
  spanY: number;
  radius: number;
  maxDepth: number;
  tiltFactor: number;
  maxTiltDeg: number;
  minScale: number;
  maxScale: number;
  lensBoost: number;
  lensRadius: number;
  perspective: number;
};

export type TilePose = {
  tx: number;
  ty: number;
  tz: number;
  rotX: number;
  rotY: number;
  scale: number;
  normR: number;
};

const COMPACT_BP = 640;
const EXTRA_GUTTER = 2;

export function getDomeLayout(vw: number, vh: number): DomeLayout {
  const shortSide = Math.min(vw, vh);
  const compact = vw < COMPACT_BP;

  const cardWidth = compact
    ? Math.round(Math.min(188, Math.max(136, vw * 0.42)))
    : Math.round(Math.min(252, Math.max(176, shortSide * 0.255)));
  const cardHeight = Math.round(cardWidth * 1.1);

  const gapX = Math.round(cardWidth * (compact ? 0.34 : 0.44));
  const gapY = Math.round(cardHeight * (compact ? 0.32 : 0.4));

  const strideX = cardWidth + gapX;
  const strideY = cardHeight + gapY;

  const cols = Math.ceil(vw / strideX) + EXTRA_GUTTER * 2 + 1;
  const rows = Math.ceil(vh / strideY) + EXTRA_GUTTER * 2 + 1;

  const radius = Math.hypot(vw, vh) * 0.62;
  const maxDepth = Math.round(shortSide * (compact ? 0.36 : 0.46));

  return {
    cardWidth,
    cardHeight,
    strideX,
    strideY,
    cols,
    rows,
    spanX: cols * strideX,
    spanY: rows * strideY,
    radius,
    maxDepth,
    tiltFactor: compact ? 22 : 28,
    maxTiltDeg: compact ? 28 : 34,
    minScale: 0.78,
    maxScale: 1.05,
    lensBoost: compact ? 0.08 : 0.14,
    lensRadius: radius * 0.45,
    perspective: Math.round(Math.max(900, Math.min(1600, shortSide * 1.55))),
  };
}

export function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

export function wrapCentered(value: number, span: number): number {
  const half = span / 2;
  return mod(value + half, span) - half;
}

/**
 * Sample the dome surface at planar offset (wx, wy) from viewport center,
 * with optional cursor focus at (fx, fy) and smooth focusStrength in [0, 1].
 */
export function writePose(
  out: TilePose,
  wx: number,
  wy: number,
  L: DomeLayout,
  fx: number | null,
  fy: number | null,
  focusStrength = 1
): void {
  const invR = 1 / L.radius;
  const nx = wx * invR;
  const ny = wy * invR;
  const r2 = nx * nx + ny * ny;
  const normR = Math.min(1.6, Math.sqrt(r2));

  // Paraboloid depth with soft saturation so far corners don't plunge forever
  const bowl = r2 / (1 + 0.35 * r2);

  // Cursor proximity lens (Gaussian in planar space) scaled by smooth focusStrength
  let lens = 0;
  if (fx !== null && fy !== null && focusStrength > 0.001) {
    const dx = wx - fx;
    const dy = wy - fy;
    const d2 = dx * dx + dy * dy;
    const s2 = L.lensRadius * L.lensRadius;
    lens = Math.exp(-d2 / (2 * s2)) * focusStrength;
  }

  const tz = -bowl * L.maxDepth + lens * L.maxDepth * 0.22;

  // Surface normal of z = -k(x^2 + y^2) points inward toward the viewer axis
  const clamp = L.maxTiltDeg;
  const rawRotY = -nx * L.tiltFactor;
  const rawRotX = ny * L.tiltFactor;
  const rotY = rawRotY > clamp ? clamp : rawRotY < -clamp ? -clamp : rawRotY;
  const rotX = rawRotX > clamp ? clamp : rawRotX < -clamp ? -clamp : rawRotX;

  // Radial Foreshortening pull toward center -> barrel/spherical warp in 2D
  const pull = 1 - 0.06 * Math.min(1.2, r2);
  const tx = wx * pull;
  const ty = wy * pull;

  const baseScale =
    L.maxScale - Math.min(1, bowl) * (L.maxScale - L.minScale);
  const scale = baseScale + lens * L.lensBoost;

  out.tx = tx;
  out.ty = ty;
  out.tz = tz;
  out.rotX = rotX;
  out.rotY = rotY;
  out.scale = scale;
  out.normR = normR;
}

export function sampleSurface(
  wx: number,
  wy: number,
  L: DomeLayout,
  fx: number | null = null,
  fy: number | null = null,
  focusStrength = 1
): TilePose {
  const out: TilePose = {
    tx: 0,
    ty: 0,
    tz: 0,
    rotX: 0,
    rotY: 0,
    scale: 1,
    normR: 0,
  };
  writePose(out, wx, wy, L, fx, fy, focusStrength);
  return out;
}

export function poseTransform(p: TilePose): string {
  return `translate3d(${p.tx.toFixed(1)}px, ${p.ty.toFixed(1)}px, ${p.tz.toFixed(1)}px) rotateX(${p.rotX.toFixed(2)}deg) rotateY(${p.rotY.toFixed(2)}deg) scale(${p.scale.toFixed(3)})`;
}

export function isOffscreen(
  p: TilePose,
  L: DomeLayout,
  vw: number,
  vh: number
): boolean {
  const padX = L.cardWidth * 1.25;
  const padY = L.cardHeight * 1.25;
  return (
    Math.abs(p.tx) > vw * 0.5 + padX || Math.abs(p.ty) > vh * 0.5 + padY
  );
}

export function screenToPlanar(
  sx: number,
  sy: number,
  L: DomeLayout
): { x: number; y: number } {
  const invR2 = 1 / (L.radius * L.radius);
  let wx = sx;
  let wy = sy;

  for (let i = 0; i < 3; i++) {
    const r2 = (wx * wx + wy * wy) * invR2;
    const bowl = r2 / (1 + 0.35 * r2);
    const tz = -bowl * L.maxDepth;
    const pull = 1 - 0.06 * Math.min(1.2, r2);
    const k = pull * (L.perspective / (L.perspective - tz));
    wx = sx / k;
    wy = sy / k;
  }

  return { x: wx, y: wy };
}

/**
 * Well-distributed 2D lattice -> item index so every row cycles through all
 * projects and no orthogonal or diagonal neighbors repeat.
 */
export function itemIndexAt(
  col: number,
  row: number,
  count: number
): number {
  if (count <= 0) return 0;
  return mod(col + row * 2, count);
}

/**
 * Normalize radial distance into a [0, 1] vignette falloff for lighting/opacity.
 */
export function lightFalloff(normR: number): number {
  const t = Math.max(0, Math.min(1, (normR - 0.55) / 0.75));
  return t * t * (3 - 2 * t);
}

export function formatMeta(project: DomeProject): string {
  return `${project.category} · ${project.year}`;
}

export function shadeFor(normR: number): number {
  return Math.min(0.72, lightFalloff(normR) * 0.68);
}

export function captionFor(normR: number): number {
  return Math.max(0, 1 - lightFalloff(normR) * 1.15);
}
