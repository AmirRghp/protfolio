import { useCallback, useEffect, useMemo, useRef } from "react";
import { GITHUB_USERNAME, useContributions } from "@/data/githubContributions";
import styles from "./githubActivity.module.css";

// 3D Cuboid face colors for GitHub contribution levels 0 to 4: [front, top, side]
// Tuned for nocturnal dark background
const CUBE_COLORS: [string, string, string][] = [
  ["#1c2128", "#282e36", "#14181f"], // Level 0 (no contributions - dark slate)
  ["#0e4429", "#165b36", "#09331e"], // Level 1 (dark green)
  ["#006d32", "#088c42", "#005226"], // Level 2 (medium green)
  ["#26a641", "#38c257", "#1d8333"], // Level 3 (bright green)
  ["#39d353", "#59e56f", "#2ea043"], // Level 4 (vibrant green)
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatBestDayDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || Number.isNaN(parts[0]) || Number.isNaN(parts[1]) || Number.isNaN(parts[2])) {
    return dateStr;
  }
  const [year, month, day] = parts;
  const monthName = MONTH_NAMES[month - 1] ?? "";
  return `${day} ${monthName} ${year}`;
}

function clamp(val: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, val));
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

function fillPolygon(ctx: CanvasRenderingContext2D, points: number[]): void {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    ctx.lineTo(points[i], points[i + 1]);
  }
  ctx.closePath();
  ctx.fill();
}

export function GithubActivitySection() {
  const data = useContributions(GITHUB_USERNAME);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const isIntersectingRef = useRef<boolean>(false);

  // Derive counts, weeks, and peak contribution day
  const { totalDays, weeksCount, counts, levels, bestCount, bestDayDate } = useMemo(() => {
    const rawDays = data.contributions ?? [];
    const len = rawDays.length || 365;
    const weeks = Math.ceil(len / 7);
    const dayCounts = rawDays.map((d) => d.count);
    const dayLevels = rawDays.map((d) => d.level);

    let maxC = 0;
    let maxIdx = 0;
    for (let i = 0; i < len; i++) {
      const c = dayCounts[i] ?? 0;
      if (c > maxC) {
        maxC = c;
        maxIdx = i;
      }
    }

    const peakDay = rawDays[maxIdx]?.date || "";

    return {
      totalDays: len,
      weeksCount: weeks,
      counts: dayCounts,
      levels: dayLevels,
      bestCount: maxC,
      bestDayDate: peakDay,
    };
  }, [data.contributions]);

  const bestDayFormatted = useMemo(() => formatBestDayDate(bestDayDate), [bestDayDate]);

  // Main 3D isometric skyline rendering logic
  const drawSkyline = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number, timeMs: number) => {
      ctx.clearRect(0, 0, width, height);

      const blockWidth = (0.92 * width) / (weeksCount + 3.3 + 1);
      const stepX = 0.55 * blockWidth;
      const stepY = 0.34 * blockWidth;
      const bWidth = 0.74 * blockWidth;
      const bDepthX = 0.74 * stepX;
      const bDepthY = -(0.74 * stepY);
      const startX = (width - (weeksCount * blockWidth + 6 * stepX)) / 2;
      const baseY = 0.9 * height;
      const maxHeightScale = 0.56 * height;

      // Base platform plate (subtle dark platform)
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      fillPolygon(ctx, [
        startX - 0.3 * blockWidth,
        baseY + 0.25 * blockWidth,
        startX + weeksCount * blockWidth,
        baseY + 0.25 * blockWidth,
        startX + weeksCount * blockWidth + 6 * stepX + bDepthX + 0.3 * blockWidth,
        baseY - 6 * stepY + bDepthY - 0.2 * blockWidth,
        startX + 6 * stepX + bDepthX,
        baseY - 6 * stepY + bDepthY - 0.2 * blockWidth,
      ]);

      let pinCoords: [number, number] | null = null;
      const peakIdx = counts.indexOf(bestCount);

      // Painter's algorithm: draw from back to front
      // Row e (0 = Sunday is farthest back with r=6; e=6 = Saturday is nearest with r=0)
      for (let e = 0; e < 7; e++) {
        const r = 6 - e;
        for (let s = 0; s < weeksCount; s++) {
          const dayIdx = 7 * s + e;
          if (dayIdx >= totalDays) continue;

          // Wave easing: wave progresses diagonally across the grid
          const waveProgress = easeOutCubic(
            clamp((timeMs - 200 - 30 * s - 55 * e) / 900),
          );

          const countVal = counts[dayIdx] ?? 0;
          const levelVal = levels[dayIdx] ?? 0;
          const safeMax = Math.max(bestCount, 1);
          const bHeight = Math.max(
            1.5,
            Math.sqrt(countVal / safeMax) * maxHeightScale * waveProgress,
          );

          const posX = startX + s * blockWidth + r * stepX;
          const posY = baseY - r * stepY;
          const [frontCol, topCol, sideCol] = CUBE_COLORS[levelVal] ?? CUBE_COLORS[0];

          // 1. Right side face
          ctx.fillStyle = sideCol;
          fillPolygon(ctx, [
            posX + bWidth,
            posY,
            posX + bWidth,
            posY - bHeight,
            posX + bWidth + bDepthX,
            posY - bHeight + bDepthY,
            posX + bWidth + bDepthX,
            posY + bDepthY,
          ]);

          // 2. Front face
          ctx.fillStyle = frontCol;
          ctx.fillRect(posX, posY - bHeight, bWidth, bHeight);

          // 3. Top face (roof)
          ctx.fillStyle = topCol;
          fillPolygon(ctx, [
            posX,
            posY - bHeight,
            posX + bWidth,
            posY - bHeight,
            posX + bWidth + bDepthX,
            posY - bHeight + bDepthY,
            posX + bDepthX,
            posY - bHeight + bDepthY,
          ]);

          if (dayIdx === peakIdx && bestCount > 0) {
            pinCoords = [posX + bWidth / 2 + bDepthX / 2, posY - bHeight + bDepthY / 2];
          }
        }
      }

      // Leader pin line & callout text for best day
      const pinProgress = easeOutCubic(clamp((timeMs - 3000) / 600));
      if (pinCoords && pinProgress > 0) {
        const [pinX, pinY] = pinCoords;
        const targetY = 0.12 * height;
        const isRightAligned = pinX > 0.65 * width;
        const textX = pinX + (isRightAligned ? -10 : 10);

        ctx.globalAlpha = pinProgress;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pinX, pinY - 4);
        ctx.lineTo(pinX, pinY - 4 - (pinY - 4 - targetY) * pinProgress);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(pinX, pinY - 4, 2.5, 0, 2 * Math.PI);
        ctx.fill();

        // Callout text: serif header & mono uppercase subtitle
        ctx.textAlign = isRightAligned ? "right" : "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#ffffff";
        const titleFontSize = Math.round(Math.max(22, Math.min(36, 0.026 * width)));
        ctx.font = `400 ${titleFontSize}px "Instrument Serif", "Georgia", serif`;
        ctx.fillText(`${bestCount} commits`, textX, targetY - 10 + 0.8 * titleFontSize);

        ctx.fillStyle = "#a1a1aa";
        ctx.font = `500 10px monospace, "Plus Jakarta Sans"`;
        ctx.fillText(
          `${bestDayFormatted}, BEST DAY`.toUpperCase(),
          textX,
          targetY - 10 + 0.8 * titleFontSize + 14,
        );

        ctx.globalAlpha = 1;
      }
    },
    [weeksCount, totalDays, counts, levels, bestCount, bestDayFormatted],
  );

  // Animation controller
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let stageW = 0;
    let stageH = 0;

    const render = (now: number) => {
      if (stageW === 0 || stageH === 0) return;
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      const elapsed = prefersReduced ? Infinity : now - startTimeRef.current;
      drawSkyline(ctx, stageW, stageH, elapsed);

      if (!prefersReduced && isIntersectingRef.current && elapsed < 4200) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1);
      stageW = rect.width;
      stageH = rect.height;

      canvas.width = Math.max(1, Math.round(stageW * dpr));
      canvas.height = Math.max(1, Math.round(stageH * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      render(performance.now());
    });
    resizeObserver.observe(stage);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          if (startTimeRef.current === null) {
            startTimeRef.current = performance.now();
          }
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = requestAnimationFrame(render);
        }
      },
      { threshold: 0.3 },
    );
    intersectionObserver.observe(stage);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [drawSkyline]);

  const handleReplay = useCallback(() => {
    startTimeRef.current = performance.now();
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = stage.getBoundingClientRect();
    const stageW = rect.width;
    const stageH = rect.height;

    const render = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      drawSkyline(ctx, stageW, stageH, elapsed);
      if (elapsed < 4200) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(render);
  }, [drawSkyline]);

  return (
    <div className={styles.activitySection}>
      <div className={styles.activityHead}>
        <div>
          <div className={styles.activityKicker}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Activity
          </div>
          <h2 className={styles.activityTitle}>Github Activity</h2>
        </div>
        <span className={styles.activityHint}>( 3D skyline of contributions )</span>
      </div>

      <div className={styles.activityCard}>
        <div ref={stageRef} className={styles.stage} data-scene="skyline">
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            role="img"
            aria-label={`GitHub contribution 3D skyline showing ${data.total} total commits, with best day of ${bestCount} commits on ${bestDayFormatted}`}
          />

          <button
            type="button"
            className={styles.replayButton}
            onClick={handleReplay}
            aria-label="Replay 3D skyline rising animation"
          >
            <span>↻</span> Replay
          </button>

          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cardFoot}
          >
            github.com/{GITHUB_USERNAME} ↗
          </a>
        </div>
      </div>
    </div>
  );
}
