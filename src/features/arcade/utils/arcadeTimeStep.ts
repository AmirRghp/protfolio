export const TARGET_ARCADE_FPS = 60;
export const MAX_ARCADE_DELTA_SEC = 0.05;

export interface ArcadeTimeStep {
  /** Clamped frame delta time in seconds (0..maxDeltaSec). */
  dt: number;
  /**
   * Normalized 60Hz frame multiplier (`dt * 60`).
   * Equals `1.0` at 60Hz, `0.5` at 120Hz, `0.4167` at 144Hz, and `0.25` at 240Hz.
   */
  frameScale: number;
}

/**
 * Computes a clamped delta-time (`dt` in seconds) and a 60Hz-normalized `frameScale`
 * so arcade game physics and animations run at identical real-world speed across
 * 60Hz, 120Hz, 144Hz, 165Hz, 240Hz, and uncapped refresh rates.
 */
export function computeArcadeTimeStep(
  currentTimeMs: number,
  lastTimeMs: number,
  maxDeltaSec: number = MAX_ARCADE_DELTA_SEC,
): ArcadeTimeStep {
  const rawDeltaSec = (currentTimeMs - lastTimeMs) / 1000;
  if (!Number.isFinite(rawDeltaSec) || rawDeltaSec <= 0) {
    return { dt: 0, frameScale: 0 };
  }
  const dt = Math.min(rawDeltaSec, maxDeltaSec);
  return {
    dt,
    frameScale: dt * TARGET_ARCADE_FPS,
  };
}

/**
 * Integrates vertical position `y` and velocity `vy` under per-60Hz-frame acceleration
 * (`gravityPerFrame`) over an arbitrary `frameScale` (`dt * 60`).
 *
 * Uses exact trapezoidal integration with discrete 60Hz Euler bias matching:
 * - At 60Hz (`frameScale = 1`), reduces algebraically to `vy += g; y += vy;`.
 * - At any higher or variable refresh rate (120Hz, 144Hz, 240Hz) where `sum(frameScale) = N`,
 *   produces the exact same velocity and position trajectory as `N` 60Hz frames.
 */
export function integrateGravityStep(
  y: number,
  vy: number,
  gravityPerFrame: number,
  frameScale: number,
  maxFallSpeed?: number,
): { y: number; vy: number } {
  if (!Number.isFinite(frameScale) || frameScale <= 0) {
    return { y, vy };
  }

  const prevVy = vy;
  let nextVy = vy + gravityPerFrame * frameScale;
  if (maxFallSpeed !== undefined && nextVy > maxFallSpeed) {
    nextVy = maxFallSpeed;
  }

  const actualGravityPerFrame = (nextVy - prevVy) / frameScale;
  const averageVelocity = (prevVy + nextVy) * 0.5 + 0.5 * actualGravityPerFrame;
  const nextY = y + averageVelocity * frameScale;

  return {
    y: nextY,
    vy: nextVy,
  };
}
