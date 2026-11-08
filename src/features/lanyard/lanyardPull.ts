export const LANYARD_PULL_MIN_PX = 75;

export type PullGestureEvaluation = {
  deltaX: number;
  deltaY: number;
  progress: number;
  triggered: boolean;
};

/**
 * Evaluates the 2D pointer pull kinematics on the hanging 3D lanyard card.
 *
 * Implements a directional displacement vector check with downward dominance:
 * $$\Delta y = \max(0, y_{\text{current}} - y_{\text{start}}), \quad \Delta x = |x_{\text{current}} - x_{\text{start}}|$$
 * Requires the vertical pull component to dominate horizontal lateral movement:
 * $$\Delta y \ge 0.6 \cdot \Delta x$$
 * and exceed the calibrated threshold $T \in [50, 100]$ px (default 75px)
 * to prevent accidental taps, swipes, or tremors from triggering the room entry.
 *
 * @param startY Initial pointer Y coordinate on drag start
 * @param currentY Current pointer Y coordinate during active drag
 * @param startX Initial pointer X coordinate on drag start
 * @param currentX Current pointer X coordinate during active drag
 * @param thresholdPx Minimum downward displacement required to fire (clamped to 50–100px)
 * @returns Evaluated gesture kinematics {deltaX, deltaY, progress in [0, 1], triggered boolean}
 */
export function evaluatePullGesture(
  startY: number,
  currentY: number,
  startX: number,
  currentX: number,
  thresholdPx: number = LANYARD_PULL_MIN_PX,
): PullGestureEvaluation {
  const safeThreshold = Math.max(50, Math.min(100, thresholdPx));
  const rawDeltaY = currentY - startY;
  const deltaY = Math.max(0, rawDeltaY);
  const deltaX = Math.abs(currentX - startX);
  const progress = Math.min(1, Math.max(0, deltaY / safeThreshold));
  const downwardDominant = deltaY >= deltaX * 0.6;
  const triggered = deltaY >= safeThreshold && downwardDominant;

  return {
    deltaX,
    deltaY,
    progress,
    triggered,
  };
}

export type IntroPhase = "active" | "building" | "ready";

/**
 * Checks whether URL query parameters request skipping the intro overlay
 * (e.g. `?autostart=1` or direct deep-link `?destination=monitor|arcade`).
 */
export function shouldSkipLanyardIntro(search: string): boolean {
  const params = new URLSearchParams(search);
  if (params.get("autostart") === "1" || params.get("skipIntro") === "1") {
    return true;
  }
  const destination = params.get("destination");
  if (destination === "monitor" || destination === "arcade") {
    return true;
  }
  return false;
}

/**
 * Resolves the initial intro phase from URL query parameters and environment.
 */
export function getInitialIntroPhaseFromSearch(
  search: string,
  isWebDriver: boolean = false,
): IntroPhase {
  const params = new URLSearchParams(search);
  if (params.get("build") === "1") {
    return "building";
  }
  if (shouldSkipLanyardIntro(search)) {
    return "ready";
  }
  if (isWebDriver && params.get("intro") !== "1") {
    return "ready";
  }
  return "active";
}

