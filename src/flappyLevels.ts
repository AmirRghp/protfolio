export const GAME_W = 880;
export const GAME_H = 600;
export const GROUND_Y = 540;
export const CEILING_Y = 0;

export const GRAVITY = 0.38;
export const FLAP_THRUST = -7.4;
export const MAX_FALL_SPEED = 9.8;
export const BIRD_RADIUS = 15;
export const BIRD_X = 140;

export const PYLON_WIDTH = 70;
export const PYLON_MIN_HEIGHT = 60;
export const ORB_RADIUS = 9;

export type FlappyPalette = {
  pylonBorder: string;
  pylonFill: string;
  pylonGlow: string;
  pylonCap: string;
  circuitLines: string;
  bgSkyTop: string;
  bgSkyBottom: string;
  citySilhouette: string;
  cityWindows: string;
  groundGrid: string;
  groundSurface: string;
  accent: string;
};

export type FlappyLevelConfig = {
  levelNumber: number;
  name: string;
  targetGates: number;
  gapSize: number;
  speed: number;
  pylonSpacing: number;
  oscillating?: boolean;
  spawnOrbs?: boolean;
  palette: FlappyPalette;
};

export const TOTAL_FLAPPY_LEVELS = 5;

export const FLAPPY_LEVELS: FlappyLevelConfig[] = [
  {
    levelNumber: 1,
    name: "LAUNCH CORRIDOR",
    targetGates: 10,
    gapSize: 170,
    speed: 3.0,
    pylonSpacing: 290,
    oscillating: false,
    spawnOrbs: false,
    palette: {
      pylonBorder: "#00f0ff",
      pylonFill: "rgba(0, 30, 50, 0.85)",
      pylonGlow: "rgba(0, 240, 255, 0.4)",
      pylonCap: "#00c8e0",
      circuitLines: "rgba(0, 240, 255, 0.25)",
      bgSkyTop: "#020713",
      bgSkyBottom: "#0b1c34",
      citySilhouette: "#051020",
      cityWindows: "#00f0ff",
      groundGrid: "#00b4d8",
      groundSurface: "#040e1b",
      accent: "#00f0ff",
    },
  },
  {
    levelNumber: 2,
    name: "CIRCUIT ALLEY",
    targetGates: 12,
    gapSize: 155,
    speed: 3.4,
    pylonSpacing: 275,
    oscillating: false,
    spawnOrbs: true,
    palette: {
      pylonBorder: "#ff007f",
      pylonFill: "rgba(50, 0, 30, 0.85)",
      pylonGlow: "rgba(255, 0, 127, 0.4)",
      pylonCap: "#e0006f",
      circuitLines: "rgba(255, 0, 127, 0.25)",
      bgSkyTop: "#120215",
      bgSkyBottom: "#28052e",
      citySilhouette: "#18041c",
      cityWindows: "#ff007f",
      groundGrid: "#d9006c",
      groundSurface: "#140217",
      accent: "#ff007f",
    },
  },
  {
    levelNumber: 3,
    name: "ENERGY SURGE",
    targetGates: 15,
    gapSize: 142,
    speed: 3.8,
    pylonSpacing: 260,
    oscillating: true,
    spawnOrbs: true,
    palette: {
      pylonBorder: "#ffd700",
      pylonFill: "rgba(45, 35, 0, 0.85)",
      pylonGlow: "rgba(255, 215, 0, 0.4)",
      pylonCap: "#e6c200",
      circuitLines: "rgba(255, 215, 0, 0.25)",
      bgSkyTop: "#170f01",
      bgSkyBottom: "#332103",
      citySilhouette: "#201503",
      cityWindows: "#ffd700",
      groundGrid: "#e5a100",
      groundSurface: "#1a1202",
      accent: "#ffd700",
    },
  },
  {
    levelNumber: 4,
    name: "OVERDRIVE",
    targetGates: 18,
    gapSize: 132,
    speed: 4.2,
    pylonSpacing: 250,
    oscillating: true,
    spawnOrbs: true,
    palette: {
      pylonBorder: "#00ff88",
      pylonFill: "rgba(0, 45, 25, 0.85)",
      pylonGlow: "rgba(0, 255, 136, 0.4)",
      pylonCap: "#00d672",
      circuitLines: "rgba(0, 255, 136, 0.25)",
      bgSkyTop: "#01150c",
      bgSkyBottom: "#042c19",
      citySilhouette: "#021a0f",
      cityWindows: "#00ff88",
      groundGrid: "#00cc6a",
      groundSurface: "#02160d",
      accent: "#00ff88",
    },
  },
  {
    levelNumber: 5,
    name: "NEON SINGULARITY",
    targetGates: 20,
    gapSize: 122,
    speed: 4.6,
    pylonSpacing: 240,
    oscillating: true,
    spawnOrbs: true,
    palette: {
      pylonBorder: "#a855f7",
      pylonFill: "rgba(35, 10, 55, 0.85)",
      pylonGlow: "rgba(168, 85, 247, 0.45)",
      pylonCap: "#9333ea",
      circuitLines: "rgba(168, 85, 247, 0.3)",
      bgSkyTop: "#090114",
      bgSkyBottom: "#1f0538",
      citySilhouette: "#140324",
      cityWindows: "#c084fc",
      groundGrid: "#a855f7",
      groundSurface: "#0f021c",
      accent: "#c084fc",
    },
  },
];

export type Pylon = {
  id: number;
  x: number;
  topHeight: number;
  gapSize: number;
  passed: boolean;
  baseTopHeight: number;
  oscillationPhase: number;
  oscillationSpeed: number;
  oscillationAmp: number;
  orb?: {
    y: number;
    collected: boolean;
    sparklePhase: number;
  };
};

/**
 * Generates a valid gap top height such that top and bottom pylons meet minimum heights.
 */
export function generatePylonGap(
  gapSize: number,
  groundY: number = GROUND_Y,
  minHeight: number = PYLON_MIN_HEIGHT,
  randomVal: number = Math.random()
): number {
  const availableSpan = groundY - gapSize - 2 * minHeight;
  if (availableSpan <= 0) {
    return minHeight;
  }
  return minHeight + randomVal * availableSpan;
}

/**
 * Accurate circular vs rectangular collision check for top & bottom pylons.
 */
export function isBirdCollidingWithPylon(
  birdX: number,
  birdY: number,
  birdRadius: number,
  pylon: Pylon,
  groundY: number = GROUND_Y
): boolean {
  const pylonLeft = pylon.x;
  const pylonRight = pylon.x + PYLON_WIDTH;
  const topPylonBottom = pylon.topHeight;
  const bottomPylonTop = pylon.topHeight + pylon.gapSize;

  // Check top pylon: box [pylonLeft..pylonRight, 0..topPylonBottom]
  const closestXTop = Math.max(pylonLeft, Math.min(birdX, pylonRight));
  const closestYTop = Math.max(0, Math.min(birdY, topPylonBottom));
  const distSqTop =
    (birdX - closestXTop) * (birdX - closestXTop) +
    (birdY - closestYTop) * (birdY - closestYTop);

  if (distSqTop < birdRadius * birdRadius) {
    return true;
  }

  // Check bottom pylon: box [pylonLeft..pylonRight, bottomPylonTop..groundY]
  const closestXBot = Math.max(pylonLeft, Math.min(birdX, pylonRight));
  const closestYBot = Math.max(bottomPylonTop, Math.min(birdY, groundY));
  const distSqBot =
    (birdX - closestXBot) * (birdX - closestXBot) +
    (birdY - closestYBot) * (birdY - closestYBot);

  return distSqBot < birdRadius * birdRadius;
}

/**
 * Checks collision with ground or ceiling.
 */
export function isBirdCollidingWithGround(
  birdY: number,
  birdRadius: number,
  groundY: number = GROUND_Y
): boolean {
  return birdY + birdRadius >= groundY;
}

/**
 * Checks if bird collects bonus data orb.
 */
export function isBirdCollectingOrb(
  birdX: number,
  birdY: number,
  birdRadius: number,
  orbX: number,
  orbY: number,
  orbRadius: number = ORB_RADIUS
): boolean {
  const dx = birdX - orbX;
  const dy = birdY - orbY;
  const combinedRadius = birdRadius + orbRadius;
  return dx * dx + dy * dy <= combinedRadius * combinedRadius;
}
