import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import TetrisGame from "./TetrisGame";
import {
  BOARD_COLS,
  BOARD_ROWS,
  calculateLineScore,
  checkCollision,
  clearLinesFromBoard,
  computeGhostY,
  createShuffledBag,
  findCompletedLines,
  tryRotation,
  type TetrominoType,
} from "./tetrisLevels";

describe("Tetris Logic & Level System", () => {
  it("generates a valid 7-bag containing all 7 unique tetrominoes", () => {
    const bag = createShuffledBag();
    expect(bag).toHaveLength(7);
    const expectedTypes: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
    expectedTypes.forEach((type) => {
      expect(bag).toContain(type);
    });
  });

  it("detects collisions against walls and floor", () => {
    const emptyBoard: (TetrominoType | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array(BOARD_COLS).fill(null)
    );

    // Within bounds
    expect(checkCollision("T", 0, 3, 5, emptyBoard)).toBe(false);

    // Left wall collision
    expect(checkCollision("T", 0, -2, 5, emptyBoard)).toBe(true);

    // Right wall collision (T width is 3)
    expect(checkCollision("T", 0, 9, 5, emptyBoard)).toBe(true);

    // Floor collision
    expect(checkCollision("T", 0, 3, 20, emptyBoard)).toBe(true);
  });

  it("detects collisions against occupied cells on the board", () => {
    const board: (TetrominoType | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array(BOARD_COLS).fill(null)
    );
    // Occupy cell (4, 6)
    board[6][4] = "I";

    // T-piece at (3, 5) with rotation 0 has shape cells [[1,0], [0,1], [1,1], [2,1]]
    // Relative cell [1, 1] lands on (3 + 1, 5 + 1) = (4, 6)
    expect(checkCollision("T", 0, 3, 5, board)).toBe(true);

    // T-piece far away from (4, 6) should not collide
    expect(checkCollision("T", 0, 0, 0, board)).toBe(false);
  });

  it("performs SRS wall kicks when rotating next to the right boundary", () => {
    const emptyBoard: (TetrominoType | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array(BOARD_COLS).fill(null)
    );

    // Place an I-piece near right wall
    const result = tryRotation("I", 1, true, 8, 5, emptyBoard);
    expect(result.success).toBe(true);
  });

  it("computes accurate ghost landing position", () => {
    const board: (TetrominoType | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array(BOARD_COLS).fill(null)
    );
    // Place an obstacle at row 18
    board[18][4] = "O";

    // Drop O-piece at col 3 (which covers cols 4 and 5 in its shape)
    const ghostY = computeGhostY("O", 0, 3, 0, board);
    // Shape occupies y + 1 at col 4, so at y = 16, bottom is at 17, at y = 17 bottom hits row 18
    expect(ghostY).toBe(16);
  });

  it("detects completed lines and collapses the board properly", () => {
    const board: (TetrominoType | null)[][] = Array.from({ length: BOARD_ROWS }, () =>
      Array(BOARD_COLS).fill(null)
    );

    // Fill row 19 completely
    for (let c = 0; c < BOARD_COLS; c++) {
      board[19][c] = "I";
    }
    // Fill row 18 partially
    board[18][0] = "T";
    board[18][1] = "T";

    const completed = findCompletedLines(board);
    expect(completed).toEqual([19]);

    const newBoard = clearLinesFromBoard(board, completed);
    expect(newBoard).toHaveLength(BOARD_ROWS);
    // Row 19 should now contain the shifted contents of row 18
    expect(newBoard[19][0]).toBe("T");
    expect(newBoard[19][1]).toBe("T");
    expect(newBoard[19][2]).toBe(null);
    // Top row 0 should be empty
    expect(newBoard[0].every((cell) => cell === null)).toBe(true);
  });

  it("calculates accurate line scores including sector multipliers and combo bonuses", () => {
    // Single line at 1.0x
    const single = calculateLineScore(1, 1.0, 0);
    expect(single.basePoints).toBe(100);
    expect(single.total).toBe(100);

    // Tetris (4 lines) at 2.0x multiplier with 2x combo
    const tetris = calculateLineScore(4, 2.0, 2);
    expect(tetris.basePoints).toBe(1600); // 800 * 2.0
    expect(tetris.comboBonus).toBe(200); // 50 * 2 * 2.0
    expect(tetris.total).toBe(1800);
  });

  it("renders canvas element without crashing", () => {
    const onExit = vi.fn();
    const html = renderToStaticMarkup(<TetrisGame onExit={onExit} />);
    expect(html).toContain("<canvas");
  });
});
