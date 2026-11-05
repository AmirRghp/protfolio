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
  isBirdCollidingWithGround,
  isBirdCollidingWithPylon,
  isBirdCollectingOrb,
  type FlappyLevelConfig,
  type Pylon,
} from "./flappyLevels";
import { flappyAudio } from "./flappyAudio";

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

export type FlappyGameMode = "READY" | "RUNNING" | "LEVEL_CLEAR" | "VICTORY" | "GAME_OVER";

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
};

export type Building = {
  x: number;
  width: number;
  height: number;
  windows: { x: number; y: number; on: boolean }[];
};

export type FlappyGameProps = {
  onExit?: () => void;
};

const STORAGE_KEY_HIGH_SCORE = "cyber_flappy_high_score";

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
    pylons: Pylon[];
    nextPylonId: number;
    particles: FlappyParticle[];
    floatingTexts: FloatingText[];
    stars: Star[];
    buildings: Building[];
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
    pylons: [],
    nextPylonId: 1,
    particles: [],
    floatingTexts: [],
    stars: [],
    buildings: [],
    groundScrollX: 0,
    screenShake: 0,
    levelClearTimer: 0,
    isEndless: false,
  });

  // Initial setup for stars and background skyline
  const initBackground = useCallback(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 70; i++) {
      stars.push({
        x: Math.random() * GAME_W,
        y: Math.random() * (GROUND_Y - 120),
        size: Math.random() < 0.2 ? 2.2 : Math.random() < 0.6 ? 1.5 : 1.0,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        speed: 0.2 + Math.random() * 0.4,
      });
    }

    const buildings: Building[] = [];
    let curX = 0;
    while (curX < GAME_W + 200) {
      const width = 45 + Math.random() * 55;
      const height = 90 + Math.random() * 160;
      const windows: { x: number; y: number; on: boolean }[] = [];
      const cols = Math.floor(width / 12);
      const rows = Math.floor((height - 20) / 16);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.45) {
            windows.push({
              x: 6 + c * 12,
              y: 12 + r * 16,
              on: Math.random() < 0.8,
            });
          }
        }
      }
      buildings.push({ x: curX, width, height, windows });
      curX += width + 6 + Math.random() * 10;
    }

    let highScore = 0;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HIGH_SCORE);
      if (stored) highScore = parseInt(stored, 10) || 0;
    } catch {
      /* ignore storage error */
    }

    gameState.current.stars = stars;
    gameState.current.buildings = buildings;
    gameState.current.highScore = highScore;
  }, []);

  const spawnPylonAt = useCallback((x: number) => {
    const s = gameState.current;
    const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
    const topHeight = generatePylonGap(level.gapSize, GROUND_Y);

    const hasOrb =
      level.spawnOrbs &&
      (s.pylons.length % 2 === 1 || Math.random() < 0.6);

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

      // Pre-spawn first 3 pylons nicely ahead of the player
      const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
      const startX = GAME_W + 60;
      for (let i = 0; i < 3; i++) {
        spawnPylonAt(startX + i * level.pylonSpacing);
      }
    },
    [spawnPylonAt]
  );

  const startLevel = useCallback(
    (levelIndex: number) => {
      const s = gameState.current;
      s.levelIndex = levelIndex;
      s.gatesClearedInLevel = 0;
      s.birdY = 260;
      s.birdSpeed = 0;
      s.birdAngle = 0;
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
    [spawnPylonAt]
  );

  const flap = useCallback(() => {
    const s = gameState.current;
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

      // Emit ion thruster exhaust particles
      const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];
      for (let i = 0; i < 6; i++) {
        s.particles.push({
          x: BIRD_X - 16,
          y: s.birdY + 2 + (Math.random() - 0.5) * 8,
          vx: -(2.5 + Math.random() * 3.5),
          vy: (Math.random() - 0.5) * 2.2,
          color: Math.random() < 0.6 ? level.palette.accent : "#ffffff",
          size: 2.5 + Math.random() * 2,
          alpha: 1,
          decay: 0.05 + Math.random() * 0.04,
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
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        flap();
      } else if (e.code === "Escape") {
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(GAME_W * dpr);
      canvas.height = Math.round(GAME_H * dpr);
      canvas.style.width = `${Math.round(GAME_W * scale)}px`;
      canvas.style.height = `${Math.round(GAME_H * scale)}px`;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const s = gameState.current;

      if (ctx) {
        // --- 1. UPDATE STATE ---
        const level = FLAPPY_LEVELS[s.levelIndex] ?? FLAPPY_LEVELS[0];

        // Screen shake decay
        if (s.screenShake > 0) {
          s.screenShake -= dt * 30;
          if (s.screenShake < 0) s.screenShake = 0;
        }

        // Parallax stars scroll
        for (const star of s.stars) {
          star.twinklePhase += star.twinkleSpeed;
          if (s.mode === "RUNNING") {
            star.x -= star.speed;
            if (star.x < 0) star.x = GAME_W + 5;
          }
        }

        // Parallax buildings scroll
        if (s.mode === "RUNNING") {
          const bgSpeed = level.speed * 0.28;
          for (const b of s.buildings) {
            b.x -= bgSpeed;
          }
          if (s.buildings.length && s.buildings[0].x + s.buildings[0].width < 0) {
            const recycled = s.buildings.shift()!;
            const lastB = s.buildings[s.buildings.length - 1];
            recycled.x = (lastB ? lastB.x + lastB.width : GAME_W) + 6 + Math.random() * 10;
            s.buildings.push(recycled);
          }

          // Ground perspective scroll
          s.groundScrollX = (s.groundScrollX - level.speed) % 40;
        }

        // Mode specific updates
        if (s.mode === "READY") {
          s.wingTimer += dt * 8;
          s.birdY = 260 + Math.sin(s.wingTimer) * 7;
          s.birdAngle = 0;
        } else if (s.mode === "RUNNING") {
          s.wingTimer += dt * 14;

          // Bird physics
          s.birdSpeed += GRAVITY;
          if (s.birdSpeed > MAX_FALL_SPEED) s.birdSpeed = MAX_FALL_SPEED;
          s.birdY += s.birdSpeed;

          // Ceiling clamp
          if (s.birdY - BIRD_RADIUS <= CEILING_Y) {
            s.birdY = CEILING_Y + BIRD_RADIUS;
            if (s.birdSpeed < 0) s.birdSpeed = 0;
          }

          // Angle interpolation
          if (s.birdSpeed < 0) {
            s.birdAngle = Math.max(-0.45, s.birdAngle - 0.15);
          } else {
            s.birdAngle = Math.min(1.2, s.birdAngle + 0.05 + s.birdSpeed * 0.02);
          }

          // Pylons update
          for (const pylon of s.pylons) {
            pylon.x -= level.speed;

            // Oscillation
            if (level.oscillating && pylon.oscillationAmp > 0) {
              pylon.oscillationPhase += pylon.oscillationSpeed;
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

              // Spawn celebratory gate particles
              for (let i = 0; i < 14; i++) {
                s.particles.push({
                  x: pylon.x + PYLON_WIDTH / 2,
                  y: pylon.topHeight + (Math.random() * pylon.gapSize),
                  vx: (Math.random() - 0.5) * 3.5,
                  vy: (Math.random() - 0.5) * 3.5,
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
              pylon.orb.sparklePhase += 0.08;
              const orbX = pylon.x + PYLON_WIDTH / 2;
              if (isBirdCollectingOrb(BIRD_X, s.birdY, BIRD_RADIUS, orbX, pylon.orb.y)) {
                pylon.orb.collected = true;
                s.score += 50;
                s.orbsCollected += 1;
                flappyAudio.playOrb();

                s.floatingTexts.push({
                  x: orbX,
                  y: pylon.orb.y - 12,
                  text: "+50",
                  color: "#ffd700",
                  alpha: 1,
                  vy: -1.2,
                });

                for (let i = 0; i < 18; i++) {
                  s.particles.push({
                    x: orbX,
                    y: pylon.orb.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    color: Math.random() < 0.5 ? "#ffd700" : "#ffffff",
                    size: 3 + Math.random() * 2,
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
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // Floating texts update
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += ft.vy;
          ft.alpha -= 0.022;
          if (ft.alpha <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Helper for death
        function triggerCrash() {
          s.mode = "GAME_OVER";
          s.screenShake = 16;
          flappyAudio.playCrash();

          // Spawn 40 digital explosion particles
          for (let i = 0; i < 40; i++) {
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

        // --- 2. RENDER SCENE ---
        ctx.save();

        // Screen shake offset
        if (s.screenShake > 0) {
          const ox = (Math.random() - 0.5) * s.screenShake;
          const oy = (Math.random() - 0.5) * s.screenShake;
          ctx.translate(ox, oy);
        }

        // A. Background Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGrad.addColorStop(0, level.palette.bgSkyTop);
        skyGrad.addColorStop(1, level.palette.bgSkyBottom);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, GAME_W, GROUND_Y);

        // B. Stars
        for (const star of s.stars) {
          const alpha = 0.35 + Math.sin(star.twinklePhase) * 0.45;
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
          ctx.fillRect(star.x, star.y, star.size, star.size);
        }

        // C. Parallax Cyber Skyline
        for (const b of s.buildings) {
          const by = GROUND_Y - b.height;
          // Building silhouette
          ctx.fillStyle = level.palette.citySilhouette;
          ctx.fillRect(b.x, by, b.width, b.height);

          // Subtle building edge line
          ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
          ctx.lineWidth = 1;
          ctx.strokeRect(b.x, by, b.width, b.height);

          // Roof antenna light
          if (b.width > 55) {
            ctx.fillStyle = level.palette.cityWindows;
            ctx.fillRect(b.x + b.width / 2 - 1, by - 6, 2, 6);
            ctx.fillStyle = "#ff0055";
            ctx.fillRect(b.x + b.width / 2 - 2, by - 8, 4, 2);
          }

          // Windows
          for (const win of b.windows) {
            if (win.on) {
              ctx.fillStyle = level.palette.cityWindows;
              ctx.globalAlpha = 0.65;
              ctx.fillRect(b.x + win.x, by + win.y, 4, 6);
              ctx.globalAlpha = 1.0;
            }
          }
        }

        // D. Laser Conduit Pylons
        for (const pylon of s.pylons) {
          const px = pylon.x;
          const topH = pylon.topHeight;
          const botY = topH + pylon.gapSize;
          const botH = GROUND_Y - botY;

          // 1. Top Pylon Body
          ctx.fillStyle = level.palette.pylonFill;
          ctx.fillRect(px, 0, PYLON_WIDTH, topH);
          ctx.strokeStyle = level.palette.pylonBorder;
          ctx.lineWidth = 2.5;
          ctx.strokeRect(px, 0, PYLON_WIDTH, topH);

          // 2. Bottom Pylon Body
          ctx.fillStyle = level.palette.pylonFill;
          ctx.fillRect(px, botY, PYLON_WIDTH, botH);
          ctx.strokeRect(px, botY, PYLON_WIDTH, botH);

          // 3. Interior Circuit Lines
          ctx.fillStyle = level.palette.circuitLines;
          const midX = px + PYLON_WIDTH / 2;
          ctx.fillRect(midX - 2, 10, 4, Math.max(0, topH - 24));
          ctx.fillRect(midX - 2, botY + 14, 4, Math.max(0, botH - 24));

          // Cross circuits
          for (let cy = 25; cy < topH - 20; cy += 32) {
            ctx.fillRect(px + 8, cy, PYLON_WIDTH - 16, 2);
          }
          for (let cy = botY + 30; cy < GROUND_Y - 20; cy += 32) {
            ctx.fillRect(px + 8, cy, PYLON_WIDTH - 16, 2);
          }

          // 4. Capacitor Caps (Flanged Endpoints)
          const capH = 16;
          const capOver = 6;
          // Top Cap
          ctx.fillStyle = level.palette.pylonCap;
          ctx.fillRect(px - capOver, topH - capH, PYLON_WIDTH + capOver * 2, capH);
          ctx.strokeRect(px - capOver, topH - capH, PYLON_WIDTH + capOver * 2, capH);

          // Bottom Cap
          ctx.fillRect(px - capOver, botY, PYLON_WIDTH + capOver * 2, capH);
          ctx.strokeRect(px - capOver, botY, PYLON_WIDTH + capOver * 2, capH);

          // 5. Plasma Arc Shimmer in Gate Gap
          const arcPulse = 0.15 + Math.sin(currentTime * 0.008 + pylon.id) * 0.1;
          ctx.fillStyle = level.palette.accent;
          ctx.globalAlpha = Math.max(0.04, arcPulse);
          ctx.fillRect(px + 4, topH, PYLON_WIDTH - 8, pylon.gapSize);
          ctx.globalAlpha = 1.0;

          // 6. Bonus Data Orb
          if (pylon.orb && !pylon.orb.collected) {
            const ox = px + PYLON_WIDTH / 2;
            const oy = pylon.orb.y;
            const pulse = 1 + Math.sin(pylon.orb.sparklePhase) * 0.18;

            ctx.save();
            ctx.translate(ox, oy);

            // Outer energy glow ring
            ctx.strokeStyle = "#ffd700";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, (ORB_RADIUS + 4) * pulse, 0, Math.PI * 2);
            ctx.stroke();

            // Inner core orb
            ctx.fillStyle = "#fff5a0";
            ctx.beginPath();
            ctx.arc(0, 0, ORB_RADIUS, 0, Math.PI * 2);
            ctx.fill();

            // Orbiting cyber pixel bit
            const bitAngle = pylon.orb.sparklePhase * 2.5;
            const bitX = Math.cos(bitAngle) * (ORB_RADIUS + 7);
            const bitY = Math.sin(bitAngle) * (ORB_RADIUS + 7);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(bitX - 2, bitY - 2, 4, 4);

            ctx.restore();
          }
        }

        // E. Cyber Grid Ground
        ctx.fillStyle = level.palette.groundSurface;
        ctx.fillRect(0, GROUND_Y, GAME_W, GAME_H - GROUND_Y);

        // Ground top border & neon light line
        ctx.strokeStyle = level.palette.pylonBorder;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(GAME_W, GROUND_Y);
        ctx.stroke();

        // Scrolling perspective vertical grid lines
        ctx.strokeStyle = level.palette.groundGrid;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.55;
        for (let gx = s.groundScrollX; gx < GAME_W; gx += 40) {
          ctx.beginPath();
          ctx.moveTo(gx, GROUND_Y);
          ctx.lineTo(gx - 30, GAME_H);
          ctx.stroke();
        }
        // Horizontal scanlines in ground
        for (let gy = GROUND_Y + 14; gy < GAME_H; gy += 16) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(GAME_W, gy);
          ctx.stroke();
        }
        ctx.globalAlpha = 1.0;

        // F. Particles
        for (const p of s.particles) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1.0;

        // G. Floating Texts (+50 etc.)
        ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
        ctx.textAlign = "center";
        for (const ft of s.floatingTexts) {
          ctx.fillStyle = ft.color;
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.globalAlpha = 1.0;

        // H. Render Cyber Bird (The Protagonist)
        if (s.mode !== "GAME_OVER") {
          ctx.save();
          ctx.translate(BIRD_X, s.birdY);
          ctx.rotate(s.birdAngle);

          // 1. Dual Thruster Nozzle & Exhaust Glow
          ctx.fillStyle = "#334155";
          ctx.fillRect(-18, -4, 6, 8);
          ctx.fillStyle = level.palette.accent;
          ctx.fillRect(-22, -2, 4, 4);

          // 2. Aerodynamic Cyber Fuselage
          const bodyGrad = ctx.createLinearGradient(-12, -12, 14, 12);
          bodyGrad.addColorStop(0, "#e2e8f0");
          bodyGrad.addColorStop(0.5, "#94a3b8");
          bodyGrad.addColorStop(1, "#334155");
          ctx.fillStyle = bodyGrad;

          ctx.beginPath();
          ctx.moveTo(18, 0); // nose cone
          ctx.lineTo(4, -13); // upper forehead
          ctx.lineTo(-14, -10); // back upper
          ctx.lineTo(-15, 8); // back lower
          ctx.lineTo(6, 12); // chin
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 1.8;
          ctx.stroke();

          // 3. Cyber Cockpit Visor (Cyan/Magenta glow)
          ctx.fillStyle = level.palette.accent;
          ctx.beginPath();
          ctx.moveTo(6, -8);
          ctx.lineTo(16, -2);
          ctx.lineTo(13, 3);
          ctx.lineTo(4, 2);
          ctx.closePath();
          ctx.fill();

          // Visor interior eye glare
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(10, -3, 3, 3);

          // 4. Articulated Cyber Wing (animated flap)
          const wingFlap = Math.sin(s.wingTimer) * 10;
          ctx.save();
          ctx.translate(-4, 0);

          ctx.fillStyle = "#cbd5e1";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-12, -14 + wingFlap);
          ctx.lineTo(6, -8 + wingFlap * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = level.palette.accent;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();

          // 5. Under-beak sensor probe
          ctx.fillStyle = "#ffd700";
          ctx.fillRect(14, 3, 5, 2);

          ctx.restore();
        }

        // I. HUD Overlay (Top Bar)
        renderHUD(ctx, s, level);

        // J. Modals & Banner Overlays
        if (s.mode === "READY") {
          renderReadyOverlay(ctx, s, level);
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
  }, []);

  // Helper renderers for UI and overlays
  function renderHUD(
    ctx: CanvasRenderingContext2D,
    s: typeof gameState.current,
    level: FlappyLevelConfig
  ) {
    ctx.save();
    // HUD background plate
    ctx.fillStyle = "rgba(4, 9, 20, 0.88)";
    ctx.fillRect(0, 0, GAME_W, 46);
    ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 46);
    ctx.lineTo(GAME_W, 46);
    ctx.stroke();

    ctx.font = `bold 14px "${EMBEDDED_FAMILY}", monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    // Level indicator
    ctx.fillStyle = level.palette.accent;
    const lvlText = s.isEndless
      ? "MODE: ENDLESS CYBER FLAP"
      : `LVL 0${level.levelNumber} // ${level.name}`;
    ctx.fillText(lvlText, 24, 24);

    // Gates quota progress
    if (!s.isEndless) {
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(
        `GATES: ${s.gatesClearedInLevel} / ${level.targetGates}`,
        320,
        24
      );
    }

    // Score & Best
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`SCORE: ${s.score}`, GAME_W - 160, 24);

    ctx.fillStyle = "#ffd700";
    ctx.fillText(`BEST: ${s.highScore}`, GAME_W - 24, 24);

    ctx.restore();
  }

  function renderReadyOverlay(
    ctx: CanvasRenderingContext2D,
    s: typeof gameState.current,
    level: FlappyLevelConfig
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(2, 6, 18, 0.72)";
    ctx.fillRect(0, 46, GAME_W, GROUND_Y - 46);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Game Title
    ctx.font = `bold 38px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = level.palette.accent;
    ctx.fillText("CYBER FLAPPY", GAME_W / 2, 190);

    // Level Subtitle
    ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`MISSION: LEVEL 0${level.levelNumber} - ${level.name}`, GAME_W / 2, 235);

    ctx.font = `14px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`PASS ${level.targetGates} LASER GATES TO ADVANCE`, GAME_W / 2, 265);

    // Pulsing Start Prompt
    const pulse = 0.65 + Math.sin(Date.now() * 0.006) * 0.35;
    ctx.font = `bold 18px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
    ctx.fillText("[ PRESS SPACE / UP OR CLICK TO FLAP ]", GAME_W / 2, 335);

    ctx.font = `12px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#64748b";
    ctx.fillText("ESC: EXIT TO ARCADE MENU", GAME_W / 2, 385);

    ctx.restore();
  }

  function renderLevelClearOverlay(
    ctx: CanvasRenderingContext2D,
    s: typeof gameState.current,
    level: FlappyLevelConfig
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(2, 6, 20, 0.78)";
    ctx.fillRect(0, 46, GAME_W, GROUND_Y - 46);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `bold 36px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#00ff88";
    ctx.fillText("SECTOR CLEARED!", GAME_W / 2, 210);

    ctx.font = `16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `LEVEL 0${level.levelNumber} COMPLETED WITH ${s.score} POINTS`,
      GAME_W / 2,
      260
    );

    const pulse = 0.6 + Math.sin(Date.now() * 0.008) * 0.4;
    ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = `rgba(0, 240, 255, ${pulse})`;
    ctx.fillText("HYPER-WARP TO NEXT SECTOR...", GAME_W / 2, 315);
    ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("[ PRESS SPACE TO ADVANCE IMMEDIATELY ]", GAME_W / 2, 355);

    ctx.restore();
  }

  function renderVictoryOverlay(
    ctx: CanvasRenderingContext2D,
    s: typeof gameState.current
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(4, 8, 24, 0.88)";
    ctx.fillRect(0, 46, GAME_W, GROUND_Y - 46);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Pulsing Gold Header
    ctx.font = `bold 42px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#ffd700";
    ctx.fillText("GRAND VICTORY!", GAME_W / 2, 175);

    ctx.font = `bold 18px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#00f0ff";
    ctx.fillText("ALL 5 CYBER SECTORS CONQUERED", GAME_W / 2, 225);

    // Final Stats
    ctx.font = `16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`FINAL SCORE: ${s.score}   ·   DATA ORBS: ${s.orbsCollected}`, GAME_W / 2, 275);
    ctx.fillStyle = "#ffd700";
    ctx.fillText(`ALL-TIME HIGH SCORE: ${s.highScore}`, GAME_W / 2, 305);

    // Prompt
    const pulse = 0.7 + Math.sin(Date.now() * 0.006) * 0.3;
    ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
    ctx.fillText("[ PRESS SPACE OR CLICK FOR ENDLESS MODE ]", GAME_W / 2, 365);

    ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#64748b";
    ctx.fillText("ESC: RETURN TO ARCADE MENU", GAME_W / 2, 410);

    ctx.restore();
  }

  function renderGameOverOverlay(
    ctx: CanvasRenderingContext2D,
    s: typeof gameState.current
  ) {
    ctx.save();
    ctx.fillStyle = "rgba(22, 2, 8, 0.84)";
    ctx.fillRect(0, 46, GAME_W, GROUND_Y - 46);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Danger Header
    ctx.font = `bold 40px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#ff0055";
    ctx.fillText("SYSTEM CRITICAL", GAME_W / 2, 190);

    ctx.font = `bold 18px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText("DRONE DESTROYED IN TRANSIT", GAME_W / 2, 235);

    ctx.font = `16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`FINAL SCORE: ${s.score}   ·   BEST: ${s.highScore}`, GAME_W / 2, 280);

    // Retry Prompt
    const pulse = 0.65 + Math.sin(Date.now() * 0.007) * 0.35;
    ctx.font = `bold 16px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
    ctx.fillText("[ PRESS SPACE OR CLICK TO REBOOT SYSTEM ]", GAME_W / 2, 345);

    ctx.font = `13px "${EMBEDDED_FAMILY}", monospace`;
    ctx.fillStyle = "#64748b";
    ctx.fillText("ESC: RETURN TO ARCADE MENU", GAME_W / 2, 395);

    ctx.restore();
  }

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
