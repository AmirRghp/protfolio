import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PixelRunGame from "./PixelRunGame";
import {
  FAST_FALL_ACCEL,
  GRAVITY,
  GROUND_Y,
  JUMP_IMPULSE,
  RAPTOR_DUCK_H,
  RAPTOR_DUCK_W,
  RAPTOR_UPRIGHT_H,
  RAPTOR_UPRIGHT_W,
  RAPTOR_X,
  SECTOR_CONFIGS,
  SHORT_HOP_CUTOFF,
  TOTAL_SECTORS,
  VICTORY_DISTANCE,
  checkCollectiblePickup,
  checkRaptorCollision,
  createCollectible,
  createObstacle,
  getRaptorHitbox,
  getSectorProgress,
  type RaptorState,
} from "./pixelRunLevels";

describe("PixelRunGame & pixelRunLevels Engine", () => {
  it("defines 5 campaign sectors in strictly increasing distance order up to VICTORY_DISTANCE", () => {
    expect(SECTOR_CONFIGS).toHaveLength(TOTAL_SECTORS);
    expect(TOTAL_SECTORS).toBe(5);

    let prevDistance = 0;
    let prevSpeed = 0;

    SECTOR_CONFIGS.forEach((sec, idx) => {
      expect(sec.sectorNumber).toBe(idx + 1);
      expect(sec.targetDistance).toBeGreaterThan(prevDistance);
      expect(sec.speed).toBeGreaterThan(prevSpeed);
      expect(sec.palette.accent).toBeDefined();
      expect(sec.palette.groundSurface).toBeDefined();
      expect(sec.allowedObstacles.length).toBeGreaterThan(0);

      prevDistance = sec.targetDistance;
      prevSpeed = sec.speed;
    });

    expect(SECTOR_CONFIGS[SECTOR_CONFIGS.length - 1].targetDistance).toBe(VICTORY_DISTANCE);
    expect(VICTORY_DISTANCE).toBe(4500);
  });

  it("calculates normalized sector progress within each sector boundary", () => {
    expect(getSectorProgress(0, 0)).toBe(0);
    expect(getSectorProgress(250, 0)).toBeCloseTo(0.5);
    expect(getSectorProgress(500, 0)).toBe(1);
    // Sector 2 spans 500..1200 (span = 700)
    expect(getSectorProgress(500, 1)).toBe(0);
    expect(getSectorProgress(850, 1)).toBeCloseTo(0.5);
    expect(getSectorProgress(1200, 1)).toBe(1);
  });

  it("calculates accurate upright and ducking hitboxes", () => {
    const uprightRaptor: RaptorState = {
      x: RAPTOR_X,
      y: GROUND_Y - RAPTOR_UPRIGHT_H,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      hasShield: false,
      runFrame: 0,
      frameTimer: 0,
    };

    const uprightBox = getRaptorHitbox(uprightRaptor);
    expect(uprightBox.w).toBe(RAPTOR_UPRIGHT_W - 14);
    expect(uprightBox.h).toBe(RAPTOR_UPRIGHT_H - 8);
    expect(uprightBox.y).toBe(GROUND_Y - RAPTOR_UPRIGHT_H + 4);

    const duckingRaptor: RaptorState = {
      ...uprightRaptor,
      isDucking: true,
    };

    const duckingBox = getRaptorHitbox(duckingRaptor);
    expect(duckingBox.w).toBe(RAPTOR_DUCK_W - 8);
    expect(duckingBox.h).toBe(RAPTOR_DUCK_H - 6);
    // Ducking height should be less than 60% of upright height
    expect(duckingBox.h).toBeLessThan(uprightBox.h * 0.6);
  });

  it("allows ducking under mid-altitude Hunter Drones while upright raptor collides", () => {
    // Create mid-height drone positioned at raptor X
    const midDrone = createObstacle("drone_mid", RAPTOR_X);

    const uprightRaptor: RaptorState = {
      x: RAPTOR_X,
      y: GROUND_Y - RAPTOR_UPRIGHT_H,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      hasShield: false,
      runFrame: 0,
      frameTimer: 0,
    };

    const duckingRaptor: RaptorState = {
      ...uprightRaptor,
      isDucking: true,
    };

    // Upright raptor hits mid-altitude drone
    const uprightCollision = checkRaptorCollision(uprightRaptor, midDrone);
    expect(uprightCollision).toBe(true);

    // Ducking raptor safely slips under mid-altitude drone!
    const duckingCollision = checkRaptorCollision(duckingRaptor, midDrone);
    expect(duckingCollision).toBe(false);
  });

  it("detects ground obstacle collision when raptor is grounded", () => {
    const spike = createObstacle("spike_single", RAPTOR_X);

    const groundedRaptor: RaptorState = {
      x: RAPTOR_X,
      y: GROUND_Y - RAPTOR_UPRIGHT_H,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      hasShield: false,
      runFrame: 0,
      frameTimer: 0,
    };

    expect(checkRaptorCollision(groundedRaptor, spike)).toBe(true);

    // When raptor has jumped high above the obstacle
    const jumpingRaptor: RaptorState = {
      ...groundedRaptor,
      y: GROUND_Y - RAPTOR_UPRIGHT_H - 80,
      isGrounded: false,
    };

    expect(checkRaptorCollision(jumpingRaptor, spike)).toBe(false);
  });

  it("handles variable jump cutoff and fast-fall physics constants", () => {
    expect(JUMP_IMPULSE).toBeLessThan(0); // Upward impulse
    expect(SHORT_HOP_CUTOFF).toBeLessThan(0);
    expect(SHORT_HOP_CUTOFF).toBeGreaterThan(JUMP_IMPULSE); // Less intense upward velocity
    expect(GRAVITY).toBeGreaterThan(0);
    expect(FAST_FALL_ACCEL).toBeGreaterThan(0);
  });

  it("detects collectible pickups for Data Cores and Holo-Shields", () => {
    const raptor: RaptorState = {
      x: RAPTOR_X,
      y: GROUND_Y - RAPTOR_UPRIGHT_H,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      hasShield: false,
      runFrame: 0,
      frameTimer: 0,
    };

    // Low collectible right at raptor position
    const core = createCollectible("core", RAPTOR_X + 10, "low");
    expect(checkCollectiblePickup(raptor, core)).toBe(true);

    // Far away collectible
    const distantCore = createCollectible("core", RAPTOR_X + 300, "low");
    expect(checkCollectiblePickup(raptor, distantCore)).toBe(false);

    // Already collected item
    core.collected = true;
    expect(checkCollectiblePickup(raptor, core)).toBe(false);
  });

  it("renders static markup without throwing", () => {
    const html = renderToStaticMarkup(<PixelRunGame onExit={() => {}} />);
    expect(html).toContain("<canvas");
  });
});
