import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  BLOCK_SIZE,
  BOARD_COLS,
  BOARD_H,
  BOARD_ROWS,
  BOARD_W,
  BOARD_X,
  BOARD_Y,
  GAME_H,
  GAME_W,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  TETRIS_SECTORS,
  TOTAL_TETRIS_SECTORS,
  calculateLineScore,
  checkCollision,
  clearLinesFromBoard,
  computeGhostY,
  createShuffledBag,
  findCompletedLines,
  getEndlessSectorConfig,
  tryRotation,
  type TetrisSectorConfig,
  type TetrominoType,
} from "./tetrisLevels";
import { tetrisAudio } from "./tetrisAudio";

const EMBEDDED_FAMILY = "Departure Mono Subset";
const EMBEDDED_FONT_B64 =
  "d09GMk9UVE8AAATgAAsAAAAAC0wAAASYAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAADY4OGyAcKgZgAFwBNgIkA1gEBgWDHAcgG4cKUVRNohBfHNjgDj0qKzWKGdvBNGJwXv34ZAfh+x68ScExtv1HxLVDKZ40NIhEl1Isutyitc0LkqASNxS0Ummm2ebfdw+xRo6UBPHfrn1/kgCzKEowizSBYzitlmi7/3M9dg9Nd8aAGIEuQgyoaW0AmdtpTKkEJ6yihcpEKaDRKRvZU5CDHOQi3++vqf3tiN3mispMLZOquffvmn+FKwGoMbo5IjfX+GYKQU7OGBKGrJn1W9RtapBavPBBZVIFho7/vzDgceXU1Nq/YEQlXjjt0w2f7vz0EJ/OatKcBeZy2Vx5Oj+hEz0xAT58xWjih4/nz7XhI8lqyX3Utqq2gQyNgzOjo2MiE5ZhFKmqyXZ9Q59YzIJ6kNbkoDETrIz18k+BCL4DNh1WYAFuYA2WEFYgQYrU5GvJqiM80ZSeTOEgx7jILV4LYoly8fVw7mHu5dyX+dX5zfmD+af5r/O/v8SyX27Lh6LfedgeToe74XF4M3wefrZGrXsUwlBDmKzMDrIGIB2n4WUbf73+50kaIWhSsNpiKCpED2Zt1KHNWfUKsulYkMSt1qNWR0GqXBIUlZ8oTnKchdyU0WNS/LQsQRGooWbAoLVhG4w82trmZ/SAYmhJhxxbshOonJDoNfbWn9eB6q2ZAEQVk86yXElEYayR4eJMu+LRSOQSM92xEwugotRY2VB8tHY8koWA6MAmxBlkJ0eG9WgUikbMCpL9iSTWtZgo76EkmJsbzu4Au6PAMRAco9FkXIpejHKF3h2A9FGXMTA568/Jhg7iwFZYvaBrFiFQbEbAsDqYAkwQa3QMN6aGZcTRhsgSyxSPhibYxPQCjn6sZ2JBF310pBTcbbs0UBx4wggJ6RUsZQ3WKTalSRhFXwUCGLVVqFhjyANHg5UxWVmSEIYHPTAatQGkxg0ZaSNvtINHDwh09uzhlEBNXze2Xjig0cpjCIGGjJjhjGCV0HSpckBxRrrGKnQfsDVp6TitkVxrnOoq3/KADl3KGr492I6VzQF7HAvl0J6Oa5bc4VqNQRu5tDW2Kgbw54bbwZ0pnYyiG3WoejRXMQv2jm6K3fsRcoMaRu/dAlazMriacEUa5sKEOMoJmUclh37rwcuyLBxzupJsveDaxqf/KyYXK0snK8s6FfYgwJQ7TzyFkw3qFABa46GziAMFE8drvJ67opWRh9NVOjkLA8YZZimAYFCwD09zKQEm+r50p4a7n+EHb60VqEdBLMxl6+HmrN+bhAVAsT2J11WKAeaMCYq3KClStbIW9RYuOgLlVNGXgL7V93pXJObJDxIqUEjCV/FDxn9h3dVMfzOWIhAAbmZr46Bfj6bzdBkRgmCmZZ0eAFbxPITRvMFfiN2tc/pnEjvHUQ1h7FRvFWAzAZANQSm5y5YKltqlUrZMqoRbkRrI9X+AodA4I49xPq5SscSdaPnRxml3vH48b8WoQOpAtEocqNgIOQdXdw9XJCoYZVYo9lBk+V19kRJEi5amwdjezBAFM83SbsdPbDaZrTsE7DdplplCnhRli344SSdLRHHwRmKCXcHiSHy7WCGs6QOPQJ/CU38E";

let embeddedFontPromise: Promise<void> | null = null;
function ensureEmbeddedFont(): Promise<void> {
  if (embeddedFontPromise) return embeddedFontPromise;
  if (typeof document === "undefined" || !(document as unknown as { fonts?: unknown }).fonts) {
    embeddedFontPromise = Promise.resolve();
    return embeddedFontPromise;
  }
  embeddedFontPromise = (async () => {
    try {
      const src = `url(data:font/woff2;base64,${EMBEDDED_FONT_B64}) format("woff2")`;
      const face = new (window as unknown as {
        FontFace: new (family: string, source: string) => { load: () => Promise<unknown> };
      }).FontFace(EMBEDDED_FAMILY, src);
      const loaded = await face.load();
      (document as unknown as { fonts: { add: (f: unknown) => void } }).fonts.add(loaded);
    } catch {
      /* fallback to monospace */
    }
  })();
  return embeddedFontPromise;
}

export type TetrisGameMode = "READY" | "RUNNING" | "PAUSED" | "LEVEL_CLEAR" | "VICTORY" | "GAME_OVER";

export type TetrisParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
};

export type FloatingText = {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
};

export interface TetrisGameProps {
  onExit: () => void;
}

const HIGH_SCORE_KEY = "cyber_tetris_high_score";

export default function TetrisGame({ onExit }: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modeRef = useRef<TetrisGameMode>("READY");

  // Game state
  const currentSectorIndexRef = useRef(0);
  const isEndlessRef = useRef(false);
  const sectorRef = useRef<TetrisSectorConfig>(TETRIS_SECTORS[0]);
  const boardRef = useRef<(TetrominoType | null)[][]>(
    Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null))
  );

  const bagRef = useRef<TetrominoType[]>([]);
  const nextQueueRef = useRef<TetrominoType[]>([]);
  const holdPieceRef = useRef<TetrominoType | null>(null);
  const canHoldRef = useRef(true);

  // Active falling tetromino
  const activePieceRef = useRef<TetrominoType>("T");
  const activeRotationRef = useRef(0);
  const activeXRef = useRef(3);
  const activeYRef = useRef(0);

  // Stats
  const scoreRef = useRef(0);
  const displayedScoreRef = useRef(0);
  const highScoreRef = useRef(0);
  const sectorLinesRef = useRef(0);
  const totalLinesRef = useRef(0);
  const comboRef = useRef(0);
  const statCountsRef = useRef({ singles: 0, doubles: 0, triples: 0, tetrises: 0 });

  // Timing
  const lastDropTimeRef = useRef(0);
  const lockTimerRef = useRef<number | null>(null);
  const lockMovesCountRef = useRef(0);
  const clearingLinesRef = useRef<number[] | null>(null);
  const clearTimerRef = useRef(0);

  // FX & Animation
  const particlesRef = useRef<TetrisParticle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const shakeTimerRef = useRef(0);
  const shakeIntensityRef = useRef(0);
  const isMusicActiveRef = useRef(false);

  // Controls DAS (Delayed Auto Shift)
  const keysDownRef = useRef<Record<string, boolean>>({});
  const dasTimerRef = useRef<number | null>(null);
  const dasRepeatTimerRef = useRef<number | null>(null);

  // Safe draw helper for bag
  const getNextPiece = useCallback((): TetrominoType => {
    if (bagRef.current.length === 0) {
      bagRef.current = createShuffledBag();
    }
    return bagRef.current.pop()!;
  }, []);

  const spawnNewPiece = useCallback((specifiedType?: TetrominoType) => {
    while (nextQueueRef.current.length < 4) {
      nextQueueRef.current.push(getNextPiece());
    }

    const type = specifiedType || nextQueueRef.current.shift()!;
    activePieceRef.current = type;
    activeRotationRef.current = 0;
    activeXRef.current = type === "O" ? 4 : 3;
    activeYRef.current = type === "I" ? -1 : 0;
    canHoldRef.current = true;
    lockTimerRef.current = null;
    lockMovesCountRef.current = 0;

    // Check immediate spawn collision -> Game Over
    if (checkCollision(type, 0, activeXRef.current, activeYRef.current, boardRef.current)) {
      modeRef.current = "GAME_OVER";
      tetrisAudio.playGameOver();
      tetrisAudio.stopMusic();
      isMusicActiveRef.current = false;
      if (scoreRef.current > highScoreRef.current) {
        highScoreRef.current = scoreRef.current;
        try {
          localStorage.setItem(HIGH_SCORE_KEY, String(scoreRef.current));
        } catch {
          /* ignore */
        }
      }
    }
  }, [getNextPiece]);

  const initGame = useCallback((sectorIndex: number, endless: boolean) => {
    currentSectorIndexRef.current = sectorIndex;
    isEndlessRef.current = endless;
    sectorRef.current = endless
      ? getEndlessSectorConfig(sectorIndex + 1)
      : TETRIS_SECTORS[sectorIndex];

    boardRef.current = Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(null));
    bagRef.current = createShuffledBag();
    nextQueueRef.current = [getNextPiece(), getNextPiece(), getNextPiece(), getNextPiece()];
    holdPieceRef.current = null;
    canHoldRef.current = true;

    scoreRef.current = 0;
    displayedScoreRef.current = 0;
    sectorLinesRef.current = 0;
    totalLinesRef.current = 0;
    comboRef.current = 0;
    statCountsRef.current = { singles: 0, doubles: 0, triples: 0, tetrises: 0 };
    particlesRef.current = [];
    floatingTextsRef.current = [];
    clearingLinesRef.current = null;

    spawnNewPiece();
  }, [getNextPiece, spawnNewPiece]);

  // Lock active piece into matrix
  const lockActivePiece = useCallback(() => {
    const type = activePieceRef.current;
    const rotation = activeRotationRef.current;
    const posX = activeXRef.current;
    const posY = activeYRef.current;
    const shape = TETROMINO_SHAPES[type][rotation];

    shape.forEach(([dx, dy]) => {
      const cy = posY + dy;
      const cx = posX + dx;
      if (cy >= 0 && cy < BOARD_ROWS && cx >= 0 && cx < BOARD_COLS) {
        boardRef.current[cy][cx] = type;
      }
    });

    // Check line clears
    const completed = findCompletedLines(boardRef.current);
    if (completed.length > 0) {
      clearingLinesRef.current = completed;
      clearTimerRef.current = 180; // 180ms flash duration

      // Particles along completed lines
      completed.forEach((row) => {
        for (let col = 0; col < BOARD_COLS; col++) {
          const color = TETROMINO_COLORS[boardRef.current[row][col] || "I"].fill;
          const px = BOARD_X + col * BLOCK_SIZE + BLOCK_SIZE / 2;
          const py = BOARD_Y + row * BLOCK_SIZE + BLOCK_SIZE / 2;
          for (let p = 0; p < 4; p++) {
            particlesRef.current.push({
              x: px,
              y: py,
              vx: (Math.random() - 0.5) * 8,
              vy: (Math.random() - 0.5) * 8,
              color,
              size: 2 + Math.random() * 3,
              alpha: 1,
              decay: 0.03 + Math.random() * 0.03,
            });
          }
        }
      });

      // Sound & score
      tetrisAudio.playLineClear(completed.length);
      comboRef.current += 1;
      const { total } = calculateLineScore(
        completed.length,
        sectorRef.current.scoreMultiplier,
        comboRef.current - 1
      );
      scoreRef.current += total;

      // Stats
      if (completed.length === 1) statCountsRef.current.singles++;
      else if (completed.length === 2) statCountsRef.current.doubles++;
      else if (completed.length === 3) statCountsRef.current.triples++;
      else if (completed.length === 4) {
        statCountsRef.current.tetrises++;
        shakeIntensityRef.current = 7;
        shakeTimerRef.current = 200;
      }

      // Floating text
      const bannerText =
        completed.length === 4
          ? `TETRIS! +${total}`
          : completed.length === 3
          ? `TRIPLE! +${total}`
          : completed.length === 2
          ? `DOUBLE! +${total}`
          : `+${total}`;

      floatingTextsRef.current.push({
        x: BOARD_X + BOARD_W / 2,
        y: BOARD_Y + completed[0] * BLOCK_SIZE,
        text: bannerText,
        color: completed.length === 4 ? "#ffd700" : sectorRef.current.theme.primary,
        alpha: 1,
        scale: completed.length === 4 ? 1.5 : 1.2,
      });

      sectorLinesRef.current += completed.length;
      totalLinesRef.current += completed.length;

      // Sector clear check
      if (sectorLinesRef.current >= sectorRef.current.targetLines) {
        if (!isEndlessRef.current && currentSectorIndexRef.current === TOTAL_TETRIS_SECTORS - 1) {
          // Grand victory!
          modeRef.current = "VICTORY";
          tetrisAudio.playLevelUp();
          for (let i = 0; i < 70; i++) {
            particlesRef.current.push({
              x: GAME_W / 2 + (Math.random() - 0.5) * 200,
              y: GAME_H / 2 + (Math.random() - 0.5) * 100,
              vx: (Math.random() - 0.5) * 12,
              vy: (Math.random() - 0.5) * 12 - 3,
              color: ["#00f0ff", "#ff007f", "#00ff66", "#ffd700", "#ff0055"][Math.floor(Math.random() * 5)],
              size: 3 + Math.random() * 4,
              alpha: 1,
              decay: 0.015,
            });
          }
        } else {
          // Sector Clear transition
          modeRef.current = "LEVEL_CLEAR";
          tetrisAudio.playLevelUp();
        }
      }
    } else {
      comboRef.current = 0;
      spawnNewPiece();
    }
  }, [spawnNewPiece]);

  // Action handlers
  const handleMove = useCallback((dir: -1 | 1) => {
    if (modeRef.current !== "RUNNING" || clearingLinesRef.current !== null) return;
    const testX = activeXRef.current + dir;
    if (!checkCollision(activePieceRef.current, activeRotationRef.current, testX, activeYRef.current, boardRef.current)) {
      activeXRef.current = testX;
      tetrisAudio.playMove();
      if (lockTimerRef.current !== null && lockMovesCountRef.current < 15) {
        lockTimerRef.current = performance.now() + 450;
        lockMovesCountRef.current++;
      }
    }
  }, []);

  const handleRotate = useCallback((clockwise: boolean) => {
    if (modeRef.current !== "RUNNING" || clearingLinesRef.current !== null) return;
    const res = tryRotation(
      activePieceRef.current,
      activeRotationRef.current,
      clockwise,
      activeXRef.current,
      activeYRef.current,
      boardRef.current
    );
    if (res.success) {
      activeRotationRef.current = res.newRotation;
      activeXRef.current = res.newX;
      activeYRef.current = res.newY;
      tetrisAudio.playRotate();
      if (lockTimerRef.current !== null && lockMovesCountRef.current < 15) {
        lockTimerRef.current = performance.now() + 450;
        lockMovesCountRef.current++;
      }
    }
  }, []);

  const handleSoftDrop = useCallback(() => {
    if (modeRef.current !== "RUNNING" || clearingLinesRef.current !== null) return;
    const testY = activeYRef.current + 1;
    if (!checkCollision(activePieceRef.current, activeRotationRef.current, activeXRef.current, testY, boardRef.current)) {
      activeYRef.current = testY;
      scoreRef.current += 1;
      tetrisAudio.playSoftDrop();
      lastDropTimeRef.current = performance.now();
    } else if (lockTimerRef.current === null) {
      lockTimerRef.current = performance.now() + 450;
    }
  }, []);

  const handleHardDrop = useCallback(() => {
    if (modeRef.current !== "RUNNING" || clearingLinesRef.current !== null) return;
    const ghostY = computeGhostY(
      activePieceRef.current,
      activeRotationRef.current,
      activeXRef.current,
      activeYRef.current,
      boardRef.current
    );
    const dropDistance = ghostY - activeYRef.current;
    activeYRef.current = ghostY;
    scoreRef.current += dropDistance * 2;

    shakeIntensityRef.current = 4;
    shakeTimerRef.current = 100;
    tetrisAudio.playHardDrop();

    // Drop dust particles
    const color = TETROMINO_COLORS[activePieceRef.current].fill;
    for (let i = 0; i < 12; i++) {
      particlesRef.current.push({
        x: BOARD_X + activeXRef.current * BLOCK_SIZE + Math.random() * (BLOCK_SIZE * 3),
        y: BOARD_Y + (ghostY + 2) * BLOCK_SIZE,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 3,
        color,
        size: 2 + Math.random() * 2,
        alpha: 1,
        decay: 0.04,
      });
    }

    lockActivePiece();
  }, [lockActivePiece]);

  const handleHold = useCallback(() => {
    if (modeRef.current !== "RUNNING" || !canHoldRef.current || clearingLinesRef.current !== null) return;
    tetrisAudio.playHold();
    const current = activePieceRef.current;
    if (holdPieceRef.current === null) {
      holdPieceRef.current = current;
      spawnNewPiece();
    } else {
      const swapped = holdPieceRef.current;
      holdPieceRef.current = current;
      spawnNewPiece(swapped);
    }
    canHoldRef.current = false;
  }, [spawnNewPiece]);

  // Load high score
  useLayoutEffect(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val)) highScoreRef.current = val;
      }
    } catch {
      /* ignore */
    }
    ensureEmbeddedFont();
    initGame(0, false);
  }, [initGame]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        e.preventDefault();
        tetrisAudio.stopMusic();
        isMusicActiveRef.current = false;
        onExit();
        return;
      }

      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        isMusicActiveRef.current = tetrisAudio.toggleMusic();
        return;
      }

      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (modeRef.current === "RUNNING") {
          modeRef.current = "PAUSED";
          tetrisAudio.stopMusic();
        } else if (modeRef.current === "PAUSED") {
          modeRef.current = "RUNNING";
          lastDropTimeRef.current = performance.now();
          if (isMusicActiveRef.current) tetrisAudio.startMusic();
        } else if (modeRef.current === "READY") {
          modeRef.current = "RUNNING";
          initGame(0, false);
          lastDropTimeRef.current = performance.now();
        }
        return;
      }

      if (modeRef.current === "PAUSED") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          modeRef.current = "RUNNING";
          lastDropTimeRef.current = performance.now();
          if (isMusicActiveRef.current) tetrisAudio.startMusic();
          return;
        }
      }

      if (modeRef.current === "READY") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          modeRef.current = "RUNNING";
          initGame(0, false);
          lastDropTimeRef.current = performance.now();
          return;
        }
      }

      if (modeRef.current === "LEVEL_CLEAR") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          const nextIndex = currentSectorIndexRef.current + 1;
          initGame(nextIndex, isEndlessRef.current);
          modeRef.current = "RUNNING";
          return;
        }
      }

      if (modeRef.current === "VICTORY") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          // Enter Endless Overdrive
          initGame(TOTAL_TETRIS_SECTORS, true);
          modeRef.current = "RUNNING";
          return;
        }
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          initGame(0, false);
          modeRef.current = "RUNNING";
          return;
        }
      }

      if (modeRef.current === "GAME_OVER") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          initGame(0, false);
          modeRef.current = "RUNNING";
          return;
        }
      }

      if (modeRef.current !== "RUNNING") return;

      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (!keysDownRef.current["left"]) {
          keysDownRef.current["left"] = true;
          handleMove(-1);
          if (dasTimerRef.current !== null) window.clearTimeout(dasTimerRef.current);
          if (dasRepeatTimerRef.current !== null) window.clearInterval(dasRepeatTimerRef.current);
          dasTimerRef.current = window.setTimeout(() => {
            dasRepeatTimerRef.current = window.setInterval(() => {
              handleMove(-1);
            }, 45);
          }, 160);
        }
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        if (!keysDownRef.current["right"]) {
          keysDownRef.current["right"] = true;
          handleMove(1);
          if (dasTimerRef.current !== null) window.clearTimeout(dasTimerRef.current);
          if (dasRepeatTimerRef.current !== null) window.clearInterval(dasRepeatTimerRef.current);
          dasTimerRef.current = window.setTimeout(() => {
            dasRepeatTimerRef.current = window.setInterval(() => {
              handleMove(1);
            }, 45);
          }, 160);
        }
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === "x" || e.key === "X") {
        e.preventDefault();
        handleRotate(true);
      } else if (e.key === "z" || e.key === "Z" || e.key === "Control") {
        e.preventDefault();
        handleRotate(false);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        handleSoftDrop();
      } else if (e.key === " ") {
        e.preventDefault();
        handleHardDrop();
      } else if (e.key === "c" || e.key === "C" || e.key === "Shift") {
        e.preventDefault();
        handleHold();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysDownRef.current["left"] = false;
        if (dasTimerRef.current !== null) window.clearTimeout(dasTimerRef.current);
        if (dasRepeatTimerRef.current !== null) window.clearInterval(dasRepeatTimerRef.current);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysDownRef.current["right"] = false;
        if (dasTimerRef.current !== null) window.clearTimeout(dasTimerRef.current);
        if (dasRepeatTimerRef.current !== null) window.clearInterval(dasRepeatTimerRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (dasTimerRef.current !== null) window.clearTimeout(dasTimerRef.current);
      if (dasRepeatTimerRef.current !== null) window.clearInterval(dasRepeatTimerRef.current);
    };
  }, [handleHardDrop, handleHold, handleMove, handleRotate, handleSoftDrop, initGame, onExit]);

  // Main 60fps Game & Render Loop
  useEffect(() => {
    let animId = 0;
    let lastFrameTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const dt = Math.min(now - lastFrameTime, 100);
      lastFrameTime = now;

      // Smooth score interpolation
      if (displayedScoreRef.current < scoreRef.current) {
        displayedScoreRef.current = Math.min(
          scoreRef.current,
          displayedScoreRef.current + Math.ceil((scoreRef.current - displayedScoreRef.current) * 0.15) + 2
        );
      }

      // Screen shake decay
      if (shakeTimerRef.current > 0) {
        shakeTimerRef.current -= dt;
        if (shakeTimerRef.current <= 0) shakeIntensityRef.current = 0;
      }

      // Update particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Update floating texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 0.6;
        ft.alpha -= 0.016;
        if (ft.alpha <= 0) {
          floatingTextsRef.current.splice(i, 1);
        }
      }

      // Process Line Clear Flash
      if (clearingLinesRef.current !== null) {
        clearTimerRef.current -= dt;
        if (clearTimerRef.current <= 0) {
          boardRef.current = clearLinesFromBoard(boardRef.current, clearingLinesRef.current);
          clearingLinesRef.current = null;
          spawnNewPiece();
        }
      } else if (modeRef.current === "RUNNING") {
        // Natural gravity drop
        const stepMs = sectorRef.current.stepMs;
        if (now - lastDropTimeRef.current >= stepMs) {
          lastDropTimeRef.current = now;
          const testY = activeYRef.current + 1;
          if (!checkCollision(activePieceRef.current, activeRotationRef.current, activeXRef.current, testY, boardRef.current)) {
            activeYRef.current = testY;
            lockTimerRef.current = null;
          } else {
            // Reached ground or obstacle: trigger lock delay
            if (lockTimerRef.current === null) {
              lockTimerRef.current = now + 450;
            }
          }
        }

        // Lock delay check
        if (lockTimerRef.current !== null && now >= lockTimerRef.current) {
          lockActivePiece();
        }
      }

      // --- RENDER PASS ---
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.max(Math.min(window.devicePixelRatio || 1, 3), 2);
      const displayW = canvas.clientWidth || GAME_W;
      const displayH = canvas.clientHeight || GAME_H;
      const targetW = Math.round(displayW * dpr);
      const targetH = Math.round(displayH * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      const contentW = 804;
      const contentH = 568;
      const fitScale = Math.min(displayW / contentW, displayH / contentH);
      const offsetX = (displayW - GAME_W * fitScale) / 2;
      const offsetY = (displayH - GAME_H * fitScale) / 2;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#0c0d18";
      ctx.fillRect(0, 0, displayW, displayH);
      ctx.translate(offsetX, offsetY);
      ctx.scale(fitScale, fitScale);

      // Apply screen shake
      if (shakeIntensityRef.current > 0) {
        const shakeX = (Math.random() - 0.5) * shakeIntensityRef.current;
        const shakeY = (Math.random() - 0.5) * shakeIntensityRef.current;
        ctx.translate(shakeX, shakeY);
      }

      // Background
      const theme = sectorRef.current.theme;
      ctx.fillStyle = "#0c0d18";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Subtle ambient cyber grid pattern
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      for (let x = 0; x < GAME_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GAME_H);
        ctx.stroke();
      }
      for (let y = 0; y < GAME_H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(GAME_W, y);
        ctx.stroke();
      }

      // Draw helper: Beveled Block
      const drawBlock = (
        bx: number,
        by: number,
        colorData: { fill: string; border: string; glow: string },
        alpha = 1,
        isGhost = false
      ) => {
        ctx.save();
        ctx.globalAlpha = alpha;
        if (isGhost) {
          ctx.strokeStyle = colorData.border;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bx + 1, by + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
          ctx.fillStyle = colorData.glow;
          ctx.fillRect(bx + 2, by + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
        } else {
          // Main block body
          ctx.fillStyle = colorData.fill;
          ctx.fillRect(bx + 1, by + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);

          // Top/Left highlight bevel
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.beginPath();
          ctx.moveTo(bx + 1, by + 1);
          ctx.lineTo(bx + BLOCK_SIZE - 1, by + 1);
          ctx.lineTo(bx + BLOCK_SIZE - 4, by + 4);
          ctx.lineTo(bx + 4, by + 4);
          ctx.lineTo(bx + 4, by + BLOCK_SIZE - 4);
          ctx.lineTo(bx + 1, by + BLOCK_SIZE - 1);
          ctx.closePath();
          ctx.fill();

          // Bottom/Right shadow bevel
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.beginPath();
          ctx.moveTo(bx + BLOCK_SIZE - 1, by + 1);
          ctx.lineTo(bx + BLOCK_SIZE - 1, by + BLOCK_SIZE - 1);
          ctx.lineTo(bx + 1, by + BLOCK_SIZE - 1);
          ctx.lineTo(bx + 4, by + BLOCK_SIZE - 4);
          ctx.lineTo(bx + BLOCK_SIZE - 4, by + BLOCK_SIZE - 4);
          ctx.lineTo(bx + BLOCK_SIZE - 4, by + 4);
          ctx.closePath();
          ctx.fill();

          // Outer glowing border
          ctx.strokeStyle = colorData.border;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx + 0.5, by + 0.5, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
        }
        ctx.restore();
      };

      // --- CENTER MATRIX BOARD ---
      // Matrix Background with Glow
      ctx.fillStyle = "rgba(10, 12, 22, 0.94)";
      ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);

      // Inner Matrix Grid
      ctx.strokeStyle = theme.gridLine;
      ctx.lineWidth = 1;
      for (let c = 1; c < BOARD_COLS; c++) {
        const gx = BOARD_X + c * BLOCK_SIZE;
        ctx.beginPath();
        ctx.moveTo(gx, BOARD_Y);
        ctx.lineTo(gx, BOARD_Y + BOARD_H);
        ctx.stroke();
      }
      for (let r = 1; r < BOARD_ROWS; r++) {
        const gy = BOARD_Y + r * BLOCK_SIZE;
        ctx.beginPath();
        ctx.moveTo(BOARD_X, gy);
        ctx.lineTo(BOARD_X + BOARD_W, gy);
        ctx.stroke();
      }

      // Settled Blocks
      for (let r = 0; r < BOARD_ROWS; r++) {
        const isClearing = clearingLinesRef.current?.includes(r);
        for (let c = 0; c < BOARD_COLS; c++) {
          const type = boardRef.current[r][c];
          if (type) {
            const bx = BOARD_X + c * BLOCK_SIZE;
            const by = BOARD_Y + r * BLOCK_SIZE;
            if (isClearing) {
              // Laser flash highlight
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = theme.primary;
              ctx.shadowBlur = 10;
              ctx.fillRect(bx, by, BLOCK_SIZE, BLOCK_SIZE);
              ctx.shadowBlur = 0;
            } else {
              drawBlock(bx, by, TETROMINO_COLORS[type]);
            }
          }
        }
      }

      // Ghost Piece
      if (modeRef.current === "RUNNING" && clearingLinesRef.current === null) {
        const ghostY = computeGhostY(
          activePieceRef.current,
          activeRotationRef.current,
          activeXRef.current,
          activeYRef.current,
          boardRef.current
        );
        const shape = TETROMINO_SHAPES[activePieceRef.current][activeRotationRef.current];
        shape.forEach(([dx, dy]) => {
          const gy = ghostY + dy;
          const gx = activeXRef.current + dx;
          if (gy >= 0 && gy < BOARD_ROWS) {
            drawBlock(
              BOARD_X + gx * BLOCK_SIZE,
              BOARD_Y + gy * BLOCK_SIZE,
              TETROMINO_COLORS[activePieceRef.current],
              0.4,
              true
            );
          }
        });

        // Active Falling Piece
        shape.forEach(([dx, dy]) => {
          const ay = activeYRef.current + dy;
          const ax = activeXRef.current + dx;
          if (ay >= 0 && ay < BOARD_ROWS) {
            drawBlock(
              BOARD_X + ax * BLOCK_SIZE,
              BOARD_Y + ay * BLOCK_SIZE,
              TETROMINO_COLORS[activePieceRef.current]
            );
          }
        });
      }

      // Matrix Board Border & Cyber Notches
      ctx.strokeStyle = theme.boardBorder;
      ctx.lineWidth = 2;
      ctx.strokeRect(BOARD_X - 1, BOARD_Y - 1, BOARD_W + 2, BOARD_H + 2);

      // Cyber corners
      const cornerSize = 10;
      ctx.strokeStyle = theme.primary;
      ctx.lineWidth = 3;
      // Top-Left
      ctx.beginPath();
      ctx.moveTo(BOARD_X - 3, BOARD_Y + cornerSize);
      ctx.lineTo(BOARD_X - 3, BOARD_Y - 3);
      ctx.lineTo(BOARD_X + cornerSize, BOARD_Y - 3);
      ctx.stroke();
      // Top-Right
      ctx.beginPath();
      ctx.moveTo(BOARD_X + BOARD_W + 3 - cornerSize, BOARD_Y - 3);
      ctx.lineTo(BOARD_X + BOARD_W + 3, BOARD_Y - 3);
      ctx.lineTo(BOARD_X + BOARD_W + 3, BOARD_Y + cornerSize);
      ctx.stroke();
      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(BOARD_X - 3, BOARD_Y + BOARD_H - cornerSize);
      ctx.lineTo(BOARD_X - 3, BOARD_Y + BOARD_H + 3);
      ctx.lineTo(BOARD_X + cornerSize, BOARD_Y + BOARD_H + 3);
      ctx.stroke();
      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(BOARD_X + BOARD_W + 3 - cornerSize, BOARD_Y + BOARD_H + 3);
      ctx.lineTo(BOARD_X + BOARD_W + 3, BOARD_Y + BOARD_H + 3);
      ctx.lineTo(BOARD_X + BOARD_W + 3, BOARD_Y + BOARD_H - cornerSize);
      ctx.stroke();

      // --- LEFT PANEL: HOLD & STATS & SCORE ---
      const drawPanel = (px: number, py: number, pw: number, ph: number, title: string) => {
        ctx.fillStyle = "rgba(12, 15, 26, 0.9)";
        ctx.fillRect(px, py, pw, ph);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, pw, ph);

        // Header tab
        ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        ctx.fillRect(px, py, pw, 24);
        ctx.fillStyle = theme.primary;
        ctx.font = `600 11px "${EMBEDDED_FAMILY}", monospace`;
        ctx.textAlign = "left";
        ctx.fillText(title, px + 10, py + 16);
      };

      // 1. Hold Box
      drawPanel(50, 40, 220, 110, "HOLD [C / SHIFT]");
      if (holdPieceRef.current) {
        const type = holdPieceRef.current;
        const shape = TETROMINO_SHAPES[type][0];
        const previewBlockSize = 20;
        const pColor = TETROMINO_COLORS[type];
        // Center shape inside hold box
        const minX = Math.min(...shape.map(([x]) => x));
        const maxX = Math.max(...shape.map(([x]) => x));
        const minY = Math.min(...shape.map(([, y]) => y));
        const maxY = Math.max(...shape.map(([, y]) => y));
        const shapeW = (maxX - minX + 1) * previewBlockSize;
        const shapeH = (maxY - minY + 1) * previewBlockSize;
        const startX = 50 + (220 - shapeW) / 2 - minX * previewBlockSize;
        const startY = 40 + 24 + (86 - shapeH) / 2 - minY * previewBlockSize;

        shape.forEach(([dx, dy]) => {
          ctx.save();
          ctx.globalAlpha = canHoldRef.current ? 1 : 0.45;
          ctx.fillStyle = pColor.fill;
          ctx.fillRect(startX + dx * previewBlockSize, startY + dy * previewBlockSize, previewBlockSize - 1, previewBlockSize - 1);
          ctx.strokeStyle = pColor.border;
          ctx.strokeRect(startX + dx * previewBlockSize, startY + dy * previewBlockSize, previewBlockSize - 1, previewBlockSize - 1);
          ctx.restore();
        });
      }

      // 2. Sector / Level Box
      drawPanel(50, 170, 220, 150, "SECTOR PROTOCOL");
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 13px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText(sectorRef.current.name, 62, 216);

      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = `11px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText(`SECTOR: ${isEndlessRef.current ? `ENDLESS ${sectorRef.current.sectorNumber}` : `${sectorRef.current.sectorNumber} / ${TOTAL_TETRIS_SECTORS}`}`, 62, 240);
      ctx.fillText(`GOAL LINES: ${Math.max(0, sectorRef.current.targetLines - sectorLinesRef.current)}`, 62, 260);
      ctx.fillText(`TOTAL LINES: ${totalLinesRef.current}`, 62, 280);
      ctx.fillText(`MULTIPLIER: ${sectorRef.current.scoreMultiplier.toFixed(1)}x`, 62, 300);

      // 3. Score Box
      drawPanel(50, 340, 220, 140, "SCORE DATA");
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = `10px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText("HIGH SCORE", 62, 380);

      ctx.fillStyle = "#ffd700";
      ctx.font = `700 18px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText(highScoreRef.current.toLocaleString(), 62, 404);

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.font = `10px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText("CURRENT SCORE", 62, 432);

      ctx.fillStyle = theme.primary;
      ctx.font = `700 22px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText(displayedScoreRef.current.toLocaleString(), 62, 460);

      // Sound/Music indicator button
      ctx.fillStyle = isMusicActiveRef.current ? "rgba(0, 255, 102, 0.15)" : "rgba(255, 255, 255, 0.05)";
      ctx.strokeStyle = isMusicActiveRef.current ? "#00ff66" : "rgba(255, 255, 255, 0.2)";
      ctx.strokeRect(50, 500, 220, 32);
      ctx.fillRect(50, 500, 220, 32);
      ctx.fillStyle = isMusicActiveRef.current ? "#00ff66" : "rgba(255, 255, 255, 0.7)";
      ctx.font = `11px "${EMBEDDED_FAMILY}", monospace`;
      ctx.textAlign = "center";
      ctx.fillText(isMusicActiveRef.current ? "♫ 8-BIT MUSIC: ON [M]" : "♫ 8-BIT MUSIC: OFF [M]", 160, 520);

      // --- RIGHT PANEL: NEXT QUEUE & STATS & CONTROLS ---
      // 1. Next Queue
      drawPanel(610, 40, 220, 210, "NEXT MATRIX");
      const previewPieces = nextQueueRef.current.slice(0, 3);
      previewPieces.forEach((type, pIdx) => {
        const shape = TETROMINO_SHAPES[type][0];
        const previewBlockSize = 16;
        const pColor = TETROMINO_COLORS[type];
        const minX = Math.min(...shape.map(([x]) => x));
        const maxX = Math.max(...shape.map(([x]) => x));
        const minY = Math.min(...shape.map(([, y]) => y));
        const maxY = Math.max(...shape.map(([, y]) => y));
        const shapeW = (maxX - minX + 1) * previewBlockSize;
        const shapeH = (maxY - minY + 1) * previewBlockSize;
        const startX = 610 + (220 - shapeW) / 2 - minX * previewBlockSize;
        const startY = 40 + 30 + pIdx * 56 + (48 - shapeH) / 2 - minY * previewBlockSize;

        shape.forEach(([dx, dy]) => {
          ctx.fillStyle = pColor.fill;
          ctx.fillRect(startX + dx * previewBlockSize, startY + dy * previewBlockSize, previewBlockSize - 1, previewBlockSize - 1);
          ctx.strokeStyle = pColor.border;
          ctx.strokeRect(startX + dx * previewBlockSize, startY + dy * previewBlockSize, previewBlockSize - 1, previewBlockSize - 1);
        });
      });

      // 2. Line Clear Breakdown Stats
      drawPanel(610, 270, 220, 120, "CLEARS STATS");
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.font = `11px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText(`SINGLES:  ${statCountsRef.current.singles}`, 622, 310);
      ctx.fillText(`DOUBLES:  ${statCountsRef.current.doubles}`, 622, 330);
      ctx.fillText(`TRIPLES:  ${statCountsRef.current.triples}`, 622, 350);
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`TETRIS:   ${statCountsRef.current.tetrises}`, 622, 370);

      // 3. Controls Guide
      drawPanel(610, 410, 220, 150, "CONTROLS GUIDE");
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = `10px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillText("◄/► or A/D : MOVE", 622, 444);
      ctx.fillText("▲ / W / X  : ROTATE CW", 622, 462);
      ctx.fillText("Z / CTRL   : ROTATE CCW", 622, 480);
      ctx.fillText("▼ or S     : SOFT DROP", 622, 498);
      ctx.fillText("SPACE      : HARD DROP", 622, 516);
      ctx.fillText("C / SHIFT  : HOLD PIECE", 622, 534);

      // --- PARTICLES & FLOATING TEXTS ---
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.restore();
      });

      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.shadowColor = ft.color;
        ctx.shadowBlur = 8;
        ctx.font = `700 ${Math.round(14 * ft.scale)}px "${EMBEDDED_FAMILY}", monospace`;
        ctx.textAlign = "center";
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // --- OVERLAY STATES ---
      if (modeRef.current === "READY") {
        ctx.fillStyle = "rgba(6, 8, 16, 0.85)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.textAlign = "center";
        ctx.fillStyle = theme.primary;
        ctx.shadowColor = theme.primary;
        ctx.shadowBlur = 12;
        ctx.font = `700 32px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("CYBER TETRIS", GAME_W / 2, GAME_H / 2 - 40);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = `14px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText(`SECTOR 1: ${sectorRef.current.name}`, GAME_W / 2, GAME_H / 2);

        ctx.fillStyle = "#ffd700";
        ctx.font = `600 13px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PRESS SPACE OR ENTER TO LAUNCH", GAME_W / 2, GAME_H / 2 + 50);
      } else if (modeRef.current === "PAUSED") {
        ctx.fillStyle = "rgba(6, 8, 16, 0.75)";
        ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd700";
        ctx.font = `700 24px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PAUSED", BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2 - 10);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PRESS P TO RESUME", BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2 + 20);
      } else if (modeRef.current === "LEVEL_CLEAR") {
        ctx.fillStyle = "rgba(6, 8, 16, 0.85)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.textAlign = "center";
        ctx.fillStyle = "#00ff66";
        ctx.shadowColor = "#00ff66";
        ctx.shadowBlur = 12;
        ctx.font = `700 28px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("SECTOR COMPLETED!", GAME_W / 2, GAME_H / 2 - 40);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = `14px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText(`LINES CLEARED: ${sectorLinesRef.current} · SCORE: ${scoreRef.current}`, GAME_W / 2, GAME_H / 2 - 6);

        ctx.fillStyle = theme.primary;
        ctx.font = `600 13px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PRESS SPACE TO ENTER NEXT SECTOR", GAME_W / 2, GAME_H / 2 + 40);
      } else if (modeRef.current === "VICTORY") {
        ctx.fillStyle = "rgba(6, 8, 16, 0.9)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ffd700";
        ctx.shadowColor = "#ffd700";
        ctx.shadowBlur = 15;
        ctx.font = `700 32px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("SYSTEM OVERDRIVE // VICTORY!", GAME_W / 2, GAME_H / 2 - 70);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = `15px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText(`FINAL CAMPAIGN SCORE: ${scoreRef.current.toLocaleString()}`, GAME_W / 2, GAME_H / 2 - 25);
        ctx.fillText(`TOTAL LINES: ${totalLinesRef.current} · TETRISES: ${statCountsRef.current.tetrises}`, GAME_W / 2, GAME_H / 2);

        ctx.fillStyle = "#00ff66";
        ctx.font = `700 13px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PRESS SPACE TO UNLOCK ENDLESS OVERDRIVE MODE", GAME_W / 2, GAME_H / 2 + 46);

        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = `11px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PRESS R TO RESTART CAMPAIGN FROM SECTOR 1", GAME_W / 2, GAME_H / 2 + 76);
      } else if (modeRef.current === "GAME_OVER") {
        ctx.fillStyle = "rgba(20, 6, 12, 0.88)";
        ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, BOARD_H);

        ctx.textAlign = "center";
        ctx.fillStyle = "#ff0055";
        ctx.shadowColor = "#ff0055";
        ctx.shadowBlur = 12;
        ctx.font = `700 24px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("MATRIX CRITICAL", BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2 - 30);
        ctx.fillText("GAME OVER", BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2);

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText(`SCORE: ${scoreRef.current}`, BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2 + 30);

        ctx.fillStyle = "#ffd700";
        ctx.font = `600 11px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText("PRESS SPACE TO RESTART", BOARD_X + BOARD_W / 2, BOARD_Y + BOARD_H / 2 + 60);
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [lockActivePiece, spawnNewPiece]);

  // Click handler on canvas for state transitions or music button
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const contentW = 804;
    const contentH = 568;
    const fitScale = Math.min(rect.width / contentW, rect.height / contentH) || 1;
    const offsetX = (rect.width - GAME_W * fitScale) / 2;
    const offsetY = (rect.height - GAME_H * fitScale) / 2;
    const clickX = (e.clientX - rect.left - offsetX) / fitScale;
    const clickY = (e.clientY - rect.top - offsetY) / fitScale;

    // Check Music Toggle Button (x: 50..270, y: 500..532)
    if (clickX >= 50 && clickX <= 270 && clickY >= 500 && clickY <= 532) {
      isMusicActiveRef.current = tetrisAudio.toggleMusic();
      return;
    }

    if (modeRef.current === "PAUSED") {
      modeRef.current = "RUNNING";
      lastDropTimeRef.current = performance.now();
      if (isMusicActiveRef.current) tetrisAudio.startMusic();
    } else if (modeRef.current === "READY") {
      modeRef.current = "RUNNING";
      initGame(0, false);
      lastDropTimeRef.current = performance.now();
    } else if (modeRef.current === "LEVEL_CLEAR") {
      const nextIndex = currentSectorIndexRef.current + 1;
      initGame(nextIndex, isEndlessRef.current);
      modeRef.current = "RUNNING";
    } else if (modeRef.current === "VICTORY") {
      initGame(TOTAL_TETRIS_SECTORS, true);
      modeRef.current = "RUNNING";
    } else if (modeRef.current === "GAME_OVER") {
      initGame(0, false);
      modeRef.current = "RUNNING";
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "#0c0d18" }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "pointer",
        }}
      />
    </div>
  );
}
