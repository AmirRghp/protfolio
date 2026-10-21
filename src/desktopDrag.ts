/** The offset of a desktop icon, relative to its place in the default layout. */
export type IconOffset = { x: number; y: number };

/** A rectangle in the local coordinate space of the desktop. */
export type LocalRect = { x: number; y: number; width: number; height: number };

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
