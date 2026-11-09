import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Glisse WebKit / Safari refraction bend patch", () => {
  it("preserves WebKit objectBoundingBox filter units and patches multi-section dynamic backdrop binding", () => {
    const esmPath = path.resolve(process.cwd(), "node_modules/glisse/dist/index.js");
    const cjsPath = path.resolve(process.cwd(), "node_modules/glisse/dist/index.cjs");

    const esmContent = fs.readFileSync(esmPath, "utf8");
    const cjsContent = fs.readFileSync(cjsPath, "utf8");

    // WebKit (Safari & iOS) requires objectBoundingBox units for SVG filters on HTML elements
    expect(esmContent).toContain(
      "const boxUnits = () => /AppleWebKit\\//.test(navigator.userAgent) && !/Chrom(?:e|ium)\\//.test(navigator.userAgent);",
    );
    expect(cjsContent).toContain(
      "const boxUnits = () => /AppleWebKit\\//.test(navigator.userAgent) && !/Chrom(?:e|ium)\\//.test(navigator.userAgent);",
    );

    // Must not force boxUnits = () => false, which places feImage at 6500% in WebKit
    expect(esmContent).not.toContain("const boxUnits = () => false;");
    expect(cjsContent).not.toContain("const boxUnits = () => false;");

    // Must include the multi-section dynamic backdrop refraction patch
    expect(esmContent).toContain("/* [patch-glisse] Multi-section dynamic backdrop refraction */");
    expect(cjsContent).toContain("/* [patch-glisse] Multi-section dynamic backdrop refraction */");
    expect(esmContent).toContain("const list = Array.isArray(source) ? source : [source];");
    expect(cjsContent).toContain("const list = Array.isArray(source) ? source : [source];");

    // Must contain bleed containment: unboxing neutral-k and bounding both across & down displacement maps
    expect(esmContent).toContain("boxed.push(across, down);");
    expect(cjsContent).toContain("boxed.push(across, down);");
    expect(esmContent).toContain("effAcross");
    expect(cjsContent).toContain("effAcross");
  });

  it("keeps section-level WebKit objectBoundingBox coordinates and physical filter dimensions under WebKit's 4096px limit", () => {
    const navbarHeight = 58;
    const navbarWidth = 390;
    const bend = 0.31;
    const dispersion = 0.4;
    const heroSectionHeight = 504; // 64px top pad + 440px mobile Hero frame
    const retinaDpr = 3;

    // Physical pixel height of a section must stay well below WebKit's 4096px max software ImageBuffer limit
    expect(heroSectionHeight * retinaDpr).toBeLessThan(4096);

    const reach = bend * navbarHeight; // 17.98px
    const spectrum = [1 + 0.2 * dispersion, 1 + 0.1 * dispersion, 1];

    // In primitiveUnits="objectBoundingBox", WebKit multiplies scale by across (X) and down (Y)
    const acrossScaleAttr = (reach / navbarWidth) * spectrum[0];
    const downScaleAttr = (reach / heroSectionHeight) * spectrum[0];

    const effectiveWebKitDisplacementX = acrossScaleAttr * navbarWidth;
    const effectiveWebKitDisplacementY = downScaleAttr * heroSectionHeight;

    expect(effectiveWebKitDisplacementX).toBeCloseTo(reach * spectrum[0], 4);
    expect(effectiveWebKitDisplacementY).toBeCloseTo(reach * spectrum[0], 4);
    expect(effectiveWebKitDisplacementY).toBeGreaterThan(19);
  });

  it("compensates for WebKit content-box padding offsets to prevent distortion bleed outside navbar bounds", () => {
    const navbarHeight = 58;
    const navbarWidth = 390;
    const sectionHeight = 504;
    const paddingTop = 64;
    const paddingLeft = 0;
    const paddingRight = 0;
    const paddingBottom = 0;

    const effAcross = Math.max(1, navbarWidth - paddingLeft - paddingRight);
    const effDown = Math.max(1, sectionHeight - paddingTop - paddingBottom);

    expect(effAcross).toBe(390);
    expect(effDown).toBe(440);

    // Suppose scrolled so navbar top is at 106px relative to element top
    const relativeNavbarTop = 106;
    const uncompensatedRectY = relativeNavbarTop / sectionHeight; // ~0.2103
    // In uncompensated WebKit, rendered top = paddingTop + (effDown * uncompensatedRectY) = 64 + 92.5 = 156.5px (50.5px offset / bleed!)
    const uncompensatedRenderedY = paddingTop + effDown * uncompensatedRectY;
    expect(uncompensatedRenderedY).toBeGreaterThan(relativeNavbarTop + 40);

    // With effDown compensation:
    const compensatedLensY = relativeNavbarTop - paddingTop; // 42px inside content box
    const compensatedRectY = compensatedLensY / effDown; // 42 / 440
    const compensatedRenderedY = paddingTop + effDown * compensatedRectY; // 64 + 42 = 106px (exact!)
    expect(compensatedRenderedY).toBeCloseTo(relativeNavbarTop, 4);

    // Height inside content box:
    const compensatedRectHeight = navbarHeight / effDown;
    const compensatedRenderedHeight = effDown * compensatedRectHeight;
    expect(compensatedRenderedHeight).toBeCloseTo(navbarHeight, 4);
  });
});
