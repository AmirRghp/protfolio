import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  BEVEL,
  buildBricksForLevel,
  DEFAULT_PALETTE,
  DEPARKANOID_LEVELS,
  GAME_H,
  GAME_W,
  TOTAL_LEVELS,
  handleDeparkanoidKeyDown,
  handleDeparkanoidKeyUp,
  bindDeparkanoidWindowListeners,
  type Brick,
  type Palette,
} from "./deparkanoidLevels";
import { EMBEDDED_FONT_FAMILY as EMBEDDED_FAMILY, ensureEmbeddedFont } from "@/features/arcade/utils/arcadeFont";
import { readArcadeHighScore, saveArcadeHighScore } from "@/features/arcade/utils/arcadeData";
import { computeArcadeTimeStep } from "@/features/arcade/utils/arcadeTimeStep";

const BALL_SIZE = 22;
const PADDLE_H = 22;
const PADDLE_STEP = 16;

const BALL_PX = [
  "..AAA..",
  ".AWWAA.",
  "AWAAAAA",
  "AAAAAAA",
  "AAAAAAA",
  ".AAAAA.",
  "..AAA..",
];

const PADDLE_RLE = [
  "3|6.9A3c63s3c9A6.",
  "3|3.3A9W3c63l3c9W3A3.",
  "3|3A3W9A3c63s3c9A3W3A",
  "7|15A3c63s3c15A",
  "3|3.12A3c63s3c12A3.",
  "3|6.9P3c63d3c9P6.",
];

function expandPaddle(): string[] {
  const rows: string[] = [];
  for (const entry of PADDLE_RLE) {
    const split = entry.indexOf("|");
    const times = parseInt(entry.slice(0, split), 10);
    const enc = entry.slice(split + 1);
    let line = "";
    const re = /(\d+)(\D)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(enc)) !== null) line += m[2].repeat(parseInt(m[1], 10));
    for (let i = 0; i < times; i++) rows.push(line);
  }
  return rows;
}

const PADDLE_PX = expandPaddle();

const clamp = (lo: number, hi: number, v: number) => Math.min(Math.max(v, lo), hi);

function spriteCanvas(rows: string[], pal: Palette): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;
  const map: Record<string, string | null> = {
    A: pal.amber,
    W: "#ffffff",
    P: pal.pumpkin,
    s: pal.smoke,
    l: "#a4a4a4",
    d: "#333333",
    c: pal.carbon,
    ".": null,
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const col = map[rows[y][x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

export type GameMode = "READY" | "RUNNING" | "PAUSED" | "LEVEL_CLEAR" | "VICTORY" | "GAME_OVER";

export type GameState = {
  levelIndex: number;
  score: number;
  highScore: number;
  lives: number;
  mode: GameMode;
  bricks: Brick[];
  paddle: { x: number; y: number; width: number; height: number };
  ball: { x: number; y: number; radius: number; xSpeed: number; ySpeed: number };
  left: boolean;
  right: boolean;
};

export interface DeparkanoidProps {
  carbon?: string;
  smoke?: string;
  dark?: string;
  amber?: string;
  pumpkin?: string;
  cement?: string;
  launchSpeed?: number;
  paddleWidth?: number;
  autoPlay?: boolean;
  startImmediately?: boolean;
  fontFamily?: string;
  fontUrl?: string;
  onExit?: () => void;
  style?: React.CSSProperties;
}

export default function Deparkanoid(props: DeparkanoidProps) {
  const {
    carbon = DEFAULT_PALETTE.carbon,
    smoke = DEFAULT_PALETTE.smoke,
    dark = DEFAULT_PALETTE.dark,
    amber = DEFAULT_PALETTE.amber,
    pumpkin = DEFAULT_PALETTE.pumpkin,
    cement = DEFAULT_PALETTE.cement,
    launchSpeed,
    paddleWidth = 110,
    autoPlay = false,
    startImmediately = false,
    fontFamily = '"Departure Mono", "Departure Mono Subset", ui-monospace, SFMono-Regular, Menlo, monospace',
    fontUrl = "",
    onExit,
    style,
  } = props;

  const pal: Palette = { carbon, smoke, dark, amber, pumpkin, cement };

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const layoutRef = useRef({ cw: GAME_W, ch: GAME_H, ox: 0, oy: 0, s: 1 });
  const spritesRef = useRef<{ ball: HTMLCanvasElement | null; paddle: HTMLCanvasElement | null }>({
    ball: null,
    paddle: null,
  });

  const palRef = useRef(pal);
  const optsRef = useRef({ paddleWidth, autoPlay, startImmediately, launchSpeed, fontFamily, fontUrl, onExit });

  useLayoutEffect(() => {
    palRef.current = { carbon, smoke, dark, amber, pumpkin, cement };
    optsRef.current = { paddleWidth, autoPlay, startImmediately, launchSpeed, fontFamily, fontUrl, onExit };
  }, [carbon, smoke, dark, amber, pumpkin, cement, paddleWidth, autoPlay, startImmediately, launchSpeed, fontFamily, fontUrl, onExit]);

  const resetBallToPaddle = useCallback((g: GameState) => {
    g.ball.x = g.paddle.x + g.paddle.width / 2;
    g.ball.y = g.paddle.y - BALL_SIZE / 2 - 2;
    g.ball.xSpeed = 0;
    g.ball.ySpeed = 0;
  }, []);

  const launchBall = useCallback((g: GameState) => {
    const levelConfig = DEPARKANOID_LEVELS[g.levelIndex] ?? DEPARKANOID_LEVELS[0];
    const speed = optsRef.current.launchSpeed ?? levelConfig.launchSpeed;
    // Launch upward at a random angle between -35 and +35 degrees
    const angle = (Math.random() * 70 - 35) * (Math.PI / 180);
    g.ball.xSpeed = speed * Math.sin(angle);
    g.ball.ySpeed = -speed * Math.cos(angle);
    g.mode = "RUNNING";
  }, []);

  const loadLevel = useCallback((g: GameState, levelIdx: number) => {
    g.levelIndex = Math.max(0, Math.min(levelIdx, TOTAL_LEVELS - 1));
    g.bricks = buildBricksForLevel(g.levelIndex, palRef.current);
    const pw = optsRef.current.paddleWidth;
    g.paddle.width = pw;
    g.paddle.x = GAME_W / 2 - pw / 2;
    g.paddle.y = GAME_H - PADDLE_H - 10;
    resetBallToPaddle(g);
    if (optsRef.current.startImmediately) {
      launchBall(g);
    } else {
      g.mode = "READY";
    }
  }, [launchBall, resetBallToPaddle]);

  const restartFromLevelOne = useCallback((g: GameState) => {
    g.score = 0;
    g.lives = 3;
    loadLevel(g, 0);
  }, [loadLevel]);

  const ensureGame = useCallback((): GameState => {
    if (!gameRef.current) {
      const pw = optsRef.current.paddleWidth;
      const g: GameState = {
        levelIndex: 0,
        score: 0,
        highScore: readArcadeHighScore("deparkanoid"),
        lives: 3,
        mode: "READY",
        bricks: [],
        paddle: {
          x: GAME_W / 2 - pw / 2,
          y: GAME_H - PADDLE_H - 10,
          width: pw,
          height: PADDLE_H,
        },
        ball: {
          x: GAME_W / 2,
          y: GAME_H - PADDLE_H - 10 - BALL_SIZE / 2 - 2,
          radius: BALL_SIZE / 2,
          xSpeed: 0,
          ySpeed: 0,
        },
        left: false,
        right: false,
      };
      loadLevel(g, 0);
      gameRef.current = g;
    }
    return gameRef.current;
  }, [loadLevel]);

  // Primary Action handler (Space or Click): progresses through game phases
  const handlePrimaryAction = useCallback(() => {
    const g = ensureGame();
    if (g.mode === "PAUSED") {
      g.mode = "RUNNING";
    } else if (g.mode === "READY") {
      launchBall(g);
    } else if (g.mode === "LEVEL_CLEAR") {
      if (g.levelIndex < TOTAL_LEVELS - 1) {
        loadLevel(g, g.levelIndex + 1);
      } else {
        restartFromLevelOne(g);
      }
    } else if (g.mode === "VICTORY" || g.mode === "GAME_OVER") {
      restartFromLevelOne(g);
    }
  }, [ensureGame, launchBall, loadLevel, restartFromLevelOne]);

  const handleTogglePause = useCallback(() => {
    const g = ensureGame();
    if (g.mode === "RUNNING") {
      g.mode = "PAUSED";
    } else if (g.mode === "PAUSED") {
      g.mode = "RUNNING";
    } else if (g.mode === "READY") {
      launchBall(g);
    }
  }, [ensureGame, launchBall]);

  // Frame draw loop
  const draw = useCallback((frameScale = 0) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const g = ensureGame();
    const p = palRef.current;
    const { cw, ch, ox, oy, s } = layoutRef.current;
    const dpr = canvas.width / Math.max(1, cw);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    // Carbon background letterbox
    ctx.fillStyle = p.carbon;
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.rect(0, 0, GAME_W, GAME_H);
    ctx.clip();
    ctx.imageSmoothingEnabled = false;

    const ff = optsRef.current.fontFamily || `"${EMBEDDED_FAMILY}", ui-monospace, SFMono-Regular, Menlo, monospace`;
    const margin = PADDLE_H / 2;
    const maxX = GAME_W - g.paddle.width - margin;

    // Paddle movement
    if (g.mode !== "PAUSED" && frameScale > 0) {
      if (optsRef.current.autoPlay && g.mode === "RUNNING") {
        g.paddle.x = clamp(margin, maxX, g.ball.x - g.paddle.width / 2);
      } else {
        if (g.left && g.paddle.x > margin) g.paddle.x -= PADDLE_STEP * frameScale;
        else if (g.right && g.paddle.x < maxX) g.paddle.x += PADDLE_STEP * frameScale;
        g.paddle.x = clamp(margin, maxX, g.paddle.x);
      }
    }

    // Keep ball pinned to paddle in READY state
    if (g.mode === "READY") {
      g.ball.x = g.paddle.x + g.paddle.width / 2;
      g.ball.y = g.paddle.y - BALL_SIZE / 2 - 2;
    }

    // Ball physics in RUNNING mode
    if (g.mode === "RUNNING" && frameScale > 0) {
      const b = g.ball;
      b.x += b.xSpeed * frameScale;
      b.y += b.ySpeed * frameScale;

      // Edge collisions
      if (b.x < b.radius || b.x > GAME_W - b.radius) {
        b.x = clamp(b.radius, GAME_W - b.radius, b.x);
        b.xSpeed *= -1;
      }
      if (b.y < b.radius + 36) {
        // Bounce below top HUD banner
        b.y = clamp(b.radius + 36, GAME_H - b.radius, b.y);
        b.ySpeed *= -1;
      }

      // Paddle collision with steering angle
      const pad = g.paddle;
      if (
        b.y + b.radius >= pad.y &&
        b.y - b.radius < pad.y + pad.height &&
        b.x + b.radius >= pad.x &&
        b.x - b.radius <= pad.x + pad.width &&
        b.ySpeed > 0
      ) {
        b.y = pad.y - b.radius;
        const currentConfig = DEPARKANOID_LEVELS[g.levelIndex] ?? DEPARKANOID_LEVELS[0];
        const currentSpeed = props.launchSpeed ?? currentConfig.launchSpeed;
        const hitOffset = (b.x - (pad.x + pad.width / 2)) / (pad.width / 2);
        const clampedOffset = Math.max(-1, Math.min(1, hitOffset));
        // Angle deflection between -60 and +60 degrees
        const angle = clampedOffset * (Math.PI / 3);
        b.xSpeed = currentSpeed * Math.sin(angle);
        b.ySpeed = -Math.abs(currentSpeed * Math.cos(angle));
      }

      // Brick collisions
      let hit = false;
      for (let k = g.bricks.length - 1; k >= 0; k--) {
        const br = g.bricks[k];
        if (
          b.x + b.radius > br.x &&
          b.x - b.radius < br.x + br.w &&
          b.y - b.radius < br.y + br.h &&
          b.y + b.radius > br.y
        ) {
          hit = true;
          g.score += br.points;
          g.bricks.splice(k, 1);
          break;
        }
      }
      if (hit) {
        b.ySpeed *= -1;
        if (g.score > g.highScore) {
          g.highScore = saveArcadeHighScore("deparkanoid", g.score);
        }
      }

      // Check level cleared
      if (g.bricks.length === 0) {
        const currentConfig = DEPARKANOID_LEVELS[g.levelIndex];
        g.score += currentConfig.bonusPoints;
        if (g.score > g.highScore) {
          g.highScore = saveArcadeHighScore("deparkanoid", g.score);
        }
        if (g.levelIndex >= TOTAL_LEVELS - 1) {
          g.mode = "VICTORY";
        } else {
          g.mode = "LEVEL_CLEAR";
        }
      }

      // Ball fell off screen
      if (b.y > GAME_H + 20) {
        g.lives -= 1;
        if (g.lives <= 0) {
          g.mode = "GAME_OVER";
          g.highScore = saveArcadeHighScore("deparkanoid", g.score);
        } else {
          g.mode = "READY";
          resetBallToPaddle(g);
        }
      }
    }

    // Draw Bricks
    for (const br of g.bricks) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = p.carbon;
      ctx.fillStyle = br.c;
      ctx.beginPath();
      ctx.rect(br.x, br.y, br.w, br.h);
      ctx.fill();
      ctx.stroke();

      // Bevel highlights & shadows
      ctx.fillStyle = "rgba(255, 255, 255, 0.31)";
      ctx.fillRect(br.x + 2, br.y + 2, br.w - 4, BEVEL);
      ctx.fillRect(br.x + 2, br.y + 2 + BEVEL, BEVEL, br.h - 4 - BEVEL);
      ctx.fillStyle = "rgb(51, 51, 51)";
      ctx.fillRect(br.x + 2, br.y + br.h - 5, br.w - 4, BEVEL);
      ctx.fillRect(br.x + br.w - 5, br.y + 2, BEVEL, br.h - 4 - BEVEL);
    }

    // Draw Paddle
    const paddleSprite = spritesRef.current.paddle;
    if (paddleSprite) {
      ctx.drawImage(paddleSprite, g.paddle.x, g.paddle.y, g.paddle.width, PADDLE_H);
    }

    // Draw Ball
    const ballSprite = spritesRef.current.ball;
    if (ballSprite) {
      ctx.drawImage(
        ballSprite,
        g.ball.x - BALL_SIZE / 2,
        g.ball.y - BALL_SIZE / 2,
        BALL_SIZE,
        BALL_SIZE
      );
    }

    // Top HUD
    ctx.fillStyle = p.cement;
    ctx.font = `14px ${ff}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("SCORE", 16, 8);
    ctx.fillText(String(g.score).padStart(5, "0"), 16, 24);

    // Center Level info
    const curLevel = DEPARKANOID_LEVELS[g.levelIndex] ?? DEPARKANOID_LEVELS[0];
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${curLevel.levelNumber}/${TOTAL_LEVELS}`, GAME_W / 2, 8);
    ctx.fillStyle = p.amber;
    ctx.fillText(curLevel.name, GAME_W / 2, 24);

    // Right Lives info
    ctx.textAlign = "right";
    ctx.fillStyle = p.cement;
    ctx.fillText("LIVES", GAME_W - 16, 8);
    let livesStr = "";
    for (let i = 0; i < g.lives; i++) livesStr += "O ";
    ctx.fillStyle = p.pumpkin;
    ctx.fillText(livesStr.trim() || "NONE", GAME_W - 16, 24);

    // Overlay Prompts
    const reducedMotion =
      typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    const blink = reducedMotion || performance.now() % 1000 < 500;

    if (g.mode === "READY") {
      if (blink) {
        ctx.fillStyle = p.amber;
        ctx.font = `20px ${ff}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PRESS SPACE OR CLICK TO LAUNCH", GAME_W / 2, GAME_H / 2 + 60);
      }
    } else if (g.mode === "PAUSED") {
      ctx.fillStyle = "rgba(10, 5, 2, 0.78)";
      ctx.fillRect(0, 36, GAME_W, GAME_H - 36);

      ctx.fillStyle = p.amber;
      ctx.font = `48px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME PAUSED", GAME_W / 2, GAME_H / 2 - 20);

      if (blink) {
        ctx.fillStyle = p.cement;
        ctx.font = `20px ${ff}`;
        ctx.fillText("PRESS PAUSE OR SPACE TO RESUME", GAME_W / 2, GAME_H / 2 + 35);
      }
    } else if (g.mode === "LEVEL_CLEAR") {
      ctx.fillStyle = "rgba(10, 5, 2, 0.75)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      ctx.fillStyle = p.amber;
      ctx.font = `64px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`LEVEL ${curLevel.levelNumber} CLEARED`, GAME_W / 2, 220);

      ctx.fillStyle = p.cement;
      ctx.font = `24px ${ff}`;
      ctx.fillText(`LEVEL BONUS +${curLevel.bonusPoints} PTS`, GAME_W / 2, 280);

      if (blink) {
        ctx.fillStyle = p.pumpkin;
        ctx.font = `24px ${ff}`;
        ctx.fillText("PRESS SPACE OR CLICK FOR NEXT LEVEL", GAME_W / 2, 360);
      }
    } else if (g.mode === "VICTORY") {
      ctx.fillStyle = "rgba(10, 5, 2, 0.85)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      ctx.fillStyle = p.amber;
      ctx.font = `64px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CONGRATULATIONS", GAME_W / 2, 190);

      ctx.fillStyle = p.pumpkin;
      ctx.font = `28px ${ff}`;
      ctx.fillText("ALL 5 LEVELS CLEARED", GAME_W / 2, 255);

      ctx.fillStyle = p.cement;
      ctx.font = `24px ${ff}`;
      ctx.fillText("ARCADE CHAMPION", GAME_W / 2, 305);
      ctx.fillText(`FINAL SCORE ${String(g.score).padStart(5, "0")}`, GAME_W / 2, 345);

      if (blink) {
        ctx.fillStyle = p.amber;
        ctx.font = `24px ${ff}`;
        ctx.fillText("PRESS SPACE OR CLICK TO PLAY AGAIN", GAME_W / 2, 430);
      }
    } else if (g.mode === "GAME_OVER") {
      ctx.fillStyle = "rgba(10, 5, 2, 0.85)";
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      ctx.fillStyle = p.pumpkin;
      ctx.font = `64px ${ff}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", GAME_W / 2, 230);

      ctx.fillStyle = p.cement;
      ctx.font = `24px ${ff}`;
      ctx.fillText(`FINAL SCORE ${String(g.score).padStart(5, "0")}`, GAME_W / 2, 285);
      ctx.fillStyle = p.amber;
      ctx.fillText(`HI-SCORE ${String(Math.max(g.score, g.highScore)).padStart(5, "0")}`, GAME_W / 2, 320);

      if (blink) {
        ctx.fillStyle = p.amber;
        ctx.font = `24px ${ff}`;
        ctx.fillText("PRESS SPACE OR CLICK TO RETRY", GAME_W / 2, 375);
      }
    }

    ctx.restore();
  }, [ensureGame, props.launchSpeed, resetBallToPaddle]);

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

  // Sprite generation
  useLayoutEffect(() => {
    const activePalette: Palette = { carbon, smoke, dark, amber, pumpkin, cement };
    spritesRef.current = {
      ball: spriteCanvas(BALL_PX, activePalette),
      paddle: spriteCanvas(PADDLE_PX, activePalette),
    };
    relayout();
    draw();
  }, [carbon, smoke, dark, amber, pumpkin, cement, relayout, draw]);

  // Paddle width update
  useLayoutEffect(() => {
    const g = gameRef.current;
    if (!g) return;
    g.paddle.width = paddleWidth;
    g.paddle.x = clamp(PADDLE_H / 2, GAME_W - paddleWidth - PADDLE_H / 2, g.paddle.x);
  }, [paddleWidth]);

  // Embedded or external font loading
  useEffect(() => {
    let cancelled = false;
    ensureEmbeddedFont(fontFamily, fontUrl).then(() => {
      if (!cancelled) draw();
    });
    return () => {
      cancelled = true;
    };
  }, [fontFamily, fontUrl, draw]);

  // Animation loop & ResizeObserver
  useLayoutEffect(() => {
    ensureGame();
    relayout();
    draw();
    wrapRef.current?.focus();

    let raf = 0;
    let lastTime = performance.now();
    const loop = (now: number) => {
      const { frameScale } = computeArcadeTimeStep(now, lastTime);
      lastTime = now;
      draw(frameScale);
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
  }, [ensureGame, relayout, draw]);

  // Pointer position translation
  const pointerToBoardX = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const r = canvas.getBoundingClientRect();
    if (!r.width) return 0;
    const ratio = (clientX - r.left) / r.width;
    const { cw, ox, s } = layoutRef.current;
    return (ratio * cw - ox) / (s || 1);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const g = ensureGame();
      const bx = pointerToBoardX(e.clientX);
      const margin = PADDLE_H / 2;
      g.paddle.x = clamp(margin, GAME_W - g.paddle.width - margin, bx - g.paddle.width / 2);
    },
    [ensureGame, pointerToBoardX]
  );

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
      handleDeparkanoidKeyDown(g, e, {
        onPrimaryAction: handlePrimaryAction,
        onTogglePause: handleTogglePause,
        onExit: () => optsRef.current.onExit?.(),
      });
    },
    [ensureGame, handlePrimaryAction, handleTogglePause]
  );

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      const g = ensureGame();
      handleDeparkanoidKeyUp(g, e);
    },
    [ensureGame]
  );

  // Normalized global window keydown/keyup listeners for virtual gamepad & unfocused play
  useEffect(() => {
    if (typeof window === "undefined") return;
    return bindDeparkanoidWindowListeners(window, ensureGame, {
      onPrimaryAction: handlePrimaryAction,
      onTogglePause: handleTogglePause,
      onExit: () => optsRef.current.onExit?.(),
    });
  }, [ensureGame, handlePrimaryAction, handleTogglePause]);

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      role="region"
      aria-label="Deparkanoid arcade game"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 1,
        minHeight: 1,
        background: carbon,
        overflow: "hidden",
        outline: "none",
        touchAction: "none",
        cursor: "none",
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
