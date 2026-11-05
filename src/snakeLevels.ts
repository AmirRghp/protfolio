export const GAME_W = 880;
export const GAME_H = 600;
export const CELL_SIZE = 20;
export const GRID_COLS = 44; // 880 / 20 = 44
export const GRID_ROWS = 30; // 600 / 20 = 30
export const HUD_ROWS = 2; // Rows 0-1 reserved for HUD

export type Point = {
  x: number;
  y: number;
};

export type SnakeLevelConfig = {
  levelNumber: number;
  name: string;
  foodTarget: number;
  tickDelayMs: number;
  bonusPoints: number;
  hasBonusFood: boolean;
  bonusFoodDurationMs: number;
  bonusFoodPoints: number;
  startPos: Point;
  startDir: Point;
  map: string[];
};

export const SNAKE_PALETTE = {
  bg: "#12131f",
  grid: "#1c1e30",
  hudBg: "#0d0e17",
  hudText: "#c0c0c0",
  accentCyan: "#4cffd7",
  snakeHead: "#4cffd7",
  snakeBody: "#00c896",
  snakeBodyAlt: "#00a87a",
  snakeEye: "#0d0e17",
  wallPrimary: "#ff2a85",
  wallBorder: "#ff6ea7",
  wallShadow: "#7a0e3c",
  foodHues: [
    "#00ffcc", // neon turquoise
    "#ff0055", // neon pink
    "#b026ff", // neon purple
    "#ffe600", // neon yellow
    "#00e5ff", // neon cyan
    "#ff6600", // neon orange
  ],
  goldenApple: "#ffd700",
  goldenGlow: "#ffaa00",
};

// Generates a 30-row map array with standard border walls at rows 2 & 29 and cols 0 & 43
function generateBaseMap(innerRows: string[]): string[] {
  const map: string[] = [];
  // Row 0 and 1: HUD area
  map.push(" ".repeat(GRID_COLS));
  map.push(" ".repeat(GRID_COLS));
  // Row 2: Top wall
  map.push("#".repeat(GRID_COLS));

  // Rows 3 to 28 (26 interior rows)
  for (let r = 0; r < 26; r++) {
    const inner = innerRows[r] || ".".repeat(42);
    map.push("#" + inner + "#");
  }

  // Row 29: Bottom wall
  map.push("#".repeat(GRID_COLS));
  return map;
}

// ----------------------------------------------------------------------
// LEVEL 1: WARM UP
// Clean open perimeter, no internal obstacles.
// ----------------------------------------------------------------------
const LEVEL_1_INNER: string[] = Array(26).fill(".".repeat(42));

// ----------------------------------------------------------------------
// LEVEL 2: TWIN COLUMNS
// Two vertical obstacle pylons dividing arena into 3 vertical channels.
// ----------------------------------------------------------------------
const LEVEL_2_INNER: string[] = [];
for (let r = 0; r < 26; r++) {
  // r corresponds to map row (r + 3). Obstacles from map rows 8 to 23 => r: 5 to 20
  if (r >= 5 && r <= 20) {
    // 42 interior columns (1 to 42). Col 14 is index 13, Col 29 is index 28.
    const rowChars = Array(42).fill(".");
    rowChars[13] = "#";
    rowChars[28] = "#";
    LEVEL_2_INNER.push(rowChars.join(""));
  } else {
    LEVEL_2_INNER.push(".".repeat(42));
  }
}

// ----------------------------------------------------------------------
// LEVEL 3: FOUR BASTIONS
// 4 L-shaped corner fortifications and center hazard block.
// ----------------------------------------------------------------------
const LEVEL_3_INNER: string[] = [];
for (let r = 0; r < 26; r++) {
  const rowChars = Array(42).fill(".");
  // Top corner L-shapes: r = 3..7
  if (r >= 3 && r <= 7) {
    rowChars[6] = "#"; // left vertical
    rowChars[35] = "#"; // right vertical
    if (r === 7) {
      for (let c = 6; c <= 12; c++) rowChars[c] = "#";
      for (let c = 29; c <= 35; c++) rowChars[c] = "#";
    }
  }
  // Center hazard: r = 12..13, c = 20..21
  if (r === 12 || r === 13) {
    rowChars[20] = "#";
    rowChars[21] = "#";
  }
  // Bottom corner L-shapes: r = 18..22
  if (r >= 18 && r <= 22) {
    rowChars[6] = "#";
    rowChars[35] = "#";
    if (r === 18) {
      for (let c = 6; c <= 12; c++) rowChars[c] = "#";
      for (let c = 29; c <= 35; c++) rowChars[c] = "#";
    }
  }
  LEVEL_3_INNER.push(rowChars.join(""));
}

// ----------------------------------------------------------------------
// LEVEL 4: CYBER SLALOM
// Horizontal barrier shelves creating serpentine slalom passages.
// ----------------------------------------------------------------------
const LEVEL_4_INNER: string[] = [];
for (let r = 0; r < 26; r++) {
  const rowChars = Array(42).fill(".");
  // Shelf 1 at r = 5 (map row 8): columns 7..34 (gap on sides)
  if (r === 5) {
    for (let c = 7; c <= 34; c++) rowChars[c] = "#";
  }
  // Shelf 2 at r = 12 (map row 15): gap in center (c 19..22)
  if (r === 12) {
    for (let c = 0; c <= 18; c++) rowChars[c] = "#";
    for (let c = 23; c <= 41; c++) rowChars[c] = "#";
  }
  // Shelf 3 at r = 19 (map row 22): columns 7..34
  if (r === 19) {
    for (let c = 7; c <= 34; c++) rowChars[c] = "#";
  }
  LEVEL_4_INNER.push(rowChars.join(""));
}

// ----------------------------------------------------------------------
// LEVEL 5: NEON CORE
// Central fortress box with 4 gateway entrances and 4 corner sentinels.
// ----------------------------------------------------------------------
const LEVEL_5_INNER: string[] = [];
for (let r = 0; r < 26; r++) {
  const rowChars = Array(42).fill(".");
  // Sentinel corner blocks (r = 3, 22; c = 6, 35)
  if ((r === 3 || r === 22) && (rowChars[6] = "#") && (rowChars[35] = "#")) {
    /* sentinels placed */
  }

  // Core box: rows 7 to 18 (map rows 10 to 21), columns 14 to 27
  if (r === 7 || r === 18) {
    // Top & bottom wall of core with central gates at c = 20..21
    for (let c = 14; c <= 27; c++) {
      if (c !== 20 && c !== 21) rowChars[c] = "#";
    }
  } else if (r > 7 && r < 18) {
    // Left & right walls of core with gates at r = 12..13
    if (r !== 12 && r !== 13) {
      rowChars[14] = "#";
      rowChars[27] = "#";
    }
  }

  LEVEL_5_INNER.push(rowChars.join(""));
}

export const SNAKE_LEVELS: SnakeLevelConfig[] = [
  {
    levelNumber: 1,
    name: "WARM UP",
    foodTarget: 10,
    tickDelayMs: 130,
    bonusPoints: 500,
    hasBonusFood: false,
    bonusFoodDurationMs: 0,
    bonusFoodPoints: 0,
    startPos: { x: 22, y: 15 },
    startDir: { x: 1, y: 0 },
    map: generateBaseMap(LEVEL_1_INNER),
  },
  {
    levelNumber: 2,
    name: "TWIN COLUMNS",
    foodTarget: 12,
    tickDelayMs: 110,
    bonusPoints: 750,
    hasBonusFood: false,
    bonusFoodDurationMs: 0,
    bonusFoodPoints: 0,
    startPos: { x: 22, y: 15 },
    startDir: { x: 1, y: 0 },
    map: generateBaseMap(LEVEL_2_INNER),
  },
  {
    levelNumber: 3,
    name: "FOUR BASTIONS",
    foodTarget: 14,
    tickDelayMs: 95,
    bonusPoints: 1000,
    hasBonusFood: true,
    bonusFoodDurationMs: 8000,
    bonusFoodPoints: 300,
    startPos: { x: 22, y: 16 },
    startDir: { x: 1, y: 0 },
    map: generateBaseMap(LEVEL_3_INNER),
  },
  {
    levelNumber: 4,
    name: "CYBER SLALOM",
    foodTarget: 16,
    tickDelayMs: 82,
    bonusPoints: 1500,
    hasBonusFood: true,
    bonusFoodDurationMs: 7000,
    bonusFoodPoints: 400,
    startPos: { x: 22, y: 9 },
    startDir: { x: 1, y: 0 },
    map: generateBaseMap(LEVEL_4_INNER),
  },
  {
    levelNumber: 5,
    name: "NEON CORE",
    foodTarget: 20,
    tickDelayMs: 68,
    bonusPoints: 2500,
    hasBonusFood: true,
    bonusFoodDurationMs: 6000,
    bonusFoodPoints: 500,
    startPos: { x: 22, y: 25 },
    startDir: { x: 1, y: 0 },
    map: generateBaseMap(LEVEL_5_INNER),
  },
];

export const TOTAL_SNAKE_LEVELS = SNAKE_LEVELS.length;

// Extracts an array of solid wall coordinates from the level map
export function buildWallsForLevel(levelIndex: number): Point[] {
  const safeIndex = Math.max(0, Math.min(levelIndex, SNAKE_LEVELS.length - 1));
  const level = SNAKE_LEVELS[safeIndex];
  const walls: Point[] = [];

  for (let r = 0; r < level.map.length; r++) {
    const row = level.map[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] === "#") {
        walls.push({ x: c, y: r });
      }
    }
  }
  return walls;
}

// Checks if a cell is an obstacle wall
export function isWall(pt: Point, walls: Point[]): boolean {
  for (let i = 0; i < walls.length; i++) {
    if (walls[i].x === pt.x && walls[i].y === pt.y) return true;
  }
  return false;
}

// Checks if a point is inside the snake body or head
export function isInSnake(pt: Point, snake: Point[]): boolean {
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === pt.x && snake[i].y === pt.y) return true;
  }
  return false;
}

// Generates a safe random free cell for food spawning
export function getSafeSpawnPosition(
  snake: Point[],
  walls: Point[],
  otherOccupied: Point[] = []
): Point {
  const occupiedSet = new Set<string>();
  for (const s of snake) occupiedSet.add(`${s.x},${s.y}`);
  for (const w of walls) occupiedSet.add(`${w.x},${w.y}`);
  for (const o of otherOccupied) occupiedSet.add(`${o.x},${o.y}`);

  const freeCells: Point[] = [];
  for (let r = HUD_ROWS + 1; r < GRID_ROWS - 1; r++) {
    for (let c = 1; c < GRID_COLS - 1; c++) {
      const key = `${c},${r}`;
      if (!occupiedSet.has(key)) {
        freeCells.push({ x: c, y: r });
      }
    }
  }

  if (freeCells.length === 0) {
    return { x: 22, y: 15 };
  }

  const idx = Math.floor(Math.random() * freeCells.length);
  return freeCells[idx];
}
