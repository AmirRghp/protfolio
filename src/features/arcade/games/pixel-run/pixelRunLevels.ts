export const GAME_W = 880;
export const GAME_H = 600;
export const GROUND_Y = 510;

export const RAPTOR_X = 120;
export const RAPTOR_UPRIGHT_W = 50;
export const RAPTOR_UPRIGHT_H = 54;
export const RAPTOR_DUCK_W = 64;
export const RAPTOR_DUCK_H = 28;

export const GRAVITY = 0.52;
export const JUMP_IMPULSE = -12.4;
export const SHORT_HOP_CUTOFF = -4.5;
export const FAST_FALL_ACCEL = 1.1;

export const VICTORY_DISTANCE = 4500;
export const TOTAL_SECTORS = 5;
export const DISTANCE_SCALE = 0.02;

export type ObstacleType =
  | "spike_single"
  | "spike_double"
  | "spike_cluster"
  | "laser_barrier"
  | "drone_low"
  | "drone_mid"
  | "drone_high";

export type Obstacle = {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  w: number;
  h: number;
  isFlying?: boolean;
  wingAngle?: number;
  pulseTimer?: number;
};

export type CollectibleType = "core" | "shield";

export type Collectible = {
  id: number;
  type: CollectibleType;
  x: number;
  y: number;
  radius: number;
  collected?: boolean;
};

export type PixelRunPalette = {
  accent: string;
  glow: string;
  skyTop: string;
  skyBottom: string;
  skyline: string;
  groundSurface: string;
  groundGrid: string;
  groundUnder: string;
  obstacleBorder: string;
  obstacleFill: string;
  textAccent: string;
};

export type SectorConfig = {
  sectorNumber: number;
  name: string;
  targetDistance: number;
  speed: number;
  minSpawnDist: number;
  maxSpawnDist: number;
  allowedObstacles: ObstacleType[];
  palette: PixelRunPalette;
};

export const SECTOR_CONFIGS: SectorConfig[] = [
  {
    sectorNumber: 1,
    name: "NEON GRIDWAY",
    targetDistance: 500,
    speed: 6.2,
    minSpawnDist: 340,
    maxSpawnDist: 580,
    allowedObstacles: ["spike_single", "spike_double"],
    palette: {
      accent: "#00f0ff",
      glow: "rgba(0, 240, 255, 0.4)",
      skyTop: "#050b18",
      skyBottom: "#0b1c38",
      skyline: "#0f2b54",
      groundSurface: "#00f0ff",
      groundGrid: "rgba(0, 240, 255, 0.25)",
      groundUnder: "#060e1e",
      obstacleBorder: "#00f0ff",
      obstacleFill: "#0b344d",
      textAccent: "#70f8ff",
    },
  },
  {
    sectorNumber: 2,
    name: "SOLAR WASTELAND",
    targetDistance: 1200,
    speed: 7.4,
    minSpawnDist: 320,
    maxSpawnDist: 540,
    allowedObstacles: ["spike_single", "spike_double", "drone_mid", "drone_high"],
    palette: {
      accent: "#ff9d00",
      glow: "rgba(255, 157, 0, 0.4)",
      skyTop: "#1c0c04",
      skyBottom: "#331605",
      skyline: "#4a2408",
      groundSurface: "#ff9d00",
      groundGrid: "rgba(255, 157, 0, 0.25)",
      groundUnder: "#1a0b03",
      obstacleBorder: "#ffaa22",
      obstacleFill: "#542503",
      textAccent: "#ffc266",
    },
  },
  {
    sectorNumber: 3,
    name: "ACID DISTRICT",
    targetDistance: 2000,
    speed: 8.6,
    minSpawnDist: 300,
    maxSpawnDist: 500,
    allowedObstacles: [
      "spike_single",
      "spike_cluster",
      "laser_barrier",
      "drone_low",
      "drone_mid",
    ],
    palette: {
      accent: "#00ff88",
      glow: "rgba(0, 255, 136, 0.4)",
      skyTop: "#04140b",
      skyBottom: "#092415",
      skyline: "#0e3821",
      groundSurface: "#00ff88",
      groundGrid: "rgba(0, 255, 136, 0.25)",
      groundUnder: "#04140b",
      obstacleBorder: "#39ff9e",
      obstacleFill: "#083c21",
      textAccent: "#85ffc1",
    },
  },
  {
    sectorNumber: 4,
    name: "VIOLET GLITCH CITY",
    targetDistance: 3000,
    speed: 9.8,
    minSpawnDist: 280,
    maxSpawnDist: 460,
    allowedObstacles: [
      "spike_double",
      "spike_cluster",
      "laser_barrier",
      "drone_mid",
      "drone_low",
      "drone_high",
    ],
    palette: {
      accent: "#f000ff",
      glow: "rgba(240, 0, 255, 0.4)",
      skyTop: "#14041a",
      skyBottom: "#280833",
      skyline: "#3e0d50",
      groundSurface: "#f000ff",
      groundGrid: "rgba(240, 0, 255, 0.25)",
      groundUnder: "#130318",
      obstacleBorder: "#f445ff",
      obstacleFill: "#410854",
      textAccent: "#f78aff",
    },
  },
  {
    sectorNumber: 5,
    name: "OVERDRIVE CORE",
    targetDistance: 4500,
    speed: 11.0,
    minSpawnDist: 260,
    maxSpawnDist: 430,
    allowedObstacles: [
      "spike_double",
      "spike_cluster",
      "laser_barrier",
      "drone_low",
      "drone_mid",
    ],
    palette: {
      accent: "#ff0044",
      glow: "rgba(255, 0, 68, 0.45)",
      skyTop: "#1c0308",
      skyBottom: "#33050e",
      skyline: "#500917",
      groundSurface: "#ff0044",
      groundGrid: "rgba(255, 0, 68, 0.3)",
      groundUnder: "#180206",
      obstacleBorder: "#ff3366",
      obstacleFill: "#540716",
      textAccent: "#ff7799",
    },
  },
];

export type RaptorState = {
  x: number;
  y: number;
  vy: number;
  isGrounded: boolean;
  isDucking: boolean;
  hasShield: boolean;
  runFrame: number;
  frameTimer: number;
};

export function getRaptorHitbox(raptor: RaptorState): {
  x: number;
  y: number;
  w: number;
  h: number;
} {
  if (raptor.isDucking && raptor.isGrounded) {
    // Ducking on ground: low streamlined profile
    const w = RAPTOR_DUCK_W - 8;
    const h = RAPTOR_DUCK_H - 6;
    const x = raptor.x + 4;
    const y = GROUND_Y - RAPTOR_DUCK_H + 3;
    return { x, y, w, h };
  }

  // Upright (or jumping):
  const w = RAPTOR_UPRIGHT_W - 14;
  const h = RAPTOR_UPRIGHT_H - 8;
  const x = raptor.x + 7;
  const y = raptor.y + 4;
  return { x, y, w, h };
}

export function isAABBCollision(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function checkRaptorCollision(raptor: RaptorState, obstacle: Obstacle): boolean {
  const raptorBox = getRaptorHitbox(raptor);

  // Inset obstacle hitbox slightly for forgiving retro feel
  const insetX = 4;
  const insetY = obstacle.isFlying ? 3 : 4;
  const obsBox = {
    x: obstacle.x + insetX,
    y: obstacle.y + insetY,
    w: Math.max(4, obstacle.w - insetX * 2),
    h: Math.max(4, obstacle.h - insetY * 2),
  };

  return isAABBCollision(raptorBox, obsBox);
}

export function checkCollectiblePickup(raptor: RaptorState, item: Collectible): boolean {
  if (item.collected) return false;
  const rBox = getRaptorHitbox(raptor);

  // Circle to box collision approximation
  const closestX = Math.max(rBox.x, Math.min(item.x, rBox.x + rBox.w));
  const closestY = Math.max(rBox.y, Math.min(item.y, rBox.y + rBox.h));
  const dx = item.x - closestX;
  const dy = item.y - closestY;
  return dx * dx + dy * dy < item.radius * item.radius;
}

let obstacleIdCounter = 1;
export function createObstacle(type: ObstacleType, startX: number): Obstacle {
  const id = obstacleIdCounter++;
  switch (type) {
    case "spike_single":
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 42,
        w: 24,
        h: 42,
      };
    case "spike_double":
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 42,
        w: 46,
        h: 42,
      };
    case "spike_cluster":
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 48,
        w: 66,
        h: 48,
      };
    case "laser_barrier":
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 54,
        w: 32,
        h: 54,
        pulseTimer: 0,
      };
    case "drone_low":
      // Low drone: Y touches ground clearance, player MUST jump over it
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 38,
        w: 44,
        h: 26,
        isFlying: true,
        wingAngle: 0,
      };
    case "drone_mid":
      // Mid drone: Y hits upright player (top 460), but clears ducking player (top 485)
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 60,
        w: 44,
        h: 26,
        isFlying: true,
        wingAngle: 0,
      };
    case "drone_high":
      // High drone: high overhead (y: GROUND_Y - 110), pure visual hazard
      return {
        id,
        type,
        x: startX,
        y: GROUND_Y - 112,
        w: 44,
        h: 26,
        isFlying: true,
        wingAngle: 0,
      };
  }
}

let collectibleIdCounter = 1;
export function createCollectible(type: CollectibleType, startX: number, altitude: "low" | "high"): Collectible {
  const id = collectibleIdCounter++;
  const y = altitude === "high" ? GROUND_Y - 96 : GROUND_Y - 32;
  return {
    id,
    type,
    x: startX,
    y,
    radius: type === "shield" ? 14 : 11,
  };
}

export function getSectorProgress(distance: number, sectorIndex: number): number {
  const clampedIndex = Math.max(0, Math.min(SECTOR_CONFIGS.length - 1, sectorIndex));
  const startDist = clampedIndex === 0 ? 0 : SECTOR_CONFIGS[clampedIndex - 1].targetDistance;
  const endDist = SECTOR_CONFIGS[clampedIndex].targetDistance;
  const span = Math.max(1, endDist - startDist);
  return Math.max(0, Math.min(1, (distance - startDist) / span));
}

