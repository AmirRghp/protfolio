import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  FAST_FALL_ACCEL,
  GAME_H,
  GAME_W,
  GRAVITY,
  GROUND_Y,
  JUMP_IMPULSE,
  RAPTOR_DUCK_H,
  RAPTOR_DUCK_W,
  RAPTOR_UPRIGHT_H,
  RAPTOR_UPRIGHT_W,
  RAPTOR_X,
  SECTOR_CONFIGS,
  SHORT_HOP_CUTOFF,
  TOTAL_SECTORS,
  VICTORY_DISTANCE,
  DISTANCE_SCALE,
  checkCollectiblePickup,
  checkRaptorCollision,
  createCollectible,
  createObstacle,
  getRaptorHitbox,
  getSectorProgress,
  type Collectible,
  type Obstacle,
  type ObstacleType,
  type RaptorState,
} from "./pixelRunLevels";
import { pixelRunAudio } from "./pixelRunAudio";

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
      const face = new (
        window as unknown as {
          FontFace: new (family: string, source: string) => { load: () => Promise<unknown> };
        }
      ).FontFace(EMBEDDED_FAMILY, src);
      const loaded = await face.load();
      (document as unknown as { fonts: { add: (f: unknown) => void } }).fonts.add(loaded);
    } catch {
      /* fallback to monospace */
    }
  })();
  return embeddedFontPromise;
}

export type PixelRunGameMode = "READY" | "RUNNING" | "PAUSED" | "SECTOR_WARP" | "VICTORY" | "GAME_OVER";

export type PixelParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
};

export type FloatingNotice = {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
};

export type FarMegastructure = {
  x: number;
  width: number;
  height: number;
  roofStyle: "pyramid" | "stepped" | "spire" | "flat";
  coreStripX: number;
};

export type CyberBuilding = {
  x: number;
  width: number;
  height: number;
  roofType: "bevel" | "antenna" | "crown" | "flat";
  signText?: string;
  windows: { x: number; y: number; w: number; h: number; on: boolean; accentTint: boolean }[];
};

export type StreetArch = {
  x: number;
  height: number;
};

export type TrafficStreak = {
  x: number;
  y: number;
  length: number;
  speed: number;
  dir: 1 | -1;
  isAccent: boolean;
};

export type Star = {
  x: number;
  y: number;
  size: number;
  twinkle: number;
  tint: "white" | "cyan" | "accent";
};

export type RaptorGhost = {
  x: number;
  y: number;
  isDucking: boolean;
  isGrounded: boolean;
  alpha: number;
};

export type PixelRunGameProps = {
  onExit?: () => void;
};

const STORAGE_KEY_HIGH_SCORE = "pixel_run_highscore";
const SIGN_LABELS = ["NEXUS", "CYBER", "SYNTH", "CORE", "GRID", "PULSE", "VORTEX"];

export default function PixelRunGame({ onExit }: PixelRunGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const gameState = useRef<{
    mode: PixelRunGameMode;
    sectorIndex: number;
    distance: number;
    score: number;
    highScore: number;
    coresCollected: number;
    raptor: RaptorState;
    raptorTrail: RaptorGhost[];
    scaleX: number;
    scaleY: number;
    obstacles: Obstacle[];
    collectibles: Collectible[];
    nextSpawnDistance: number;
    particles: PixelParticle[];
    floatingNotices: FloatingNotice[];
    stars: Star[];
    traffic: TrafficStreak[];
    farBuildings: FarMegastructure[];
    buildings: CyberBuilding[];
    streetArches: StreetArch[];
    groundScrollX: number;
    screenShake: number;
    warpTimer: number;
    isEndless: boolean;
    lastMilestone: number;
    jumpKeyPressed: boolean;
    duckKeyPressed: boolean;
  }>({
    mode: "READY",
    sectorIndex: 0,
    distance: 0,
    score: 0,
    highScore: 0,
    coresCollected: 0,
    raptor: {
      x: RAPTOR_X,
      y: GROUND_Y - RAPTOR_UPRIGHT_H,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      hasShield: false,
      runFrame: 0,
      frameTimer: 0,
    },
    raptorTrail: [],
    scaleX: 1,
    scaleY: 1,
    obstacles: [],
    collectibles: [],
    nextSpawnDistance: 380,
    particles: [],
    floatingNotices: [],
    stars: [],
    traffic: [],
    farBuildings: [],
    buildings: [],
    streetArches: [],
    groundScrollX: 0,
    screenShake: 0,
    warpTimer: 0,
    isEndless: false,
    lastMilestone: 0,
    jumpKeyPressed: false,
    duckKeyPressed: false,
  });

  // Initialize multi-layer cyberpunk world
  useEffect(() => {
    const s: Star[] = [];
    for (let i = 0; i < 60; i++) {
      s.push({
        x: Math.random() * GAME_W,
        y: 58 + Math.random() * (GROUND_Y - 210),
        size: Math.random() < 0.22 ? 2.5 : Math.random() < 0.6 ? 1.6 : 1.0,
        twinkle: Math.random() * Math.PI * 2,
        tint: Math.random() < 0.25 ? "accent" : Math.random() < 0.5 ? "cyan" : "white",
      });
    }
    gameState.current.stars = s;

    // Aerial traffic streaks
    const traffic: TrafficStreak[] = [];
    for (let i = 0; i < 9; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      traffic.push({
        x: Math.random() * GAME_W,
        y: 135 + (i % 4) * 48 + Math.random() * 18,
        length: 18 + Math.random() * 28,
        speed: (35 + Math.random() * 55) * dir,
        dir,
        isAccent: i % 3 === 0,
      });
    }
    gameState.current.traffic = traffic;

    // Layer 1: Far Megastructures
    const farB: FarMegastructure[] = [];
    let farX = 0;
    const roofStyles: FarMegastructure["roofStyle"][] = ["pyramid", "stepped", "spire", "flat"];
    while (farX < GAME_W + 360) {
      const width = 75 + Math.random() * 95;
      const height = 200 + Math.random() * 145;
      farB.push({
        x: farX,
        width,
        height,
        roofStyle: roofStyles[Math.floor(Math.random() * roofStyles.length)],
        coreStripX: 0.3 + Math.random() * 0.4,
      });
      farX += width + 8 + Math.random() * 18;
    }
    gameState.current.farBuildings = farB;

    // Layer 2: Mid-ground Cyber Towers
    const b: CyberBuilding[] = [];
    let curX = 0;
    const roofTypes: CyberBuilding["roofType"][] = ["bevel", "antenna", "crown", "flat"];
    let idx = 0;
    while (curX < GAME_W + 320) {
      const width = 52 + Math.random() * 68;
      const height = 115 + Math.random() * 165;
      const windows: CyberBuilding["windows"] = [];
      const cols = Math.max(2, Math.floor((width - 14) / 13));
      const rows = Math.max(3, Math.floor((height - 28) / 18));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          windows.push({
            x: 8 + c * 13,
            y: 18 + r * 18,
            w: 7,
            h: 10,
            on: Math.random() < 0.48,
            accentTint: Math.random() < 0.3,
          });
        }
      }
      b.push({
        x: curX,
        width,
        height,
        roofType: roofTypes[idx % roofTypes.length],
        signText: idx % 2 === 0 ? SIGN_LABELS[idx % SIGN_LABELS.length] : undefined,
        windows,
      });
      curX += width + 10 + Math.random() * 22;
      idx++;
    }
    gameState.current.buildings = b;

    // Layer 3: Foreground Highway Light Gantries
    const arches: StreetArch[] = [];
    for (let ax = 120; ax < GAME_W + 340; ax += 280) {
      arches.push({
        x: ax,
        height: 155,
      });
    }
    gameState.current.streetArches = arches;

    // Load High Score from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
      if (saved) {
        gameState.current.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      /* ignore */
    }
  }, []);

  const spawnParticles = useCallback(
    (x: number, y: number, color: string, count: number, speed = 3, size = 3) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const v = (Math.random() * 0.7 + 0.3) * speed;
        gameState.current.particles.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          color,
          size: Math.random() * size + 1.5,
          alpha: 1,
          decay: 0.025 + Math.random() * 0.03,
        });
      }
    },
    [],
  );

  const addNotice = useCallback((text: string, x: number, y: number, color: string) => {
    gameState.current.floatingNotices.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.2,
    });
  }, []);

  const resetGame = useCallback((startEndless = false) => {
    const state = gameState.current;
    state.mode = "RUNNING";
    state.sectorIndex = startEndless ? 4 : 0;
    state.distance = 0;
    state.score = 0;
    state.coresCollected = 0;
    state.lastMilestone = 0;
    state.isEndless = startEndless;
    state.obstacles = [];
    state.collectibles = [];
    state.particles = [];
    state.floatingNotices = [];
    state.raptorTrail = [];
    state.scaleX = 1;
    state.scaleY = 1;
    state.nextSpawnDistance = 340;
    state.screenShake = 0;
    state.raptor = {
      x: RAPTOR_X,
      y: GROUND_Y - RAPTOR_UPRIGHT_H,
      vy: 0,
      isGrounded: true,
      isDucking: false,
      hasShield: false,
      runFrame: 0,
      frameTimer: 0,
    };

    if (!pixelRunAudio.isMusicActive() && !pixelRunAudio.getIsMuted()) {
      pixelRunAudio.startMusic();
    }
  }, []);

  const handleJumpPress = useCallback(() => {
    const state = gameState.current;
    if (state.mode === "PAUSED") {
      state.mode = "RUNNING";
      return;
    }
    if (state.mode === "READY") {
      resetGame(false);
      return;
    }
    if (state.mode === "GAME_OVER") {
      resetGame(false);
      return;
    }
    if (state.mode === "VICTORY") {
      resetGame(true);
      return;
    }
    if (state.mode !== "RUNNING" && state.mode !== "SECTOR_WARP") return;

    if (state.raptor.isGrounded) {
      state.raptor.vy = JUMP_IMPULSE;
      state.raptor.isGrounded = false;
      state.raptor.isDucking = false;
      state.jumpKeyPressed = true;
      state.scaleX = 0.86;
      state.scaleY = 1.16;
      pixelRunAudio.playJump();

      spawnParticles(
        state.raptor.x + 14,
        state.raptor.y + RAPTOR_UPRIGHT_H,
        "#00f0ff",
        10,
        4.2,
        4,
      );
    }
  }, [resetGame, spawnParticles]);

  const handleJumpRelease = useCallback(() => {
    const state = gameState.current;
    state.jumpKeyPressed = false;
    if (!state.raptor.isGrounded && state.raptor.vy < SHORT_HOP_CUTOFF) {
      state.raptor.vy = SHORT_HOP_CUTOFF;
    }
  }, []);

  const handleDuckPress = useCallback(() => {
    const state = gameState.current;
    state.duckKeyPressed = true;
    if (state.mode !== "RUNNING" && state.mode !== "SECTOR_WARP") return;

    if (state.raptor.isGrounded) {
      if (!state.raptor.isDucking) {
        state.raptor.isDucking = true;
        state.scaleX = 1.18;
        state.scaleY = 0.82;
        pixelRunAudio.playDuck();
      }
    } else {
      state.raptor.vy += FAST_FALL_ACCEL * 7;
      pixelRunAudio.playDuck();
    }
  }, []);

  const handleDuckRelease = useCallback(() => {
    const state = gameState.current;
    state.duckKeyPressed = false;
    state.raptor.isDucking = false;
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P" || e.code === "KeyP") {
        e.preventDefault();
        const state = gameState.current;
        if (state.mode === "RUNNING") {
          state.mode = "PAUSED";
        } else if (state.mode === "PAUSED") {
          state.mode = "RUNNING";
        } else if (state.mode === "READY") {
          resetGame(false);
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
        handleJumpPress();
      } else if (e.code === "ArrowDown" || e.code === "KeyS" || e.key === "ArrowDown") {
        e.preventDefault();
        handleDuckPress();
      } else if (e.code === "KeyM" || e.key === "m" || e.key === "M") {
        e.preventDefault();
        const active = pixelRunAudio.toggleMusic();
        addNotice(
          active ? "BGM: ON" : "BGM: OFF",
          GAME_W / 2,
          120,
          active ? "#00f0ff" : "#ff4466",
        );
      } else if (e.code === "Escape" || e.key === "Escape") {
        e.preventDefault();
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.key === " " ||
        e.key === "ArrowUp"
      ) {
        e.preventDefault();
        handleJumpRelease();
      } else if (e.code === "ArrowDown" || e.code === "KeyS" || e.key === "ArrowDown") {
        e.preventDefault();
        handleDuckRelease();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleJumpPress, handleJumpRelease, handleDuckPress, handleDuckRelease, addNotice, onExit, resetGame]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeY = (e.clientY - rect.top) / rect.height;

      if (relativeY < 0.65) {
        handleJumpPress();
      } else {
        handleDuckPress();
      }
    },
    [handleJumpPress, handleDuckPress],
  );

  const handlePointerUp = useCallback(() => {
    handleJumpRelease();
    handleDuckRelease();
  }, [handleJumpRelease, handleDuckRelease]);

  // Main 60fps Game Loop
  useLayoutEffect(() => {
    ensureEmbeddedFont();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();
    let trailTimer = 0;

    const updateCanvasSize = () => {
      if (canvas.width !== GAME_W || canvas.height !== GAME_H) {
        canvas.width = GAME_W;
        canvas.height = GAME_H;
      }
    };
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      ctx.save();
      ctx.scale(canvas.width / GAME_W, canvas.height / GAME_H);

      const state = gameState.current;
      const currentSector = SECTOR_CONFIGS[state.sectorIndex] ?? SECTOR_CONFIGS[0];
      const palette = currentSector.palette;

      // Damped squash & stretch recovery
      state.scaleX += (1 - state.scaleX) * Math.min(1, dt * 14);
      state.scaleY += (1 - state.scaleY) * Math.min(1, dt * 14);

      // Screen shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (state.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * state.screenShake * 5;
        shakeY = (Math.random() - 0.5) * state.screenShake * 5;
        state.screenShake = Math.max(0, state.screenShake - dt * 2.5);
      }
      ctx.translate(shakeX, shakeY);

      // --- AMBIENT TRAFFIC UPDATE ---
      for (const tr of state.traffic) {
        tr.x += tr.speed * dt;
        if (tr.dir === 1 && tr.x > GAME_W + 60) tr.x = -60;
        if (tr.dir === -1 && tr.x < -60) tr.x = GAME_W + 60;
      }

      // --- GAMEPLAY UPDATE ---
      if (state.mode === "RUNNING" || state.mode === "SECTOR_WARP") {
        const speed = currentSector.speed * (state.isEndless ? 1.25 : 1.0);
        const distStep = speed * 60 * dt * DISTANCE_SCALE;
        state.distance += distStep;
        state.score += distStep * 3;

        state.groundScrollX = (state.groundScrollX + speed * 60 * dt) % 64;

        // Check 100m milestones
        const currentMilestone = Math.floor(state.distance / 100);
        if (currentMilestone > state.lastMilestone) {
          state.lastMilestone = currentMilestone;
          pixelRunAudio.playMilestone();
          addNotice(
            `${currentMilestone * 100}M`,
            state.raptor.x + 30,
            state.raptor.y - 20,
            "#ffff00",
          );
        }

        // Campaign Sector Warp Progression
        if (!state.isEndless) {
          if (
            state.distance >= currentSector.targetDistance &&
            state.sectorIndex < TOTAL_SECTORS - 1
          ) {
            state.sectorIndex++;
            state.mode = "SECTOR_WARP";
            state.warpTimer = 2.0;
            pixelRunAudio.playSectorWarp();
            state.score += 500;
            addNotice(
              `SECTOR ${state.sectorIndex + 1}: ${SECTOR_CONFIGS[state.sectorIndex].name}`,
              GAME_W / 2,
              220,
              SECTOR_CONFIGS[state.sectorIndex].palette.accent,
            );
          } else if (
            state.distance >= VICTORY_DISTANCE &&
            state.sectorIndex === TOTAL_SECTORS - 1
          ) {
            state.mode = "VICTORY";
            pixelRunAudio.playVictory();
            state.score += 2500;
            const currentTotalScore = Math.floor(state.score);
            if (currentTotalScore > state.highScore) {
              state.highScore = currentTotalScore;
              try {
                localStorage.setItem(STORAGE_KEY_HIGH_SCORE, state.highScore.toString());
              } catch {
                /* ignore */
              }
            }
          }
        }

        if (state.mode === "SECTOR_WARP") {
          state.warpTimer -= dt;
          if (state.warpTimer <= 0) {
            state.mode = "RUNNING";
          }
        }

        // Physics: Raptor Jump & Gravity
        const raptor = state.raptor;
        if (!raptor.isGrounded) {
          raptor.vy += GRAVITY * (state.duckKeyPressed ? 2.4 : 1.0);
          raptor.y += raptor.vy;

          if (raptor.y >= GROUND_Y - RAPTOR_UPRIGHT_H) {
            raptor.y = GROUND_Y - RAPTOR_UPRIGHT_H;
            raptor.vy = 0;
            raptor.isGrounded = true;
            state.scaleX = 1.2;
            state.scaleY = 0.8;
            pixelRunAudio.playLand();
            spawnParticles(raptor.x + 20, GROUND_Y, palette.accent, 6, 2.5, 2.8);
            if (state.duckKeyPressed) {
              raptor.isDucking = true;
            }
          }
        }

        // Record motion trail ghosts when jumping, duck-sliding, or warping
        trailTimer += dt;
        if (trailTimer >= 0.035) {
          trailTimer = 0;
          if (!raptor.isGrounded || raptor.isDucking || state.mode === "SECTOR_WARP") {
            state.raptorTrail.push({
              x: raptor.x,
              y: raptor.isDucking && raptor.isGrounded ? GROUND_Y - RAPTOR_DUCK_H : raptor.y,
              isDucking: raptor.isDucking && raptor.isGrounded,
              isGrounded: raptor.isGrounded,
              alpha: 0.48,
            });
            if (state.raptorTrail.length > 6) {
              state.raptorTrail.shift();
            }
          }
        }

        // Running Frame Animation
        raptor.frameTimer += dt * speed;
        if (raptor.frameTimer > 0.1) {
          raptor.runFrame = (raptor.runFrame + 1) % 4;
          raptor.frameTimer = 0;

          if (raptor.isGrounded && !raptor.isDucking && raptor.runFrame % 2 === 0) {
            spawnParticles(raptor.x + 8, GROUND_Y - 2, palette.groundSurface, 2, 1.6, 2);
          }
        }

        // Sliding sparks when ducking on ground
        if (raptor.isGrounded && raptor.isDucking && Math.random() < 0.65) {
          spawnParticles(
            raptor.x + RAPTOR_DUCK_W * 0.35,
            GROUND_Y - 2,
            palette.accent,
            2,
            3.2,
            2.5,
          );
        }

        const moveDist = speed * 60 * dt;

        // Scroll trail ghosts with world
        for (let i = state.raptorTrail.length - 1; i >= 0; i--) {
          const g = state.raptorTrail[i];
          g.x -= moveDist * 0.45;
          g.alpha -= dt * 2.2;
          if (g.alpha <= 0) state.raptorTrail.splice(i, 1);
        }

        // Update Obstacles Movement
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.x -= moveDist;

          if (obs.isFlying) {
            obs.wingAngle = (obs.wingAngle || 0) + dt * 16;
          }
          if (obs.type === "laser_barrier") {
            obs.pulseTimer = (obs.pulseTimer || 0) + dt * 10;
          }

          if (obs.x + obs.w < -80) {
            state.obstacles.splice(i, 1);
          }
        }

        // Update Collectibles Movement
        for (let i = state.collectibles.length - 1; i >= 0; i--) {
          const item = state.collectibles[i];
          item.x -= moveDist;

          if (!item.collected && checkCollectiblePickup(raptor, item)) {
            item.collected = true;
            if (item.type === "core") {
              state.score += 100;
              state.coresCollected++;
              pixelRunAudio.playCollect();
              addNotice("+100 CORE", item.x, item.y - 15, "#00f0ff");
              spawnParticles(item.x, item.y, "#00f0ff", 14, 4.2, 3.2);
            } else if (item.type === "shield") {
              raptor.hasShield = true;
              pixelRunAudio.playCollect();
              addNotice("SHIELD READY", item.x, item.y - 15, "#ffff00");
              spawnParticles(item.x, item.y, "#ffff00", 18, 5, 4);
            }
          }

          if (item.x + item.radius < -50 || item.collected) {
            state.collectibles.splice(i, 1);
          }
        }

        // Procedural Spawning
        state.nextSpawnDistance -= moveDist;
        if (state.nextSpawnDistance <= 0) {
          const allowed = currentSector.allowedObstacles;
          const chosenType: ObstacleType =
            allowed[Math.floor(Math.random() * allowed.length)] || "spike_single";

          const newObs = createObstacle(chosenType, GAME_W + 50);
          state.obstacles.push(newObs);

          if (Math.random() < 0.35) {
            const isShield = Math.random() < 0.12 && !raptor.hasShield;
            const altitude = Math.random() < 0.5 ? "low" : "high";
            const colType = isShield ? "shield" : "core";
            state.collectibles.push(
              createCollectible(colType, GAME_W + 50 + (Math.random() * 80 + 50), altitude),
            );
          }

          const gap =
            currentSector.minSpawnDist +
            Math.random() * (currentSector.maxSpawnDist - currentSector.minSpawnDist);
          state.nextSpawnDistance = gap;
        }

        // Check Collisions
        for (const obs of state.obstacles) {
          if (checkRaptorCollision(raptor, obs)) {
            if (raptor.hasShield) {
              raptor.hasShield = false;
              pixelRunAudio.playShieldBreak();
              state.screenShake = 1.0;
              addNotice("SHIELD BROKE!", raptor.x + 20, raptor.y - 15, "#ff3333");
              spawnParticles(raptor.x + 20, raptor.y + 20, "#ffff00", 22, 6, 4);
              obs.x = -120;
            } else {
              state.mode = "GAME_OVER";
              state.screenShake = 2.2;
              pixelRunAudio.playCrash();
              spawnParticles(raptor.x + 20, raptor.y + 20, "#ff0044", 32, 8, 5);
              spawnParticles(raptor.x + 20, raptor.y + 20, palette.accent, 22, 6, 3.5);

              const currentTotalScore = Math.floor(state.score);
              if (currentTotalScore > state.highScore) {
                state.highScore = currentTotalScore;
                try {
                  localStorage.setItem(STORAGE_KEY_HIGH_SCORE, state.highScore.toString());
                } catch {
                  /* ignore */
                }
              }
              break;
            }
          }
        }
      }

      // Update Particles
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          state.particles.splice(i, 1);
        }
      }

      // Update Floating Notices
      for (let i = state.floatingNotices.length - 1; i >= 0; i--) {
        const n = state.floatingNotices[i];
        n.y += n.vy;
        n.alpha -= dt * 0.9;
        if (n.alpha <= 0) {
          state.floatingNotices.splice(i, 1);
        }
      }

      // =======================================================================
      // --- RENDERING: MULTI-LAYER CYBERPUNK ENVIRONMENT ---
      // =======================================================================

      // 1. Deep Atmospheric Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, palette.skyTop);
      skyGrad.addColorStop(0.65, palette.skyBottom);
      skyGrad.addColorStop(1, palette.groundUnder);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // Subtle upper-sky cyber grid telemetry lines
      ctx.save();
      ctx.strokeStyle = palette.accent;
      ctx.globalAlpha = 0.05;
      ctx.lineWidth = 1;
      for (let gy = 70; gy < 220; gy += 36) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(GAME_W, gy);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Stars & Nebula Shimmer
      state.stars.forEach((s) => {
        const alpha = 0.35 + Math.sin(time * 0.0035 + s.twinkle) * 0.4;
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillStyle =
          s.tint === "accent" ? palette.accent : s.tint === "cyan" ? "#70f8ff" : "#ffffff";
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1.0;

      // 3. Synthwave Segmented Cyber-Sun / Reactor Core on Horizon
      const sunX = GAME_W * 0.68;
      const sunY = 195;
      const sunR = 92;
      ctx.save();
      const haloGrad = ctx.createRadialGradient(sunX, sunY, sunR * 0.15, sunX, sunY, sunR * 2.5);
      haloGrad.addColorStop(0, "rgba(255, 42, 133, 0.36)");
      haloGrad.addColorStop(0.45, palette.glow);
      haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = haloGrad;
      ctx.fillRect(sunX - sunR * 2.6, sunY - sunR * 2.6, sunR * 5.2, sunR * 5.2);

      // Dual outer orbital telemetry rings around the sun
      ctx.strokeStyle = palette.accent;
      ctx.globalAlpha = 0.36;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR + 14, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#ff2a85";
      ctx.globalAlpha = 0.24;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR + 26, 0, Math.PI * 2);
      ctx.stroke();

      // Sun disc with horizontal synthwave scanline cutouts
      ctx.globalAlpha = 0.9;
      const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + sunR);
      sunGrad.addColorStop(0, "#fff07c");
      sunGrad.addColorStop(0.42, "#ff2a85");
      sunGrad.addColorStop(0.85, palette.accent);
      sunGrad.addColorStop(1, palette.obstacleFill);
      ctx.fillStyle = sunGrad;

      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      // Slice horizontal scanline bars out of the lower half of the sun
      ctx.fillStyle = palette.skyTop;
      ctx.globalAlpha = 0.88;
      for (let slice = 0; slice < 7; slice++) {
        const sy = sunY + 6 + slice * 12;
        const sh = 2.2 + slice * 1.15;
        ctx.fillRect(sunX - sunR - 2, sy, sunR * 2 + 4, sh);
      }
      ctx.restore();

      const isMoving = state.mode === "RUNNING" || state.mode === "SECTOR_WARP";
      const worldSpeed = isMoving ? currentSector.speed * (state.isEndless ? 1.25 : 1.0) : 0;

      // 4. Layer 1: Far Megastructure Silhouettes (Slow Parallax)
      const farSpeed = worldSpeed * 4.5;
      ctx.save();
      state.farBuildings.forEach((fb) => {
        fb.x -= farSpeed * dt;
        if (fb.x + fb.width < -90) {
          fb.x = GAME_W + 60 + Math.random() * 90;
        }
        const topY = GROUND_Y - fb.height;
        ctx.fillStyle = palette.skyTop;
        ctx.globalAlpha = 0.72;
        ctx.fillRect(fb.x, topY, fb.width, fb.height);

        // Roof silhouette shapes
        ctx.beginPath();
        if (fb.roofStyle === "pyramid") {
          ctx.moveTo(fb.x, topY);
          ctx.lineTo(fb.x + fb.width / 2, topY - 28);
          ctx.lineTo(fb.x + fb.width, topY);
        } else if (fb.roofStyle === "stepped") {
          ctx.rect(fb.x + fb.width * 0.18, topY - 18, fb.width * 0.64, 18);
          ctx.rect(fb.x + fb.width * 0.35, topY - 34, fb.width * 0.3, 16);
        } else if (fb.roofStyle === "spire") {
          ctx.rect(fb.x + fb.width * 0.46, topY - 42, 4, 42);
        }
        ctx.fill();

        // Subtle rim outline & vertical energy slit
        ctx.strokeStyle = palette.accent;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = 1;
        ctx.strokeRect(fb.x, topY, fb.width, fb.height);

        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.22;
        ctx.fillRect(fb.x + fb.width * fb.coreStripX, topY + 20, 2, fb.height - 40);
      });
      ctx.restore();

      // 5. High-Altitude Aerial Cruiser Traffic Lanes
      ctx.save();
      for (const tr of state.traffic) {
        const tailColor = tr.isAccent ? palette.accent : "#ff2a6d";
        const grad = ctx.createLinearGradient(
          tr.x,
          tr.y,
          tr.x - tr.length * tr.dir,
          tr.y,
        );
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(0.3, tailColor);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y);
        ctx.lineTo(tr.x - tr.length * tr.dir, tr.y);
        ctx.stroke();
      }
      ctx.restore();

      // 6. Layer 2: Mid-Ground Cyber Skyscrapers (Medium Parallax)
      const bSpeed = worldSpeed * 13;
      state.buildings.forEach((b) => {
        b.x -= bSpeed * dt;
        if (b.x + b.width < -70) {
          b.x = GAME_W + 60 + Math.random() * 80;
        }

        const by = GROUND_Y - b.height;

        // Building shaded body
        const bGrad = ctx.createLinearGradient(b.x, by, b.x + b.width, GROUND_Y);
        bGrad.addColorStop(0, palette.skyline);
        bGrad.addColorStop(1, palette.skyTop);
        ctx.fillStyle = bGrad;
        ctx.fillRect(b.x, by, b.width, b.height);

        // Architectural roof details
        if (b.roofType === "bevel") {
          ctx.beginPath();
          ctx.moveTo(b.x, by);
          ctx.lineTo(b.x + 14, by - 14);
          ctx.lineTo(b.x + b.width - 14, by - 14);
          ctx.lineTo(b.x + b.width, by);
          ctx.closePath();
          ctx.fill();
        } else if (b.roofType === "antenna") {
          ctx.fillStyle = palette.accent;
          ctx.fillRect(b.x + b.width * 0.3, by - 22, 2, 22);
          // Blinking beacon
          if (Math.sin(time * 0.006 + b.width) > 0) {
            ctx.fillStyle = "#ff0055";
            ctx.fillRect(b.x + b.width * 0.3 - 2, by - 25, 6, 4);
          }
        } else if (b.roofType === "crown") {
          ctx.fillStyle = palette.obstacleFill;
          ctx.fillRect(b.x + 6, by - 10, b.width - 12, 10);
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 1;
          ctx.strokeRect(b.x + 6, by - 10, b.width - 12, 10);
        }

        // Building neon border
        ctx.strokeStyle = palette.glow;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(b.x, by, b.width, b.height);

        // Windows
        b.windows.forEach((w) => {
          if (w.on) {
            ctx.fillStyle = w.accentTint ? palette.textAccent : palette.accent;
            ctx.globalAlpha = w.accentTint ? 0.55 : 0.32;
            ctx.fillRect(b.x + w.x, by + w.y, w.w, w.h);
          }
        });
        ctx.globalAlpha = 1.0;

        // Holographic Neon Signboard on select towers
        if (b.signText && b.width >= 58) {
          ctx.save();
          const sx = b.x + 8;
          const sy = by + 22;
          const sw = b.width - 16;
          const sh = 16;
          ctx.fillStyle = "rgba(4, 10, 22, 0.85)";
          ctx.fillRect(sx, sy, sw, sh);
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 1;
          ctx.strokeRect(sx, sy, sw, sh);
          ctx.fillStyle = palette.textAccent;
          ctx.font = `bold 9px "${EMBEDDED_FAMILY}", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.signText, sx + sw / 2, sy + sh / 2 + 0.5);
          ctx.restore();
        }
      });

      // 7. Horizon Atmospheric Neon Haze
      const mistGrad = ctx.createLinearGradient(0, GROUND_Y - 55, 0, GROUND_Y);
      mistGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
      mistGrad.addColorStop(1, palette.glow);
      ctx.fillStyle = mistGrad;
      ctx.globalAlpha = 0.45;
      ctx.fillRect(0, GROUND_Y - 55, GAME_W, 55);
      ctx.globalAlpha = 1.0;

      // 8. Layer 3: Foreground Highway Light Gantries (Fast Parallax)
      const archSpeed = worldSpeed * 32;
      ctx.save();
      state.streetArches.forEach((arch) => {
        arch.x -= archSpeed * dt;
        if (arch.x < -80) {
          arch.x += 280 * state.streetArches.length;
        }
        const ay = GROUND_Y - arch.height;

        // Volumetric light cone Downward
        const coneGrad = ctx.createLinearGradient(arch.x, ay + 8, arch.x, GROUND_Y);
        coneGrad.addColorStop(0, palette.glow);
        coneGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = coneGrad;
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.moveTo(arch.x - 10, ay + 8);
        ctx.lineTo(arch.x + 26, ay + 8);
        ctx.lineTo(arch.x + 65, GROUND_Y);
        ctx.lineTo(arch.x - 45, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Steel support mast & cantilever lamp arm
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = "#0b1528";
        ctx.strokeStyle = palette.groundGrid;
        ctx.lineWidth = 1.5;
        ctx.fillRect(arch.x - 3, ay, 6, arch.height);
        ctx.strokeRect(arch.x - 3, ay, 6, arch.height);

        // Overhanging neon luminaire head
        ctx.fillStyle = palette.accent;
        ctx.fillRect(arch.x - 8, ay, 30, 5);
      });
      ctx.restore();

      // 9. Ground Highway Deck & 3D Synthwave Perspective Grid
      ctx.fillStyle = palette.groundUnder;
      ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);

      // Glowing Highway Curb Strip with Hazard Ticks
      ctx.fillStyle = "rgba(8, 18, 36, 0.95)";
      ctx.fillRect(0, GROUND_Y, GAME_W, 10);

      ctx.save();
      ctx.fillStyle = palette.accent;
      ctx.globalAlpha = 0.55;
      for (let hx = -state.groundScrollX; hx < GAME_W + 64; hx += 32) {
        ctx.beginPath();
        ctx.moveTo(hx, GROUND_Y + 2);
        ctx.lineTo(hx + 12, GROUND_Y + 2);
        ctx.lineTo(hx + 6, GROUND_Y + 9);
        ctx.lineTo(hx - 6, GROUND_Y + 9);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // Primary Neon Highway Surface Rail
      ctx.strokeStyle = palette.groundSurface;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_W, GROUND_Y);
      ctx.stroke();

      // Secondary curb bottom line
      ctx.strokeStyle = palette.groundGrid;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 10);
      ctx.lineTo(GAME_W, GROUND_Y + 10);
      ctx.stroke();

      // Animated scrolling 3D perspective road lines below curb
      ctx.strokeStyle = palette.groundGrid;
      ctx.lineWidth = 2;
      for (let x = -state.groundScrollX; x < GAME_W + 64; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y + 10);
        ctx.lineTo(x - 36, GAME_H);
        ctx.stroke();
      }

      // Horizontal perspective grid lines below ground
      const horizGridYs = [GROUND_Y + 24, GROUND_Y + 44, GROUND_Y + 68];
      horizGridYs.forEach((gy) => {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(GAME_W, gy);
        ctx.stroke();
      });

      // 10. Render Obstacles
      state.obstacles.forEach((obs) => {
        ctx.save();
        ctx.strokeStyle = palette.obstacleBorder;
        ctx.fillStyle = palette.obstacleFill;
        ctx.lineWidth = 2;

        if (obs.type === "spike_single") {
          // Outer neon hazard aura
          ctx.fillStyle = palette.glow;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w / 2, obs.y - 6);
          ctx.lineTo(obs.x + obs.w + 5, obs.y + obs.h);
          ctx.lineTo(obs.x - 5, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();

          // Metallic emitter base plate
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(obs.x - 2, obs.y + obs.h - 5, obs.w + 4, 5);
          ctx.strokeRect(obs.x - 2, obs.y + obs.h - 5, obs.w + 4, 5);

          // Faceted plasma crystal spire
          const spireGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.h);
          spireGrad.addColorStop(0, "#ffffff");
          spireGrad.addColorStop(0.35, palette.accent);
          spireGrad.addColorStop(1, palette.obstacleFill);
          ctx.fillStyle = spireGrad;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h - 5);
          ctx.lineTo(obs.x, obs.y + obs.h - 5);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Internal bright core conduit
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(obs.x + obs.w / 2 - 1.5, obs.y + 8, 3, obs.h - 15);
        } else if (obs.type === "spike_double") {
          const half = obs.w / 2;
          ctx.fillStyle = palette.glow;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w / 2, obs.y - 6);
          ctx.lineTo(obs.x + obs.w + 5, obs.y + obs.h);
          ctx.lineTo(obs.x - 5, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#0f172a";
          ctx.fillRect(obs.x - 2, obs.y + obs.h - 5, obs.w + 4, 5);
          for (let k = 0; k < 2; k++) {
            const ox = obs.x + k * half;
            const topOffset = k === 1 ? 6 : 0;
            const spireGrad = ctx.createLinearGradient(ox, obs.y + topOffset, ox, obs.y + obs.h);
            spireGrad.addColorStop(0, "#ffffff");
            spireGrad.addColorStop(0.4, palette.accent);
            spireGrad.addColorStop(1, palette.obstacleFill);
            ctx.fillStyle = spireGrad;
            ctx.beginPath();
            ctx.moveTo(ox + half / 2, obs.y + topOffset);
            ctx.lineTo(ox + half - 1, obs.y + obs.h - 5);
            ctx.lineTo(ox + 1, obs.y + obs.h - 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(ox + half / 2 - 1.5, obs.y + topOffset + 9, 3, obs.h - topOffset - 16);
          }
        } else if (obs.type === "spike_cluster") {
          const partW = obs.w / 3;
          ctx.fillStyle = palette.glow;
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w / 2, obs.y - 6);
          ctx.lineTo(obs.x + obs.w + 5, obs.y + obs.h);
          ctx.lineTo(obs.x - 5, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#0f172a";
          ctx.fillRect(obs.x - 2, obs.y + obs.h - 5, obs.w + 4, 5);
          for (let k = 0; k < 3; k++) {
            const ox = obs.x + k * partW;
            const hOffset = k === 1 ? 0 : 8;
            const spireGrad = ctx.createLinearGradient(ox, obs.y + hOffset, ox, obs.y + obs.h);
            spireGrad.addColorStop(0, "#ffffff");
            spireGrad.addColorStop(0.4, palette.accent);
            spireGrad.addColorStop(1, palette.obstacleFill);
            ctx.fillStyle = spireGrad;
            ctx.beginPath();
            ctx.moveTo(ox + partW / 2, obs.y + hOffset);
            ctx.lineTo(ox + partW - 1, obs.y + obs.h - 5);
            ctx.lineTo(ox + 1, obs.y + obs.h - 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.fillRect(ox + partW / 2 - 1, obs.y + hOffset + 8, 2, obs.h - hOffset - 15);
          }
        } else if (obs.type === "laser_barrier") {
          // Left and right armored emitter pylons
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(obs.x, obs.y, 7, obs.h);
          ctx.strokeRect(obs.x, obs.y, 7, obs.h);
          ctx.fillRect(obs.x + obs.w - 7, obs.y, 7, obs.h);
          ctx.strokeRect(obs.x + obs.w - 7, obs.y, 7, obs.h);

          // Translucent energy curtain
          ctx.fillStyle = palette.glow;
          ctx.globalAlpha = 0.25;
          ctx.fillRect(obs.x + 7, obs.y + 6, obs.w - 14, obs.h - 12);
          ctx.globalAlpha = 1.0;

          // Crackling central laser beams
          const pulse = Math.sin(obs.pulseTimer || 0);
          ctx.strokeStyle = pulse > 0 ? "#ffffff" : palette.accent;
          ctx.lineWidth = 2.5 + Math.abs(pulse) * 1.5;
          [obs.y + 12, obs.y + 27, obs.y + 42].forEach((beamY, idx) => {
            ctx.beginPath();
            ctx.moveTo(obs.x + 5, beamY);
            ctx.lineTo(obs.x + obs.w / 2, beamY + (idx % 2 === 0 ? pulse * 3 : -pulse * 3));
            ctx.lineTo(obs.x + obs.w - 5, beamY);
            ctx.stroke();
          });
        } else if (obs.isFlying) {
          // Aerial Cyber-Hunter Drone
          const flap = Math.sin(obs.wingAngle || 0) * 5;

          // Forward Red Target Scanner Beam Cone
          ctx.save();
          const scanGrad = ctx.createLinearGradient(obs.x - 42, obs.y + 13, obs.x + 8, obs.y + 13);
          scanGrad.addColorStop(0, "rgba(255, 0, 68, 0)");
          scanGrad.addColorStop(1, "rgba(255, 0, 68, 0.38)");
          ctx.fillStyle = scanGrad;
          ctx.beginPath();
          ctx.moveTo(obs.x + 8, obs.y + 11);
          ctx.lineTo(obs.x - 42, obs.y + 2);
          ctx.lineTo(obs.x - 42, obs.y + 26);
          ctx.lineTo(obs.x + 8, obs.y + 15);
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          // Armored Drone Fuselage
          ctx.fillStyle = "#111c30";
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, obs.y + 13);
          ctx.lineTo(obs.x + 14, obs.y + 5);
          ctx.lineTo(obs.x + obs.w - 8, obs.y + 5);
          ctx.lineTo(obs.x + obs.w - 2, obs.y + 13);
          ctx.lineTo(obs.x + obs.w - 8, obs.y + 21);
          ctx.lineTo(obs.x + 14, obs.y + 21);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Swept Plasma Wings
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.moveTo(obs.x + 14, obs.y + 9);
          ctx.lineTo(obs.x + 2, obs.y - 2 + flap);
          ctx.lineTo(obs.x + 26, obs.y + 6);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w - 14, obs.y + 9);
          ctx.lineTo(obs.x + obs.w + 4, obs.y - 2 - flap);
          ctx.lineTo(obs.x + obs.w - 22, obs.y + 6);
          ctx.closePath();
          ctx.fill();

          // Crimson Glowing Scanner Eye
          ctx.fillStyle = "#ff0044";
          ctx.fillRect(obs.x + 10, obs.y + 10, 9, 6);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(obs.x + 11, obs.y + 11, 3, 2);

          // Rear Ion Thruster Plume
          ctx.fillStyle = palette.textAccent;
          ctx.fillRect(obs.x + obs.w - 2, obs.y + 9, 6 + Math.random() * 4, 3);
          ctx.fillRect(obs.x + obs.w - 2, obs.y + 15, 6 + Math.random() * 4, 3);
        }

        ctx.restore();
      });

      // 11. Render Collectibles
      state.collectibles.forEach((item) => {
        if (item.collected) return;
        ctx.save();
        const floatY = item.y + Math.sin(time * 0.006 + item.id) * 4;

        if (item.type === "core") {
          ctx.translate(item.x, floatY);

          // Outer counter-rotating ring
          ctx.save();
          ctx.rotate(-time * 0.003);
          ctx.strokeStyle = "rgba(0, 240, 255, 0.55)";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-item.radius, -item.radius, item.radius * 2, item.radius * 2);
          ctx.restore();

          // Inner rotating neon data diamond
          ctx.rotate(time * 0.005);
          ctx.fillStyle = "#00f0ff";
          ctx.beginPath();
          ctx.moveTo(0, -item.radius);
          ctx.lineTo(item.radius, 0);
          ctx.lineTo(0, item.radius);
          ctx.lineTo(-item.radius, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-3.5, -3.5, 7, 7);
        } else if (item.type === "shield") {
          ctx.translate(item.x, floatY);
          ctx.fillStyle = "rgba(255, 230, 0, 0.28)";
          ctx.strokeStyle = "#ffff00";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Inner hex core
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();

          // Dual orbital rings
          ctx.rotate(time * 0.005);
          ctx.beginPath();
          ctx.ellipse(0, 0, item.radius + 6, 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 12. Render Motion Trail Ghosts + Mech-Raptor Protagonist
      const raptor = state.raptor;
      ctx.save();

      if (state.mode !== "GAME_OVER") {
        // Motion Afterimage Trail
        for (const ghost of state.raptorTrail) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, ghost.alpha * 0.45);
          ctx.strokeStyle = palette.accent;
          ctx.fillStyle = palette.glow;
          ctx.lineWidth = 1.5;
          if (ghost.isDucking) {
            ctx.beginPath();
            ctx.moveTo(ghost.x, ghost.y + RAPTOR_DUCK_H - 4);
            ctx.lineTo(ghost.x + 16, ghost.y + 6);
            ctx.lineTo(ghost.x + RAPTOR_DUCK_W - 8, ghost.y + 4);
            ctx.lineTo(ghost.x + RAPTOR_DUCK_W, ghost.y + 16);
            ctx.lineTo(ghost.x + RAPTOR_DUCK_W - 12, ghost.y + RAPTOR_DUCK_H);
            ctx.lineTo(ghost.x + 14, ghost.y + RAPTOR_DUCK_H);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.moveTo(ghost.x + 4, ghost.y + 22);
            ctx.lineTo(ghost.x + 24, ghost.y + 12);
            ctx.lineTo(ghost.x + 36, ghost.y + 4);
            ctx.lineTo(ghost.x + RAPTOR_UPRIGHT_W, ghost.y + 12);
            ctx.lineTo(ghost.x + 30, ghost.y + 36);
            ctx.lineTo(ghost.x + 16, ghost.y + 36);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        }

        if (raptor.isDucking && raptor.isGrounded) {
          // --- DUCKING / HOVER-SLIDE POSTURE ---
          const rx = raptor.x;
          const ry = GROUND_Y - RAPTOR_DUCK_H;

          const bodyGrad = ctx.createLinearGradient(rx, ry, rx, ry + RAPTOR_DUCK_H);
          bodyGrad.addColorStop(0, "#1e293b");
          bodyGrad.addColorStop(1, "#091220");
          ctx.fillStyle = bodyGrad;
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(rx, ry + RAPTOR_DUCK_H - 4);
          ctx.lineTo(rx + 16, ry + 7);
          ctx.lineTo(rx + RAPTOR_DUCK_W - 8, ry + 3);
          ctx.lineTo(rx + RAPTOR_DUCK_W, ry + 15);
          ctx.lineTo(rx + RAPTOR_DUCK_W - 12, ry + RAPTOR_DUCK_H);
          ctx.lineTo(rx + 14, ry + RAPTOR_DUCK_H);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Internal cyber ribcage core line
          ctx.strokeStyle = palette.textAccent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(rx + 18, ry + 15);
          ctx.lineTo(rx + 40, ry + 15);
          ctx.stroke();

          // Visor Eye + Light Streak
          ctx.fillStyle = palette.accent;
          ctx.fillRect(rx + RAPTOR_DUCK_W - 21, ry + 8, 11, 4);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(rx + RAPTOR_DUCK_W - 14, ry + 9, 3, 2);

          // Dorsal Neon Spines
          ctx.fillStyle = palette.textAccent;
          for (let i = 0; i < 4; i++) {
            const sx = rx + 12 + i * 10;
            ctx.beginPath();
            ctx.moveTo(sx, ry + 6);
            ctx.lineTo(sx + 4, ry - 4);
            ctx.lineTo(sx + 8, ry + 6);
            ctx.closePath();
            ctx.fill();
          }

          // Rear hover-slide plasma flame
          ctx.fillStyle = "#ffaa00";
          ctx.beginPath();
          ctx.moveTo(rx + 2, ry + 14);
          ctx.lineTo(rx - 14 - Math.random() * 8, ry + 18);
          ctx.lineTo(rx + 4, ry + 23);
          ctx.closePath();
          ctx.fill();
        } else {
          // --- UPRIGHT / JUMPING POSTURE ---
          const rx = raptor.x;
          const ry = raptor.y;

          ctx.save();
          // Apply subtle squash & stretch anchored at feet center
          const pivotX = rx + RAPTOR_UPRIGHT_W * 0.5;
          const pivotY = ry + RAPTOR_UPRIGHT_H;
          ctx.translate(pivotX, pivotY);
          ctx.scale(state.scaleX, state.scaleY);
          ctx.translate(-pivotX, -pivotY);

          const bodyGrad = ctx.createLinearGradient(rx, ry, rx + RAPTOR_UPRIGHT_W, ry + 40);
          bodyGrad.addColorStop(0, "#1e293b");
          bodyGrad.addColorStop(0.6, "#0d1b2a");
          bodyGrad.addColorStop(1, "#060d18");
          ctx.fillStyle = bodyGrad;
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 2;

          // Main Armored Torso & Head
          ctx.beginPath();
          ctx.moveTo(rx + 2, ry + 24); // Tail tip
          ctx.lineTo(rx + 15, ry + 18); // Tail base
          ctx.lineTo(rx + 25, ry + 11); // Back shoulder
          ctx.lineTo(rx + 35, ry + 3); // Head crown
          ctx.lineTo(rx + RAPTOR_UPRIGHT_W, ry + 10); // Snout tip
          ctx.lineTo(rx + RAPTOR_UPRIGHT_W - 3, ry + 19); // Upper jaw
          ctx.lineTo(rx + 36, ry + 21); // Throat
          ctx.lineTo(rx + 31, ry + 36); // Chest plate
          ctx.lineTo(rx + 15, ry + 36); // Hip joint
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Glowing Power Reactor Core on Chest/Flank
          ctx.fillStyle = palette.textAccent;
          ctx.beginPath();
          ctx.arc(rx + 24, ry + 24, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Visor Eye with Cyber Glare
          ctx.fillStyle = palette.accent;
          ctx.fillRect(rx + 37, ry + 8, 9, 5);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(rx + 42, ry + 9, 3, 2);

          // Dorsal Neon Energy Spines
          ctx.fillStyle = palette.textAccent;
          for (let i = 0; i < 4; i++) {
            const sx = rx + 11 + i * 7;
            ctx.beginPath();
            ctx.moveTo(sx, ry + 18 - i * 2.5);
            ctx.lineTo(sx + 3, ry + 10 - i * 2.5);
            ctx.lineTo(sx + 6, ry + 18 - i * 2.5);
            ctx.closePath();
            ctx.fill();
          }

          // Articulated Cyber Foreclaw
          ctx.strokeStyle = palette.textAccent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx + 31, ry + 24);
          ctx.lineTo(rx + 38, ry + 28);
          ctx.lineTo(rx + 43, ry + 26);
          ctx.stroke();

          // Piston Legs & Running Kinematics
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 2.4;
          if (raptor.isGrounded) {
            const legPhase = raptor.runFrame;
            const legOffsets = [
              { l1: 0, l2: 12 },
              { l1: 8, l2: 4 },
              { l1: 14, l2: -2 },
              { l1: 6, l2: 6 },
            ][legPhase] || { l1: 0, l2: 10 };

            // Left piston leg
            ctx.beginPath();
            ctx.moveTo(rx + 21, ry + 34);
            ctx.lineTo(rx + 21 - legOffsets.l1 * 0.5, ry + 44);
            ctx.lineTo(rx + 21 - legOffsets.l1, ry + RAPTOR_UPRIGHT_H);
            ctx.stroke();

            // Right piston leg
            ctx.beginPath();
            ctx.moveTo(rx + 27, ry + 34);
            ctx.lineTo(rx + 27 + legOffsets.l2 * 0.5, ry + 44);
            ctx.lineTo(rx + 27 + legOffsets.l2, ry + RAPTOR_UPRIGHT_H);
            ctx.stroke();
          } else {
            // Airborne tucked legs
            ctx.beginPath();
            ctx.moveTo(rx + 22, ry + 34);
            ctx.lineTo(rx + 28, ry + 42);
            ctx.lineTo(rx + 34, ry + 46);
            ctx.stroke();

            // Dual-stage plasma thruster flame
            ctx.fillStyle = "#ff8800";
            ctx.beginPath();
            ctx.moveTo(rx + 14, ry + 36);
            ctx.lineTo(rx + 19, ry + 51 + Math.random() * 7);
            ctx.lineTo(rx + 24, ry + 36);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(rx + 16, ry + 36);
            ctx.lineTo(rx + 19, ry + 45);
            ctx.lineTo(rx + 22, ry + 36);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }

        // Active Holo-Shield Hex Bubble
        if (raptor.hasShield) {
          ctx.strokeStyle = "#ffff00";
          ctx.fillStyle = "rgba(255, 255, 0, 0.16)";
          ctx.lineWidth = 2;
          const box = getRaptorHitbox(raptor);
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          const radius = Math.max(box.w, box.h) * 0.68;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();

      // 13. Render Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      });

      // 14. Render Floating Notices
      state.floatingNotices.forEach((n) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, n.alpha);
        ctx.fillStyle = n.color;
        ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.textAlign = "center";
        ctx.fillText(n.text, n.x, n.y);
        ctx.restore();
      });

      // 15. Cyber-Telemetry HUD Console (Top Deck)
      ctx.save();
      ctx.fillStyle = "rgba(4, 10, 22, 0.86)";
      ctx.fillRect(0, 0, GAME_W, 64);

      ctx.strokeStyle = palette.accent;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(GAME_W, 64);
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = palette.textAccent;

      // Left Zone: Distance & Sector Progress Bar
      const distStr = Math.floor(state.distance).toString().padStart(5, "0");
      ctx.textAlign = "left";
      ctx.fillText(`DIST: ${distStr}M`, 22, 26);

      ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#e2e8f0";
      ctx.fillText(
        `SEC 0${state.sectorIndex + 1} · ${currentSector.name}${state.isEndless ? " [MAX]" : ""}`,
        22,
        48,
      );

      // Sector Progress Bar (center-left)
      const secProg = state.isEndless ? 1 : getSectorProgress(state.distance, state.sectorIndex);
      const barX = 248;
      const barY = 38;
      const barW = 110;
      const barH = 8;
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = palette.accent;
      ctx.fillRect(barX, barY, Math.round(barW * secProg), barH);
      ctx.strokeStyle = palette.groundGrid;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      // Center Zone: Score & Data Cores
      ctx.font = `bold 15px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffffff";
      const scoreStr = Math.floor(state.score).toString().padStart(6, "0");
      ctx.textAlign = "center";
      ctx.fillText(`SCORE: ${scoreStr}`, GAME_W / 2 + 20, 26);

      ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#00f0ff";
      const shieldTag = state.raptor.hasShield ? " · SHIELD: ON" : "";
      ctx.fillText(`CORES: ✦ ${state.coresCollected}${shieldTag}`, GAME_W / 2 + 20, 48);

      // Right Zone: High Score & Audio Status
      const hiStr = state.highScore.toString().padStart(6, "0");
      ctx.textAlign = "right";
      ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#ffd700";
      ctx.fillText(`BEST: ${hiStr}`, GAME_W - 22, 26);

      ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(`[M] BGM: ${pixelRunAudio.isMusicActive() ? "ON" : "OFF"}`, GAME_W - 22, 48);
      ctx.restore();

      // 16. Framed Holographic Overlays (READY / SECTOR_WARP / VICTORY / GAME_OVER)
      const drawCyberModalFrame = (
        w: number,
        h: number,
        borderColor: string,
        bgTint = "rgba(4, 10, 22, 0.9)",
      ) => {
        const mx = (GAME_W - w) / 2;
        const my = (GAME_H - h) / 2 + 12;
        ctx.fillStyle = bgTint;
        ctx.fillRect(mx, my, w, h);

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(mx, my, w, h);

        // Corner brackets
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
      };

      if (state.mode === "READY") {
        ctx.save();
        ctx.fillStyle = "rgba(3, 7, 16, 0.58)";
        ctx.fillRect(0, 64, GAME_W, GAME_H - 64);

        const { my } = drawCyberModalFrame(580, 310, palette.accent);

        ctx.textAlign = "center";
        ctx.font = `bold 38px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.accent;
        ctx.fillText("CYBER PIXEL RUN", GAME_W / 2, my + 58);

        ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText("5-SECTOR SYNTHWAVE MECH-RAPTOR RUNNER", GAME_W / 2, my + 92);

        // Sector preview pips
        for (let sIdx = 0; sIdx < TOTAL_SECTORS; sIdx++) {
          const px = GAME_W / 2 - 90 + sIdx * 45;
          ctx.fillStyle = SECTOR_CONFIGS[sIdx].palette.accent;
          ctx.fillRect(px - 14, my + 110, 28, 5);
        }

        ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.textAccent;
        ctx.fillText("[SPACE / UP / CLICK] JUMP  (HOLD FOR HIGH JUMP)", GAME_W / 2, my + 152);
        ctx.fillText("[DOWN / S] SLIDE-DUCK  (AIR DUCK = FAST DROP)", GAME_W / 2, my + 180);
        ctx.fillText("DUCK UNDER MID-ALTITUDE HUNTER DRONES · COLLECT CORES", GAME_W / 2, my + 208);

        const pulse = 0.65 + Math.sin(time * 0.006) * 0.35;
        ctx.font = `bold 17px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = `rgba(255, 230, 0, ${pulse})`;
        ctx.fillText("[ PRESS SPACE OR CLICK TO LAUNCH ]", GAME_W / 2, my + 258);

        ctx.font = `11px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("[M] TOGGLE SYNTH AUDIO  ·  [ESC] EXIT TO ARCADE", GAME_W / 2, my + 288);
        ctx.restore();
      } else if (state.mode === "PAUSED") {
        ctx.save();
        ctx.fillStyle = "rgba(3, 7, 16, 0.68)";
        ctx.fillRect(0, 64, GAME_W, GAME_H - 64);

        const { my } = drawCyberModalFrame(420, 180, "#ffd700");
        ctx.textAlign = "center";
        ctx.font = `bold 32px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffd700";
        ctx.fillText("GAME PAUSED", GAME_W / 2, my + 72);

        ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText("[ PRESS PAUSE OR JUMP TO RESUME ]", GAME_W / 2, my + 125);
        ctx.restore();
      } else if (state.mode === "SECTOR_WARP") {
        ctx.save();
        ctx.fillStyle = "rgba(0, 240, 255, 0.08)";
        ctx.fillRect(0, 64, GAME_W, GAME_H - 64);

        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 16; i++) {
          const ly = 80 + ((i * 31 + Math.floor(time * 0.5)) % (GROUND_Y - 90));
          const lx = ((i * 97 + Math.floor(time * 1.8)) % GAME_W);
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx - 120, ly);
          ctx.stroke();
        }

        ctx.textAlign = "center";
        ctx.font = `bold 30px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.accent;
        ctx.fillText("SECTOR WARP ENGAGED", GAME_W / 2, 215);
        ctx.font = `bold 17px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          `ENTERING SECTOR 0${state.sectorIndex + 1}: ${currentSector.name}`,
          GAME_W / 2,
          252,
        );
        ctx.restore();
      } else if (state.mode === "VICTORY") {
        ctx.save();
        ctx.fillStyle = "rgba(6, 3, 16, 0.72)";
        ctx.fillRect(0, 64, GAME_W, GAME_H - 64);

        const { my } = drawCyberModalFrame(560, 290, "#00ff88");

        ctx.textAlign = "center";
        ctx.font = `bold 34px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#00ff88";
        ctx.fillText("CYBER MATRIX CONQUERED!", GAME_W / 2, my + 58);

        ctx.font = `bold 15px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText("ALL 5 SECTORS CLEARED — OVERDRIVE UNLOCKED", GAME_W / 2, my + 95);

        ctx.font = `14px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.textAccent;
        ctx.fillText(`FINAL DISTANCE: ${Math.floor(state.distance)}M`, GAME_W / 2, my + 140);
        ctx.fillText(`FINAL SCORE: ${Math.floor(state.score)} PTS`, GAME_W / 2, my + 168);
        ctx.fillText(`DATA CORES COLLECTED: ${state.coresCollected}`, GAME_W / 2, my + 196);

        const pulse = 0.65 + Math.sin(time * 0.006) * 0.35;
        ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = `rgba(255, 230, 0, ${pulse})`;
        ctx.fillText("[ PRESS SPACE OR CLICK FOR ENDLESS OVERDRIVE ]", GAME_W / 2, my + 248);
        ctx.restore();
      } else if (state.mode === "GAME_OVER") {
        ctx.save();
        ctx.fillStyle = "rgba(14, 2, 6, 0.72)";
        ctx.fillRect(0, 64, GAME_W, GAME_H - 64);

        const { my } = drawCyberModalFrame(520, 265, "#ff0044", "rgba(18, 4, 10, 0.92)");

        ctx.textAlign = "center";
        ctx.font = `bold 36px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ff0044";
        ctx.fillText("CRASH DETECTED", GAME_W / 2, my + 60);

        ctx.font = `15px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
          `DISTANCE: ${Math.floor(state.distance)}M   ·   SCORE: ${Math.floor(state.score)}`,
          GAME_W / 2,
          my + 108,
        );
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(
          `SECTOR 0${state.sectorIndex + 1} (${currentSector.name})   ·   CORES: ${state.coresCollected}`,
          GAME_W / 2,
          my + 136,
        );

        const finalScore = Math.floor(state.score);
        if (finalScore >= state.highScore && finalScore > 0) {
          ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = "#ffff00";
          ctx.fillText("★ NEW ALL-TIME HIGH SCORE! ★", GAME_W / 2, my + 172);
        }

        const pulse = 0.65 + Math.sin(time * 0.006) * 0.35;
        ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = pulse;
        ctx.fillText("[ PRESS SPACE OR CLICK TO REBOOT ]", GAME_W / 2, my + 222);
        ctx.restore();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      pixelRunAudio.stopMusic();
    };
  }, [addNotice, spawnParticles]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        background: "#050b18",
        outline: "none",
        overflow: "hidden",
      }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "contain",
          cursor: "pointer",
          touchAction: "none",
        }}
      />
    </div>
  );
}
