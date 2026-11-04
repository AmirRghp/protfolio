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
    id: "tetris",
    title: "Pixel Tetris",
    system: "Arcade Puzzle",
    year: "1984",
    badge: "COMING SOON",
    playable: false,
    description: "Falling-block puzzle classic. Clear lines and manage the matrix. Coming soon in a future update.",
    icon: TetrisIcon,
  },
  {
    id: "snake",
    title: "Snake Grid",
    system: "Retro Arcade",
    year: "1997",
    badge: "COMING SOON",
    playable: false,
    description: "Grid-based snake retro action. Feed, grow, and avoid walls. Coming soon in a future update.",
    icon: SnakeIcon,
  },
  {
    id: "deparkanoid",
    title: "Deparkanoid",
    system: "Canvas Breakout",
    year: "1986",
    badge: "COMING SOON",
    playable: false,
    description: "Paddle-and-ball arcade brick breaker with ricochet bounce physics. Coming soon in a future update.",
    icon: ArkanoidIcon,
  },
];
