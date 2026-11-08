export type RoomHotspot = "monitor" | "arcade" | "cat";

export const ROOM_HOTSPOT_LABELS: Record<RoomHotspot, string> = {
  monitor: "USE COMPUTER",
  arcade: "USE ARCADE",
  cat: "oiia ?",
};

export type RoomHotspotHover = {
  destination: RoomHotspot;
  clientX: number;
  clientY: number;
};

const HINT_GAP_X = 14;
const HINT_GAP_Y = 18;
const VIEWPORT_MARGIN = 12;

const BACK_HINT_GAP_X = 12;
const BACK_HINT_GAP_Y = 16;
const BACK_VIEWPORT_MARGIN = 10;

/**
 * Places the monitor hint just below the cursor while keeping the whole label inside the viewport.
 * The tooltip is fixed to the viewport, so its available area is the layout viewport, not the page.
 */
export function hotspotHintPosition(
  pointer: { clientX: number; clientY: number },
  tooltip: { width: number; height: number },
  viewport: { width: number; height: number },
) {
  const maxX = Math.max(VIEWPORT_MARGIN, viewport.width - tooltip.width - VIEWPORT_MARGIN);
  const maxY = Math.max(VIEWPORT_MARGIN, viewport.height - tooltip.height - VIEWPORT_MARGIN);

  return {
    x: Math.min(Math.max(pointer.clientX + HINT_GAP_X, VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(pointer.clientY + HINT_GAP_Y, VIEWPORT_MARGIN), maxY),
  };
}

/**
 * Places the [Go Back] cursor tooltip near the pointer while keeping it fully within the viewport.
 */
export function backCursorHintPosition(
  pointer: { clientX: number; clientY: number },
  tooltip: { width: number; height: number },
  viewport: { width: number; height: number },
) {
  const maxX = Math.max(BACK_VIEWPORT_MARGIN, viewport.width - tooltip.width - BACK_VIEWPORT_MARGIN);
  const maxY = Math.max(BACK_VIEWPORT_MARGIN, viewport.height - tooltip.height - BACK_VIEWPORT_MARGIN);

  return {
    x: Math.min(Math.max(pointer.clientX + BACK_HINT_GAP_X, BACK_VIEWPORT_MARGIN), maxX),
    y: Math.min(Math.max(pointer.clientY + BACK_HINT_GAP_Y, BACK_VIEWPORT_MARGIN), maxY),
  };
}
