export type BlueprintBoxKind = "media" | "text" | "btn" | "card";

export interface BlueprintTextStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  centerVertically?: boolean;
}

export interface BlueprintPadding {
  l: number;
  t: number;
  r: number;
}

export interface BlueprintBox {
  kind: BlueprintBoxKind;
  x: number;
  y: number;
  w: number;
  h: number;
  boxW?: number;
  label: string;
  text?: string;
  textStyle?: BlueprintTextStyle;
  radius?: string;
  pad?: BlueprintPadding;
}

export interface ColumnGuides {
  l: number;
  r: number;
}

export const LOADER_TEXT_THRESHOLD = 86;
export const LOADER_BOX_END_PROGRESS = 76;
export const LOADER_HOLD_BEFORE_WIPE_MS = 340;
export const LOADER_WIPE_DURATION_MS = 980;
export const LOADER_MAX_BOXES = 70;

/**
 * Computes the 0..100 integer progress along a smooth cubic ease-in-out curve.
 */
export function computeLoaderProgress(
  elapsedMs: number,
  durationMs: number,
  isDocumentReady = true,
): number {
  const safeDuration = Math.max(durationMs, 1);
  const w = Math.min(Math.max(elapsedMs / safeDuration, 0), 1);
  let eased = (w < 0.5 ? 2 * w * w : 1 - Math.pow(-2 * w + 2, 2) / 2) * 100;
  if (!isDocumentReady) {
    eased = Math.min(eased, 92);
  }
  return Math.min(Math.floor(eased + (w >= 1 && isDocumentReady ? 1 : 0)), 100);
}

/**
 * Determines whether box `index` of `totalBoxes` has been triggered at `progress` (0..100).
 * Combines sequential index order with optional vertical scanline position so boxes
 * materialize in the wake of the downward calibration laser beam.
 */
export function isBlueprintBoxActive(
  progress: number,
  index: number,
  totalBoxes: number,
  boxY?: number,
  viewportHeight?: number,
): boolean {
  const maxIndex = Math.max(totalBoxes - 1, 1);
  const indexRatio = index / maxIndex;
  const spatialRatio =
    typeof boxY === "number" &&
    typeof viewportHeight === "number" &&
    viewportHeight > 0
      ? Math.min(Math.max(boxY / viewportHeight, 0), 1)
      : indexRatio;

  const blendedRatio = indexRatio * 0.55 + spatialRatio * 0.45;
  const threshold = 4 + blendedRatio * (LOADER_BOX_END_PROGRESS - 4);
  return progress >= threshold;
}

/**
 * Computes the vertical position (0..100%) of the active horizontal laser scanline
 * during the wireframe mapping phase.
 */
export function computeScannerLinePercent(progress: number): number {
  const normalized = Math.min(
    Math.max((progress - 2) / (LOADER_BOX_END_PROGRESS + 6), 0),
    1,
  );
  return Math.round(normalized * 1000) / 10;
}

/**
 * Computes the left and right vertical column guide coordinates from the scanned boxes.
 */
export function computeColumnGuides(boxes: BlueprintBox[]): ColumnGuides | null {
  if (!boxes.length) return null;
  const widest = boxes.reduce(
    (best, item) => (item.w > best.w ? item : best),
    boxes[0],
  );
  return { l: widest.x, r: widest.x + widest.w };
}

function extractTextStyle(style: CSSStyleDeclaration): BlueprintTextStyle {
  const display = style.display || "";
  const alignItems = style.alignItems || "";
  const placeItems = style.placeItems || "";
  const centerVertically =
    (display.includes("grid") || display.includes("flex")) &&
    (alignItems === "center" || placeItems.includes("center"));

  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    lineHeight: style.lineHeight,
    letterSpacing: style.letterSpacing,
    textAlign: style.textAlign,
    centerVertically,
  };
}

function extractPadding(style: CSSStyleDeclaration): BlueprintPadding {
  return {
    l:
      (parseFloat(style.paddingLeft) || 0) +
      (parseFloat(style.borderLeftWidth) || 0),
    t:
      (parseFloat(style.paddingTop) || 0) +
      (parseFloat(style.borderTopWidth) || 0),
    r:
      (parseFloat(style.paddingRight) || 0) +
      (parseFloat(style.borderRightWidth) || 0),
  };
}

interface ClipRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const MIN_VISIBLE_BOX_SIZE = 4;
const MIN_CONTAINER_VISIBLE_RATIO = 0.45;

function intersectClip(a: ClipRect, b: ClipRect): ClipRect {
  return {
    left: Math.max(a.left, b.left),
    top: Math.max(a.top, b.top),
    right: Math.min(a.right, b.right),
    bottom: Math.min(a.bottom, b.bottom),
  };
}

function isClipOverflowValue(value: string): boolean {
  return (
    value === "hidden" ||
    value === "clip" ||
    value === "scroll" ||
    value === "auto"
  );
}

function isVisuallyHiddenElement(
  node: HTMLElement | SVGElement,
  style: CSSStyleDeclaration,
  rect: DOMRect,
): boolean {
  const className = node.getAttribute("class") ?? "";
  if (
    node.classList.contains("sr-only") ||
    /(?:^|[\s_-])sr-?only(?:$|[\s_-])/i.test(className)
  ) {
    return true;
  }
  const normalizedClip = style.clip.replace(/\s+/g, "");
  if (
    normalizedClip === "rect(0px,0px,0px,0px)" ||
    normalizedClip === "rect(0,0,0,0)" ||
    style.clipPath === "inset(50%)"
  ) {
    return true;
  }
  if (
    rect.width <= 2 &&
    rect.height <= 2 &&
    (style.overflow === "hidden" || style.overflow === "clip")
  ) {
    return true;
  }
  return false;
}

function clipElementRect(
  rect: DOMRect,
  viewportClip: ClipRect,
  containerClip: ClipRect,
  vw: number,
  vh: number,
  options?: { minViewportSize?: number },
): { x: number; y: number; w: number; h: number } | null {
  const inTightContainer =
    containerClip.left > 0.5 ||
    containerClip.top > 0.5 ||
    containerClip.right < vw - 0.5 ||
    containerClip.bottom < vh - 0.5;

  const cLeft = Math.max(rect.left, containerClip.left);
  const cTop = Math.max(rect.top, containerClip.top);
  const cRight = Math.min(rect.right, containerClip.right);
  const cBottom = Math.min(rect.bottom, containerClip.bottom);
  const cW = cRight - cLeft;
  const cH = cBottom - cTop;

  if (cW < MIN_VISIBLE_BOX_SIZE || cH < MIN_VISIBLE_BOX_SIZE) {
    return null;
  }

  // Skip elements substantially cut off by an ancestor overflow container (e.g. stage edge tiles)
  if (
    inTightContainer &&
    (cW < rect.width * MIN_CONTAINER_VISIBLE_RATIO ||
      cH < rect.height * MIN_CONTAINER_VISIBLE_RATIO)
  ) {
    return null;
  }

  const vLeft = Math.max(cLeft, viewportClip.left);
  const vTop = Math.max(cTop, viewportClip.top);
  const vRight = Math.min(cRight, viewportClip.right);
  const vBottom = Math.min(cBottom, viewportClip.bottom);
  const vW = vRight - vLeft;
  const vH = vBottom - vTop;
  const minSize = options?.minViewportSize ?? MIN_VISIBLE_BOX_SIZE;

  if (vW < minSize || vH < minSize) {
    return null;
  }

  return { x: vLeft, y: vTop, w: vW, h: vH };
}

/**
 * Scans the live DOM inside `scopeRoot` (or `document.body`) and returns the
 * spatial calibration wireframe boxes visible in the initial viewport.
 */
export function scanBlueprintBoxes(
  scopeRoot?: HTMLElement | null,
): BlueprintBox[] {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return [];
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (vw <= 0 || vh <= 0) return [];

  const boxes: BlueprintBox[] = [];
  const counters = { node: 0, nav: 0, icon: 0, head: 0, cta: 0 };
  const pad2 = (n: number) => String(n).padStart(2, "0");

  const root = scopeRoot ?? document.getElementById("landing") ?? document.body;
  const baseViewportClip: ClipRect = { left: 0, top: 0, right: vw, bottom: vh };

  let contentTopClip = 0;
  const headerEl = root.querySelector("header");
  if (headerEl instanceof HTMLElement) {
    const hStyle = window.getComputedStyle(headerEl);
    const hRect = headerEl.getBoundingClientRect();
    if (
      hStyle.display !== "none" &&
      hStyle.visibility !== "hidden" &&
      parseFloat(hStyle.opacity || "1") >= 0.05 &&
      hRect.height >= 20 &&
      hRect.top <= 4 &&
      hRect.bottom > 0 &&
      hRect.bottom < vh * 0.4
    ) {
      contentTopClip = Math.max(0, hRect.bottom);
    }
  }

  const contentViewportClip: ClipRect = {
    left: 0,
    top: contentTopClip,
    right: vw,
    bottom: vh,
  };

  const visit = (
    node: Element,
    viewportClip: ClipRect,
    containerClip: ClipRect,
    inHeader: boolean,
  ) => {
    if (boxes.length >= LOADER_MAX_BOXES) return;
    if (!(node instanceof HTMLElement || node instanceof SVGElement)) return;
    if (
      node.classList.contains("pl-root") ||
      node.getAttribute("data-pl-ignore") === "true" ||
      node.classList.contains("sr-only")
    ) {
      return;
    }

    const tagUpper = node.tagName.toUpperCase();
    if (
      ["SCRIPT", "STYLE", "NOSCRIPT", "LINK", "META", "PATH", "DEFS"].includes(
        tagUpper,
      )
    ) {
      return;
    }

    const style = window.getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") {
      return;
    }
    const isRiseContainer = node.hasAttribute("data-pl-rise");
    if (!isRiseContainer && parseFloat(style.opacity || "1") < 0.05) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (isVisuallyHiddenElement(node, style, rect)) {
      return;
    }

    const activeInHeader = inHeader || node === headerEl;
    const activeViewportClip = activeInHeader
      ? baseViewportClip
      : viewportClip;
    const effectiveClip = intersectClip(activeViewportClip, containerClip);
    if (
      effectiveClip.right - effectiveClip.left < MIN_VISIBLE_BOX_SIZE ||
      effectiveClip.bottom - effectiveClip.top < MIN_VISIBLE_BOX_SIZE
    ) {
      return;
    }

    const hasSize = rect.width >= 2 && rect.height >= 2;
    const tag = node.tagName.toLowerCase();

    // Update container clip when traversing through overflow-clipping elements.
    // Skip overflowing check for dome tile buttons so outer buffer tiles only prune on [data-frame] visibility.
    let childContainerClip = containerClip;
    if (node !== root && hasSize && node instanceof HTMLElement) {
      const clipsX = isClipOverflowValue(style.overflowX || style.overflow);
      const clipsY = isClipOverflowValue(style.overflowY || style.overflow);
      if (clipsX || clipsY) {
        childContainerClip = intersectClip(containerClip, {
          left: clipsX ? rect.left : containerClip.left,
          top: clipsY ? rect.top : containerClip.top,
          right: clipsX ? rect.right : containerClip.right,
          bottom: clipsY ? rect.bottom : containerClip.bottom,
        });
      }
    }

    // For DomeGallery tiles, prune the entire tile (image + overflowing bottom caption)
    // if its media frame is offscreen or mostly clipped by stage bounds or sticky header.
    if (tag === "button" && node.hasAttribute("data-slot")) {
      const frameEl = node.querySelector("[data-frame]");
      if (frameEl instanceof HTMLElement) {
        const frameClip = clipElementRect(
          frameEl.getBoundingClientRect(),
          activeViewportClip,
          containerClip,
          vw,
          vh,
          { minViewportSize: 28 },
        );
        if (
          !frameClip ||
          frameClip.w < frameEl.getBoundingClientRect().width * 0.45 ||
          frameClip.h < frameEl.getBoundingClientRect().height * 0.45
        ) {
          return;
        }
      }
    } else if (hasSize && childContainerClip !== containerClip) {
      // Prune whole clipped subtrees that sit completely outside their parent's clip rect
      if (
        childContainerClip.right - childContainerClip.left <
          MIN_VISIBLE_BOX_SIZE ||
        childContainerClip.bottom - childContainerClip.top <
          MIN_VISIBLE_BOX_SIZE
      ) {
        return;
      }
    }

    // Explicit media container override (e.g. Hero ASCII reel frame)
    const explicitMedia = node.getAttribute("data-pl-media");
    if (hasSize && explicitMedia) {
      const boxRect = clipElementRect(
        rect,
        activeViewportClip,
        containerClip,
        vw,
        vh,
      );
      if (!boxRect) return;
      boxes.push({
        kind: "media",
        x: boxRect.x,
        y: boxRect.y,
        w: boxRect.w,
        h: boxRect.h,
        label:
          explicitMedia === "BANNER"
            ? "VIEWPORT // ASCII_CORE"
            : explicitMedia,
        radius: style.borderRadius,
      });
      return;
    }

    // Explicit composite text override (e.g. DynamicText role wrapper or pill badge)
    const explicitText = node.getAttribute("data-pl-text");
    if (hasSize && explicitText && node instanceof HTMLElement) {
      const boxRect = clipElementRect(
        rect,
        activeViewportClip,
        containerClip,
        vw,
        vh,
      );
      if (!boxRect) return;
      const label =
        node.getAttribute("data-pl-label") || "ROLE // STREAM";
      boxes.push({
        kind: "text",
        x: boxRect.x,
        y: boxRect.y,
        w: boxRect.w,
        h: boxRect.h,
        label,
        text: explicitText,
        textStyle: extractTextStyle(style),
        radius: style.borderRadius,
        pad: extractPadding(style),
      });
      return;
    }

    // Skip full-viewport background canvases or SVGs (such as LiquidGrid) or decorative button canvases
    if (hasSize && (tag === "canvas" || tag === "svg")) {
      if (rect.width > vw * 0.94) {
        return;
      }
      if (
        node.closest("button, a") ||
        node.parentElement?.querySelector("button, a")
      ) {
        return;
      }
    }

    // Media elements (Banner video, images, canvases)
    if (hasSize && (tag === "img" || tag === "video" || tag === "canvas")) {
      const boxRect = clipElementRect(
        rect,
        activeViewportClip,
        containerClip,
        vw,
        vh,
        { minViewportSize: rect.height >= 40 ? 24 : MIN_VISIBLE_BOX_SIZE },
      );
      if (!boxRect) return;
      const label =
        rect.width > rect.height * 1.4 && rect.width > 240
          ? "VIEWPORT // ASCII_CORE"
          : rect.width >= 60
            ? "ASSET // MEDIA"
            : "VEC // ICON";
      if (label === "VEC // ICON") counters.icon++;
      boxes.push({
        kind: "media",
        x: boxRect.x,
        y: boxRect.y,
        w: boxRect.w,
        h: boxRect.h,
        label,
        radius: style.borderRadius,
      });
      return;
    }

    if (hasSize && tag === "svg") {
      if (rect.width >= 10) {
        const boxRect = clipElementRect(
          rect,
          activeViewportClip,
          containerClip,
          vw,
          vh,
        );
        if (!boxRect) return;
        boxes.push({
          kind: "media",
          x: boxRect.x,
          y: boxRect.y,
          w: boxRect.w,
          h: boxRect.h,
          label: "VEC",
          radius: "4px",
        });
      }
      return;
    }

    // Buttons and navigation links
    const isButton = tag === "button" || node.getAttribute("role") === "button";
    const isAnchor =
      tag === "a" && !node.querySelector("img") && rect.height < 90;
    if (
      hasSize &&
      (isButton || isAnchor) &&
      rect.height < 100 &&
      node instanceof HTMLElement
    ) {
      const boxRect = clipElementRect(
        rect,
        activeViewportClip,
        containerClip,
        vw,
        vh,
      );
      if (!boxRect) return;
      const rawText = (node.innerText || node.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
      const hasBorderOrBg =
        parseFloat(style.borderTopWidth) > 0 ||
        (style.backgroundColor !== "rgba(0, 0, 0, 0)" &&
          style.backgroundColor !== "transparent");
      const isNavLink = isAnchor && !hasBorderOrBg;
      const isBrandLogo = isNavLink && counters.nav === 0 && Boolean(node.querySelector("b"));
      const customLabel = node.getAttribute("data-pl-label");
      const navIndex = !isBrandLogo && isNavLink ? ++counters.nav : counters.nav;
      const label = customLabel
        ? customLabel
        : !rawText
          ? "VEC"
          : isBrandLogo
            ? "BRAND"
            : isNavLink
              ? rect.width < 54
                ? `NAV ${pad2(navIndex)}`
                : `NAV // ${pad2(navIndex)}`
              : `CTA // ${pad2(++counters.cta)}`;

      boxes.push({
        kind: isNavLink ? "text" : "btn",
        x: boxRect.x,
        y: boxRect.y,
        w: Math.max(boxRect.w, isNavLink && boxRect.w < 48 ? 48 : boxRect.w),
        h: boxRect.h,
        label,
        text: rawText,
        textStyle: extractTextStyle(style),
        radius: style.borderRadius,
        pad: extractPadding(style),
      });
      return;
    }

    // Framed cards
    if (
      hasSize &&
      rect.height >= 50 &&
      rect.height <= 360 &&
      !node.querySelector("img") &&
      !node.querySelector("video") &&
      parseFloat(style.borderTopWidth) > 0 &&
      style.borderTopStyle !== "none" &&
      parseFloat(style.borderTopLeftRadius) >= 8
    ) {
      const boxRect = clipElementRect(
        rect,
        activeViewportClip,
        containerClip,
        vw,
        vh,
      );
      if (boxRect) {
        boxes.push({
          kind: "card",
          x: boxRect.x,
          y: boxRect.y,
          w: boxRect.w,
          h: boxRect.h,
          label: "SURFACE // CARD",
          radius: style.borderRadius,
        });
      }
    }

    // Direct text elements (headings, paragraphs, spans)
    let directText = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        directText += child.textContent ?? "";
      }
    });

    if (
      hasSize &&
      directText.trim().length > 0 &&
      node instanceof HTMLElement
    ) {
      const boxRect = clipElementRect(
        rect,
        activeViewportClip,
        containerClip,
        vw,
        vh,
      );
      if (!boxRect) return;
      const isHeading = /^h[1-6]$/.test(tag);
      const label =
        tag === "h1"
          ? "IDENTITY // H1"
          : isHeading
            ? `HEAD // H${tag[1]}`
            : `NODE // ${pad2(++counters.node)}`;
      if (isHeading) counters.head++;

      boxes.push({
        kind: "text",
        x: boxRect.x,
        y: boxRect.y,
        w: boxRect.w,
        h: boxRect.h,
        label,
        text: (node.innerText || node.textContent || "").trim(),
        textStyle: extractTextStyle(style),
        pad: extractPadding(style),
      });
      return;
    }

    Array.from(node.children).forEach((child) =>
      visit(child, activeViewportClip, childContainerClip, activeInHeader),
    );
  };

  visit(root, contentViewportClip, baseViewportClip, false);

  // Align wide multi-line text boxes to the right edge of the text column,
  // provided no sibling box sits to the right on the same horizontal row.
  const wideTextBoxes = boxes.filter(
    (b) => b.kind === "text" && b.w >= 260 && !b.textStyle?.centerVertically,
  );
  if (wideTextBoxes.length > 0) {
    const maxTextRight = Math.max(...wideTextBoxes.map((b) => b.x + b.w));
    boxes.forEach((b) => {
      if (b.textStyle?.centerVertically) return;
      const hasRightSiblingOnRow = boxes.some(
        (other) =>
          other !== b &&
          other.x >= b.x + b.w - 4 &&
          Math.abs(other.y - b.y) < Math.max(b.h, other.h) * 0.8,
      );
      if (hasRightSiblingOnRow) return;

      const isMultiLineBlock = b.w >= 220 && b.kind === "text" && b.h >= 40;
      const diff = maxTextRight - (b.x + b.w);
      if (isMultiLineBlock && diff > 8 && b.x < maxTextRight && diff < 280) {
        b.boxW = maxTextRight - b.x;
      }
    });
  }

  // Sort top-to-bottom, left-to-right, keeping media banners before overlapping text overlays
  boxes.sort((a, b) => {
    if (
      a.kind === "media" &&
      b.kind !== "media" &&
      a.y <= b.y &&
      a.y + a.h >= b.y
    ) {
      return -1;
    }
    if (
      b.kind === "media" &&
      a.kind !== "media" &&
      b.y <= a.y &&
      b.y + b.h >= a.y
    ) {
      return 1;
    }
    return a.y - b.y || a.x - b.x;
  });

  return boxes;
}
