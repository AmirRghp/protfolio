export type FabPosition = {
  x: number;
  y: number;
  dockSide: "left" | "right";
};

export const EDGE_MARGIN = 14;
export const TOP_SAFE_MARGIN = 76;
export const BOTTOM_SAFE_MARGIN = 20;
export const DRAG_THRESHOLD_PX = 7;

/**
 * Pure helper computing the clamped drag position and the magnetic horizontal
 * edge-snap position (iOS AssistiveTouch behavior).
 */
export function computeAssistiveSnapPosition(
  rawX: number,
  rawY: number,
  viewportW: number,
  viewportH: number,
  btnSize = 58
): { clamped: { x: number; y: number }; snapped: FabPosition } {
  const minX = EDGE_MARGIN;
  const maxX = Math.max(minX, viewportW - btnSize - EDGE_MARGIN);
  const minY = TOP_SAFE_MARGIN;
  const maxY = Math.max(minY, viewportH - btnSize - BOTTOM_SAFE_MARGIN);

  const clampedX = Math.min(maxX, Math.max(minX, rawX));
  const clampedY = Math.min(maxY, Math.max(minY, rawY));

  const centerX = clampedX + btnSize / 2;
  const dockSide: "left" | "right" = centerX < viewportW / 2 ? "left" : "right";
  const snappedX = dockSide === "left" ? minX : maxX;

  return {
    clamped: { x: clampedX, y: clampedY },
    snapped: { x: snappedX, y: clampedY, dockSide },
  };
}
