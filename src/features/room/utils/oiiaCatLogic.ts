import { DataTexture, LinearFilter, RGBAFormat } from "three";

/**
 * Mathematical calculations and animation helpers for Oiia Cat
 */

export const PARTY_COLORS = [
  "#00e5ff", // Electric Cyan
  "#ff007f", // Neon Magenta
  "#a855f7", // Deep Purple
  "#fde047", // Neon Yellow
  "#38bdf8", // Sky Blue
  "#f43f5e", // Hot Pink
];

/**
 * Creates an elongated loaf footprint contact shadow texture with smooth-feathered
 * ambient occlusion gradient (dense dark core with soft fade to zero at boundary).
 */
export function createLoafShadowTexture(): DataTexture {
  const width = 128;
  const height = 256;
  const data = new Uint8Array(width * height * 4);

  const paws = [
    { x: 0.30, y: 0.72, rx: 0.14, ry: 0.08 },
    { x: 0.70, y: 0.72, rx: 0.14, ry: 0.08 },
    { x: 0.26, y: 0.28, rx: 0.14, ry: 0.08 },
    { x: 0.74, y: 0.28, rx: 0.14, ry: 0.08 },
  ];

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    // Capsule spine along length
    const cy = Math.max(-60, Math.min(60, y - 128));
    const dy = (y - 128) - cy;

    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const dx = x - 64;
      const d = Math.sqrt((dx / 44) ** 2 + (dy / 44) ** 2);
      const idx = (y * width + x) * 4;

      // Dark ambient occlusion tone: #090706
      data[idx] = 9;
      data[idx + 1] = 7;
      data[idx + 2] = 6;

      if (d >= 1.0) {
        data[idx + 3] = 0;
      } else {
        const bodyAlpha = Math.exp(-2.2 * d * d) * Math.cos(d * Math.PI * 0.5);
        let pawAlpha = 0;
        for (const p of paws) {
          const pdx = (nx - p.x) / p.rx;
          const pdy = (ny - p.y) / p.ry;
          const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pdist < 1.0) {
            pawAlpha += Math.exp(-2.0 * pdist * pdist) * (1 - pdist) * 0.45;
          }
        }
        const totalAlpha = Math.min(1.0, bodyAlpha + pawAlpha);
        data[idx + 3] = Math.round(totalAlpha * 255);
      }
    }
  }

  const texture = new DataTexture(data, width, height, RGBAFormat);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function calculateShortestAngleDiff(
  currentAngle: number,
  targetAngle: number,
): number {
  const twoPi = Math.PI * 2;
  const target = ((targetAngle % twoPi) + twoPi) % twoPi;
  const current = ((currentAngle % twoPi) + twoPi) % twoPi;
  let diff = (target - current + Math.PI) % twoPi;
  if (diff < 0) diff += twoPi;
  diff -= Math.PI;
  return diff;
}

export function calculateSpinVelocity(
  timeInDance: number,
  isDrop: boolean,
  reducedMotion: boolean,
): number {
  if (reducedMotion) {
    return 0.45; // Gentle 0.45 rad/s (~1 rotation every 14 seconds)
  }

  if (isDrop) {
    // Drop mode: 4.5 rotations/sec (~28 rad/s)
    return Math.PI * 2 * 4.5;
  }

  // Smooth ramp-up from 0.8 to 2.2 rotations/sec over the first 6 seconds
  const ramp = Math.min(1, Math.max(0, timeInDance / 6.0));
  const rotationsPerSecond = 0.8 + ramp * 1.4;
  return Math.PI * 2 * rotationsPerSecond;
}

export function calculateMorphInfluence(
  currentInfluence: number,
  dancing: boolean,
  delta: number,
  speed = 3.0,
): number {
  const target = dancing ? 1.0 : 0.0;
  if (currentInfluence === target) return target;

  const step = delta * speed;
  if (target > currentInfluence) {
    return Math.min(target, currentInfluence + step);
  }
  return Math.max(target, currentInfluence - step);
}

export function calculateHoverHeight(
  timeInDance: number,
  isDrop: boolean,
  dancing: boolean,
  reducedMotion: boolean,
): number {
  if (!dancing) return 0;
  if (reducedMotion) return 0.02;

  if (isDrop) {
    return 0.085; // Elevates noticeably above desk during drop
  }

  // Smoothly hover up to ~0.035 as dance gets going
  const ramp = Math.min(1, Math.max(0, (timeInDance - 1.5) / 3.0));
  return ramp * 0.035;
}

export function calculateCatBounce(
  beatTime: number,
  bassEnergy: number,
  isDrop: boolean,
  dancing: boolean,
  reducedMotion: boolean,
  bpm = 160,
): { bounceY: number; tiltX: number; tiltZ: number } {
  if (!dancing || reducedMotion) {
    return { bounceY: 0, tiltX: 0, tiltZ: 0 };
  }

  const beatPeriod = 60 / bpm; // 0.375s
  const beatPhase = (beatTime % beatPeriod) / beatPeriod;

  // Pure vertical bouncy sine arc per beat without off-axis wobble
  const bounceWave = Math.sin(beatPhase * Math.PI);
  const bounceY = bounceWave * (isDrop ? 0.045 : 0.025) * (0.8 + bassEnergy * 0.4);

  return { bounceY, tiltX: 0, tiltZ: 0 };
}

export function calculateShadowProperties(hoverY: number): {
  scale: number;
  opacity: number;
} {
  // Shadow expands and fades slightly as cat lifts off the desk
  const scale = 1.0 + hoverY * 3.5;
  const opacity = Math.max(0.18, 0.46 - hoverY * 2.2);
  return { scale, opacity };
}

export function calculatePartyLight(
  time: number,
  bassEnergy: number,
  isDrop: boolean,
  dancing: boolean,
  reducedMotion: boolean,
): { color: string; intensity: number } {
  if (!dancing) {
    return { color: "#000000", intensity: 0 };
  }

  if (reducedMotion) {
    return { color: "#38bdf8", intensity: 1.2 };
  }

  // Pick color based on time and beat
  const colorIndex = Math.floor((time * 2.5) % PARTY_COLORS.length);
  const color = PARTY_COLORS[colorIndex] ?? PARTY_COLORS[0];

  const baseIntensity = isDrop ? 3.5 : 1.2;
  const pulseIntensity = bassEnergy * (isDrop ? 6.0 : 2.8);
  const intensity = baseIntensity + pulseIntensity;

  return { color, intensity };
}

export interface RaveLightingState {
  wallLeftColor: string;
  wallRightColor: string;
  wallIntensity: number;
  shelf1LColor: string;
  shelf1RColor: string;
  shelf2LColor: string;
  shelf2RColor: string;
  shelf1LIntensity: number;
  shelf1RIntensity: number;
  shelf2LIntensity: number;
  shelf2RIntensity: number;
  ambientColor: string;
  ambientIntensity: number;
  hemiColor: string;
  hemiIntensity: number;
  backgroundColor: string;
}

export function calculateRaveLightingState(
  currentTime: number,
  bassEnergy: number,
  defaults: {
    wallIntensity?: number;
    shelfIntensity?: number;
    ambientIntensity?: number;
    hemiIntensity?: number;
    defaultBg?: string;
  } = {},
): RaveLightingState {
  const defaultWall = defaults.wallIntensity ?? 4.5;
  const defaultShelf = defaults.shelfIntensity ?? 5.5;
  const defaultAmbient = defaults.ambientIntensity ?? 0.38;
  const defaultHemi = defaults.hemiIntensity ?? 0.45;
  const defaultBg = defaults.defaultBg ?? "#080614";

  const beatIndex = Math.floor(currentTime * (160 / 60));
  const subBeat = Math.floor(currentTime * (320 / 60)) % 2;

  const colL = PARTY_COLORS[beatIndex % PARTY_COLORS.length] ?? PARTY_COLORS[0];
  const colR = PARTY_COLORS[(beatIndex + 2) % PARTY_COLORS.length] ?? PARTY_COLORS[2];
  const colS1 = PARTY_COLORS[(beatIndex + 1) % PARTY_COLORS.length] ?? PARTY_COLORS[1];
  const colS2 = PARTY_COLORS[(beatIndex + 3) % PARTY_COLORS.length] ?? PARTY_COLORS[3];

  return {
    wallLeftColor: colL,
    wallRightColor: colR,
    wallIntensity: defaultWall + bassEnergy * 4.0,
    shelf1LColor: subBeat === 0 ? colS1 : colS2,
    shelf1RColor: subBeat === 1 ? colS2 : colS1,
    shelf2LColor: subBeat === 1 ? colS1 : colS2,
    shelf2RColor: subBeat === 0 ? colS2 : colS1,
    shelf1LIntensity: defaultShelf + (subBeat === 0 ? bassEnergy * 5.0 : bassEnergy * 1.5),
    shelf1RIntensity: defaultShelf + (subBeat === 1 ? bassEnergy * 5.0 : bassEnergy * 1.5),
    shelf2LIntensity: defaultShelf + (subBeat === 1 ? bassEnergy * 5.0 : bassEnergy * 1.5),
    shelf2RIntensity: defaultShelf + (subBeat === 0 ? bassEnergy * 5.0 : bassEnergy * 1.5),
    ambientColor: colL,
    ambientIntensity: defaultAmbient + bassEnergy * 0.40,
    hemiColor: colR,
    hemiIntensity: defaultHemi + bassEnergy * 0.35,
    backgroundColor: bassEnergy > 0.5 ? "#160b2e" : defaultBg,
  };
}

/**
 * Calculates a solid background color for the computer monitor during the fast drop rave.
 * Changes on every beat (160 BPM => beat every 0.375s), perfectly synchronizing with
 * the wall rave lights.
 */
export function calculateMonitorRaveColor(
  currentTime: number,
  reducedMotion = false,
): string {
  if (reducedMotion) return "#1e1b4b";
  const beatIndex = Math.floor(currentTime * (160 / 60));
  return PARTY_COLORS[beatIndex % PARTY_COLORS.length] ?? PARTY_COLORS[0];
}

