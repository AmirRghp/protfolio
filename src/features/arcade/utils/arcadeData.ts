import type { ReactNode } from "react";
import { createElement } from "react";

export const ARCADE_GAME_URL = "https://www.ps1fun.com/play/crash-bandicoot/1212";
export const ARCADE_LOAD_TIMEOUT_MS = 8000;

export type GameItem = {
  id: string;
  title: string;
  system: string;
  year: string;
  badge: "PLAY" | "COMING SOON";
  playable: boolean;
  description: string;
  controls?: string;
  icon: (props: { className?: string }) => ReactNode;
};

export function CrashIcon({ className }: { className?: string }) {
  return createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    createElement("path", { d: "M6 3h12l2 6-8 12-8-12z" }),
    createElement("path", { d: "M10 9l2 2 2-2" }),
    createElement("circle", { cx: "9", cy: "7", r: "1", fill: "currentColor" }),
    createElement("circle", { cx: "15", cy: "7", r: "1", fill: "currentColor" }),
  );
}

export function TetrisIcon({ className }: { className?: string }) {
  return createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
    },
    createElement("rect", { x: "4", y: "4", width: "7", height: "7", rx: "1" }),
    createElement("rect", { x: "13", y: "4", width: "7", height: "7", rx: "1" }),
    createElement("rect", { x: "4", y: "13", width: "7", height: "7", rx: "1" }),
    createElement("rect", { x: "13", y: "13", width: "7", height: "7", rx: "1" }),
  );
}

export function SnakeIcon({ className }: { className?: string }) {
  return createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    createElement("path", { d: "M4 18h6a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3h4" }),
    createElement("circle", { cx: "19", cy: "6", r: "1.5", fill: "currentColor" }),
  );
}

export function ArkanoidIcon({ className }: { className?: string }) {
  return createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
    },
    createElement("circle", { cx: "12", cy: "7", r: "2.5", fill: "currentColor" }),
    createElement("rect", { x: "6", y: "18", width: "12", height: "3", rx: "1.5", fill: "currentColor" }),
    createElement("path", { d: "M7 14l5-4 5 4", strokeDasharray: "2 2" }),
  );
}

export function FlappyIcon({ className }: { className?: string }) {
  return createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    createElement("path", { d: "M3 13c3-3 8-4 13-1l5 1-4 4c-4 2-9 1-14-4z" }),
    createElement("path", { d: "M9 11l4-7c2 2 3 5 2 7" }),
    createElement("circle", { cx: "16", cy: "11", r: "1", fill: "currentColor" }),
  );
}

export function PixelRunIcon({ className }: { className?: string }) {
  return createElement(
    "svg",
    {
      className,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    },
    // Cyber dino / raptor runner icon
    createElement("path", { d: "M4 14l4-3 5-1 3-5 5 1-1 4-3 1v3l3 4" }),
    createElement("path", { d: "M11 13l-2 5-4 1" }),
    createElement("path", { d: "M14 14l2 4 3 2" }),
    createElement("circle", { cx: "17", cy: "7", r: "1", fill: "currentColor" }),
    createElement("path", { d: "M2 20h20", strokeDasharray: "3 2" }),
  );
}

export const ARCADE_GAMES: GameItem[] = [
  {
    id: "crash",
    title: "Crash Bandicoot",
    system: "PlayStation 1",
    year: "1996",
    badge: "PLAY",
    playable: true,
    description: "Classic 3D platformer featuring Crash. Dodge TNT, collect Wumpa fruit, and take on Dr. Neo Cortex.",
    controls: "Arrows: Move · Space/X: Jump · C: Spin",
    icon: CrashIcon,
  },
  {
    id: "pixelrun",
    title: "Pixel Run",
    system: "Neon Arcade",
    year: "2024",
    badge: "PLAY",
    playable: true,
    description: "Retro 5-sector cyberpunk dino runner with variable jump, slide-ducking, aerial hunter drones, and 8-bit synthwave audio.",
    controls: "Space/Up: Jump · Down: Duck/Slide · M: Music · Esc: Exit",
    icon: PixelRunIcon,
  },
  {
    id: "tetris",
    title: "Cyber Tetris",
    system: "Neon Arcade",
    year: "1984",
    badge: "PLAY",
    playable: true,
    description: "Retro 5-sector cyberpunk falling-block puzzle with SRS wall kicks, ghost piece, hold queue, particle bursts, and 8-bit chiptune sound.",
    controls: "Arrows/WASD: Move/Rotate · Space: Hard Drop · C: Hold · M: Music · Esc: Exit",
    icon: TetrisIcon,
  },
  {
    id: "snake",
    title: "Snake Grid",
    system: "Retro Arcade",
    year: "1997",
    badge: "PLAY",
    playable: true,
    description: "Retro 5-level cyber snake with progressive speed, obstacle mazes, golden bonus apples, and neon particle bursts.",
    controls: "Arrows / WASD: Move · Space / Click: Start / Advance · Esc: Exit",
    icon: SnakeIcon,
  },
  {
    id: "deparkanoid",
    title: "Deparkanoid",
    system: "Canvas Breakout",
    year: "1986",
    badge: "PLAY",
    playable: true,
    description: "Retro 5-level brick breaker with custom pixel art, authentic ricochet physics, and retro Departure Mono typography.",
    controls: "Mouse / Arrows: Move · Space / Click: Launch · Esc: Exit",
    icon: ArkanoidIcon,
  },
  {
    id: "flappy",
    title: "Cyber Flappy",
    system: "Neon Arcade",
    year: "2024",
    badge: "PLAY",
    playable: true,
    description: "Retro 5-level cyber flappy with laser conduit pylons, oscillating gates, bonus data orbs, and neon particle bursts.",
    controls: "Space / Up / Click: Flap · Esc: Exit",
    icon: FlappyIcon,
  },
];

/**
 * The 5 native HTML5 Canvas games available on the Mobile Retro Handheld Console.
 * Excludes Crash Bandicoot (PS1 iframe) to guarantee 60fps native touch performance.
 */
export const MOBILE_ARCADE_GAMES: GameItem[] = ARCADE_GAMES.filter((g) => g.id !== "crash");

export type GameControlAction = {
  id: string;
  label: string;
  key: string;
  code?: string;
  color?: "cyan" | "magenta" | "amber";
};

export type GameControlProfile = {
  showDpad: boolean;
  actions: GameControlAction[];
};

export const GAME_CONTROL_PROFILES: Record<string, GameControlProfile> = {
  flappy: {
    showDpad: false,
    actions: [{ id: "flap", label: "FLAP", key: " ", code: "Space", color: "cyan" }],
  },
  deparkanoid: {
    showDpad: true,
    actions: [{ id: "launch", label: "LAUNCH", key: " ", code: "Space", color: "amber" }],
  },
  pixelrun: {
    showDpad: false,
    actions: [
      { id: "jump", label: "JUMP", key: "ArrowUp", code: "ArrowUp", color: "cyan" },
      { id: "slide", label: "SLIDE", key: "ArrowDown", code: "ArrowDown", color: "magenta" },
    ],
  },
  snake: {
    showDpad: true,
    actions: [{ id: "start", label: "START", key: " ", code: "Space", color: "cyan" }],
  },
  tetris: {
    showDpad: true,
    actions: [
      { id: "rotate", label: "ROTATE", key: "ArrowUp", code: "ArrowUp", color: "cyan" },
      { id: "drop", label: "HARD DROP", key: " ", code: "Space", color: "magenta" },
      { id: "hold", label: "HOLD", key: "c", code: "KeyC", color: "amber" },
    ],
  },
};

export function pressKey(key: string, code?: string): void {
  if (typeof window === "undefined") return;
  const resolvedCode = code ?? (key === " " ? "Space" : key);
  const event =
    typeof KeyboardEvent !== "undefined"
      ? new KeyboardEvent("keydown", { key, code: resolvedCode, bubbles: true, cancelable: true })
      : Object.assign(new Event("keydown", { bubbles: true, cancelable: true }), {
          key,
          code: resolvedCode,
        });
  window.dispatchEvent(event);
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(10);
    } catch {
      /* ignore vibration errors on unsupported devices */
    }
  }
}

export function releaseKey(key: string, code?: string): void {
  if (typeof window === "undefined") return;
  const resolvedCode = code ?? (key === " " ? "Space" : key);
  const event =
    typeof KeyboardEvent !== "undefined"
      ? new KeyboardEvent("keyup", { key, code: resolvedCode, bubbles: true, cancelable: true })
      : Object.assign(new Event("keyup", { bubbles: true, cancelable: true }), {
          key,
          code: resolvedCode,
        });
  window.dispatchEvent(event);
}

