/** A point in the local coordinate space of the desktop. */
export type LocalPoint = { x: number; y: number };

/** The offset of a desktop icon, relative to its place in the default layout. */
export type IconOffset = LocalPoint;

/** A rectangle in the local coordinate space of the desktop. */
export type LocalRect = { x: number; y: number; width: number; height: number };

/** The rectangle of a desktop window in the local coordinate space of the desktop. */
export type WindowRect = LocalRect;

/** The space an icon may move in. */
export type DesktopBounds = {
  width: number;
  height: number;
  /** The height of the status bar, which icons stay below. */
  top: number;
};

/**
 * Keeps a dragged icon inside the desktop and below the status bar.
 * The offset is relative to the place the icon has in the default layout.
 */
export function clampIconOffset(base: LocalRect, offset: IconOffset, bounds: DesktopBounds): IconOffset {
  const minX = -base.x;
  const maxX = bounds.width - base.x - base.width;
  const minY = bounds.top - base.y;
  const maxY = bounds.height - base.y - base.height;
  return {
    x: Math.min(Math.max(offset.x, minX), maxX),
    y: Math.min(Math.max(offset.y, minY), maxY),
  };
}

/**
 * Keeps a window inside the desktop, below the status bar and within the usable height.
 * A window that is larger than the current desktop shrinks instead of hanging outside it.
 */
export function clampWindowRect(rect: WindowRect, bounds: DesktopBounds): WindowRect {
  const width = Math.min(Math.max(rect.width, 0), Math.max(bounds.width, 0));
  const height = Math.min(Math.max(rect.height, 0), Math.max(bounds.height - bounds.top, 0));
  const maxX = Math.max(bounds.width - width, 0);
  const maxY = Math.max(bounds.height - height, bounds.top);
  return {
    x: Math.min(Math.max(rect.x, 0), maxX),
    y: Math.min(Math.max(rect.y, bounds.top), maxY),
    width,
    height,
  };
}

/** The rectangle of a maximized window: the whole workspace below the status bar. */
export function maximizedWindowRect(bounds: DesktopBounds): WindowRect {
  return {
    x: 0,
    y: bounds.top,
    width: Math.max(bounds.width, 0),
    height: Math.max(bounds.height - bounds.top, 0),
  };
}

/** Moves a window by a delta and keeps the destination inside the desktop. */
export function moveWindowRect(rect: WindowRect, dx: number, dy: number, bounds: DesktopBounds): WindowRect {
  return clampWindowRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, bounds);
}

/** The rectangle of an element in the local coordinate space of the desktop. */
export function localRect(desktop: HTMLElement, element: HTMLElement): LocalRect {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== desktop) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, width: element.offsetWidth, height: element.offsetHeight };
}

/** The base rectangle of every app icon in the local coordinate space of the desktop. */
export function iconBaseRects(desktop: HTMLElement, list: HTMLElement): Map<string, LocalRect> {
  const rects = new Map<string, LocalRect>();
  for (const item of Array.from(list.children)) {
    if (!(item instanceof HTMLElement)) continue;
    const id = item.querySelector("[data-app-id]")?.getAttribute("data-app-id");
    if (!id) continue;
    rects.set(id, localRect(desktop, item));
  }
  return rects;
}

/**
 * The ratio between the projected size of the desktop and its local size.
 * The display is flat and faces the camera while it is focused, so the projection scales evenly.
 */
export function desktopScale(desktop: HTMLElement): number {
  const scale = desktop.getBoundingClientRect().width / desktop.offsetWidth;
  return scale > 0 ? scale : 1;
}

/** Maps a pointer position on the projected desktop back to its local pixel coordinates. */
export function desktopPoint(desktop: HTMLElement, clientX: number, clientY: number): LocalPoint {
  const rect = desktop.getBoundingClientRect();
  const scale = desktopScale(desktop);
  return { x: (clientX - rect.left) / scale, y: (clientY - rect.top) / scale };
}
