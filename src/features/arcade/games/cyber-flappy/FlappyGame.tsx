import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  BIRD_RADIUS,
  BIRD_X,
  CEILING_Y,
  FLAP_THRUST,
  FLAPPY_LEVELS,
  GAME_H,
  GAME_W,
  GRAVITY,
  GROUND_Y,
  MAX_FALL_SPEED,
  ORB_RADIUS,
  PYLON_WIDTH,
  TOTAL_FLAPPY_LEVELS,
  generatePylonGap,
  getLevelProgress,
  isBirdCollidingWithGround,
  isBirdCollidingWithPylon,
  isBirdCollectingOrb,
  type FlappyLevelConfig,
  type Pylon,
} from "./flappyLevels";
import { flappyAudio } from "./flappyAudio";
import { EMBEDDED_FONT_FAMILY as EMBEDDED_FAMILY, ensureEmbeddedFont } from "@/features/arcade/utils/arcadeFont";
import { computeArcadeTimeStep, integrateGravityStep } from "@/features/arcade/utils/arcadeTimeStep";

export type FlappyGameMode = "READY" | "RUNNING" | "PAUSED" | "LEVEL_CLEAR" | "VICTORY" | "GAME_OVER";

export type FlappyParticle = {
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
  vy: number;
};

export type Star = {
  x: number;
  y: number;
  size: number;
  twinklePhase: number;
  twinkleSpeed: number;
  speed: number;
  isAccent: boolean;
};

export type FarTower = {
  x: number;
  width: number;
  height: number;
  roofStyle: "spire" | "pyramid" | "stepped" | "flat";
};

export type Building = {
  x: number;
  width: number;
  height: number;
  roofType: "bevel" | "antenna" | "crown" | "flat";
  signText?: string;
  windows: { x: number; y: number; on: boolean; bright: boolean }[];
};

export type AerialTraffic = {
  x: number;
  y: number;
  len: number;
  speed: number;
  dir: 1 | -1;
  isAccent: boolean;
};

export type BirdTrailPoint = {
  x: number;
  y: number;
  alpha: number;
};

export type FlappyGameProps = {
  onExit?: () => void;
};

const STORAGE_KEY_HIGH_SCORE = "cyber_flappy_high_score";
const SKYLINE_SIGNS = ["AERO", "NEXUS", "PULSE", "SYNTH", "GRID", "ORBIT"];

export default function FlappyGame({ onExit }: FlappyGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const gameState = useRef<{
    mode: FlappyGameMode;
    levelIndex: number;
    score: number;
    highScore: number;
    gatesClearedInLevel: number;
    orbsCollected: number;
    birdY: number;
    birdSpeed: number;
    birdAngle: number;
    wingTimer: number;
    birdTrail: BirdTrailPoint[];
    pylons: Pylon[];
    nextPylonId: number;
    particles: FlappyParticle[];
    floatingTexts: FloatingText[];
    stars: Star[];
    farTowers: FarTower[];
    buildings: Building[];
    traffic: AerialTraffic[];
    groundScrollX: number;
    screenShake: number;
    levelClearTimer: number;
    isEndless: boolean;
  }>({
    mode: "READY",
    levelIndex: 0,
    score: 0,
    highScore: 0,
    gatesClearedInLevel: 0,
    orbsCollected: 0,
    birdY: 260,
    birdSpeed: 0,
    birdAngle: 0,
    wingTimer: 0,
    birdTrail: [],
    pylons: [],
    nextPylonId: 1,
    particles: [],
    floatingTexts: [],
    stars: [],
    farTowers: [],
    buildings: [],
    traffic: [],
    groundScrollX: 0,
    screenShake: 0,
    levelClearTimer: 0,
    isEndless: false,
  });

  // Initial setup for multi-layer background skyline
  const initBackground = useCallback(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 75; i++) {
      stars.push({
        x: Math.random() * GAME_W,
        y: 52 + Math.random() * (GROUND_Y - 160),
        size: Math.random() < 0.22 ? 2.4 : Math.random() < 0.6 ? 1.5 : 1.0,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        speed: 0.2 + Math.random() * 0.4,
        isAccent: Math.random() < 0.28,
      });
    }

    const farTowers: FarTower[] = [];
    let farX = 0;
    const roofStyles: FarTower["roofStyle"][] = ["spire", "pyramid", "stepped", "flat"];
    while (farX < GAME_W + 280) {
      const width = 65 + Math.random() * 85;
      const height = 135 + Math.random() * 105;
      farTowers.push({
        x: farX,
        width,
        height,
        roofStyle: roofStyles[Math.floor(Math.random() * roofStyles.length)],
      });
      farX += width + 8 + Math.random() * 16;
    }

    const buildings: Building[] = [];
    let curX = 0;
    let bIdx = 0;
    const roofTypes: Building["roofType"][] = ["bevel", "antenna", "crown", "flat"];
    while (curX < GAME_W + 240) {
      const width = 48 + Math.random() * 58;
      const height = 85 + Math.random() * 135;
      const windows: Building["windows"] = [];
      const cols = Math.floor((width - 10) / 12);
      const rows = Math.floor((height - 24) / 16);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.48) {
            windows.push({
              x: 6 + c * 12,
              y: 16 + r * 16,
              on: Math.random() < 0.82,
              bright: Math.random() < 0.25,
            });
          }
        }
      }
      buildings.push({
        x: curX,
        width,
        height,
        roofType: roofTypes[bIdx % roofTypes.length],
        signText: bIdx % 3 === 0 ? SKYLINE_SIGNS[bIdx % SKYLINE_SIGNS.length] : undefined,
        windows,
      });
      curX += width + 6 + Math.random() * 12;
      bIdx++;
    }

    const traffic: AerialTraffic[] = [];
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      traffic.push({
        x: Math.random() * GAME_W,
        y: 120 + (i % 4) * 55 + Math.random() * 20,
        len: 16 + Math.random() * 24,
        speed: (0.9 + Math.random() * 1.4) * dir,
        dir,
        isAccent: i % 2 === 0,
      });
    }

    let highScore = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
      if (stored) highScore = parseInt(stored, 10) || 0;
    } catch {
      /* ignore storage error */
    }

    gameState.current.stars = stars;
    gameState.current.farTowers = farTowers;
    gameState.current.buildings = buildings;
    gameState.current.traffic = traffic;
    gameState.current.highScore = highScore;
  }, []);

  const spawnPylonAt = useCallback((x: number) => {
    const s = gameState.current;
    const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
    const topHeight = generatePylonGap(level.gapSize, GROUND_Y);

    const hasOrb =
      level.spawnOrbs && (s.pylons.length % 2 === 1 || Math.random() < 0.6);

    const pylon: Pylon = {
      id: s.nextPylonId++,
      x,
      topHeight,
      baseTopHeight: topHeight,
      gapSize: level.gapSize,
      passed: false,
      oscillationPhase: Math.random() * Math.PI * 2,
      oscillationSpeed: 0.035 + Math.random() * 0.02,
      oscillationAmp: level.oscillating ? 26 : 0,
      orb: hasOrb
        ? {
            y: topHeight + level.gapSize / 2,
            collected: false,
            sparklePhase: Math.random() * Math.PI * 2,
          }
        : undefined,
    };
    s.pylons.push(pylon);
  }, []);

  const resetGame = useCallback(
    (targetLevelIndex = 0, keepHighScore = true) => {
      const s = gameState.current;
      s.mode = "READY";
      s.levelIndex = targetLevelIndex;
      s.score = 0;
      s.gatesClearedInLevel = 0;
      s.orbsCollected = 0;
      s.birdY = 260;
      s.birdSpeed = 0;
      s.birdAngle = 0;
      s.wingTimer = 0;
      s.birdTrail = [];
      s.pylons = [];
      s.nextPylonId = 1;
      s.particles = [];
      s.floatingTexts = [];
      s.screenShake = 0;
      s.levelClearTimer = 0;
      s.isEndless = false;

      if (!keepHighScore) {
        s.highScore = 0;
      }

      const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
      const startX = GAME_W + 60;
      for (let i = 0; i < 3; i++) {
        spawnPylonAt(startX + i * level.pylonSpacing);
      }
    },
    [spawnPylonAt],
  );

  const startLevel = useCallback(
    (levelIndex: number) => {
      const s = gameState.current;
      s.levelIndex = levelIndex;
      s.gatesClearedInLevel = 0;
      s.birdY = 260;
      s.birdSpeed = 0;
      s.birdAngle = 0;
      s.birdTrail = [];
      s.pylons = [];
      s.particles = [];
      s.floatingTexts = [];
      s.screenShake = 0;
      s.levelClearTimer = 0;
      s.mode = "RUNNING";

      const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
      const startX = GAME_W + 40;
      for (let i = 0; i < 3; i++) {
        spawnPylonAt(startX + i * level.pylonSpacing);
      }
    },
    [spawnPylonAt],
  );

  const flap = useCallback(() => {
    const s = gameState.current;
    if (s.mode === "PAUSED") {
      s.mode = "RUNNING";
      s.birdSpeed = FLAP_THRUST;
      s.birdAngle = -0.38;
      flappyAudio.playFlap();
      return;
    }

    if (s.mode === "READY") {
      s.mode = "RUNNING";
      s.birdSpeed = FLAP_THRUST;
      s.birdAngle = -0.38;
      flappyAudio.playFlap();
      return;
    }

    if (s.mode === "RUNNING") {
      s.birdSpeed = FLAP_THRUST;
      s.birdAngle = -0.38;
      flappyAudio.playFlap();

      const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
      for (let i = 0; i < 8; i++) {
        s.particles.push({
          x: BIRD_X - 16,
          y: s.birdY + 2 + (Math.random() - 0.5) * 8,
          vx: -(2.8 + Math.random() * 3.8),
          vy: (Math.random() - 0.5) * 2.4,
          color: Math.random() < 0.65 ? level.palette.accent : "#ffffff",
          size: 2.5 + Math.random() * 2.2,
          alpha: 1,
          decay: 0.045 + Math.random() * 0.04,
        });
      }
      return;
    }

    if (s.mode === "LEVEL_CLEAR") {
      if (s.levelIndex < TOTAL_FLAPPY_LEVELS - 1) {
        startLevel(s.levelIndex + 1);
      } else {
        s.mode = "VICTORY";
        flappyAudio.playVictory();
      }
      return;
    }

    if (s.mode === "GAME_OVER") {
      resetGame(0);
      return;
    }

    if (s.mode === "VICTORY") {
      s.isEndless = true;
      resetGame(TOTAL_FLAPPY_LEVELS - 1);
      s.mode = "RUNNING";
      return;
    }
  }, [resetGame, startLevel]);

  // Handle inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P" || e.code === "KeyP") {
        e.preventDefault();
        const s = gameState.current;
        if (s.mode === "RUNNING") {
          s.mode = "PAUSED";
        } else if (s.mode === "PAUSED") {
          s.mode = "RUNNING";
        } else if (s.mode === "READY") {
          flap();
        }
        return;
      }

      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.key === " " ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        flap();
      } else if (e.code === "Escape" || e.key === "Escape") {
        e.preventDefault();
        if (onExit) onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flap, onExit]);

  // Canvas scaling layout
  useLayoutEffect(() => {
    ensureEmbeddedFont();
    initBackground();
    resetGame(0);

    const updateScale = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const cw = container.clientWidth || GAME_W;
      const ch = container.clientHeight || GAME_H;
      const scale = Math.min(cw / GAME_W, ch / GAME_H);

      canvas.width = GAME_W;
      canvas.height = GAME_H;
      canvas.style.width = `${Math.round(GAME_W * scale)}px`;
      canvas.style.height = `${Math.round(GAME_H * scale)}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.imageSmoothingEnabled = false;
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [initBackground, resetGame]);

  // Main 60fps game loop
  useEffect(() => {
    let lastTime = performance.now();
    let trailSpawnAcc = 0;

    function drawCyberModalBox(
      ctx: CanvasRenderingContext2D,
      w: number,
      h: number,
      borderColor: string,
      bgTint = "rgba(4, 9, 22, 0.9)",
    ) {
      const mx = (GAME_W - w) / 2;
      const my = (GROUND_Y - 48 - h) / 2 + 48;
      ctx.fillStyle = bgTint;
      ctx.fillRect(mx, my, w, h);

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(mx, my, w, h);

      const cLen = 14;
      ctx.fillStyle = borderColor;
      ctx.fillRect(mx - 2, my - 2, cLen, 4);
      ctx.fillRect(mx - 2, my - 2, 4, cLen);
      ctx.fillRect(mx + w - cLen + 2, my - 2, cLen, 4);
      ctx.fillRect(mx + w - 2, my - 2, 4, cLen);
      ctx.fillRect(mx - 2, my + h - 2, cLen, 4);
      ctx.fillRect(mx - 2, my + h - cLen + 2, 4, cLen);
      ctx.fillRect(mx + w - cLen + 2, my + h - 2, cLen, 4);
      ctx.fillRect(mx + w - 2, my + h - cLen + 2, 4, cLen);
      return { mx, my, w, h };
    }

    function renderHUD(
      ctx: CanvasRenderingContext2D,
      s: typeof gameState.current,
      level: FlappyLevelConfig,
    ) {
      ctx.save();
      ctx.fillStyle = "rgba(4, 9, 20, 0.9)";
      ctx.fillRect(0, 0, GAME_W, 48);
      ctx.strokeStyle = level.palette.accent;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 48);
      ctx.lineTo(GAME_W, 48);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      // Level indicator
      ctx.fillStyle = level.palette.accent;
      const lvlText = s.isEndless
        ? "ENDLESS SINGULARITY"
        : `LVL 0${level.levelNumber} · ${level.name}`;
      ctx.fillText(lvlText, 22, 24);

      // Gates quota progress + visual bar
      if (!s.isEndless) {
        ctx.fillStyle = "#e2e8f0";
        ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillText(`GATES: ${s.gatesClearedInLevel}/${level.targetGates}`, 285, 24);

        const prog = getLevelProgress(s.gatesClearedInLevel, level.targetGates);
        const bx = 405;
        const by = 19;
        const bw = 96;
        const bh = 10;
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = level.palette.accent;
        ctx.fillRect(bx, by, Math.round(bw * prog), bh);
        ctx.strokeStyle = level.palette.circuitLines;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      }

      // Score, Orbs & Best
      ctx.textAlign = "right";
      ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`SCORE: ${s.score}`, GAME_W - 155, 24);

      ctx.fillStyle = "#ffd700";
      ctx.fillText(`BEST: ${s.highScore}`, GAME_W - 22, 24);

      ctx.restore();
    }

    function renderReadyOverlay(
      ctx: CanvasRenderingContext2D,
      _s: typeof gameState.current,
      level: FlappyLevelConfig,
    ) {
      ctx.save();
      ctx.fillStyle = "rgba(2, 6, 18, 0.56)";
      ctx.fillRect(0, 48, GAME_W, GROUND_Y - 48);

      const { my } = drawCyberModalBox(ctx, 540, 290, level.palette.accent);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = `bold 38px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = level.palette.accent;
      ctx.fillText("CYBER FLAPPY", GAME_W / 2, my + 56);

      // 5 Level Palette Bars
      for (let i = 0; i < TOTAL_FLAPPY_LEVELS; i++) {
        const px = GAME_W / 2 - 90 + i * 45;
        ctx.fillStyle = FLAPPY_LEVELS[i].palette.accent;
        ctx.fillRect(px - 14, my + 88, 28, 5);
      }

      ctx.font = `bold 15px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`SECTOR 0${level.levelNumber}: ${level.name}`, GAME_W / 2, my + 124);

      ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(
        `CLEAR ${level.targetGates} LASER CONDUIT GATES · COLLECT +50 DATA ORBS`,
        GAME_W / 2,
        156 + my,
      );

      const pulse = 0.65 + Math.sin(Date.now() * 0.006) * 0.35;
      ctx.font = `bold 17px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.fillText("[ PRESS SPACE / UP OR CLICK TO FLAP ]", GAME_W / 2, my + 215);

      ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#64748b";
      ctx.fillText("ESC: EXIT TO ARCADE MENU", GAME_W / 2, my + 258);

      ctx.restore();
    }

    function renderLevelClearOverlay(
      ctx: CanvasRenderingContext2D,
      s: typeof gameState.current,
      level: FlappyLevelConfig,
    ) {
      ctx.save();
      ctx.fillStyle = "rgba(2, 6, 20, 0.65)";
      ctx.fillRect(0, 48, GAME_W, GROUND_Y - 48);

      const { my } = drawCyberModalBox(ctx, 520, 240, "#00ff88");

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = `bold 34px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#00ff88";
      ctx.fillText("SECTOR CLEARED!", GAME_W / 2, my + 60);

      ctx.font = `15px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        `LEVEL 0${level.levelNumber} COMPLETED  ·  SCORE: ${s.score}`,
        GAME_W / 2,
        my + 112,
      );

      const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
      ctx.font = `bold 15px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = `rgba(0, 240, 255, ${pulse})`;
      ctx.fillText("ENGAGING HYPER-WARP TO NEXT SECTOR...", GAME_W / 2, my + 162);

      ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText("[ PRESS SPACE TO ADVANCE IMMEDIATELY ]", GAME_W / 2, my + 202);

      ctx.restore();
    }

    function renderVictoryOverlay(
      ctx: CanvasRenderingContext2D,
      s: typeof gameState.current,
    ) {
      ctx.save();
      ctx.fillStyle = "rgba(4, 8, 24, 0.76)";
      ctx.fillRect(0, 48, GAME_W, GROUND_Y - 48);

      const { my } = drawCyberModalBox(ctx, 560, 290, "#ffd700");

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = `bold 38px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffd700";
      ctx.fillText("GRAND VICTORY!", GAME_W / 2, my + 56);

      ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#00f0ff";
      ctx.fillText("ALL 5 CYBER SECTORS CONQUERED", GAME_W / 2, my + 100);

      ctx.font = `15px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`FINAL SCORE: ${s.score}   ·   DATA ORBS: ${s.orbsCollected}`, GAME_W / 2, my + 148);
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`ALL-TIME HIGH SCORE: ${s.highScore}`, GAME_W / 2, my + 178);

      const pulse = 0.7 + Math.sin(Date.now() * 0.006) * 0.3;
      ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
      ctx.fillText("[ PRESS SPACE OR CLICK FOR ENDLESS MODE ]", GAME_W / 2, my + 228);

      ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#64748b";
      ctx.fillText("ESC: RETURN TO ARCADE MENU", GAME_W / 2, my + 264);

      ctx.restore();
    }

    function renderGameOverOverlay(
      ctx: CanvasRenderingContext2D,
      s: typeof gameState.current,
    ) {
      ctx.save();
      ctx.fillStyle = "rgba(18, 2, 8, 0.72)";
      ctx.fillRect(0, 48, GAME_W, GROUND_Y - 48);

      const { my } = drawCyberModalBox(ctx, 520, 265, "#ff0055", "rgba(20, 4, 10, 0.92)");

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.font = `bold 36px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ff0055";
      ctx.fillText("SYSTEM CRITICAL", GAME_W / 2, my + 56);

      ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText("STRIKE DRONE DESTROYED IN TRANSIT", GAME_W / 2, my + 100);

      ctx.font = `15px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#cbd5e1";
      ctx.fillText(
        `FINAL SCORE: ${s.score}   ·   ORBS: ${s.orbsCollected}   ·   BEST: ${s.highScore}`,
        GAME_W / 2,
        my + 142,
      );

      const pulse = 0.65 + Math.sin(Date.now() * 0.007) * 0.35;
      ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.fillText("[ PRESS SPACE OR CLICK TO REBOOT SYSTEM ]", GAME_W / 2, my + 198);

      ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#64748b";
      ctx.fillText("ESC: RETURN TO ARCADE MENU", GAME_W / 2, my + 238);

      ctx.restore();
    }

    const loop = (currentTime: number) => {
      const { dt, frameScale } = computeArcadeTimeStep(currentTime, lastTime);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const s = gameState.current;

      if (ctx) {
        // --- 1. UPDATE STATE ---
        const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];

        if (s.screenShake > 0) {
          s.screenShake -= dt * 30;
          if (s.screenShake < 0) s.screenShake = 0;
        }

        // Parallax stars scroll
        for (const star of s.stars) {
          star.twinklePhase += star.twinkleSpeed * frameScale;
          if (s.mode === "RUNNING") {
            star.x -= star.speed * frameScale;
            if (star.x < 0) star.x = GAME_W + 5;
          }
        }

        // Aerial traffic lanes update
        for (const tr of s.traffic) {
          tr.x += (tr.speed - (s.mode === "RUNNING" ? level.speed * 0.15 : 0)) * frameScale;
          if (tr.x > GAME_W + 50) tr.x = -50;
          if (tr.x < -50) tr.x = GAME_W + 50;
        }

        // Parallax far towers & mid buildings scroll
        if (s.mode === "RUNNING") {
          const farSpeed = level.speed * 0.11 * frameScale;
          for (const ft of s.farTowers) {
            ft.x -= farSpeed;
          }
          if (s.farTowers.length && s.farTowers[0].x + s.farTowers[0].width < -20) {
            const recycled = s.farTowers.shift()!;
            const lastFt = s.farTowers[s.farTowers.length - 1];
            recycled.x = (lastFt ? lastFt.x + lastFt.width : GAME_W) + 8 + Math.random() * 16;
            s.farTowers.push(recycled);
          }

          const bgSpeed = level.speed * 0.28 * frameScale;
          for (const b of s.buildings) {
            b.x -= bgSpeed;
          }
          if (s.buildings.length && s.buildings[0].x + s.buildings[0].width < 0) {
            const recycled = s.buildings.shift()!;
            const lastB = s.buildings[s.buildings.length - 1];
            recycled.x = (lastB ? lastB.x + lastB.width : GAME_W) + 6 + Math.random() * 10;
            s.buildings.push(recycled);
          }

          s.groundScrollX = (s.groundScrollX - level.speed * frameScale) % 40;
        }

        // Mode specific updates
        if (s.mode === "READY") {
          s.wingTimer += dt * 8;
          s.birdY = 260 + Math.sin(s.wingTimer) * 7;
          s.birdAngle = 0;
        } else if (s.mode === "RUNNING") {
          s.wingTimer += dt * 15;

          // Bird physics (frame-rate independent trapezoidal gravity integration)
          const birdStep = integrateGravityStep(
            s.birdY,
            s.birdSpeed,
            GRAVITY,
            frameScale,
            MAX_FALL_SPEED,
          );
          s.birdSpeed = birdStep.vy;
          s.birdY = birdStep.y;

          // Ceiling clamp
          if (s.birdY - BIRD_RADIUS <= CEILING_Y) {
            s.birdY = CEILING_Y + BIRD_RADIUS;
            if (s.birdSpeed < 0) s.birdSpeed = 0;
          }

          // Angle interpolation
          if (s.birdSpeed < 0) {
            s.birdAngle = Math.max(-0.45, s.birdAngle - 0.15 * frameScale);
          } else {
            s.birdAngle = Math.min(
              1.2,
              s.birdAngle + (0.05 + s.birdSpeed * 0.02) * frameScale,
            );
          }

          // Update bird ion ribbon trail
          for (let i = s.birdTrail.length - 1; i >= 0; i--) {
            s.birdTrail[i].x -= level.speed * frameScale;
            s.birdTrail[i].alpha -= 0.09 * frameScale;
            if (s.birdTrail[i].alpha <= 0) {
              s.birdTrail.splice(i, 1);
            }
          }
          trailSpawnAcc += frameScale;
          if (trailSpawnAcc >= 1) {
            trailSpawnAcc %= 1;
            s.birdTrail.push({ x: BIRD_X - 14, y: s.birdY, alpha: 0.85 });
            if (s.birdTrail.length > 10) {
              s.birdTrail.shift();
            }
          }

          // Pylons update
          for (const pylon of s.pylons) {
            pylon.x -= level.speed * frameScale;

            if (level.oscillating && pylon.oscillationAmp > 0) {
              pylon.oscillationPhase += pylon.oscillationSpeed * frameScale;
              pylon.topHeight =
                pylon.baseTopHeight + Math.sin(pylon.oscillationPhase) * pylon.oscillationAmp;
              if (pylon.orb && !pylon.orb.collected) {
                pylon.orb.y = pylon.topHeight + pylon.gapSize / 2;
              }
            }

            // Gate passed check
            if (!pylon.passed && pylon.x + PYLON_WIDTH < BIRD_X) {
              pylon.passed = true;
              s.score += 1;
              s.gatesClearedInLevel += 1;

              if (s.score > s.highScore) {
                s.highScore = s.score;
                try {
                  localStorage.setItem(STORAGE_KEY_HIGH_SCORE, String(s.highScore));
                } catch {
                  /* ignore storage error */
                }
              }

              flappyAudio.playScore();

              for (let i = 0; i < 16; i++) {
                s.particles.push({
                  x: pylon.x + PYLON_WIDTH / 2,
                  y: pylon.topHeight + Math.random() * pylon.gapSize,
                  vx: (Math.random() - 0.5) * 3.8,
                  vy: (Math.random() - 0.5) * 3.8,
                  color: level.palette.accent,
                  size: 2.5 + Math.random() * 2,
                  alpha: 1,
                  decay: 0.04 + Math.random() * 0.03,
                });
              }

              // Check level quota
              if (!s.isEndless && s.gatesClearedInLevel >= level.targetGates) {
                if (s.levelIndex >= TOTAL_FLAPPY_LEVELS - 1) {
                  s.mode = "VICTORY";
                  flappyAudio.playVictory();
                } else {
                  s.mode = "LEVEL_CLEAR";
                  s.levelClearTimer = 1.9;
                  flappyAudio.playLevelClear();
                }
              }
            }

            // Orb collection check
            if (pylon.orb && !pylon.orb.collected) {
              pylon.orb.sparklePhase += 0.08 * frameScale;
              const orbX = pylon.x + PYLON_WIDTH / 2;
              if (isBirdCollectingOrb(BIRD_X, s.birdY, BIRD_RADIUS, orbX, pylon.orb.y)) {
                pylon.orb.collected = true;
                s.score += 50;
                s.orbsCollected += 1;
                flappyAudio.playOrb();

                s.floatingTexts.push({
                  x: orbX,
                  y: pylon.orb.y - 12,
                  text: "+50 ORB",
                  color: "#ffd700",
                  alpha: 1,
                  vy: -1.3,
                });

                for (let i = 0; i < 20; i++) {
                  s.particles.push({
                    x: orbX,
                    y: pylon.orb.y,
                    vx: (Math.random() - 0.5) * 5.2,
                    vy: (Math.random() - 0.5) * 5.2,
                    color: Math.random() < 0.5 ? "#ffd700" : "#ffffff",
                    size: 3 + Math.random() * 2.2,
                    alpha: 1,
                    decay: 0.035,
                  });
                }
              }
            }

            // Pylon collision
            if (isBirdCollidingWithPylon(BIRD_X, s.birdY, BIRD_RADIUS, pylon)) {
              triggerCrash();
              break;
            }
          }

          // Ground collision
          if (isBirdCollidingWithGround(s.birdY, BIRD_RADIUS)) {
            triggerCrash();
          }

          // Recycle passed pylons and spawn ahead
          if (s.pylons.length && s.pylons[0].x + PYLON_WIDTH < -30) {
            s.pylons.shift();
          }

          const lastPylon = s.pylons[s.pylons.length - 1];
          if (!lastPylon || lastPylon.x <= GAME_W + 50 - level.pylonSpacing) {
            spawnPylonAt(lastPylon ? lastPylon.x + level.pylonSpacing : GAME_W + 60);
          }
        } else if (s.mode === "LEVEL_CLEAR") {
          s.levelClearTimer -= dt;
          if (s.levelClearTimer <= 0) {
            if (s.levelIndex < TOTAL_FLAPPY_LEVELS - 1) {
              startLevel(s.levelIndex + 1);
            } else {
              s.mode = "VICTORY";
              flappyAudio.playVictory();
            }
          }
        }

        // Particle updates
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx * frameScale;
          p.y += p.vy * frameScale;
          p.alpha -= p.decay * frameScale;
          if (p.alpha <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // Floating texts update
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy * frameScale;
          ft.alpha -= 0.022 * frameScale;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        function triggerCrash() {
          s.mode = "GAME_OVER";
          s.screenShake = 16;
          flappyAudio.playCrash();

          for (let i = 0; i < 42; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 7;
            s.particles.push({
              x: BIRD_X,
              y: s.birdY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: Math.random() < 0.4 ? "#ff0055" : Math.random() < 0.7 ? "#00f0ff" : "#ffffff",
              size: 3 + Math.random() * 3.5,
              alpha: 1,
              decay: 0.03 + Math.random() * 0.02,
            });
          }
        }

        // =====================================================================
        // --- 2. RENDER SCENE: MULTI-LAYER NEON METROPOLIS ---
        // =====================================================================
        ctx.save();

        if (s.screenShake > 0) {
          const ox = (Math.random() - 0.5) * s.screenShake;
          const oy = (Math.random() - 0.5) * s.screenShake;
          ctx.translate(ox, oy);
        }

        // A. Deep Atmospheric Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGrad.addColorStop(0, level.palette.bgSkyTop);
        skyGrad.addColorStop(1, level.palette.bgSkyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, GAME_W, GROUND_Y);

        // Subtle atmospheric grid lines in upper sky
        ctx.save();
        ctx.strokeStyle = level.palette.accent;
        ctx.globalAlpha = 0.05;
        ctx.lineWidth = 1;
        for (let gy = 80; gy < 240; gy += 40) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(GAME_W, gy);
          ctx.stroke();
        }
        ctx.restore();

        // B. Multi-Depth Twinkling Stars
        for (const star of s.stars) {
          const alpha = 0.35 + Math.sin(star.twinklePhase) * 0.45;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fillStyle = star.isAccent ? level.palette.accent : "#ffffff";
          ctx.fillRect(star.x, star.y, star.size, star.size);
        }
        ctx.globalAlpha = 1.0;

        // C. Synthwave Horizon Sun / Singularity Reactor
        const sunX = GAME_W * 0.68;
        const sunY = 195;
        const sunR = 88;
        ctx.save();
        const sunHalo = ctx.createRadialGradient(sunX, sunY, sunR * 0.15, sunX, sunY, sunR * 2.5);
        sunHalo.addColorStop(0, "rgba(255, 42, 133, 0.38)");
        sunHalo.addColorStop(0.45, level.palette.pylonGlow);
        sunHalo.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = sunHalo;
        ctx.fillRect(sunX - sunR * 2.6, sunY - sunR * 2.6, sunR * 5.2, sunR * 5.2);

        // Dual outer orbital telemetry rings
        ctx.strokeStyle = level.palette.accent;
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR + 13, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = "#ff2a85";
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR + 24, 0, Math.PI * 2);
        ctx.stroke();

        // Segmented sun disc
        ctx.globalAlpha = 0.9;
        const discGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
        discGrad.addColorStop(0, "#fff07c");
        discGrad.addColorStop(0.4, "#ff2a85");
        discGrad.addColorStop(0.82, level.palette.accent);
        discGrad.addColorStop(1, level.palette.citySilhouette);
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();

        // Horizontal scanline slices on lower half
        ctx.fillStyle = level.palette.bgSkyTop;
        ctx.globalAlpha = 0.88;
        for (let sl = 0; sl < 6; sl++) {
          const sy = sunY + 6 + sl * 12;
          ctx.fillRect(sunX - sunR - 2, sy, sunR * 2 + 4, 2.4 + sl * 1.15);
        }
        ctx.restore();

        // D. Layer 1: Far Arcology Megastructures
        ctx.save();
        for (const ft of s.farTowers) {
          const fy = GROUND_Y - ft.height;
          ctx.fillStyle = level.palette.bgSkyTop;
          ctx.globalAlpha = 0.72;
          ctx.fillRect(ft.x, fy, ft.width, ft.height);

          if (ft.roofStyle === "pyramid") {
            ctx.beginPath();
            ctx.moveTo(ft.x, fy);
            ctx.lineTo(ft.x + ft.width / 2, fy - 24);
            ctx.lineTo(ft.x + ft.width, fy);
            ctx.closePath();
            ctx.fill();
          } else if (ft.roofStyle === "spire") {
            ctx.fillRect(ft.x + ft.width / 2 - 2, fy - 36, 4, 36);
          } else if (ft.roofStyle === "stepped") {
            ctx.fillRect(ft.x + ft.width * 0.2, fy - 16, ft.width * 0.6, 16);
          }

          ctx.strokeStyle = level.palette.accent;
          ctx.globalAlpha = 0.28;
          ctx.lineWidth = 1;
          ctx.strokeRect(ft.x, fy, ft.width, ft.height);
        }
        ctx.restore();

        // E. Nocturnal Sweeping Sky Searchlights
        ctx.save();
        for (let bIdx = 0; bIdx < 3; bIdx++) {
          const baseX = 180 + bIdx * 280;
          const sweepAngle = Math.sin(currentTime * 0.0008 + bIdx * 2.1) * 0.32;
          ctx.save();
          ctx.translate(baseX, GROUND_Y - 60);
          ctx.rotate(sweepAngle);
          const beamGrad = ctx.createLinearGradient(0, 0, 0, -340);
          beamGrad.addColorStop(0, level.palette.pylonGlow);
          beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = beamGrad;
          ctx.globalAlpha = 0.32;
          ctx.beginPath();
          ctx.moveTo(-8, 0);
          ctx.lineTo(-54, -340);
          ctx.lineTo(54, -340);
          ctx.lineTo(8, 0);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // F. Aerial Spinner Traffic Streaks
        ctx.save();
        for (const tr of s.traffic) {
          const tailColor = tr.isAccent ? level.palette.accent : "#ff2a6d";
          const tGrad = ctx.createLinearGradient(tr.x, tr.y, tr.x - tr.len * tr.dir, tr.y);
          tGrad.addColorStop(0, "#ffffff");
          tGrad.addColorStop(0.35, tailColor);
          tGrad.addColorStop(1, "rgba(0,0,0,0)");
          ctx.strokeStyle = tGrad;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tr.x, tr.y);
          ctx.lineTo(tr.x - tr.len * tr.dir, tr.y);
          ctx.stroke();
        }
        ctx.restore();

        // G. Layer 2: Mid-Ground Cyber Skyline
        for (const b of s.buildings) {
          const by = GROUND_Y - b.height;
          ctx.fillStyle = level.palette.citySilhouette;
          ctx.fillRect(b.x, by, b.width, b.height);

          // Roof details
          if (b.roofType === "bevel") {
            ctx.beginPath();
            ctx.moveTo(b.x, by);
            ctx.lineTo(b.x + 10, by - 12);
            ctx.lineTo(b.x + b.width - 10, by - 12);
            ctx.lineTo(b.x + b.width, by);
            ctx.closePath();
            ctx.fill();
          } else if (b.roofType === "crown") {
            ctx.fillRect(b.x + 6, by - 9, b.width - 12, 9);
          }

          ctx.strokeStyle = level.palette.accent;
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 1.2;
          ctx.strokeRect(b.x, by, b.width, b.height);
          ctx.globalAlpha = 1.0;

          // Roof antenna beacon
          if (b.width > 52 || b.roofType === "antenna") {
            ctx.fillStyle = level.palette.cityWindows;
            ctx.fillRect(b.x + b.width / 2 - 1, by - 10, 2, 10);
            if (Math.sin(currentTime * 0.006 + b.width) > -0.2) {
              ctx.fillStyle = "#ff0055";
              ctx.fillRect(b.x + b.width / 2 - 2, by - 13, 4, 3);
            }
          }

          // Windows
          for (const win of b.windows) {
            if (win.on) {
              ctx.fillStyle = win.bright ? "#ffffff" : level.palette.cityWindows;
              ctx.globalAlpha = win.bright ? 0.82 : 0.56;
              ctx.fillRect(b.x + win.x, by + win.y, 4, 6);
            }
          }
          ctx.globalAlpha = 1.0;

          // Rooftop / Facade Hologram Sign
          if (b.signText && b.width >= 54) {
            ctx.save();
            const sx = b.x + 6;
            const sy = by + 18;
            const sw = b.width - 12;
            const sh = 14;
            ctx.fillStyle = "rgba(4, 9, 20, 0.85)";
            ctx.fillRect(sx, sy, sw, sh);
            ctx.strokeStyle = level.palette.accent;
            ctx.lineWidth = 1;
            ctx.strokeRect(sx, sy, sw, sh);
            ctx.fillStyle = level.palette.accent;
            ctx.font = `bold 8px "${EMBEDDED_FAMILY}", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.signText, sx + sw / 2, sy + sh / 2 + 0.5);
            ctx.restore();
          }
        }

        // H. Horizon Neon Mist Glow
        const mistGrad = ctx.createLinearGradient(0, GROUND_Y - 50, 0, GROUND_Y);
        mistGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        mistGrad.addColorStop(1, level.palette.pylonGlow);
        ctx.fillStyle = mistGrad;
        ctx.globalAlpha = 0.48;
        ctx.fillRect(0, GROUND_Y - 50, GAME_W, 50);
        ctx.globalAlpha = 1.0;

        // I. Laser Conduit Pylons & Gate Portals
        for (const pylon of s.pylons) {
          const px = pylon.x;
          const topStart = 48; // Anchor below top HUD bar
          const topH = Math.max(topStart + 18, pylon.topHeight);
          const botY = pylon.topHeight + pylon.gapSize;
          const botH = GROUND_Y - botY;
          const midX = px + PYLON_WIDTH / 2;

          // Outer neon aura around pylons
          ctx.fillStyle = level.palette.pylonGlow;
          ctx.globalAlpha = 0.2;
          ctx.fillRect(px - 4, topStart, PYLON_WIDTH + 8, topH - topStart);
          ctx.fillRect(px - 4, botY, PYLON_WIDTH + 8, botH);
          ctx.globalAlpha = 1.0;

          // 3D Cylindrical Metallic Shading Gradient
          const pylonGrad = ctx.createLinearGradient(px, 0, px + PYLON_WIDTH, 0);
          pylonGrad.addColorStop(0, "#0b172a");
          pylonGrad.addColorStop(0.2, level.palette.pylonFill);
          pylonGrad.addColorStop(0.5, "#243b55");
          pylonGrad.addColorStop(0.8, level.palette.pylonFill);
          pylonGrad.addColorStop(1, "#0b172a");

          // 1. Top Pylon Body
          ctx.fillStyle = pylonGrad;
          ctx.fillRect(px, topStart, PYLON_WIDTH, topH - topStart);
          ctx.strokeStyle = level.palette.pylonBorder;
          ctx.lineWidth = 2.4;
          ctx.strokeRect(px, topStart, PYLON_WIDTH, topH - topStart);

          // 2. Bottom Pylon Body
          ctx.fillStyle = pylonGrad;
          ctx.fillRect(px, botY, PYLON_WIDTH, botH);
          ctx.strokeRect(px, botY, PYLON_WIDTH, botH);

          // 3. Glowing Interior Plasma Core Tube & Circuit Ribs
          ctx.fillStyle = level.palette.circuitLines;
          ctx.fillRect(midX - 6, topStart + 6, 12, Math.max(0, topH - topStart - 22));
          ctx.fillRect(midX - 6, botY + 18, 12, Math.max(0, botH - 24));

          ctx.fillStyle = level.palette.accent;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(midX - 2.5, topStart + 6, 5, Math.max(0, topH - topStart - 22));
          ctx.fillRect(midX - 2.5, botY + 18, 5, Math.max(0, botH - 24));
          ctx.globalAlpha = 1.0;

          // Horizontal armor ribs
          ctx.fillStyle = level.palette.pylonBorder;
          ctx.globalAlpha = 0.45;
          for (let cy = topStart + 22; cy < topH - 22; cy += 26) {
            ctx.fillRect(px + 5, cy, PYLON_WIDTH - 10, 2.5);
          }
          for (let cy = botY + 28; cy < GROUND_Y - 18; cy += 26) {
            ctx.fillRect(px + 5, cy, PYLON_WIDTH - 10, 2.5);
          }
          ctx.globalAlpha = 1.0;

          // 4. Flanged Capacitor Emitter Caps
          const capH = 18;
          const capOver = 7;
          ctx.fillStyle = "#112238";
          ctx.strokeStyle = level.palette.pylonCap;
          ctx.lineWidth = 2.2;

          // Top Cap
          ctx.fillRect(px - capOver, topH - capH, PYLON_WIDTH + capOver * 2, capH);
          ctx.strokeRect(px - capOver, topH - capH, PYLON_WIDTH + capOver * 2, capH);

          // Bottom Cap
          ctx.fillRect(px - capOver, botY, PYLON_WIDTH + capOver * 2, capH);
          ctx.strokeRect(px - capOver, botY, PYLON_WIDTH + capOver * 2, capH);

          // Capacitor hazard bars & emitter lens glow
          ctx.fillStyle = level.palette.pylonCap;
          ctx.fillRect(px - 2, topH - 8, PYLON_WIDTH + 4, 4);
          ctx.fillRect(px - 2, botY + 4, PYLON_WIDTH + 4, 4);

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(midX - 16, topH - 3, 32, 3);
          ctx.fillRect(midX - 16, botY, 32, 3);

          // 5. Plasma Gate Field & Twin Laser Guide Threads in Gap
          const arcPulse = 0.14 + Math.sin(currentTime * 0.008 + pylon.id) * 0.07;
          ctx.fillStyle = level.palette.accent;
          ctx.globalAlpha = Math.max(0.05, arcPulse);
          ctx.fillRect(px + 6, topH, PYLON_WIDTH - 12, pylon.gapSize);

          // Guide laser threads on edges of gap
          ctx.globalAlpha = 0.55;
          ctx.fillRect(px + 6, topH, 2, pylon.gapSize);
          ctx.fillRect(px + PYLON_WIDTH - 8, topH, 2, pylon.gapSize);
          ctx.globalAlpha = 1.0;

          // 6. Bonus Data Orb
          if (pylon.orb && !pylon.orb.collected) {
            const ox = midX;
            const oy = pylon.orb.y;
            const pulse = 1 + Math.sin(pylon.orb.sparklePhase) * 0.18;

            ctx.save();
            ctx.translate(ox, oy);

            // Outer energy glow ring
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, (ORB_RADIUS + 5) * pulse, 0, Math.PI * 2);
            ctx.stroke();

            // Inner diamond core
            ctx.fillStyle = "#ffd700";
            ctx.beginPath();
            ctx.arc(0, 0, ORB_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, 0, ORB_RADIUS * 0.45, 0, Math.PI * 2);
            ctx.fill();

            // Dual counter-orbiting cyber pixel satellites
            const bitAngle = pylon.orb.sparklePhase * 2.5;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(
              Math.cos(bitAngle) * (ORB_RADIUS + 8) - 2,
              Math.sin(bitAngle) * (ORB_RADIUS + 8) - 2,
              4,
              4,
            );
            ctx.fillStyle = level.palette.accent;
            ctx.fillRect(
              Math.cos(-bitAngle) * (ORB_RADIUS + 8) - 2,
              Math.sin(-bitAngle) * (ORB_RADIUS + 8) - 2,
              4,
              4,
            );

            ctx.restore();
          }
        }

        // J. Cyber Grid Ground Deck
        ctx.fillStyle = level.palette.groundSurface;
        ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);

        // Glowing Hazard Curb Band
        ctx.fillStyle = "rgba(6, 14, 28, 0.95)";
        ctx.fillRect(0, GROUND_Y, GAME_W, 9);
        ctx.save();
        ctx.fillStyle = level.palette.accent;
        ctx.globalAlpha = 0.55;
        for (let hx = s.groundScrollX; hx < GAME_W + 40; hx += 28) {
          ctx.beginPath();
          ctx.moveTo(hx, GROUND_Y + 2);
          ctx.lineTo(hx + 10, GROUND_Y + 2);
          ctx.lineTo(hx + 5, GROUND_Y + 8);
          ctx.lineTo(hx - 5, GROUND_Y + 8);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Ground top border & neon light rail
        ctx.strokeStyle = level.palette.pylonBorder;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(GAME_W, GROUND_Y);
        ctx.stroke();

        // Scrolling perspective vertical grid lines
        ctx.strokeStyle = level.palette.groundGrid;
        ctx.lineWidth = 1.6;
        ctx.globalAlpha = 0.58;
        for (let gx = s.groundScrollX; gx < GAME_W + 40; gx += 36) {
          ctx.beginPath();
          ctx.moveTo(gx, GROUND_Y + 9);
          ctx.lineTo(gx - 32, GAME_H);
          ctx.stroke();
        }
        for (let gy = GROUND_Y + 18; gy < GAME_H; gy += 15) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(GAME_W, gy);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // K. Particles
        for (const p of s.particles) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;

        // L. Floating Texts (+50 ORB etc.)
        ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.textAlign = "center";
        for (const ft of s.floatingTexts) {
          ctx.fillStyle = ft.color;
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1.0;

        // M. Render Ion Trail Ribbon & Cyber-Wing Strike Drone (The Protagonist)
        if (s.mode !== "GAME_OVER") {
          // 0. Ion Ribbon Trail behind the bird
          if (s.birdTrail.length > 1) {
            ctx.save();
            for (let i = 1; i < s.birdTrail.length; i++) {
              const p0 = s.birdTrail[i - 1];
              const p1 = s.birdTrail[i];
              ctx.strokeStyle = level.palette.accent;
              ctx.globalAlpha = Math.max(0, p1.alpha * 0.45);
              ctx.lineWidth = 2 + (i / s.birdTrail.length) * 4;
              ctx.beginPath();
              ctx.moveTo(p0.x, p0.y);
              ctx.lineTo(p1.x, p1.y);
              ctx.stroke();
            }
            ctx.restore();
          }

          ctx.save();
          ctx.translate(BIRD_X, s.birdY);
          ctx.rotate(s.birdAngle);

          // 1. Dual Thruster Nozzle & Multi-Stage Exhaust Flame
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(-19, -5, 7, 10);
          ctx.strokeStyle = level.palette.accent;
          ctx.lineWidth = 1;
          ctx.strokeRect(-19, -5, 7, 10);

          const flameLen = 8 + Math.abs(Math.sin(s.wingTimer)) * 7;
          ctx.fillStyle = level.palette.accent;
          ctx.beginPath();
          ctx.moveTo(-19, -4);
          ctx.lineTo(-19 - flameLen, 0);
          ctx.lineTo(-19, 4);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(-19, -2);
          ctx.lineTo(-19 - flameLen * 0.55, 0);
          ctx.lineTo(-19, 2);
          ctx.closePath();
          ctx.fill();

          // 2. Aerodynamic Cyber Fuselage
          const bodyGrad = ctx.createLinearGradient(-14, -13, 16, 13);
          bodyGrad.addColorStop(0, "#f8fafc");
          bodyGrad.addColorStop(0.5, "#94a3b8");
          bodyGrad.addColorStop(1, "#1e293b");
          ctx.fillStyle = bodyGrad;

          ctx.beginPath();
          ctx.moveTo(19, 0); // nose cone
          ctx.lineTo(5, -13); // upper forehead
          ctx.lineTo(-14, -10); // back upper
          ctx.lineTo(-16, 9); // back lower
          ctx.lineTo(6, 12); // chin
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // Glowing Reactor Core on Flank
          ctx.fillStyle = level.palette.accent;
          ctx.beginPath();
          ctx.arc(-4, 2, 3, 0, Math.PI * 2);
          ctx.fill();

          // 3. Cyber Cockpit Visor
          ctx.fillStyle = level.palette.accent;
          ctx.beginPath();
          ctx.moveTo(5, -8);
          ctx.lineTo(17, -2);
          ctx.lineTo(13, 3);
          ctx.lineTo(4, 2);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(10, -3, 3, 3);

          // 4. Articulated Holographic Plasma Wing (animated flap)
          const wingFlap = Math.sin(s.wingTimer) * 10;
          ctx.save();
          ctx.translate(-4, 0);

          ctx.fillStyle = "#e2e8f0";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-13, -15 + wingFlap);
          ctx.lineTo(7, -8 + wingFlap * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = level.palette.accent;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          ctx.restore();

          // 5. Under-beak laser probe
          ctx.fillStyle = "#ffd700";
          ctx.fillRect(14, 3, 6, 2);

          ctx.restore();
        }

        // N. HUD Overlay (Top Bar)
        renderHUD(ctx, s, level);

        // O. Framed Holographic Modals & Banner Overlays
        if (s.mode === "READY") {
          renderReadyOverlay(ctx, s, level);
        } else if (s.mode === "PAUSED") {
          ctx.save();
          ctx.fillStyle = "rgba(2, 6, 18, 0.68)";
          ctx.fillRect(0, 48, GAME_W, GROUND_Y - 48);
          const { my } = drawCyberModalBox(ctx, 420, 180, "#ffd700");
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = `bold 32px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = "#ffd700";
          ctx.fillText("GAME PAUSED", GAME_W / 2, my + 68);
          ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = "#e2e8f0";
          ctx.fillText("[ PRESS PAUSE OR FLAP TO RESUME ]", GAME_W / 2, my + 122);
          ctx.restore();
        } else if (s.mode === "LEVEL_CLEAR") {
          renderLevelClearOverlay(ctx, s, level);
        } else if (s.mode === "VICTORY") {
          renderVictoryOverlay(ctx, s);
        } else if (s.mode === "GAME_OVER") {
          renderGameOverOverlay(ctx, s);
        }

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [spawnPylonAt, startLevel]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#02040a",
        position: "relative",
        userSelect: "none",
        cursor: "pointer",
        overflow: "hidden",
      }}
      onClick={flap}
      role="application"
      aria-label="Cyber Flappy Arcade Game"
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          imageRendering: "pixelated",
          boxShadow: "0 0 24px rgba(0, 240, 255, 0.15)",
        }}
      />
    </div>
  );
}
