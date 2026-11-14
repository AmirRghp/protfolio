import { afterEach, describe, expect, it, vi } from "vitest";
import {
  computeColumnGuides,
  computeLoaderProgress,
  computeScannerLinePercent,
  isBlueprintBoxActive,
  LOADER_TEXT_THRESHOLD,
  scanBlueprintBoxes,
  type BlueprintBox,
} from "./portfolioLoaderUtils";

interface MockStyleOptions {
  display?: string;
  visibility?: string;
  opacity?: string;
  overflow?: string;
  overflowX?: string;
  overflowY?: string;
  clip?: string;
  clipPath?: string;
}

interface MockRectOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

class FakeSVGElement {}

class FakeHTMLElement {
  tagName: string;
  children: FakeHTMLElement[] = [];
  childNodes: Array<{ nodeType: number; textContent: string }> = [];
  parentElement: FakeHTMLElement | null = null;
  attributes = new Map<string, string>();
  classList: { contains: (cls: string) => boolean };
  private _rect: DOMRect;
  private _style: CSSStyleDeclaration;
  textContent = "";

  constructor(
    tagName: string,
    rect: MockRectOptions,
    style: MockStyleOptions = {},
    attrs: Record<string, string> = {},
    text = "",
  ) {
    this.tagName = tagName.toUpperCase();
    this._rect = {
      left: rect.left,
      top: rect.top,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    } as DOMRect;
    this._style = {
      display: style.display ?? "block",
      visibility: style.visibility ?? "visible",
      opacity: style.opacity ?? "1",
      overflow: style.overflow ?? "visible",
      overflowX: style.overflowX ?? style.overflow ?? "visible",
      overflowY: style.overflowY ?? style.overflow ?? "visible",
      clip: style.clip ?? "auto",
      clipPath: style.clipPath ?? "none",
      borderRadius: "8px",
      borderTopWidth: "0px",
      borderTopStyle: "none",
      borderTopLeftRadius: "8px",
      backgroundColor: "transparent",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
      fontWeight: "500",
      fontStyle: "normal",
      lineHeight: "1.4",
      letterSpacing: "0px",
      textAlign: "left",
      paddingLeft: "0px",
      paddingTop: "0px",
      paddingRight: "0px",
      borderLeftWidth: "0px",
      borderRightWidth: "0px",
      alignItems: "normal",
      placeItems: "normal",
    } as unknown as CSSStyleDeclaration;

    for (const [k, v] of Object.entries(attrs)) {
      this.attributes.set(k, v);
    }

    const classTokens = (attrs.class ?? "").split(/\s+/).filter(Boolean);
    this.classList = {
      contains: (cls: string) => classTokens.includes(cls),
    };

    if (text) {
      this.textContent = text;
      this.childNodes.push({ nodeType: 3, textContent: text });
    }
  }

  get innerText() {
    return this.textContent;
  }

  append(...nodes: FakeHTMLElement[]) {
    for (const n of nodes) {
      n.parentElement = this;
      this.children.push(n);
    }
  }

  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name: string) {
    return this.attributes.has(name);
  }

  getBoundingClientRect() {
    return this._rect;
  }

  querySelector(selector: string): FakeHTMLElement | null {
    const matches = (el: FakeHTMLElement): boolean => {
      if (selector === "header") return el.tagName === "HEADER";
      if (selector === "[data-frame]") return el.hasAttribute("data-frame");
      if (selector === "img") return el.tagName === "IMG";
      if (selector === "video") return el.tagName === "VIDEO";
      if (selector === "b") return el.tagName === "B";
      if (selector === "button, a") {
        return el.tagName === "BUTTON" || el.tagName === "A";
      }
      return false;
    };
    for (const child of this.children) {
      if (matches(child)) return child;
      const nested = child.querySelector(selector);
      if (nested) return nested;
    }
    return null;
  }

  closest(selector: string): FakeHTMLElement | null {
    const wantTags = selector.split(",").map((s) => s.trim().toUpperCase());
    if (wantTags.includes(this.tagName)) return this;
    let cur: FakeHTMLElement | null = this.parentElement;
    while (cur) {
      if (wantTags.includes(cur.tagName)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  getComputedStyle() {
    return this._style;
  }
}

describe("portfolioLoaderUtils", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("computes quadratic ease-in-out loader progress from 0 to 100", () => {
    expect(computeLoaderProgress(0, 3200, true)).toBe(0);
    expect(computeLoaderProgress(1600, 3200, true)).toBe(50);
    expect(computeLoaderProgress(3200, 3200, true)).toBe(100);
  });

  it("caps progress at 92 while document is not yet ready", () => {
    expect(computeLoaderProgress(3200, 3200, false)).toBe(92);
    expect(computeLoaderProgress(3200, 3200, true)).toBe(100);
  });

  it("activates blueprint boxes sequentially across the 4..76 progress window", () => {
    expect(isBlueprintBoxActive(0, 0, 10)).toBe(false);
    expect(isBlueprintBoxActive(4, 0, 10)).toBe(true);
    expect(isBlueprintBoxActive(40, 5, 11)).toBe(true);
    expect(isBlueprintBoxActive(75, 9, 10)).toBe(false);
    expect(isBlueprintBoxActive(76, 9, 10)).toBe(true);
    expect(LOADER_TEXT_THRESHOLD).toBe(86);
  });

  it("computes scanner beam vertical percentage from progress", () => {
    expect(computeScannerLinePercent(0)).toBe(0);
    expect(computeScannerLinePercent(43)).toBe(50);
    expect(computeScannerLinePercent(100)).toBe(100);
  });

  it("computes vertical column guides from the widest scanned box", () => {
    expect(computeColumnGuides([])).toBeNull();

    const boxes: BlueprintBox[] = [
      { kind: "text", x: 120, y: 20, w: 180, h: 24, label: "NAV // 01" },
      { kind: "media", x: 100, y: 64, w: 1240, h: 600, label: "VIEWPORT // ASCII_CORE" },
      { kind: "text", x: 140, y: 180, w: 520, h: 60, label: "IDENTITY // H1" },
    ];
    expect(computeColumnGuides(boxes)).toEqual({ l: 100, r: 1340 });
  });

  it("excludes CSS-module srOnly trees, prunes offstage dome tiles, and clips to stage and sticky header", () => {
    vi.stubGlobal("HTMLElement", FakeHTMLElement);
    vi.stubGlobal("SVGElement", FakeSVGElement);
    vi.stubGlobal("window", {
      innerWidth: 1440,
      innerHeight: 900,
      getComputedStyle: (el: FakeHTMLElement) => el.getComputedStyle(),
    });
    vi.stubGlobal("document", {
      getElementById: () => null,
      body: null,
    });

    const root = new FakeHTMLElement("div", { left: 0, top: 0, width: 1440, height: 900 }, { overflow: "hidden" }, { id: "landing" });
    const header = new FakeHTMLElement("header", { left: 0, top: 0, width: 1440, height: 64 });
    const navLink = new FakeHTMLElement("a", { left: 600, top: 20, width: 60, height: 24 }, {}, {}, "Work");
    header.append(navLink);

    const main = new FakeHTMLElement("main", { left: 0, top: 0, width: 1440, height: 1200 });
    const workSection = new FakeHTMLElement("section", { left: 100, top: 100, width: 1240, height: 780 }, {}, { id: "ld-work" });

    // CSS-module hashed srOnly index that previously leaked "View ... on GitHub" boxes
    const srUl = new FakeHTMLElement(
      "ul",
      { left: 100, top: 100, width: 1, height: 1 },
      { overflow: "hidden", clip: "rect(0px, 0px, 0px, 0px)" },
      { class: "_srOnly_abc12" },
    );
    const srLi = new FakeHTMLElement("li", { left: 100, top: 100, width: 320, height: 20 });
    const srAnchor = new FakeHTMLElement("a", { left: 100, top: 100, width: 320, height: 20 }, {}, {}, "View Video KYC on GitHub");
    srLi.append(srAnchor);
    srUl.append(srLi);

    // .domeStage overflow: hidden bounding tiles to X:[100..1340], Y:[100..880]
    const domeStage = new FakeHTMLElement(
      "div",
      { left: 100, top: 100, width: 1240, height: 780 },
      { overflow: "hidden" },
    );

    const makeTile = (slot: string, x: number, y: number, w: number, h: number, title: string) => {
      const btn = new FakeHTMLElement(
        "button",
        { left: x, top: y, width: w, height: h },
        {},
        { "data-slot": slot },
      );
      const frame = new FakeHTMLElement("div", { left: x, top: y, width: w, height: h }, { overflow: "hidden" }, { "data-frame": "" });
      const img = new FakeHTMLElement("img", { left: x, top: y, width: w, height: h });
      frame.append(img);
      const caption = new FakeHTMLElement("div", { left: x, top: y + h + 8, width: w, height: 34 });
      const titleSpan = new FakeHTMLElement("span", { left: x, top: y + h + 8, width: w, height: 16 }, {}, {}, title);
      caption.append(titleSpan);
      btn.append(frame, caption);
      return btn;
    };

    // Row -1 leaking completely above .domeStage into sticky header / tools strip
    const topOffscreenTile = makeTile("0:-2", 620, -140, 200, 220, "Leaky Top Tile");
    // Column -3 completely outside left edge of .domeStage
    const leftOffscreenTile = makeTile("-3:0", -150, 300, 200, 220, "Leaky Left Tile");
    // Edge column peeking only 30% inside stage (< 45% visible) -> should be pruned cleanly
    const edgeSliverTile = makeTile("-2:0", -40, 300, 200, 220, "Sliver Edge Tile");
    // Edge column 75% inside stage -> clamped cleanly to stage.left (x = 100)
    const partiallyClippedTile = makeTile("-1:0", 50, 300, 200, 220, "Video KYC");
    // Fully visible center tile
    const centerTile = makeTile("0:0", 620, 300, 200, 220, "Kanban Studio");

    domeStage.append(
      topOffscreenTile,
      leftOffscreenTile,
      edgeSliverTile,
      partiallyClippedTile,
      centerTile,
    );
    workSection.append(srUl, domeStage);
    main.append(workSection);
    root.append(header, main);

    const boxes = scanBlueprintBoxes(root as unknown as HTMLElement);
    const texts = boxes.map((b) => b.text).filter(Boolean);

    expect(texts).not.toContain("View Video KYC on GitHub");
    expect(texts).not.toContain("Leaky Top Tile");
    expect(texts).not.toContain("Leaky Left Tile");
    expect(texts).not.toContain("Sliver Edge Tile");
    expect(texts).toContain("Video KYC");
    expect(texts).toContain("Kanban Studio");

    // All non-header boxes stay strictly within .domeStage horizontal bounds and below sticky header
    const contentBoxes = boxes.filter((b) => b.text !== "Work");
    for (const box of contentBoxes) {
      expect(box.x).toBeGreaterThanOrEqual(100);
      expect(box.x + box.w).toBeLessThanOrEqual(1340);
      expect(box.y).toBeGreaterThanOrEqual(100);
      expect(box.y + box.h).toBeLessThanOrEqual(880);
    }
  });
});
