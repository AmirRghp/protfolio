export type Palette = {
  carbon: string;
  smoke: string;
  dark: string;
  amber: string;
  pumpkin: string;
  cement: string;
};

export const DEFAULT_PALETTE: Palette = {
  carbon: "#222222",
  smoke: "#666666",
  dark: "#444444",
  amber: "#ffa133",
  pumpkin: "#e47b1a",
  cement: "#c0c0c0",
};

export type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
  points: number;
};

export type LevelConfig = {
  levelNumber: number;
  name: string;
  launchSpeed: number;
  bonusPoints: number;
  map: string[];
};

export const BRICK_W = 80;
export const BRICK_H = 22;
export const BEVEL = 3;
export const GAME_W = 880;
export const GAME_H = 600;

const LEVEL_1_MAP = [
  "...........",
  "...........",
  "...sssss...",
  "..sssaass..",
  ".ssaaaaass.",
  "..sssaass..",
  "...sssss...",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
];

const LEVEL_2_MAP = [
  "..d.....d..",
  "..d.....d..",
  "...d...d...",
  "...d...d...",
  "..sssssss..",
  "..sssssss..",
  ".ssdsssdss.",
  ".ssdsssdss.",
  "sssssssssss",
  "sssssssssss",
  "sssssssssss",
  "sssssssssss",
  "sss.....sss",
  "s.s.....s.s",
  "...ss.ss...",
  "...ss.ss...",
];

const LEVEL_3_MAP = [
  "...........",
  "...a...a...",
  "....a.a....",
  "...aaaaa...",
  "..aa.a.aa..",
  ".aaaaaaaaa.",
  ".a.aaaaa.a.",
  ".a.a...a.a.",
  "...pp.pp...",
  "..ppppppp..",
  "....ppp....",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
];

const LEVEL_4_MAP = [
  ".....p.....",
  "....ppp....",
  "...p.c.p...",
  "..p.ccc.p..",
  ".p.ccacc.p.",
  "..p.ccc.p..",
  "...p.c.p...",
  "....ppp....",
  ".....p.....",
  "..d.....d..",
  ".ddd...ddd.",
  "...........",
  "...........",
  "...........",
  "...........",
  "...........",
];

const LEVEL_5_MAP = [
  ".cc.....cc.",
  "ccca...accc",
  "c.caaaaac.c",
  "..aaaaaaa..",
  ".pp.apa.pp.",
  ".ppppppppp.",
  "..ddddddd..",
  "...ddddd...",
  "..sssssss..",
  ".ss.....ss.",
  ".ss.sss.ss.",
  "..s..s..s..",
  "...........",
  "...........",
  "...........",
  "...........",
];

export const DEPARKANOID_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    name: "WARM UP",
    launchSpeed: 7.5,
    bonusPoints: 500,
    map: LEVEL_1_MAP,
  },
  {
    levelNumber: 2,
    name: "CITADEL",
    launchSpeed: 8.0,
    bonusPoints: 600,
    map: LEVEL_2_MAP,
  },
  {
    levelNumber: 3,
    name: "SPACE INVADER",
    launchSpeed: 8.5,
    bonusPoints: 700,
    map: LEVEL_3_MAP,
  },
  {
    levelNumber: 4,
    name: "DIAMOND MATRIX",
    launchSpeed: 9.0,
    bonusPoints: 800,
    map: LEVEL_4_MAP,
  },
  {
    levelNumber: 5,
    name: "CYBER CORE",
    launchSpeed: 9.5,
    bonusPoints: 1000,
    map: LEVEL_5_MAP,
  },
];

export const TOTAL_LEVELS = DEPARKANOID_LEVELS.length;

export function getBrickColorAndPoints(ch: string, palette: Palette): { color: string; points: number } | null {
  switch (ch) {
    case "s":
      return { color: palette.smoke, points: 50 };
    case "d":
      return { color: palette.dark, points: 75 };
    case "a":
      return { color: palette.amber, points: 100 };
    case "p":
      return { color: palette.pumpkin, points: 125 };
    case "c":
      return { color: palette.cement, points: 150 };
    default:
      return null;
  }
}

export function buildBricksForLevel(levelIndex: number, palette: Palette = DEFAULT_PALETTE): Brick[] {
  const safeIndex = Math.max(0, Math.min(levelIndex, DEPARKANOID_LEVELS.length - 1));
  const level = DEPARKANOID_LEVELS[safeIndex];
  const out: Brick[] = [];

  for (let r = 0; r < level.map.length; r++) {
    const row = level.map[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      const match = getBrickColorAndPoints(ch, palette);
      if (!match) continue;
      out.push({
        x: c * BRICK_W,
        y: r * BRICK_H,
        w: BRICK_W,
        h: BRICK_H,
        c: match.color,
        points: match.points,
      });
    }
  }

  return out;
}
