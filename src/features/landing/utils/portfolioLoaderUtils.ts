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

  const visit = (node: Element) => {
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
    if (!isRiseContainer && parseFloat(style.opacity) < 0.05) {
      return;
    }

    const rect = node.getBoundingClientRect();
    const hasSize = rect.width >= 2 && rect.height >= 2;
    if (
      hasSize &&
      (rect.bottom < 0 || rect.top > vh || rect.right < 0 || rect.left > vw)
    ) {
      return;
    }

    const tag = node.tagName.toLowerCase();

    // Explicit media container override (e.g. Hero ASCII reel frame)
    const explicitMedia = node.getAttribute("data-pl-media");
    if (hasSize && explicitMedia) {
      boxes.push({
        kind: "media",
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        label:
          explicitMedia === "BANNER"
            ? "VIEWPORT // ASCII_CORE"
            : explicitMedia,
        radius: style.borderRadius,
      });
      return;
    }

    // Explicit composite text override (e.g. DynamicText role wrapper)
    const explicitText = node.getAttribute("data-pl-text");
    if (hasSize && explicitText && node instanceof HTMLElement) {
      const label =
        node.getAttribute("data-pl-label") || "ROLE // STREAM";
      boxes.push({
        kind: "text",
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        label,
        text: explicitText,
        textStyle: extractTextStyle(style),
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
      const label =
        rect.width > rect.height * 1.4 && rect.width > 240
          ? "VIEWPORT // ASCII_CORE"
          : rect.width >= 60
            ? "ASSET // MEDIA"
            : "VEC // ICON";
      if (label === "VEC // ICON") counters.icon++;
      boxes.push({
        kind: "media",
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        label,
        radius: style.borderRadius,
      });
      return;
    }

    if (hasSize && tag === "svg") {
      if (rect.width >= 10) {
        boxes.push({
          kind: "media",
          x: rect.left,
          y: rect.top,
          w: rect.width,
          h: rect.height,
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
        x: rect.left,
        y: rect.top,
        w: Math.max(rect.width, isNavLink && rect.width < 48 ? 48 : rect.width),
        h: rect.height,
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
      boxes.push({
        kind: "card",
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        label: "SURFACE // CARD",
        radius: style.borderRadius,
      });
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
        x: rect.left,
        y: rect.top,
        w: rect.width,
        h: rect.height,
        label,
        text: (node.innerText || node.textContent || "").trim(),
        textStyle: extractTextStyle(style),
        pad: extractPadding(style),
      });
      return;
    }

    Array.from(node.children).forEach(visit);
  };

  visit(root);

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
