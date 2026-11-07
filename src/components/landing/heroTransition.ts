export type RectBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type ViewportSize = {
  width: number;
  height: number;
};

export type HeroPortalGeometry = {
  scale: number;
  translateX: number;
  translateY: number;
  fullscreenInsetX: number;
  fullscreenInsetY: number;
  fullscreenTransform: string;
  dockedTransform: string;
  fullscreenClipPath: string;
  dockedClipPath: string;
};

export const EASE_PORTAL_DOCK = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_PORTAL_EXPAND = "cubic-bezier(0.22, 1, 0.36, 1)";
export const EASE_SCAN_SWEEP = "cubic-bezier(0.35, 0, 0.25, 1)";
export const EASE_CRISP_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";

export const HERO_OPEN_TIMING = {
  quantizeFadeDuration: 180,
  scanSweepDuration: 650,
  dockDelay: 0,
  dockDuration: 650,
  backdropDelay: 80,
  backdropDuration: 420,
  navDelay: 220,
  navDuration: 380,
  contentDelay: 200,
  contentDuration: 420,
} as const;

export const HERO_CLOSE_TIMING = {
  contentFadeDuration: 200,
  navFadeDuration: 180,
  backdropFadeDuration: 280,
  expandDuration: 500,
  dissolveDelay: 320,
  dissolveDuration: 280,
} as const;

function fmtPx(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return `${Object.is(rounded, -0) ? 0 : rounded}px`;
}

function fmtScale(value: number): string {
  const rounded = Math.round(value * 10000) / 10000;
  return `${rounded}`;
}

/**
 * Computes distortion-free uniform-scale + local-inset FLIP keyframes so the
 * Hero `<video>` container itself morphs between the full 100vw×100vh viewport
 * and its docked `.ldFrame` layout box without ever swapping from a static image
 * to a video or changing `object-fit` aspect ratio at animation completion.
 */
export function computeHeroPortalGeometry(
  viewport: ViewportSize,
  frameRect: RectBounds,
  dockedRadiusPx: number = 6,
): HeroPortalGeometry {
  const vw = Math.max(1, viewport.width);
  const vh = Math.max(1, viewport.height);
  const fw = Math.max(1, frameRect.width);
  const fh = Math.max(1, frameRect.height);

  // Uniform scale guarantees zero aspect-ratio stretching of the inner <video>
  const scale = Math.max(1, vw / fw, vh / fh);

  const frameCenterX = frameRect.left + fw / 2;
  const frameCenterY = frameRect.top + fh / 2;
  const translateX = vw / 2 - frameCenterX;
  const translateY = vh / 2 - frameCenterY;

  // In pre-scaled local frame coordinates, crop any excess width/height beyond the viewport
  const visibleLocalWidth = Math.min(fw, vw / scale);
  const visibleLocalHeight = Math.min(fh, vh / scale);
  const fullscreenInsetX = Math.max(0, (fw - visibleLocalWidth) / 2);
  const fullscreenInsetY = Math.max(0, (fh - visibleLocalHeight) / 2);

  return {
    scale,
    translateX,
    translateY,
    fullscreenInsetX,
    fullscreenInsetY,
    fullscreenTransform: `translate3d(${fmtPx(translateX)}, ${fmtPx(translateY)}, 0px) scale(${fmtScale(scale)})`,
    dockedTransform: "translate3d(0px, 0px, 0px) scale(1)",
    fullscreenClipPath: `inset(${fmtPx(fullscreenInsetY)} ${fmtPx(fullscreenInsetX)} ${fmtPx(fullscreenInsetY)} ${fmtPx(fullscreenInsetX)} round 0px)`,
    dockedClipPath: `inset(0px 0px 0px 0px round ${fmtPx(dockedRadiusPx)})`,
  };
}
