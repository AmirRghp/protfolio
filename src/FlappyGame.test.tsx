import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FlappyGame from "./FlappyGame";
import {
  BIRD_RADIUS,
  BIRD_X,
  FLAPPY_LEVELS,
  GROUND_Y,
  PYLON_MIN_HEIGHT,
  PYLON_WIDTH,
  TOTAL_FLAPPY_LEVELS,
  generatePylonGap,
  isBirdCollidingWithGround,
  isBirdCollidingWithPylon,
  isBirdCollectingOrb,
  type Pylon,
} from "./flappyLevels";

describe("flappyLevels configuration & physics", () => {
  it("defines exactly 5 progressive levels", () => {
    expect(TOTAL_FLAPPY_LEVELS).toBe(5);
    expect(FLAPPY_LEVELS).toHaveLength(5);
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
});

describe("FlappyGame component", () => {
  it("renders without crashing and includes canvas with aria-label", () => {
    const html = renderToStaticMarkup(<FlappyGame />);
    expect(html).toContain("Cyber Flappy Arcade Game");
    expect(html).toContain("<canvas");
  });
});
