import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FlappyGame from "./FlappyGame";
import {
  BIRD_RADIUS,
  BIRD_X,
  FLAP_THRUST,
  FLAPPY_LEVELS,
  GRAVITY,
  GROUND_Y,
  MAX_FALL_SPEED,
  PYLON_MIN_HEIGHT,
  PYLON_WIDTH,
  TOTAL_FLAPPY_LEVELS,
  generatePylonGap,
  getLevelProgress,
  isBirdCollidingWithGround,
  isBirdCollidingWithPylon,
  isBirdCollectingOrb,
  type Pylon,
} from "./flappyLevels";
import { computeArcadeTimeStep, integrateGravityStep } from "@/features/arcade/utils/arcadeTimeStep";

describe("flappyLevels configuration & physics", () => {
  it("defines exactly 5 progressive levels", () => {
    expect(TOTAL_FLAPPY_LEVELS).toBe(5);
    expect(FLAPPY_LEVELS).toHaveLength(5);
  });

  it("calculates clamped level quota progress accurately", () => {
    expect(getLevelProgress(0, 10)).toBe(0);
    expect(getLevelProgress(5, 10)).toBeCloseTo(0.5);
    expect(getLevelProgress(10, 10)).toBe(1);
    expect(getLevelProgress(15, 10)).toBe(1);
  });

  it("scales difficulty progressively across levels", () => {
    for (let i = 0; i < FLAPPY_LEVELS.length - 1; i++) {
      const cur = FLAPPY_LEVELS[i];
      const next = FLAPPY_LEVELS[i + 1];

      // Speed increases
      expect(next.speed).toBeGreaterThan(cur.speed);
      // Gap narrows
      expect(next.gapSize).toBeLessThan(cur.gapSize);
      // Target gates increase or stay challenging
      expect(next.targetGates).toBeGreaterThanOrEqual(cur.targetGates);
    }
  });

  it("ensures generatePylonGap guarantees minimum heights for both top and bottom pylons", () => {
    const gapSize = 140;
    for (let r = 0; r <= 1.0; r += 0.1) {
      const topHeight = generatePylonGap(gapSize, GROUND_Y, PYLON_MIN_HEIGHT, r);
      const bottomHeight = GROUND_Y - (topHeight + gapSize);

      expect(topHeight).toBeGreaterThanOrEqual(PYLON_MIN_HEIGHT);
      expect(bottomHeight).toBeGreaterThanOrEqual(PYLON_MIN_HEIGHT);
    }
  });

  it("correctly identifies safe flight vs pylon collision", () => {
    const pylon: Pylon = {
      id: 1,
      x: 120,
      topHeight: 180,
      gapSize: 150,
      passed: false,
      baseTopHeight: 180,
      oscillationPhase: 0,
      oscillationSpeed: 0,
      oscillationAmp: 0,
    };

    // Safe inside gap: y = 255 (between 180 and 330)
    expect(isBirdCollidingWithPylon(BIRD_X, 255, BIRD_RADIUS, pylon)).toBe(false);

    // Collision with top pylon (y = 175, radius = 15 => intersects top pylon at 180)
    expect(isBirdCollidingWithPylon(BIRD_X, 175, BIRD_RADIUS, pylon)).toBe(true);

    // Collision with bottom pylon (bottom starts at 180 + 150 = 330; bird at y = 335)
    expect(isBirdCollidingWithPylon(BIRD_X, 335, BIRD_RADIUS, pylon)).toBe(true);

    // Bird well before pylon x
    expect(isBirdCollidingWithPylon(80, 100, BIRD_RADIUS, pylon)).toBe(false);

    // Bird well after pylon x
    expect(isBirdCollidingWithPylon(120 + PYLON_WIDTH + 40, 100, BIRD_RADIUS, pylon)).toBe(false);
  });

  it("detects ground collisions correctly", () => {
    // Above ground
    expect(isBirdCollidingWithGround(400, BIRD_RADIUS, GROUND_Y)).toBe(false);

    // Exactly touching or below ground
    expect(isBirdCollidingWithGround(GROUND_Y - BIRD_RADIUS, BIRD_RADIUS, GROUND_Y)).toBe(true);
    expect(isBirdCollidingWithGround(GROUND_Y, BIRD_RADIUS, GROUND_Y)).toBe(true);
  });

  it("detects bonus orb collection within radius threshold", () => {
    const orbX = 200;
    const orbY = 250;

    // Bird directly overlapping orb
    expect(isBirdCollectingOrb(200, 250, BIRD_RADIUS, orbX, orbY)).toBe(true);

    // Bird within combined radius
    expect(isBirdCollectingOrb(210, 250, BIRD_RADIUS, orbX, orbY)).toBe(true);

    // Bird too far away
    expect(isBirdCollectingOrb(260, 250, BIRD_RADIUS, orbX, orbY)).toBe(false);
  });

  it("maintains identical bird flight arc and pylon travel distance across 60Hz and 144Hz refresh rates", () => {
    const levelSpeed = FLAPPY_LEVELS[0].speed;

    function runSimulation(hz: number, seconds: number) {
      let y = 260;
      let vy = FLAP_THRUST;
      let pylonX = 600;
      const totalFrames = Math.round(hz * seconds);
      const frameDurationMs = 1000 / hz;

      for (let i = 0; i < totalFrames; i++) {
        const { frameScale } = computeArcadeTimeStep((i + 1) * frameDurationMs, i * frameDurationMs);
        const nextBird = integrateGravityStep(y, vy, GRAVITY, frameScale, MAX_FALL_SPEED);
        y = nextBird.y;
        vy = nextBird.vy;
        pylonX -= levelSpeed * frameScale;
      }
      return { y, vy, pylonX };
    }

    const res60 = runSimulation(60, 0.5);
    const res144 = runSimulation(144, 0.5);

    expect(res144.y).toBeCloseTo(res60.y, 4);
    expect(res144.vy).toBeCloseTo(res60.vy, 4);
    expect(res144.pylonX).toBeCloseTo(res60.pylonX, 4);
  });
});

describe("FlappyGame component", () => {
  it("renders without crashing and includes canvas with aria-label", () => {
    const html = renderToStaticMarkup(<FlappyGame />);
    expect(html).toContain("Cyber Flappy Arcade Game");
    expect(html).toContain("<canvas");
  });
});
