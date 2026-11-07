export type RoomBuildStage = "idle" | "blackout" | "wireframe" | "materializing" | "complete";

export type RoomBuildItemGroup =
  | "architecture"
  | "shelvesAndArcade"
  | "monitor"
  | "peripherals"
  | "props";

export type RoomBuildItemProgress = Record<RoomBuildItemGroup, number>;

export type RoomBuildState = {
  progress: number;
  stage: RoomBuildStage;
  wireframeStrength: number;
  ditherWaveStrength: number;
  revealProgress: number;
  desktopOverlayOpacity: number;
  itemProgress: RoomBuildItemProgress;
};

/** Lead time while the lanyard card drops and fades into pitch black (#000000). */
export const LANYARD_EXIT_LEAD_MS = 280;

/** Total duration of the Basement.studio-style 3D wireframe + pixelated dither room build. */
export const ROOM_BUILD_DURATION_MS = 3300;

/** Shortened duration when prefers-reduced-motion is active. */
export const ROOM_BUILD_REDUCED_MOTION_MS = 320;

export const ROOM_BUILD_ITEM_WINDOWS: Record<RoomBuildItemGroup, readonly [number, number]> = {
  architecture: [0.05, 0.27],
  shelvesAndArcade: [0.12, 0.36],
  monitor: [0.20, 0.44],
  peripherals: [0.28, 0.52],
  props: [0.36, 0.60],
};

function clamp01(value: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function createIdleRoomBuildState(): RoomBuildState {
  return {
    progress: 0,
    stage: "idle",
    wireframeStrength: 0,
    ditherWaveStrength: 0,
    revealProgress: 0,
    desktopOverlayOpacity: 0,
    itemProgress: {
      architecture: 0,
      shelvesAndArcade: 0,
      monitor: 0,
      peripherals: 0,
      props: 0,
    },
  };
}

export function createCompletedRoomBuildState(): RoomBuildState {
  return {
    progress: 1,
    stage: "complete",
    wireframeStrength: 0,
    ditherWaveStrength: 0,
    revealProgress: 1,
    desktopOverlayOpacity: 1,
    itemProgress: {
      architecture: 1,
      shelvesAndArcade: 1,
      monitor: 1,
      peripherals: 1,
      props: 1,
    },
  };
}

/**
 * Computes the deterministic Basement.studio-style 3D construction & pixelated dither
 * materialization state for a given elapsed time after the lanyard pull begins exiting.
 */
export function evaluateRoomBuildState(
  elapsedMs: number,
  reducedMotion: boolean = false,
): RoomBuildState {
  if (reducedMotion) {
    const p = clamp01(elapsedMs / ROOM_BUILD_REDUCED_MOTION_MS);
    if (p >= 1) return createCompletedRoomBuildState();
    return {
      progress: p,
      stage: p < 0.25 ? "blackout" : "materializing",
      wireframeStrength: 0,
      ditherWaveStrength: 0,
      revealProgress: smoothstep(0.15, 1.0, p),
      desktopOverlayOpacity: smoothstep(0.35, 1.0, p),
      itemProgress: {
        architecture: 1,
        shelvesAndArcade: 1,
        monitor: 1,
        peripherals: 1,
        props: 1,
      },
    };
  }

  const effectiveElapsed = Math.max(0, elapsedMs - LANYARD_EXIT_LEAD_MS);
  const progress = clamp01(effectiveElapsed / ROOM_BUILD_DURATION_MS);

  if (progress >= 1) {
    return createCompletedRoomBuildState();
  }

  if (elapsedMs < LANYARD_EXIT_LEAD_MS || progress < 0.05) {
    return {
      progress,
      stage: "blackout",
      wireframeStrength: 0,
      ditherWaveStrength: smoothstep(0.02, 0.05, progress) * 0.35,
      revealProgress: 0,
      desktopOverlayOpacity: 0,
      itemProgress: {
        architecture: 0,
        shelvesAndArcade: 0,
        monitor: 0,
        peripherals: 0,
        props: 0,
      },
    };
  }

  const stage: RoomBuildStage = progress < 0.62 ? "wireframe" : "materializing";

  // Wireframe lines ramp in sharply at 0.05..0.15, hold full crisp white through 0.62,
  // then dissolve into the pixelated dither wave between 0.62 and 0.80.
  const wireFadeIn = smoothstep(0.05, 0.14, progress);
  const wireFadeOut = 1 - smoothstep(0.62, 0.80, progress);
  const wireframeStrength = clamp01(wireFadeIn * wireFadeOut);

  // Pixelated grayscale dither waves sweep across surfaces during wireframe construction
  // and peak along the 0.60..0.92 materialization frontier before settling at 1.0.
  const ditherRampIn = smoothstep(0.05, 0.14, progress);
  const ditherRampOut = 1 - smoothstep(0.90, 0.99, progress);
  const ditherWaveStrength = clamp01(ditherRampIn * ditherRampOut);

  // The lit 3D room stays at 0 (pure black occluded surfaces) while wireframe + pixel waves
  // construct the items (0.00..0.60), then sweeps 0 -> 1 across the dithered block frontier.
  const revealProgress = smoothstep(0.60, 0.98, progress);

  // Monitor desktop HTML overlay stays hidden while the monitor is in wireframe/pixel-scan mode
  // and fades in as the reveal frontier completes across the monitor screen.
  const desktopOverlayOpacity = smoothstep(0.78, 0.97, progress);

  const itemProgress: RoomBuildItemProgress = {
    architecture: smoothstep(
      ROOM_BUILD_ITEM_WINDOWS.architecture[0],
      ROOM_BUILD_ITEM_WINDOWS.architecture[1],
      progress,
    ),
    shelvesAndArcade: smoothstep(
      ROOM_BUILD_ITEM_WINDOWS.shelvesAndArcade[0],
      ROOM_BUILD_ITEM_WINDOWS.shelvesAndArcade[1],
      progress,
    ),
    monitor: smoothstep(
      ROOM_BUILD_ITEM_WINDOWS.monitor[0],
      ROOM_BUILD_ITEM_WINDOWS.monitor[1],
      progress,
    ),
    peripherals: smoothstep(
      ROOM_BUILD_ITEM_WINDOWS.peripherals[0],
      ROOM_BUILD_ITEM_WINDOWS.peripherals[1],
      progress,
    ),
    props: smoothstep(
      ROOM_BUILD_ITEM_WINDOWS.props[0],
      ROOM_BUILD_ITEM_WINDOWS.props[1],
      progress,
    ),
  };

  return {
    progress,
    stage,
    wireframeStrength,
    ditherWaveStrength,
    revealProgress,
    desktopOverlayOpacity,
    itemProgress,
  };
}
