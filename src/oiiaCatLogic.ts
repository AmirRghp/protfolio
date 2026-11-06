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

  // Bouncy sine arc per beat
  const bounceWave = Math.sin(beatPhase * Math.PI);
  const bounceY = bounceWave * (isDrop ? 0.045 : 0.025) * (0.8 + bassEnergy * 0.4);

  // Wobble / tilt during dance
  const wobbleSpeed = isDrop ? 14 : 9;
  const tiltAmp = (isDrop ? 0.085 : 0.045) * (0.6 + bassEnergy * 0.5);
  const tiltX = Math.sin(beatTime * wobbleSpeed) * tiltAmp;
  const tiltZ = Math.cos(beatTime * (wobbleSpeed * 0.85)) * tiltAmp;

  return { bounceY, tiltX, tiltZ };
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
