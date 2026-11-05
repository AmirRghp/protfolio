export const GAME_W = 880;
export const GAME_H = 600;

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;
export const BLOCK_SIZE = 26;
export const BOARD_W = BOARD_COLS * BLOCK_SIZE; // 260
export const BOARD_H = BOARD_ROWS * BLOCK_SIZE; // 520
export const BOARD_X = 310;
export const BOARD_Y = 40;

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type TetrisTheme = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  gridLine: string;
  boardBorder: string;
  bgGlow: string;
};

export type TetrisSectorConfig = {
  sectorNumber: number;
  name: string;
  targetLines: number;
  stepMs: number;
  scoreMultiplier: number;
  theme: TetrisTheme;
};

export const TETROMINO_COLORS: Record<TetrominoType, { fill: string; border: string; glow: string }> = {
  I: { fill: "#00f0ff", border: "#70f7ff", glow: "rgba(0, 240, 255, 0.6)" },
  O: { fill: "#ffd700", border: "#ffe666", glow: "rgba(255, 215, 0, 0.6)" },
  T: { fill: "#b026ff", border: "#cf6eff", glow: "rgba(176, 38, 255, 0.6)" },
  S: { fill: "#00ff66", border: "#73ffaa", glow: "rgba(0, 255, 102, 0.6)" },
  Z: { fill: "#ff0055", border: "#ff6699", glow: "rgba(255, 0, 85, 0.6)" },
  J: { fill: "#0066ff", border: "#66a3ff", glow: "rgba(0, 102, 255, 0.6)" },
  L: { fill: "#ff8800", border: "#ffb366", glow: "rgba(255, 136, 0, 0.6)" },
};

export const TETROMINO_SHAPES: Record<TetrominoType, [number, number][][]> = {
  I: [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[2, 0], [2, 1], [2, 2], [2, 3]],
    [[0, 2], [1, 2], [2, 2], [3, 2]],
    [[1, 0], [1, 1], [1, 2], [1, 3]],
  ],
  O: [
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [2, 1]],
  ],
  T: [
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [1, 2]],
    [[1, 0], [0, 1], [1, 1], [1, 2]],
  ],
  S: [
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[1, 0], [1, 1], [2, 1], [2, 2]],
    [[1, 1], [2, 1], [0, 2], [1, 2]],
    [[0, 0], [0, 1], [1, 1], [1, 2]],
  ],
  Z: [
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[2, 0], [1, 1], [2, 1], [1, 2]],
    [[0, 1], [1, 1], [1, 2], [2, 2]],
    [[1, 0], [0, 1], [1, 1], [0, 2]],
  ],
  J: [
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [1, 1], [1, 2]],
    [[0, 1], [1, 1], [2, 1], [2, 2]],
    [[1, 0], [1, 1], [0, 2], [1, 2]],
  ],
  L: [
    [[2, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [1, 1], [1, 2], [2, 2]],
    [[0, 1], [1, 1], [2, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1], [1, 2]],
  ],
};

export const TOTAL_TETRIS_SECTORS = 5;

export const TETRIS_SECTORS: TetrisSectorConfig[] = [
  {
    sectorNumber: 1,
    name: "NEON PROTOCOL",
    targetLines: 10,
    stepMs: 800,
    scoreMultiplier: 1.0,
    theme: {
      name: "Cyan Glow",
      primary: "#00f0ff",
      secondary: "#0088cc",
      accent: "#70f7ff",
      gridLine: "rgba(0, 240, 255, 0.12)",
      boardBorder: "rgba(0, 240, 255, 0.4)",
      bgGlow: "rgba(0, 240, 255, 0.04)",
    },
  },
  {
    sectorNumber: 2,
    name: "SYNTH GRID",
    targetLines: 10,
    stepMs: 620,
    scoreMultiplier: 1.5,
    theme: {
      name: "Cyber Violet",
      primary: "#ff007f",
      secondary: "#bc13fe",
      accent: "#ff77b4",
      gridLine: "rgba(255, 0, 127, 0.12)",
      boardBorder: "rgba(255, 0, 127, 0.4)",
      bgGlow: "rgba(188, 19, 254, 0.04)",
    },
  },
  {
    sectorNumber: 3,
    name: "MATRIX OVERLOAD",
    targetLines: 12,
    stepMs: 460,
    scoreMultiplier: 2.0,
    theme: {
      name: "Emerald Stream",
      primary: "#00ff66",
      secondary: "#00aa44",
      accent: "#66ff99",
      gridLine: "rgba(0, 255, 102, 0.12)",
      boardBorder: "rgba(0, 255, 102, 0.4)",
      bgGlow: "rgba(0, 255, 102, 0.04)",
    },
  },
  {
    sectorNumber: 4,
    name: "SOLAR CORE",
    targetLines: 12,
    stepMs: 320,
    scoreMultiplier: 2.5,
    theme: {
      name: "Hyper Amber",
      primary: "#ffb700",
      secondary: "#ff5500",
      accent: "#ffe666",
      gridLine: "rgba(255, 183, 0, 0.12)",
      boardBorder: "rgba(255, 183, 0, 0.4)",
      bgGlow: "rgba(255, 85, 0, 0.04)",
    },
  },
  {
    sectorNumber: 5,
    name: "NEO TOKYO OVERDRIVE",
    targetLines: 15,
    stepMs: 200,
    scoreMultiplier: 3.0,
    theme: {
      name: "Crimson Voltage",
      primary: "#ff003c",
      secondary: "#e024c3",
      accent: "#ff5577",
      gridLine: "rgba(255, 0, 60, 0.14)",
      boardBorder: "rgba(255, 0, 60, 0.45)",
      bgGlow: "rgba(255, 0, 60, 0.05)",
    },
  },
];

// Returns an endless overdrive sector config when going beyond Sector 5
export function getEndlessSectorConfig(levelNumber: number): TetrisSectorConfig {
  const stepMs = Math.max(90, Math.floor(200 - (levelNumber - 5) * 18));
  const scoreMultiplier = 3.0 + (levelNumber - 5) * 0.5;
  const baseTheme = TETRIS_SECTORS[(levelNumber - 1) % TETRIS_SECTORS.length].theme;
  return {
    sectorNumber: levelNumber,
    name: `OVERDRIVE S-${levelNumber}`,
    targetLines: 15,
    stepMs,
    scoreMultiplier,
    theme: baseTheme,
  };
}

// 7-Bag Randomizer
export function createShuffledBag(): TetrominoType[] {
  const bag: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

// Collision detection
export function checkCollision(
  type: TetrominoType,
  rotation: number,
  posX: number,
  posY: number,
  board: (TetrominoType | null)[][],
): boolean {
  const shape = TETROMINO_SHAPES[type][rotation];
  for (let i = 0; i < shape.length; i++) {
    const [dx, dy] = shape[i];
    const cellX = posX + dx;
    const cellY = posY + dy;

    // Check board horizontal walls
    if (cellX < 0 || cellX >= BOARD_COLS) {
      return true;
    }
    // Check board floor
    if (cellY >= BOARD_ROWS) {
      return true;
    }
    // Check occupied cells (ignore cells above row 0 during spawn)
    if (cellY >= 0 && board[cellY] && board[cellY][cellX] !== null) {
      return true;
    }
  }
  return false;
}

// SRS wall kick test offsets
const STANDARD_KICKS = [
  [0, 0],
  [-1, 0],
  [1, 0],
  [0, -1],
  [-1, -1],
  [1, -1],
  [-2, 0],
  [2, 0],
  [0, -2],
];

const I_KICKS = [
  [0, 0],
  [-2, 0],
  [1, 0],
  [-2, -1],
  [1, 2],
  [2, 0],
  [-1, 0],
  [2, 1],
  [-1, -2],
  [0, -1],
  [0, -2],
];

export function tryRotation(
  type: TetrominoType,
  currentRotation: number,
  clockwise: boolean,
  posX: number,
  posY: number,
  board: (TetrominoType | null)[][],
): { success: boolean; newRotation: number; newX: number; newY: number } {
  const dir = clockwise ? 1 : 3;
  const targetRotation = (currentRotation + dir) % 4;
  const kickTable = type === "I" ? I_KICKS : STANDARD_KICKS;

  for (let i = 0; i < kickTable.length; i++) {
    const [kickX, kickY] = kickTable[i];
    const testX = posX + kickX;
    const testY = posY + kickY;
    if (!checkCollision(type, targetRotation, testX, testY, board)) {
      return {
        success: true,
        newRotation: targetRotation,
        newX: testX,
        newY: testY,
      };
    }
  }

  return {
    success: false,
    newRotation: currentRotation,
    newX: posX,
    newY: posY,
  };
}

// Compute ghost piece position
export function computeGhostY(
  type: TetrominoType,
  rotation: number,
  posX: number,
  posY: number,
  board: (TetrominoType | null)[][],
): number {
  let ghostY = posY;
  while (!checkCollision(type, rotation, posX, ghostY + 1, board)) {
    ghostY++;
  }
  return ghostY;
}

// Check completed rows
export function findCompletedLines(board: (TetrominoType | null)[][]): number[] {
  const completed: number[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    let full = true;
    for (let c = 0; c < BOARD_COLS; c++) {
      if (board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      completed.push(r);
    }
  }
  return completed;
}

// Clear lines and drop stack
export function clearLinesFromBoard(
  board: (TetrominoType | null)[][],
  lineIndices: number[],
): (TetrominoType | null)[][] {
  if (lineIndices.length === 0) return board;

  const newBoard: (TetrominoType | null)[][] = [];
  const linesToSkip = new Set(lineIndices);

  for (let r = 0; r < BOARD_ROWS; r++) {
    if (!linesToSkip.has(r)) {
      newBoard.push([...board[r]]);
    }
  }

  // Prepend empty rows at top
  while (newBoard.length < BOARD_ROWS) {
    newBoard.unshift(Array(BOARD_COLS).fill(null));
  }

  return newBoard;
}

// Score formula based on lines cleared and current sector multiplier
export function calculateLineScore(
  linesCleared: number,
  multiplier: number,
  comboCount: number,
): { basePoints: number; comboBonus: number; total: number } {
  let base = 0;
  if (linesCleared === 1) base = 100;
  else if (linesCleared === 2) base = 300;
  else if (linesCleared === 3) base = 500;
  else if (linesCleared === 4) base = 800; // Tetris!

  const basePoints = Math.round(base * multiplier);
  const comboBonus = comboCount > 0 ? Math.round(50 * comboCount * multiplier) : 0;
  return {
    basePoints,
    comboBonus,
    total: basePoints + comboBonus,
  };
}
