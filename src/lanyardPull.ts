export const LANYARD_PULL_MIN_PX = 75;

export type PullGestureEvaluation = {
  deltaX: number;
  deltaY: number;
  progress: number;
  triggered: boolean;
};

/**
 * Evaluates a pointer drag that started on the hanging lanyard card.
 * Requires a deliberate downward pull of at least `thresholdPx` (default 75px,
 * within the 50–100px window) so a simple touch, tap, or small movement never
 * triggers the site transition prematurely.
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
