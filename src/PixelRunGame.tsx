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
  checkCollectiblePickup,
  checkRaptorCollision,
  createCollectible,
  createObstacle,
  getRaptorHitbox,
  type Collectible,
  type Obstacle,
  type ObstacleType,
  type PixelRunPalette,
  type RaptorState,
  type SectorConfig,
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

export type PixelRunGameMode = "READY" | "RUNNING" | "SECTOR_WARP" | "VICTORY" | "GAME_OVER";

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

export type CyberBuilding = {
  x: number;
  width: number;
  height: number;
  windows: { x: number; y: number; on: boolean }[];
};

export type Star = {
  x: number;
  y: number;
  size: number;
  twinkle: number;
};

export type PixelRunGameProps = {
  onExit?: () => void;
};

const STORAGE_KEY_HIGH_SCORE = "pixel_run_highscore";

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
    obstacles: Obstacle[];
    collectibles: Collectible[];
    nextSpawnDistance: number;
    particles: PixelParticle[];
    floatingNotices: FloatingNotice[];
    stars: Star[];
    buildings: CyberBuilding[];
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
    obstacles: [],
    collectibles: [],
    nextSpawnDistance: 380,
    particles: [],
    floatingNotices: [],
    stars: [],
    buildings: [],
    groundScrollX: 0,
    screenShake: 0,
    warpTimer: 0,
    isEndless: false,
    lastMilestone: 0,
    jumpKeyPressed: false,
    duckKeyPressed: false,
  });

  // Initialize stars and cyber buildings for parallax skyline
  useEffect(() => {
    const s: Star[] = [];
    for (let i = 0; i < 40; i++) {
      s.push({
        x: Math.random() * GAME_W,
        y: Math.random() * (GROUND_Y - 180),
        size: Math.random() < 0.25 ? 2.5 : 1.5,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    gameState.current.stars = s;

    const b: CyberBuilding[] = [];
    let curX = 0;
    while (curX < GAME_W + 300) {
      const width = 50 + Math.random() * 70;
      const height = 120 + Math.random() * 180;
      const windows: { x: number; y: number; on: boolean }[] = [];
      const cols = Math.floor(width / 16);
      const rows = Math.floor(height / 24);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          windows.push({
            x: 8 + c * 14,
            y: 12 + r * 20,
            on: Math.random() < 0.45,
          });
        }
      }
      b.push({ x: curX, width, height, windows });
      curX += width + 10 + Math.random() * 25;
    }
    gameState.current.buildings = b;

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

  const resetGame = useCallback(
    (startEndless = false) => {
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
    },
    [],
  );

  const handleJumpPress = useCallback(() => {
    const state = gameState.current;
    if (state.mode === "READY") {
      resetGame(false);
      return;
    }
    if (state.mode === "GAME_OVER") {
      resetGame(false);
      return;
    }
    if (state.mode === "VICTORY") {
      resetGame(true); // Proceed to Endless Overdrive
      return;
    }
    if (state.mode !== "RUNNING" && state.mode !== "SECTOR_WARP") return;

    if (state.raptor.isGrounded) {
      state.raptor.vy = JUMP_IMPULSE;
      state.raptor.isGrounded = false;
      state.raptor.isDucking = false;
      state.jumpKeyPressed = true;
      pixelRunAudio.playJump();

      // Jet flame burst
      spawnParticles(
        state.raptor.x + 12,
        state.raptor.y + RAPTOR_UPRIGHT_H,
        "#00f0ff",
        8,
        4,
        4,
      );
    }
  }, [resetGame, spawnParticles]);

  const handleJumpRelease = useCallback(() => {
    const state = gameState.current;
    state.jumpKeyPressed = false;
    // Variable jump: cut upward velocity if released early (short-hop)
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
        pixelRunAudio.playDuck();
      }
    } else {
      // Fast fall when ducking mid-air
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
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        handleJumpPress();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        handleDuckPress();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        const active = pixelRunAudio.toggleMusic();
        addNotice(
          active ? "BGM: ON" : "BGM: OFF",
          GAME_W / 2,
          120,
          active ? "#00f0ff" : "#ff4466",
        );
      } else if (e.code === "Escape") {
        e.preventDefault();
        if (onExit) onExit();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        handleJumpRelease();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
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
  }, [handleJumpPress, handleJumpRelease, handleDuckPress, handleDuckRelease, addNotice, onExit]);

  // Pointer / Touch Handlers
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

    const renderLoop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05); // cap at 50ms to prevent collision tunneling
      lastTime = time;

      // Ensure canvas DPI scaling
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(canvas.width / GAME_W, canvas.height / GAME_H);

      const state = gameState.current;
      const currentSector = SECTOR_CONFIGS[state.sectorIndex] ?? SECTOR_CONFIGS[0];
      const palette = currentSector.palette;

      // Screen shake offset
      let shakeX = 0;
      let shakeY = 0;
      if (state.screenShake > 0) {
        shakeX = (Math.random() - 0.5) * state.screenShake * 5;
        shakeY = (Math.random() - 0.5) * state.screenShake * 5;
        state.screenShake = Math.max(0, state.screenShake - dt * 2.5);
      }
      ctx.translate(shakeX, shakeY);

      // --- GAMEPLAY UPDATE ---
      if (state.mode === "RUNNING" || state.mode === "SECTOR_WARP") {
        const speed = currentSector.speed * (state.isEndless ? 1.25 : 1.0);
        const distStep = speed * 60 * dt * 0.18; // 1 unit ~ 0.18m
        state.distance += distStep;
        state.score += Math.floor(distStep * 1.5);

        // Ground scroll
        state.groundScrollX = (state.groundScrollX + speed * 60 * dt) % 80;

        // Check 100m milestones
        const currentMilestone = Math.floor(state.distance / 100);
        if (currentMilestone > state.lastMilestone) {
          state.lastMilestone = currentMilestone;
          pixelRunAudio.playMilestone();
          addNotice(`${currentMilestone * 100}M`, state.raptor.x + 30, state.raptor.y - 20, "#ffff00");
        }

        // Campaign Sector Warp Progression
        if (!state.isEndless) {
          if (
            state.distance >= currentSector.targetDistance &&
            state.sectorIndex < TOTAL_SECTORS - 1
          ) {
            state.sectorIndex++;
            state.mode = "SECTOR_WARP";
            state.warpTimer = 2.0; // 2 seconds warp
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
            state.sectorIndex === TOTAL_SECTORS - 1 &&
            state.mode !== "VICTORY"
          ) {
            state.mode = "VICTORY";
            pixelRunAudio.playVictory();
            state.score += 2500;
            if (state.score > state.highScore) {
              state.highScore = state.score;
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
            pixelRunAudio.playLand();
            spawnParticles(raptor.x + 20, GROUND_Y, palette.accent, 4, 2, 2.5);
            if (state.duckKeyPressed) {
              raptor.isDucking = true;
            }
          }
        }

        // Running Frame Animation
        raptor.frameTimer += dt * speed;
        if (raptor.frameTimer > 0.1) {
          raptor.runFrame = (raptor.runFrame + 1) % 4;
          raptor.frameTimer = 0;

          // Footstep dust spark when on ground
          if (raptor.isGrounded && !raptor.isDucking && raptor.runFrame % 2 === 0) {
            spawnParticles(raptor.x + 8, GROUND_Y - 2, palette.groundSurface, 2, 1.5, 2);
          }
        }

        // Sliding sparks when ducking on ground
        if (raptor.isGrounded && raptor.isDucking && Math.random() < 0.6) {
          spawnParticles(
            raptor.x + RAPTOR_DUCK_W * 0.4,
            GROUND_Y - 1,
            palette.accent,
            2,
            3,
            2.5,
          );
        }

        // Update Obstacles Movement
        const moveDist = speed * 60 * dt;
        for (let i = state.obstacles.length - 1; i >= 0; i--) {
          const obs = state.obstacles[i];
          obs.x -= moveDist;

          if (obs.isFlying) {
            obs.wingAngle = (obs.wingAngle || 0) + dt * 16;
          }
          if (obs.type === "laser_barrier") {
            obs.pulseTimer = (obs.pulseTimer || 0) + dt * 8;
          }

          // Offscreen culling
          if (obs.x + obs.w < -60) {
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
              spawnParticles(item.x, item.y, "#00f0ff", 12, 4, 3);
            } else if (item.type === "shield") {
              raptor.hasShield = true;
              pixelRunAudio.playCollect();
              addNotice("SHIELD READY", item.x, item.y - 15, "#ffff00");
              spawnParticles(item.x, item.y, "#ffff00", 16, 5, 4);
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

          // Occasionally spawn a collectible alongside or behind the obstacle
          if (Math.random() < 0.35) {
            const isShield = Math.random() < 0.12 && !raptor.hasShield;
            const altitude = Math.random() < 0.5 ? "low" : "high";
            const colType = isShield ? "shield" : "core";
            state.collectibles.push(
              createCollectible(colType, GAME_W + 50 + (Math.random() * 80 + 50), altitude),
            );
          }

          // Next spawn gap
          const gap =
            currentSector.minSpawnDist +
            Math.random() * (currentSector.maxSpawnDist - currentSector.minSpawnDist);
          state.nextSpawnDistance = gap;
        }

        // Check Collisions
        for (const obs of state.obstacles) {
          if (checkRaptorCollision(raptor, obs)) {
            if (raptor.hasShield) {
              // Holo-shield absorbs the impact
              raptor.hasShield = false;
              pixelRunAudio.playShieldBreak();
              state.screenShake = 1.0;
              addNotice("SHIELD BROKE!", raptor.x + 20, raptor.y - 15, "#ff3333");
              spawnParticles(raptor.x + 20, raptor.y + 20, "#ffff00", 20, 6, 4);
              // Shift obstacle behind to avoid double collision
              obs.x = -100;
            } else {
              // Player crashes!
              state.mode = "GAME_OVER";
              state.screenShake = 2.0;
              pixelRunAudio.playCrash();
              spawnParticles(raptor.x + 20, raptor.y + 20, "#ff0044", 30, 8, 5);
              spawnParticles(raptor.x + 20, raptor.y + 20, palette.accent, 20, 6, 3);

              if (state.score > state.highScore) {
                state.highScore = state.score;
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

      // --- RENDERING ---

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, palette.skyTop);
      skyGrad.addColorStop(1, palette.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, GAME_W, GAME_H);

      // 2. Stars / Cyber Dust
      ctx.fillStyle = "#ffffff";
      state.stars.forEach((s) => {
        const alpha = 0.4 + Math.sin(time * 0.003 + s.twinkle) * 0.35;
        ctx.globalAlpha = Math.max(0.1, alpha);
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.globalAlpha = 1.0;

      // 3. Distant Parallax Cyber Buildings
      const bSpeed = state.mode === "RUNNING" || state.mode === "SECTOR_WARP" ? currentSector.speed * 12 : 0;
      state.buildings.forEach((b) => {
        b.x -= bSpeed * dt;
        if (b.x + b.width < -50) {
          b.x = GAME_W + 50 + Math.random() * 80;
        }

        ctx.fillStyle = palette.skyline;
        ctx.fillRect(b.x, GROUND_Y - b.height, b.width, b.height);

        // Building neon border
        ctx.strokeStyle = palette.glow;
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, GROUND_Y - b.height, b.width, b.height);

        // Windows
        ctx.fillStyle = palette.accent;
        ctx.globalAlpha = 0.35;
        b.windows.forEach((w) => {
          if (w.on) {
            ctx.fillRect(b.x + w.x, GROUND_Y - b.height + w.y, 6, 9);
          }
        });
        ctx.globalAlpha = 1.0;
      });

      // 4. Ground Road & 3D Perspective Grid
      ctx.fillStyle = palette.groundUnder;
      ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);

      // Ground Surface Line
      ctx.strokeStyle = palette.groundSurface;
      ctx.lineWidth = 3;
      ctx.shadowColor = palette.groundSurface;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(GAME_W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Animated scrolling road dashes below ground line
      ctx.strokeStyle = palette.groundGrid;
      ctx.lineWidth = 2;
      for (let x = -state.groundScrollX; x < GAME_W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND_Y);
        ctx.lineTo(x - 25, GAME_H);
        ctx.stroke();
      }

      // Horizontal perspective grid lines below ground
      const horizGridYs = [GROUND_Y + 18, GROUND_Y + 42, GROUND_Y + 72];
      horizGridYs.forEach((gy) => {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(GAME_W, gy);
        ctx.stroke();
      });

      // 5. Render Obstacles
      state.obstacles.forEach((obs) => {
        ctx.save();
        ctx.strokeStyle = palette.obstacleBorder;
        ctx.fillStyle = palette.obstacleFill;
        ctx.lineWidth = 2;
        ctx.shadowColor = palette.obstacleBorder;
        ctx.shadowBlur = 8;

        if (obs.type === "spike_single") {
          // Sharp neon plasma pylon
          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w / 2, obs.y);
          ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
          ctx.lineTo(obs.x, obs.y + obs.h);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Internal core conduit
          ctx.fillStyle = palette.accent;
          ctx.fillRect(obs.x + obs.w / 2 - 2, obs.y + 12, 4, obs.h - 14);
        } else if (obs.type === "spike_double") {
          // Two linked pylons
          const half = obs.w / 2;
          for (let k = 0; k < 2; k++) {
            const ox = obs.x + k * half;
            ctx.beginPath();
            ctx.moveTo(ox + half / 2, obs.y + (k === 1 ? 6 : 0));
            ctx.lineTo(ox + half - 2, obs.y + obs.h);
            ctx.lineTo(ox + 2, obs.y + obs.h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        } else if (obs.type === "spike_cluster") {
          // Three jagged spiked data mines
          const partW = obs.w / 3;
          for (let k = 0; k < 3; k++) {
            const ox = obs.x + k * partW;
            const hOffset = k === 1 ? 0 : 8;
            ctx.beginPath();
            ctx.moveTo(ox + partW / 2, obs.y + hOffset);
            ctx.lineTo(ox + partW - 1, obs.y + obs.h);
            ctx.lineTo(ox + 1, obs.y + obs.h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        } else if (obs.type === "laser_barrier") {
          // Left and right emitter pylons
          ctx.fillRect(obs.x, obs.y, 6, obs.h);
          ctx.strokeRect(obs.x, obs.y, 6, obs.h);
          ctx.fillRect(obs.x + obs.w - 6, obs.y, 6, obs.h);
          ctx.strokeRect(obs.x + obs.w - 6, obs.y, 6, obs.h);

          // Crackling central laser
          const pulse = Math.sin(obs.pulseTimer || 0);
          ctx.strokeStyle = pulse > 0 ? "#ffffff" : palette.accent;
          ctx.lineWidth = 3 + pulse * 1.5;
          ctx.beginPath();
          ctx.moveTo(obs.x + 3, obs.y + 14);
          ctx.lineTo(obs.x + obs.w - 3, obs.y + 14);
          ctx.moveTo(obs.x + 3, obs.y + 36);
          ctx.lineTo(obs.x + obs.w - 3, obs.y + 36);
          ctx.stroke();
        } else if (obs.isFlying) {
          // Aerial Hunter Drone
          const flap = Math.sin(obs.wingAngle || 0) * 5;

          // Drone Fuselage
          ctx.fillStyle = palette.obstacleFill;
          ctx.fillRect(obs.x + 8, obs.y + 6, obs.w - 16, 14);
          ctx.strokeRect(obs.x + 8, obs.y + 6, obs.w - 16, 14);

          // Wings
          ctx.fillStyle = palette.accent;
          ctx.beginPath();
          ctx.moveTo(obs.x + 4, obs.y + 12);
          ctx.lineTo(obs.x - 4, obs.y + 2 + flap);
          ctx.lineTo(obs.x + 12, obs.y + 8);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(obs.x + obs.w - 4, obs.y + 12);
          ctx.lineTo(obs.x + obs.w + 6, obs.y + 2 - flap);
          ctx.lineTo(obs.x + obs.w - 12, obs.y + 8);
          ctx.closePath();
          ctx.fill();

          // Red glowing scanner eye
          ctx.fillStyle = "#ff0044";
          ctx.shadowColor = "#ff0044";
          ctx.shadowBlur = 8;
          ctx.fillRect(obs.x + 14, obs.y + 9, 8, 8);

          // Dual thruster exhausts
          ctx.fillStyle = palette.accent;
          ctx.fillRect(obs.x + obs.w - 6, obs.y + 8, 4, 3);
          ctx.fillRect(obs.x + obs.w - 6, obs.y + 15, 4, 3);
        }

        ctx.restore();
      });

      // 6. Render Collectibles
      state.collectibles.forEach((item) => {
        if (item.collected) return;
        ctx.save();
        const floatY = item.y + Math.sin(time * 0.006 + item.id) * 4;

        if (item.type === "core") {
          // Rotating neon data diamond
          ctx.translate(item.x, floatY);
          ctx.rotate(time * 0.004);
          ctx.fillStyle = "#00f0ff";
          ctx.shadowColor = "#00f0ff";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(0, -item.radius);
          ctx.lineTo(item.radius, 0);
          ctx.lineTo(0, item.radius);
          ctx.lineTo(-item.radius, 0);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-3, -3, 6, 6);
        } else if (item.type === "shield") {
          // Holo-Shield sphere with orbital ring
          ctx.translate(item.x, floatY);
          ctx.fillStyle = "rgba(255, 230, 0, 0.35)";
          ctx.strokeStyle = "#ffff00";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Orbital ring
          ctx.rotate(time * 0.005);
          ctx.beginPath();
          ctx.ellipse(0, 0, item.radius + 6, 4, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 7. Render Mech-Raptor (Cyber Dino)
      const raptor = state.raptor;
      ctx.save();

      if (state.mode !== "GAME_OVER") {
        if (raptor.isDucking && raptor.isGrounded) {
          // --- DUCKING / HOVER-SLIDE POSTURE ---
          const rx = raptor.x;
          const ry = GROUND_Y - RAPTOR_DUCK_H;

          // Chassis Body (Low & Streamlined)
          ctx.fillStyle = "#0d1b2a";
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 2;
          ctx.shadowColor = palette.accent;
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.moveTo(rx, ry + RAPTOR_DUCK_H - 4); // Tail tip
          ctx.lineTo(rx + 16, ry + 8);
          ctx.lineTo(rx + RAPTOR_DUCK_W - 8, ry + 4); // Snout top
          ctx.lineTo(rx + RAPTOR_DUCK_W, ry + 16); // Snout front
          ctx.lineTo(rx + RAPTOR_DUCK_W - 12, ry + RAPTOR_DUCK_H); // Bottom jaw/chin
          ctx.lineTo(rx + 14, ry + RAPTOR_DUCK_H); // Underbelly skid
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Visor Eye
          ctx.fillStyle = palette.accent;
          ctx.fillRect(rx + RAPTOR_DUCK_W - 20, ry + 8, 10, 4);

          // Dorsal Neon Spines
          ctx.fillStyle = palette.textAccent;
          for (let i = 0; i < 3; i++) {
            const sx = rx + 14 + i * 12;
            ctx.beginPath();
            ctx.moveTo(sx, ry + 6);
            ctx.lineTo(sx + 5, ry - 3);
            ctx.lineTo(sx + 8, ry + 6);
            ctx.closePath();
            ctx.fill();
          }

          // Sliding exhaust sparks from rear
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(rx + 2, ry + RAPTOR_DUCK_H - 6, 6, 3);
        } else {
          // --- UPRIGHT / JUMPING POSTURE ---
          const rx = raptor.x;
          const ry = raptor.y;

          ctx.fillStyle = "#0d1b2a";
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 2;
          ctx.shadowColor = palette.accent;
          ctx.shadowBlur = 8;

          // Main Torso
          ctx.beginPath();
          ctx.moveTo(rx + 4, ry + 22); // Tail base
          ctx.lineTo(rx + 24, ry + 12); // Back shoulder
          ctx.lineTo(rx + 36, ry + 4); // Head crown
          ctx.lineTo(rx + RAPTOR_UPRIGHT_W, ry + 12); // Snout tip
          ctx.lineTo(rx + RAPTOR_UPRIGHT_W - 4, ry + 20); // Mouth
          ctx.lineTo(rx + 34, ry + 22); // Throat
          ctx.lineTo(rx + 30, ry + 36); // Chest/belly
          ctx.lineTo(rx + 16, ry + 36); // Lower hip
          ctx.lineTo(rx, ry + 26); // Tail tip
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Visor Eye (Neon glow)
          ctx.fillStyle = palette.accent;
          ctx.fillRect(rx + 38, ry + 10, 8, 5);

          // Dorsal Spines on Spine
          ctx.fillStyle = palette.textAccent;
          for (let i = 0; i < 3; i++) {
            const sx = rx + 14 + i * 8;
            ctx.beginPath();
            ctx.moveTo(sx, ry + 14 - i * 2);
            ctx.lineTo(sx + 3, ry + 7 - i * 2);
            ctx.lineTo(sx + 6, ry + 14 - i * 2);
            ctx.closePath();
            ctx.fill();
          }

          // Small mechanical forelimb / cyber claw
          ctx.strokeStyle = palette.accent;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rx + 32, ry + 24);
          ctx.lineTo(rx + 38, ry + 28);
          ctx.lineTo(rx + 42, ry + 26);
          ctx.stroke();

          // Legs & Running Kinematics
          if (raptor.isGrounded) {
            // 4-frame stride
            const legPhase = raptor.runFrame;
            const legOffsets = [
              { l1: 0, l2: 12 },
              { l1: 8, l2: 4 },
              { l1: 14, l2: -2 },
              { l1: 6, l2: 6 },
            ][legPhase] || { l1: 0, l2: 10 };

            // Left leg
            ctx.beginPath();
            ctx.moveTo(rx + 22, ry + 34);
            ctx.lineTo(rx + 22 - legOffsets.l1 * 0.5, ry + 44);
            ctx.lineTo(rx + 22 - legOffsets.l1, ry + RAPTOR_UPRIGHT_H);
            ctx.stroke();

            // Right leg
            ctx.beginPath();
            ctx.moveTo(rx + 26, ry + 34);
            ctx.lineTo(rx + 26 + legOffsets.l2 * 0.5, ry + 44);
            ctx.lineTo(rx + 26 + legOffsets.l2, ry + RAPTOR_UPRIGHT_H);
            ctx.stroke();
          } else {
            // Jump pose: legs tucked forward
            ctx.beginPath();
            ctx.moveTo(rx + 22, ry + 34);
            ctx.lineTo(rx + 28, ry + 42);
            ctx.lineTo(rx + 34, ry + 46);
            ctx.stroke();

            // Jet Thruster flame firing downward!
            ctx.fillStyle = "#ffaa00";
            ctx.shadowColor = "#ff5500";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(rx + 16, ry + 36);
            ctx.lineTo(rx + 20, ry + 48 + Math.random() * 6);
            ctx.lineTo(rx + 24, ry + 36);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Active Holo-Shield Bubble
        if (raptor.hasShield) {
          ctx.strokeStyle = "#ffff00";
          ctx.fillStyle = "rgba(255, 255, 0, 0.18)";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 14;
          const box = getRaptorHitbox(raptor);
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          const radius = Math.max(box.w, box.h) * 0.65;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();

      // 8. Render Particles
      state.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.restore();
      });

      // 9. Render Floating Notices
      state.floatingNotices.forEach((n) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, n.alpha);
        ctx.fillStyle = n.color;
        ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.textAlign = "center";
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 8;
        ctx.fillText(n.text, n.x, n.y);
        ctx.restore();
      });

      // 10. HUD (Heads-Up Display)
      ctx.save();
      ctx.font = `14px "${EMBEDDED_FAMILY}", monospace`;
      ctx.fillStyle = palette.textAccent;
      ctx.shadowColor = palette.accent;
      ctx.shadowBlur = 6;

      // Distance & Sector
      const distStr = Math.floor(state.distance).toString().padStart(5, "0");
      ctx.textAlign = "left";
      ctx.fillText(`DIST: ${distStr}M`, 24, 34);
      ctx.fillText(
        `SECTOR ${state.sectorIndex + 1}: ${currentSector.name}${state.isEndless ? " [OVERDRIVE]" : ""}`,
        24,
        56,
      );

      // Score & Data Cores
      const scoreStr = state.score.toString().padStart(6, "0");
      ctx.textAlign = "center";
      ctx.fillText(`SCORE: ${scoreStr}`, GAME_W / 2, 34);
      ctx.fillText(`CORES: ✦ ${state.coresCollected}`, GAME_W / 2, 56);

      // High Score & Sound status
      const hiStr = state.highScore.toString().padStart(6, "0");
      ctx.textAlign = "right";
      ctx.fillText(`HI: ${hiStr}`, GAME_W - 24, 34);
      ctx.fillText(`[M] BGM: ${pixelRunAudio.isMusicActive() ? "ON" : "OFF"}`, GAME_W - 24, 56);
      ctx.restore();

      // 11. Overlays (READY / SECTOR_WARP / VICTORY / GAME_OVER)
      if (state.mode === "READY") {
        ctx.save();
        ctx.fillStyle = "rgba(5, 11, 24, 0.78)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.textAlign = "center";
        ctx.font = `bold 42px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.accent;
        ctx.shadowColor = palette.accent;
        ctx.shadowBlur = 18;
        ctx.fillText("CYBER PIXEL RUN", GAME_W / 2, 190);

        ctx.font = `16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.fillText("5-SECTOR CYBERPUNK RUNNER", GAME_W / 2, 230);

        ctx.font = `14px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.textAccent;
        ctx.shadowBlur = 0;
        ctx.fillText("[SPACE] / [UP] / CLICK : JUMP (HOLD FOR HIGH JUMP)", GAME_W / 2, 290);
        ctx.fillText("[DOWN] / [S] : DUCK & SLIDE (AIR DUCK = FAST FALL)", GAME_W / 2, 320);
        ctx.fillText("DUCK UNDER MID-HEIGHT HUNTER DRONES!", GAME_W / 2, 350);
        ctx.fillText("[M] TOGGLE BGM · [ESC] EXIT", GAME_W / 2, 380);

        const blink = Math.sin(time * 0.005) > 0;
        if (blink) {
          ctx.font = `bold 18px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = "#ffff00";
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 10;
          ctx.fillText("PRESS SPACE OR CLICK TO RUN", GAME_W / 2, 440);
        }
        ctx.restore();
      } else if (state.mode === "SECTOR_WARP") {
        // Warp lines
        ctx.save();
        ctx.fillStyle = "rgba(0, 240, 255, 0.12)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 3;
        for (let i = 0; i < 20; i++) {
          const ly = Math.random() * GAME_H;
          ctx.beginPath();
          ctx.moveTo(Math.random() * GAME_W, ly);
          ctx.lineTo(Math.random() * GAME_W + 150, ly);
          ctx.stroke();
        }

        ctx.textAlign = "center";
        ctx.font = `bold 32px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.accent;
        ctx.shadowColor = palette.accent;
        ctx.shadowBlur = 16;
        ctx.fillText("SECTOR WARP ENGAGED", GAME_W / 2, 230);
        ctx.font = `18px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`ENTERING ${currentSector.name}`, GAME_W / 2, 270);
        ctx.restore();
      } else if (state.mode === "VICTORY") {
        ctx.save();
        ctx.fillStyle = "rgba(10, 3, 20, 0.85)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.textAlign = "center";
        ctx.font = `bold 36px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#00ff88";
        ctx.shadowColor = "#00ff88";
        ctx.shadowBlur = 18;
        ctx.fillText("CYBER MATRIX OVERLOAD!", GAME_W / 2, 190);

        ctx.font = `18px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 8;
        ctx.fillText("ALL 5 SECTORS CONQUERED — VICTORY ACHIEVED", GAME_W / 2, 235);

        ctx.font = `15px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = palette.textAccent;
        ctx.fillText(`FINAL DISTANCE: ${Math.floor(state.distance)}M`, GAME_W / 2, 285);
        ctx.fillText(`FINAL SCORE: ${state.score} PTS`, GAME_W / 2, 315);
        ctx.fillText(`DATA CORES: ${state.coresCollected}`, GAME_W / 2, 345);

        const blink = Math.sin(time * 0.005) > 0;
        if (blink) {
          ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = "#ffff00";
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 10;
          ctx.fillText("PRESS SPACE OR CLICK FOR ENDLESS OVERDRIVE", GAME_W / 2, 410);
        }
        ctx.restore();
      } else if (state.mode === "GAME_OVER") {
        ctx.save();
        ctx.fillStyle = "rgba(15, 2, 6, 0.82)";
        ctx.fillRect(0, 0, GAME_W, GAME_H);

        ctx.textAlign = "center";
        ctx.font = `bold 38px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ff0044";
        ctx.shadowColor = "#ff0044";
        ctx.shadowBlur = 18;
        ctx.fillText("CRASH DETECTED", GAME_W / 2, 200);

        ctx.font = `16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.fillText(
          `DISTANCE: ${Math.floor(state.distance)}M · SCORE: ${state.score}`,
          GAME_W / 2,
          250,
        );

        if (state.score >= state.highScore && state.score > 0) {
          ctx.font = `bold 18px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = "#ffff00";
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 12;
          ctx.fillText("★ NEW ALL-TIME HIGH SCORE! ★", GAME_W / 2, 295);
        }

        const blink = Math.sin(time * 0.005) > 0;
        if (blink) {
          ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
          ctx.fillStyle = palette.accent;
          ctx.shadowColor = palette.accent;
          ctx.shadowBlur = 10;
          ctx.fillText("PRESS SPACE OR CLICK TO RETRY", GAME_W / 2, 370);
        }
        ctx.restore();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
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
