import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildContributionMatrix,
  calculateMonthLabels,
  calculateStreaks,
  formatContributionDateRange,
  formatTooltipDate,
  useContributions,
  type ContributionCell,
  type ContributionDay,
} from "./githubContributions";
import styles from "./ContributionRing.module.css";

export type ContributionRingProps = {
  total?: number;
  contributions?: ContributionDay[];
  className?: string;
  autoPlay?: boolean;
};

const VIEW_BOX_SIZE = 320;
const CENTER_X = VIEW_BOX_SIZE / 2; // 160
const CENTER_Y = VIEW_BOX_SIZE / 2; // 160
const INNER_RADIUS = 62;
const OUTER_RADIUS = 126;
const MONTH_LABEL_RADIUS = 142;
const ANIMATION_DURATION_MS = 2200;

// Angles in degrees: gap at top (12 o'clock, which is -90°)
const GAP_DEG = 16;
const START_DEG = -90 + GAP_DEG / 2; // -82°
const TOTAL_SWEEP_DEG = 360 - GAP_DEG; // 344°
const DEG_TO_RAD = Math.PI / 180;
const START_RAD = START_DEG * DEG_TO_RAD;
const TOTAL_SWEEP_RAD = TOTAL_SWEEP_DEG * DEG_TO_RAD;

const RADIAL_GAP = 1.6;
const NUM_RINGS = 7;
const RING_THICKNESS = (OUTER_RADIUS - INNER_RADIUS - (NUM_RINGS - 1) * RADIAL_GAP) / NUM_RINGS; // ~7.77px

const NUM_WEEKS = 52;
const WEEK_SLICE_DEG = TOTAL_SWEEP_DEG / NUM_WEEKS; // ~6.615°
const ANGULAR_GAP_DEG = 1.2;

function annularSectorPath(
  cx: number,
  cy: number,
  rin: number,
  rout: number,
  a0: number,
  a1: number,
): string {
  const x0 = cx + rout * Math.cos(a0);
  const y0 = cy + rout * Math.sin(a0);
  const x1 = cx + rout * Math.cos(a1);
  const y1 = cy + rout * Math.sin(a1);
  const x2 = cx + rin * Math.cos(a1);
  const y2 = cy + rin * Math.sin(a1);
  const x3 = cx + rin * Math.cos(a0);
  const y3 = cy + rin * Math.sin(a0);

  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${rout.toFixed(2)} ${rout.toFixed(2)} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} A ${rin.toFixed(2)} ${rin.toFixed(2)} 0 0 0 ${x3.toFixed(2)} ${y3.toFixed(2)} Z`;
}

function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export default function ContributionRing({
  total: propTotal,
  contributions: propContributions,
  className = "",
  autoPlay = true,
}: ContributionRingProps) {
  const hookData = useContributions();
  const total = propTotal ?? hookData.total;
  const rawContributions = propContributions ?? hookData.contributions;

  const [hoveredCell, setHoveredCell] = useState<ContributionCell | null>(null);
  const [progress, setProgress] = useState(autoPlay ? 0 : 1);
  const [isAnimating, setIsAnimating] = useState(autoPlay);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const matrix = useMemo(() => buildContributionMatrix(rawContributions, NUM_WEEKS), [rawContributions]);
  const streaks = useMemo(() => calculateStreaks(rawContributions), [rawContributions]);
  const dateRange = useMemo(() => formatContributionDateRange(rawContributions), [rawContributions]);
  const monthLabels = useMemo(
    () => calculateMonthLabels(matrix, START_RAD, TOTAL_SWEEP_RAD),
    [matrix],
  );

  const runSweepFrame = useCallback(function step(timestamp: number) {
    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
      setIsAnimating(true);
    }
    const elapsed = timestamp - startTimeRef.current;
    const rawProgress = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
    const eased = easeOutCubic(rawProgress);

    setProgress(eased);

    if (rawProgress < 1) {
      animFrameRef.current = requestAnimationFrame(step);
    } else {
      setIsAnimating(false);
      animFrameRef.current = null;
    }
  }, []);

  const startSweep = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setProgress(1);
      setIsAnimating(false);
      return;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    setProgress(0);
    setIsAnimating(true);
    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(runSweepFrame);
  }, [runSweepFrame]);

  useEffect(() => {
    if (!autoPlay) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    startTimeRef.current = null;
    animFrameRef.current = requestAnimationFrame(runSweepFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [autoPlay, runSweepFrame]);

  // Geometric sectors pre-computation for performance
  const weekSectors = useMemo(() => {
    return matrix.map((week) => {
      const w = week.weekIndex;
      const deg0 = START_DEG + w * WEEK_SLICE_DEG + ANGULAR_GAP_DEG / 2;
      const deg1 = START_DEG + (w + 1) * WEEK_SLICE_DEG - ANGULAR_GAP_DEG / 2;
      const a0 = deg0 * DEG_TO_RAD;
      const a1 = deg1 * DEG_TO_RAD;

      const cellPaths = week.days.map((day) => {
        const d = day.dayIndex;
        const rin = INNER_RADIUS + d * (RING_THICKNESS + RADIAL_GAP);
        const rout = rin + RING_THICKNESS;
        const path = annularSectorPath(CENTER_X, CENTER_Y, rin, rout, a0, a1);
        return { day, path };
      });

      return {
        weekIndex: w,
        threshold: w / (NUM_WEEKS - 1),
        cellPaths,
      };
    });
  }, [matrix]);

  // Sweep hand coordinates
  const handAngle = START_RAD + progress * TOTAL_SWEEP_RAD;
  const handX1 = CENTER_X + (INNER_RADIUS - 6) * Math.cos(handAngle);
  const handY1 = CENTER_Y + (INNER_RADIUS - 6) * Math.sin(handAngle);
  const handX2 = CENTER_X + (OUTER_RADIUS + 8) * Math.cos(handAngle);
  const handY2 = CENTER_Y + (OUTER_RADIUS + 8) * Math.sin(handAngle);

  return (
    <div className={`${styles.container} ${className}`.trim()}>
      <div className={styles.ringWrapper}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
          role="img"
          aria-label="Round the year contribution graph"
        >
          {/* Center dial / streak gauge */}
          <circle
            cx={CENTER_X}
            cy={CENTER_Y}
            r={INNER_RADIUS - 5}
            className={styles.centerDial}
          />

          <g className={styles.centerGroup}>
            <text
              x={CENTER_X}
              y={CENTER_Y - 4}
              textAnchor="middle"
              className={styles.streakCount}
            >
              {streaks.activeStreak}d
            </text>
            <text
              x={CENTER_X}
              y={CENTER_Y + 14}
              textAnchor="middle"
              className={styles.streakLabel}
            >
              STREAK
            </text>
          </g>

          {/* Month labels around perimeter */}
          {monthLabels.map((lbl) => {
            const lx = CENTER_X + MONTH_LABEL_RADIUS * Math.cos(lbl.angle);
            const ly = CENTER_Y + MONTH_LABEL_RADIUS * Math.sin(lbl.angle);
            return (
              <text
                key={`${lbl.month}-${lbl.weekIndex}`}
                x={lx.toFixed(2)}
                y={ly.toFixed(2)}
                textAnchor="middle"
                dominantBaseline="central"
                className={styles.monthLabel}
              >
                {lbl.month}
              </text>
            );
          })}

          {/* 52 weeks x 7 days annular tiles */}
          <g className={styles.tilesGroup}>
            {weekSectors.map((sector) => {
              const isRevealed = progress >= sector.threshold;
              return (
                <g
                  key={sector.weekIndex}
                  data-week={sector.weekIndex}
                  style={{
                    opacity: isRevealed ? 1 : 0.22,
                    transition: "opacity 0.15s ease",
                  }}
                >
                  {sector.cellPaths.map(({ day, path }) => {
                    const levelClass = isRevealed
                      ? styles[`level${day.level}`]
                      : styles.level0;
                    return (
                      <path
                        key={`${day.weekIndex}-${day.dayIndex}`}
                        d={path}
                        className={`${styles.cell} ${levelClass}`}
                        data-cell="true"
                        data-level={day.level}
                        data-count={day.count}
                        data-date={day.date}
                        tabIndex={day.date ? 0 : undefined}
                        aria-label={
                          day.date
                            ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`
                            : "No activity"
                        }
                        onPointerEnter={() => setHoveredCell(day)}
                        onPointerLeave={() => setHoveredCell(null)}
                        onFocus={() => setHoveredCell(day)}
                        onBlur={() => setHoveredCell(null)}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>

          {/* Sweep hand */}
          {isAnimating && (
            <g className={styles.handGroup}>
              <line
                x1={handX1.toFixed(2)}
                y1={handY1.toFixed(2)}
                x2={handX2.toFixed(2)}
                y2={handY2.toFixed(2)}
                className={styles.sweepHand}
              />
              <circle
                cx={handX2.toFixed(2)}
                cy={handY2.toFixed(2)}
                r="3"
                className={styles.sweepTip}
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip */}
        {hoveredCell && hoveredCell.date && (
          <div className={styles.tooltip} role="status">
            <span className={styles.tipCount}>
              {hoveredCell.count} contribution{hoveredCell.count === 1 ? "" : "s"}
            </span>
            <span className={styles.tipDate}>on {formatTooltipDate(hoveredCell.date)}</span>
          </div>
        )}
      </div>

      {/* Right meta details and replay control */}
      <div className={styles.meta}>
        <div className={styles.metric}>
          <span className={styles.totalCount}>{total.toLocaleString()}</span>
          <span className={styles.totalLabel}>CONTRIBUTIONS</span>
          <span className={styles.dateRange}>{dateRange}</span>
        </div>
        <button
          type="button"
          className={styles.replayButton}
          onClick={startSweep}
          aria-label="Replay contribution sweep animation"
        >
          <span className={styles.replayIcon} aria-hidden="true">↻</span>
          <span>REPLAY</span>
        </button>
      </div>
    </div>
  );
}
