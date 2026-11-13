import { describe, expect, it } from "vitest";
import {
  MAX_ARCADE_DELTA_SEC,
  TARGET_ARCADE_FPS,
  computeArcadeTimeStep,
  integrateGravityStep,
} from "./arcadeTimeStep";

describe("arcadeTimeStep frame-rate normalization", () => {
  it("computes expected dt and frameScale across 60Hz, 120Hz, 144Hz, and 240Hz", () => {
    const step60 = computeArcadeTimeStep(1000 + 1000 / 60, 1000);
    expect(step60.dt).toBeCloseTo(1 / 60, 6);
    expect(step60.frameScale).toBeCloseTo(1.0, 6);

    const step120 = computeArcadeTimeStep(1000 + 1000 / 120, 1000);
    expect(step120.dt).toBeCloseTo(1 / 120, 6);
    expect(step120.frameScale).toBeCloseTo(0.5, 6);

    const step144 = computeArcadeTimeStep(1000 + 1000 / 144, 1000);
    expect(step144.dt).toBeCloseTo(1 / 144, 6);
    expect(step144.frameScale).toBeCloseTo(60 / 144, 6);

    const step240 = computeArcadeTimeStep(1000 + 1000 / 240, 1000);
    expect(step240.dt).toBeCloseTo(1 / 240, 6);
    expect(step240.frameScale).toBeCloseTo(0.25, 6);
  });

  it("clamps large delta spikes and handles zero or negative deltas safely", () => {
    const spike = computeArcadeTimeStep(5000, 1000);
    expect(spike.dt).toBe(MAX_ARCADE_DELTA_SEC);
    expect(spike.frameScale).toBeCloseTo(MAX_ARCADE_DELTA_SEC * TARGET_ARCADE_FPS, 6);

    expect(computeArcadeTimeStep(1000, 1000)).toEqual({ dt: 0, frameScale: 0 });
    expect(computeArcadeTimeStep(900, 1000)).toEqual({ dt: 0, frameScale: 0 });
    expect(computeArcadeTimeStep(Number.NaN, 1000)).toEqual({ dt: 0, frameScale: 0 });
  });

  it("produces identical Pixel Run jump trajectory and airtime at 60Hz, 120Hz, 144Hz, and 240Hz", () => {
    const groundY = 510 - 54; // GROUND_Y - RAPTOR_UPRIGHT_H = 456
    const jumpImpulse = -12.4;
    const gravity = 0.52;

    function simulateJump(hz: number) {
      const frameScale = 60 / hz;
      let y = groundY;
      let vy = jumpImpulse;
      let minY = y;
      let elapsedSeconds = 0;

      // Simulate 1.0 second of flight without ground clamp to compare exact trajectories,
      // and also record exact landing time when y >= groundY
      let landingTimeSec: number | null = null;
      const totalSteps = Math.round(hz * 1.0);

      for (let i = 0; i < totalSteps; i++) {
        const next = integrateGravityStep(y, vy, gravity, frameScale);
        y = next.y;
        vy = next.vy;
        elapsedSeconds += 1 / hz;
        if (y < minY) minY = y;
        if (landingTimeSec === null && y >= groundY) {
          landingTimeSec = elapsedSeconds;
        }
      }

      return { finalY: y, finalVy: vy, minY, landingTimeSec };
    }

    const sim60 = simulateJump(60);
    const sim120 = simulateJump(120);
    const sim144 = simulateJump(144);
    const sim240 = simulateJump(240);

    // Final position and velocity after 1.0s must match to 5 decimal places across all refresh rates
    expect(sim120.finalY).toBeCloseTo(sim60.finalY, 5);
    expect(sim144.finalY).toBeCloseTo(sim60.finalY, 5);
    expect(sim240.finalY).toBeCloseTo(sim60.finalY, 5);

    expect(sim120.finalVy).toBeCloseTo(sim60.finalVy, 5);
    expect(sim144.finalVy).toBeCloseTo(sim60.finalVy, 5);
    expect(sim240.finalVy).toBeCloseTo(sim60.finalVy, 5);

    // Peak jump apex height (minY) must match within ~0.5px across all refresh rates
    expect(Math.abs(sim120.minY - sim60.minY)).toBeLessThan(0.5);
    expect(Math.abs(sim144.minY - sim60.minY)).toBeLessThan(0.5);
    expect(Math.abs(sim240.minY - sim60.minY)).toBeLessThan(0.5);

    // Total jump airtime (~0.80s) must match within 1 frame across all refresh rates
    expect(sim60.landingTimeSec).not.toBeNull();
    expect(Math.abs((sim120.landingTimeSec ?? 0) - (sim60.landingTimeSec ?? 0))).toBeLessThan(0.02);
    expect(Math.abs((sim144.landingTimeSec ?? 0) - (sim60.landingTimeSec ?? 0))).toBeLessThan(0.02);
    expect(Math.abs((sim240.landingTimeSec ?? 0) - (sim60.landingTimeSec ?? 0))).toBeLessThan(0.02);
  });

  it("produces identical Cyber Flappy flap & fall trajectory at 60Hz, 120Hz, 144Hz, and 240Hz", () => {
    const startY = 260;
    const flapThrust = -7.4;
    const gravity = 0.38;
    const maxFallSpeed = 9.8;

    function simulateFlappy(hz: number, durationSec: number) {
      const frameScale = 60 / hz;
      let y = startY;
      let vy = flapThrust;
      const steps = Math.round(hz * durationSec);
      for (let i = 0; i < steps; i++) {
        const next = integrateGravityStep(y, vy, gravity, frameScale, maxFallSpeed);
        y = next.y;
        vy = next.vy;
      }
      return { y, vy };
    }

    // 0.5 seconds (before terminal velocity cap)
    const f60 = simulateFlappy(60, 0.5);
    const f120 = simulateFlappy(120, 0.5);
    const f144 = simulateFlappy(144, 0.5);
    const f240 = simulateFlappy(240, 0.5);

    expect(f120.y).toBeCloseTo(f60.y, 5);
    expect(f144.y).toBeCloseTo(f60.y, 5);
    expect(f240.y).toBeCloseTo(f60.y, 5);
    expect(f144.vy).toBeCloseTo(f60.vy, 5);

    // 1.0 second (including terminal velocity clamping at MAX_FALL_SPEED)
    const t60 = simulateFlappy(60, 1.0);
    const t144 = simulateFlappy(144, 1.0);
    const t240 = simulateFlappy(240, 1.0);

    expect(t60.vy).toBe(maxFallSpeed);
    expect(t144.vy).toBe(maxFallSpeed);
    expect(t240.vy).toBe(maxFallSpeed);
    expect( Math.abs(t144.y - t60.y) ).toBeLessThan(1.5);
    expect( Math.abs(t240.y - t60.y) ).toBeLessThan(1.5);
  });
});
