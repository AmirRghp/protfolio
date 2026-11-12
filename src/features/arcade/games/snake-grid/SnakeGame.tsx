import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  CELL_SIZE,
  GAME_H,
  GAME_W,
  GRID_COLS,
  GRID_ROWS,
  HUD_ROWS,
  TOTAL_SNAKE_LEVELS,
  SNAKE_LEVELS,
  SNAKE_PALETTE,
  buildWallsForLevel,
  getSafeSpawnPosition,
  isInSnake,
  isWall,
  handleSnakeKeyEvent,
  bindSnakeWindowListeners,
  type Point,
  type SnakeLevelConfig,
} from "./snakeLevels";

const EMBEDDED_FAMILY = "Departure Mono Subset";
const EMBEDDED_FONT_B64 =
  "d09GMk9UVE8AAATgAAsAAAAAC0wAAASYAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAADY4OGyAcKgZgAFwBNgIkA1gEBgWDHAcgG4cKUVRNohBfHNjgDj0qKzWKGdvBNGJwXv34ZAfh+x68ScExtv1HxLVDKZ40NIhEl1Isutyitc0LkqASNxS0Ummm2ebfdw+xRo6UBPHfrn1/kgCzKEowizSBYzitlmi7/3M9dg9Nd8aAGIEuQgyoaW0AmdtpTKkEJ6yihcpEKaDRKRvZU5CDHOQi3++vqf3tiN3mispMLZOquffvmn+FKwGoMbo5IjfX+GYKQU7OGBKGrJn1W9RtapBavPBBZVIFho7/vzDgceXU1Nq/YEQlXjjt0w2f7vz0EJ/OatKcBeZy2Vx5Oj+hEz0xAT58xWjih4/nz7XhI8lqyX3Utqq2gQyNgzOjo2MiE5ZhFKmqyXZ9Q59YzIJ6kNbkoDETrIz18k+BCL4DNh1WYAFuYA2WEFYgQYrU5GvJqiM80ZSeTOEgx7jILV4LYoly8fVw7mHu5dyX+dX5zfmD+af5r/O/v8SyX27Lh6LfedgeToe74XF4M3wefrZGrXsUwlBDmKzMDrIGIB2n4WUbf73+50kaIWhSsNpiKCpED2Zt1KHNWfUKsulYkMSt1qNWR0GqXBIUlZ8oTnKchdyU0WNS/LQsQRGooWbAoLVhG4w82trmZ/SAYmhJhxxbshOonJDoNfbWn9eB6q2ZAEQVk86yXElEYayR4eJMu+LRSOQSM92xEwugotRY2VB8tHY8koWA6MAmxBlkJ0eG9WgUikbMCpL9iSTWtZgo76EkmJsbzu4Au6PAMRAco9FkXIpejHKF3h2A9FGXMTA568/Jhg7iwFZYvaBrFiFQbEbAsDqYAkwQa3QMN6aGZcTRhsgSyxSPhibYxPQCjn6sZ2JBF310pBTcbbs0UBx4wggJ6RUsZQ3WKTalSRhFXwUCGLVVqFhjyANHg5UxWVmSEIYHPTAatQGkxg0ZaSNvtINHDwh09uzhlEBNXze2Xjig0cpjCIGGjJjhjGCV0HSpckBxRrrGKnQfsDVp6TitkVxrnOoq3/KADl3KGr492I6VzQF7HAvl0J6Oa5bc4VqNQRu5tDW2Kgbw54bbwZ0pnYyiG3WoejRXMQv2jm6K3fsRcoMaRu/dAlazMriacEUa5sKEOMoJmUclh37rwcuyLBxzupJsveDaxqf/KyYXK0snK8s6FfYgwJQ7TzyFkw3qFABa46GziAMFE8drvJ67opWRh9NVOjkLA8YZZimAYFCwD09zKQEm+r50p4a7n+EHb60VqEdBLMxl6+HmrN+bhAVAsT2J11WKAeaMCYq3KClStbIW9RYuOgLlVNGXgL7V93pXJObJDxIqUEjCV/FDxn9h3dVMfzOWIhAAbmZr46Bfj6bzdBkRgmCmZZ0eAFbxPITRvMFfiN2tc/pnEjvHUQ1h7FRvFWAzAZANQSm5y5YKltqlUrZMqoRbkRrI9X+AodA4I49xPq5SscSdaPnRxml3vH48b8WoQOpAtEocqNgIOQdXdw9XJCoYZVYo9lBk+V19kRJEi5amwdjezBAFM83SbsdPbDaZrTsE7DdplplCnhRli344SSdLRHHwRmKCXcHiSHy7WCGs6QOPQJ/CU38E";

let embeddedFontPromise: Promise<void> | null = null;
function ensureEmbeddedFont(fontFamily?: string, fontUrl?: string): Promise<void> {
  if (embeddedFontPromise) return embeddedFontPromise;
  if (typeof document === "undefined" || !(document as unknown as { fonts?: unknown }).fonts) {
    embeddedFontPromise = Promise.resolve();
    return embeddedFontPromise;
  }
  embeddedFontPromise = (async () => {
    try {
      const family = fontFamily || EMBEDDED_FAMILY;
      const src = fontUrl ? `url(${fontUrl})` : `url(data:font/woff2;base64,${EMBEDDED_FONT_B64}) format("woff2")`;
      const face = new (window as unknown as { FontFace: new (family: string, source: string) => { load: () => Promise<unknown> } }).FontFace(
        family,
        src
      );
      const loaded = await face.load();
      (document as unknown as { fonts: { add: (f: unknown) => void } }).fonts.add(loaded);
    } catch {
      /* fallback to monospace */
    }
  })();
  return embeddedFontPromise;
}

export type GameMode = "READY" | "RUNNING" | "PAUSED" | "LEVEL_CLEAR" | "VICTORY" | "GAME_OVER";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
};

export type BonusFood = {
  pos: Point;
  expiresAt: number;
  duration: number;
};

export type SnakeGameState = {
  levelIndex: number;
  score: number;
  highScore: number;
  foodsEatenInLevel: number;
  mode: GameMode;
  snake: Point[];
  dir: Point;
  inputQueue: Point[];
  walls: Point[];
  food: { pos: Point; color: string };
  bonusFood: BonusFood | null;
  nextBonusSpawnTime: number;
  particles: Particle[];
  gameOverReason: string;
  lastTick: number;
};

export interface SnakeGameProps {
  onExit?: () => void;
  fontFamily?: string;
  fontUrl?: string;
  style?: React.CSSProperties;
}

const STORAGE_KEY = "snake_high_score";

function loadHighScore(): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function saveHighScore(score: number): void {
  if (typeof window === "undefined") return;
  try {
    const cur = loadHighScore();
    if (score > cur) {
      window.localStorage.setItem(STORAGE_KEY, String(score));
    }
  } catch {
    /* ignore storage errors */
  }
}

export default function SnakeGame(props: SnakeGameProps) {
  const {
    onExit,
    fontFamily = '"Departure Mono", "Departure Mono Subset", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontUrl = "",
    style,
  } = props;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<SnakeGameState | null>(null);
  const layoutRef = useRef({ cw: GAME_W, ch: GAME_H, ox: 0, oy: 0, s: 1 });
  const optsRef = useRef({ onExit, fontFamily, fontUrl });

  useLayoutEffect(() => {
    optsRef.current = { onExit, fontFamily, fontUrl };
  }, [onExit, fontFamily, fontUrl]);

  const createFood = useCallback((snake: Point[], walls: Point[], bonusPos?: Point): { pos: Point; color: string } => {
    const occupied = bonusPos ? [bonusPos] : [];
    const pos = getSafeSpawnPosition(snake, walls, occupied);
    const hues = SNAKE_PALETTE.foodHues;
    const color = hues[Math.floor(Math.random() * hues.length)];
    return { pos, color };
  }, []);

  const spawnBonusFood = useCallback((g: SnakeGameState, config: SnakeLevelConfig, now: number) => {
    if (!config.hasBonusFood) return;
    const pos = getSafeSpawnPosition(g.snake, g.walls, [g.food.pos]);
    g.bonusFood = {
      pos,
      expiresAt: now + config.bonusFoodDurationMs,
      duration: config.bonusFoodDurationMs,
    };
  }, []);

  const spawnParticles = useCallback((x: number, y: number, color: string, count = 25) => {
    const g = gameRef.current;
    if (!g) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      g.particles.push({
        x: x * CELL_SIZE + CELL_SIZE / 2,
        y: y * CELL_SIZE + CELL_SIZE / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        alpha: 1,
      });
    }
  }, []);

  const initLevel = useCallback(
    (g: SnakeGameState, levelIdx: number) => {
      const safeIdx = Math.max(0, Math.min(levelIdx, TOTAL_SNAKE_LEVELS - 1));
      const config = SNAKE_LEVELS[safeIdx];
      g.levelIndex = safeIdx;
      g.foodsEatenInLevel = 0;
      g.walls = buildWallsForLevel(safeIdx);

      // Snake initial body: head + 3 tail segments
      const head = { ...config.startPos };
      const dir = { ...config.startDir };
      g.dir = dir;
      g.inputQueue = [];
      g.snake = [
        head,
        { x: head.x - dir.x, y: head.y - dir.y },
        { x: head.x - dir.x * 2, y: head.y - dir.y * 2 },
        { x: head.x - dir.x * 3, y: head.y - dir.y * 3 },
      ];

      g.food = createFood(g.snake, g.walls);
      g.bonusFood = null;
      g.nextBonusSpawnTime = performance.now() + 6000 + Math.random() * 4000;
      g.mode = "READY";
      g.lastTick = performance.now();
    },
    [createFood]
  );

  const restartFromLevelOne = useCallback(
    (g: SnakeGameState) => {
      g.score = 0;
      g.highScore = loadHighScore();
      initLevel(g, 0);
    },
    [initLevel]
  );

  const ensureGame = useCallback((): SnakeGameState => {
    if (!gameRef.current) {
      const initialHighScore = loadHighScore();
      const g: SnakeGameState = {
        levelIndex: 0,
        score: 0,
        highScore: initialHighScore,
        foodsEatenInLevel: 0,
        mode: "READY",
        snake: [],
        dir: { x: 1, y: 0 },
        inputQueue: [],
        walls: [],
        food: { pos: { x: 25, y: 15 }, color: SNAKE_PALETTE.foodHues[0] },
        bonusFood: null,
        nextBonusSpawnTime: 0,
        particles: [],
        gameOverReason: "",
        lastTick: 0,
      };
      initLevel(g, 0);
      gameRef.current = g;
    }
    return gameRef.current;
  }, [initLevel]);

  // Primary Action handler (Space or Click): progresses through game phases
  const handlePrimaryAction = useCallback(() => {
    const g = ensureGame();
    if (g.mode === "PAUSED") {
      g.mode = "RUNNING";
      g.lastTick = performance.now();
    } else if (g.mode === "READY") {
      g.mode = "RUNNING";
      g.lastTick = performance.now();
    } else if (g.mode === "LEVEL_CLEAR") {
      if (g.levelIndex < TOTAL_SNAKE_LEVELS - 1) {
        initLevel(g, g.levelIndex + 1);
      } else {
        restartFromLevelOne(g);
      }
    } else if (g.mode === "VICTORY" || g.mode === "GAME_OVER") {
      restartFromLevelOne(g);
    }
  }, [ensureGame, initLevel, restartFromLevelOne]);

  // Game Logic Tick
  const updateGameTick = useCallback(
    (g: SnakeGameState, now: number) => {
      if (g.mode !== "RUNNING") return;

      const currentConfig = SNAKE_LEVELS[g.levelIndex] ?? SNAKE_LEVELS[0];

      // Process input queue for non-reversing direction
      while (g.inputQueue.length > 0) {
        const nextDir = g.inputQueue.shift()!;
        if (nextDir.x !== -g.dir.x && nextDir.y !== -g.dir.y) {
          g.dir = nextDir;
          break;
        }
      }

      const head = g.snake[0];
      const nextHead: Point = {
        x: head.x + g.dir.x,
        y: head.y + g.dir.y,
      };

      // 1. Wall Collision Check (Immediate Game Over, Sudden Death)
      if (isWall(nextHead, g.walls)) {
        g.mode = "GAME_OVER";
        g.gameOverReason = "CRASHED INTO WALL";
        saveHighScore(g.score);
        g.highScore = Math.max(g.highScore, g.score);
        spawnParticles(head.x, head.y, SNAKE_PALETTE.wallPrimary, 30);
        return;
      }

      // 2. Self Collision Check (Tail will move unless eating food, but check all except tail end)
      // If nextHead is within body (ignoring last tail element if not eating), death!
      const isEatingRegular = nextHead.x === g.food.pos.x && nextHead.y === g.food.pos.y;
      const bodyToCheck = isEatingRegular ? g.snake : g.snake.slice(0, -1);
      if (isInSnake(nextHead, bodyToCheck)) {
        g.mode = "GAME_OVER";
        g.gameOverReason = "SELF-COLLISION";
        saveHighScore(g.score);
        g.highScore = Math.max(g.highScore, g.score);
        spawnParticles(head.x, head.y, SNAKE_PALETTE.snakeHead, 30);
        return;
      }

      // Move Snake forward
      g.snake.unshift(nextHead);

      // Check Bonus Food collision
      if (g.bonusFood && nextHead.x === g.bonusFood.pos.x && nextHead.y === g.bonusFood.pos.y) {
        g.score += currentConfig.bonusFoodPoints;
        spawnParticles(nextHead.x, nextHead.y, SNAKE_PALETTE.goldenApple, 35);
        g.bonusFood = null;
        g.nextBonusSpawnTime = now + 12000 + Math.random() * 6000;
      }

      // Check Regular Food collision
      if (isEatingRegular) {
        g.score += 100;
        g.foodsEatenInLevel += 1;
        spawnParticles(nextHead.x, nextHead.y, g.food.color, 25);

        // Check Level Clearance
        if (g.foodsEatenInLevel >= currentConfig.foodTarget) {
          g.score += currentConfig.bonusPoints;
          if (g.levelIndex >= TOTAL_SNAKE_LEVELS - 1) {
            g.mode = "VICTORY";
            saveHighScore(g.score);
            g.highScore = Math.max(g.highScore, g.score);
          } else {
            g.mode = "LEVEL_CLEAR";
          }
          return;
        }

        // Spawn next food
        g.food = createFood(g.snake, g.walls, g.bonusFood ? g.bonusFood.pos : undefined);
      } else {
        // Did not eat regular food, trim tail
        g.snake.pop();
      }

      // Bonus food spawning and expiration
      if (currentConfig.hasBonusFood) {
        if (!g.bonusFood && now >= g.nextBonusSpawnTime) {
          spawnBonusFood(g, currentConfig, now);
        } else if (g.bonusFood && now > g.bonusFood.expiresAt) {
          spawnParticles(g.bonusFood.pos.x, g.bonusFood.pos.y, "#888888", 12);
          g.bonusFood = null;
          g.nextBonusSpawnTime = now + 12000 + Math.random() * 6000;
        }
      }
    },
    [createFood, spawnBonusFood, spawnParticles]
  );

  // Frame draw loop
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const g = ensureGame();
    const { cw, ch, ox, oy, s } = layoutRef.current;
    const dpr = canvas.width / Math.max(1, cw);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Dark cyber background
    ctx.fillStyle = SNAKE_PALETTE.bg;
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.rect(0, 0, GAME_W, GAME_H);
    ctx.clip();

    const ff = optsRef.current.fontFamily || `"${EMBEDDED_FAMILY}", ui-monospace, monospace`;
    const curLevel = SNAKE_LEVELS[g.levelIndex] ?? SNAKE_LEVELS[0];

    // 1. Draw Arena Grid lines
    ctx.strokeStyle = SNAKE_PALETTE.grid;
    ctx.lineWidth = 1;
    for (let c = 1; c < GRID_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, HUD_ROWS * CELL_SIZE);
      ctx.lineTo(c * CELL_SIZE, GAME_H);
      ctx.stroke();
    }
    for (let r = HUD_ROWS + 1; r < GRID_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(GAME_W, r * CELL_SIZE);
      ctx.stroke();
    }

    // 2. Draw Walls
    for (const w of g.walls) {
      const wx = w.x * CELL_SIZE;
      const wy = w.y * CELL_SIZE;
      ctx.fillStyle = SNAKE_PALETTE.wallPrimary;
      ctx.fillRect(wx, wy, CELL_SIZE, CELL_SIZE);

      // Bevel highlights & shadow
      ctx.fillStyle = SNAKE_PALETTE.wallBorder;
      ctx.fillRect(wx, wy, CELL_SIZE, 2);
      ctx.fillRect(wx, wy, 2, CELL_SIZE);

      ctx.fillStyle = SNAKE_PALETTE.wallShadow;
      ctx.fillRect(wx, wy + CELL_SIZE - 2, CELL_SIZE, 2);
      ctx.fillRect(wx + CELL_SIZE - 2, wy, 2, CELL_SIZE);
    }

    // 3. Draw Golden Bonus Food if active
    const now = performance.now();
    if (g.bonusFood) {
      const bx = g.bonusFood.pos.x * CELL_SIZE + CELL_SIZE / 2;
      const by = g.bonusFood.pos.y * CELL_SIZE + CELL_SIZE / 2;
      const remainingRatio = Math.max(0, (g.bonusFood.expiresAt - now) / g.bonusFood.duration);

      // Outer pulsing glow
      const pulse = Math.sin(now / 150) * 2 + 8;
      ctx.save();
      ctx.shadowBlur = pulse;
      ctx.shadowColor = SNAKE_PALETTE.goldenApple;
      ctx.fillStyle = SNAKE_PALETTE.goldenApple;

      // Draw Diamond Apple
      ctx.beginPath();
      ctx.arc(bx, by, CELL_SIZE / 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Countdown timer ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = SNAKE_PALETTE.goldenGlow;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(bx, by, CELL_SIZE / 2 + 1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * remainingRatio);
      ctx.stroke();

      // Golden sparkle core
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(bx - 2, by - 2, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 4. Draw Regular Food
    const fx = g.food.pos.x * CELL_SIZE;
    const fy = g.food.pos.y * CELL_SIZE;
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = g.food.color;
    ctx.fillStyle = g.food.color;
    ctx.beginPath();
    ctx.roundRect(fx + 2, fy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 4);
    ctx.fill();

    // Food inner highlight
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(fx + 6, fy + 6, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 5. Draw Snake
    for (let i = g.snake.length - 1; i >= 0; i--) {
      const pt = g.snake[i];
      const sx = pt.x * CELL_SIZE;
      const sy = pt.y * CELL_SIZE;

      if (i === 0) {
        // Head with directional eyes
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = SNAKE_PALETTE.snakeHead;
        ctx.fillStyle = SNAKE_PALETTE.snakeHead;
        ctx.beginPath();
        ctx.roundRect(sx + 1, sy + 1, CELL_SIZE - 2, CELL_SIZE - 2, 5);
        ctx.fill();
        ctx.restore();

        // Directional eyes
        ctx.fillStyle = SNAKE_PALETTE.snakeEye;
        let e1x = sx + 5;
        let e1y = sy + 5;
        let e2x = sx + 13;
        let e2y = sy + 5;
        if (g.dir.x === 1) {
          // Moving Right
          e1x = sx + 12;
          e1y = sy + 4;
          e2x = sx + 12;
          e2y = sy + 12;
        } else if (g.dir.x === -1) {
          // Moving Left
          e1x = sx + 4;
          e1y = sy + 4;
          e2x = sx + 4;
          e2y = sy + 12;
        } else if (g.dir.y === 1) {
          // Moving Down
          e1x = sx + 4;
          e1y = sy + 12;
          e2x = sx + 12;
          e2y = sy + 12;
        } else if (g.dir.y === -1) {
          // Moving Up
          e1x = sx + 4;
          e1y = sy + 4;
          e2x = sx + 12;
          e2y = sy + 4;
        }
        ctx.fillRect(e1x, e1y, 3, 3);
        ctx.fillRect(e2x, e2y, 3, 3);
      } else {
        // Body segments
        ctx.fillStyle = i % 2 === 0 ? SNAKE_PALETTE.snakeBody : SNAKE_PALETTE.snakeBodyAlt;
        ctx.beginPath();
        ctx.roundRect(sx + 2, sy + 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
        ctx.fill();
      }
    }

    // 6. Draw Particles
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = g.particles.length - 1; i >= 0; i--) {
      const p = g.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        g.particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 7. Top HUD Bar
    ctx.fillStyle = SNAKE_PALETTE.hudBg;
    ctx.fillRect(0, 0, GAME_W, HUD_ROWS * CELL_SIZE);
    ctx.fillStyle = SNAKE_PALETTE.grid;
    ctx.fillRect(0, HUD_ROWS * CELL_SIZE - 1, GAME_W, 1);

    ctx.font = `14px ${ff}`;
    ctx.textBaseline = "middle";

    // Left: Score & High Score
    ctx.textAlign = "left";
    ctx.fillStyle = SNAKE_PALETTE.hudText;
    ctx.fillText("SCORE", 16, 12);
    ctx.fillStyle = SNAKE_PALETTE.accentCyan;
    ctx.fillText(String(g.score).padStart(5, "0"), 16, 28);

    ctx.fillStyle = SNAKE_PALETTE.hudText;
    ctx.fillText("HIGH", 110, 12);
    ctx.fillStyle = SNAKE_PALETTE.goldenApple;
    ctx.fillText(String(Math.max(g.score, g.highScore)).padStart(5, "0"), 110, 28);

    // Center: Level Name
    ctx.textAlign = "center";
    ctx.fillStyle = SNAKE_PALETTE.hudText;
    ctx.fillText(`LEVEL ${curLevel.levelNumber}/${TOTAL_SNAKE_LEVELS}`, GAME_W / 2, 12);
    ctx.fillStyle = SNAKE_PALETTE.accentCyan;
    ctx.fillText(curLevel.name, GAME_W / 2, 28);

    // Right: Food Quota Progress
    ctx.textAlign = "right";
    ctx.fillStyle = SNAKE_PALETTE.hudText;
    ctx.fillText("FOOD TARGET", GAME_W - 16, 12);
    ctx.fillStyle =
      g.foodsEatenInLevel >= curLevel.foodTarget ? SNAKE_PALETTE.accentCyan : SNAKE_PALETTE.wallPrimary;
    ctx.fillText(`${g.foodsEatenInLevel}/${curLevel.foodTarget}`, GAME_W - 16, 28);

    // 8. Overlays & Game State Prompts
    const blink = performance.now() % 1000 < 500;

    if (g.mode === "READY") {
      ctx.fillStyle = "rgba(18, 19, 31, 0.75)";
      ctx.fillRect(0, HUD_ROWS * CELL_SIZE, GAME_W, GAME_H - HUD_ROWS * CELL_SIZE);

      ctx.fillStyle = SNAKE_PALETTE.accentCyan;
      ctx.font = `44px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`LEVEL ${curLevel.levelNumber}: ${curLevel.name}`, GAME_W / 2, 220);

      ctx.fillStyle = SNAKE_PALETTE.hudText;
      ctx.font = `20px ${ff}`;
      ctx.fillText(`EAT ${curLevel.foodTarget} NEON FOODS TO COMPLETE LEVEL`, GAME_W / 2, 280);

      if (curLevel.hasBonusFood) {
        ctx.fillStyle = SNAKE_PALETTE.goldenApple;
        ctx.font = `16px ${ff}`;
        ctx.fillText(`★ GOLDEN CYBER APPLES ENABLED (+${curLevel.bonusFoodPoints} PTS) ★`, GAME_W / 2, 320);
      }

      if (blink) {
        ctx.fillStyle = SNAKE_PALETTE.accentCyan;
        ctx.font = `22px ${ff}`;
        ctx.fillText("PRESS ARROWS / WASD OR SPACE TO START", GAME_W / 2, 380);
      }
    } else if (g.mode === "PAUSED") {
      ctx.fillStyle = "rgba(10, 11, 20, 0.78)";
      ctx.fillRect(0, HUD_ROWS * CELL_SIZE, GAME_W, GAME_H - HUD_ROWS * CELL_SIZE);

      ctx.fillStyle = SNAKE_PALETTE.goldenApple;
      ctx.font = `44px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME PAUSED", GAME_W / 2, 260);

      if (blink) {
        ctx.fillStyle = SNAKE_PALETTE.accentCyan;
        ctx.font = `20px ${ff}`;
        ctx.fillText("PRESS PAUSE OR SPACE TO RESUME", GAME_W / 2, 325);
      }
    } else if (g.mode === "LEVEL_CLEAR") {
      ctx.fillStyle = "rgba(10, 11, 20, 0.82)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      ctx.fillStyle = SNAKE_PALETTE.accentCyan;
      ctx.font = `56px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`LEVEL ${curLevel.levelNumber} CLEARED`, GAME_W / 2, 220);

      ctx.fillStyle = SNAKE_PALETTE.hudText;
      ctx.font = `24px ${ff}`;
      ctx.fillText(`STAGE BONUS +${curLevel.bonusPoints} PTS`, GAME_W / 2, 280);

      if (blink) {
        ctx.fillStyle = SNAKE_PALETTE.goldenApple;
        ctx.font = `22px ${ff}`;
        ctx.fillText("PRESS SPACE OR CLICK FOR NEXT LEVEL", GAME_W / 2, 360);
      }
    } else if (g.mode === "VICTORY") {
      ctx.fillStyle = "rgba(10, 11, 20, 0.88)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      ctx.fillStyle = SNAKE_PALETTE.goldenApple;
      ctx.font = `54px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CONGRATULATIONS", GAME_W / 2, 190);

      ctx.fillStyle = SNAKE_PALETTE.accentCyan;
      ctx.font = `26px ${ff}`;
      ctx.fillText("ALL 5 LEVELS CONQUERED", GAME_W / 2, 255);

      ctx.fillStyle = SNAKE_PALETTE.hudText;
      ctx.font = `22px ${ff}`;
      ctx.fillText("CYBER SNAKE CHAMPION", GAME_W / 2, 305);
      ctx.fillText(`FINAL SCORE ${String(g.score).padStart(5, "0")}`, GAME_W / 2, 345);

      if (blink) {
        ctx.fillStyle = SNAKE_PALETTE.goldenApple;
        ctx.font = `22px ${ff}`;
        ctx.fillText("PRESS SPACE OR CLICK TO PLAY AGAIN", GAME_W / 2, 420);
      }
    } else if (g.mode === "GAME_OVER") {
      ctx.fillStyle = "rgba(10, 11, 20, 0.88)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      ctx.fillStyle = SNAKE_PALETTE.wallPrimary;
      ctx.font = `56px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", GAME_W / 2, 210);

      ctx.fillStyle = SNAKE_PALETTE.wallBorder;
      ctx.font = `20px ${ff}`;
      ctx.fillText(g.gameOverReason, GAME_W / 2, 270);

      ctx.fillStyle = SNAKE_PALETTE.hudText;
      ctx.font = `22px ${ff}`;
      ctx.fillText(`FINAL SCORE ${String(g.score).padStart(5, "0")}`, GAME_W / 2, 315);

      if (blink) {
        ctx.fillStyle = SNAKE_PALETTE.accentCyan;
        ctx.font = `22px ${ff}`;
        ctx.fillText("PRESS SPACE OR CLICK TO RESTART (LEVEL 1)", GAME_W / 2, 385);
      }
    }

    ctx.restore();
  }, [ensureGame]);

  // Relayout on resize
  const relayout = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cw = wrap.clientWidth;
    let ch = wrap.clientHeight;
    if (!cw || cw < 1) cw = GAME_W;
    if (!ch || ch < 1) ch = Math.round(cw * (GAME_H / GAME_W));
    const dpr = Math.min(3, Math.max(1, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1));
    const bw = Math.round(cw * dpr);
    const bh = Math.round(ch * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    const s = Math.min(cw / GAME_W, ch / GAME_H);
    layoutRef.current = {
      cw,
      ch,
      s,
      ox: (cw - GAME_W * s) / 2,
      oy: (ch - GAME_H * s) / 2,
    };
  }, []);

  // Embedded font loading
  useEffect(() => {
    let cancelled = false;
    ensureEmbeddedFont(fontFamily, fontUrl).then(() => {
      if (!cancelled) draw();
    });
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontUrl, draw]);

  // Main Animation & Tick Loop
  useLayoutEffect(() => {
    ensureGame();
    relayout();
    draw();
    wrapRef.current?.focus();

    let raf = 0;
    const loop = (time: number) => {
      const g = gameRef.current;
      if (g && g.mode === "RUNNING") {
        const curConfig = SNAKE_LEVELS[g.levelIndex] ?? SNAKE_LEVELS[0];
        if (time - g.lastTick >= curConfig.tickDelayMs) {
          updateGameTick(g, time);
          g.lastTick = time;
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const wrap = wrapRef.current;
    let ro: ResizeObserver | null = null;
    if (wrap && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => {
        relayout();
        draw();
      });
      ro.observe(wrap);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [ensureGame, relayout, draw, updateGameTick]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 2) return;
      wrapRef.current?.focus();
      handlePrimaryAction();
    },
    [handlePrimaryAction]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const g = ensureGame();
      handleSnakeKeyEvent(g, e, {
        onPrimaryAction: handlePrimaryAction,
        onExit: () => optsRef.current.onExit?.(),
      });
    },
    [ensureGame, handlePrimaryAction]
  );

  // Normalized global window keydown/keyup listeners for virtual gamepad & unfocused play
  useEffect(() => {
    if (typeof window === "undefined") return;
    return bindSnakeWindowListeners(window, ensureGame, {
      onPrimaryAction: handlePrimaryAction,
      onExit: () => optsRef.current.onExit?.(),
    });
  }, [ensureGame, handlePrimaryAction]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="region"
      aria-label="Snake Grid arcade game"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 1,
        minHeight: 1,
        background: SNAKE_PALETTE.bg,
        overflow: "hidden",
        outline: "none",
        touchAction: "none",
        userSelect: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
