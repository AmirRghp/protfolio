import type { RoomDestination } from "./roomNavigation";

export type RoomHotspot = Exclude<RoomDestination, "room">;

export type RoomHotspotHover = {
  destination: RoomHotspot;
  clientX: number;
  clientY: number;
};

const HINT_GAP_X = 14;
const HINT_GAP_Y = 18;
const VIEWPORT_MARGIN = 12;

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
