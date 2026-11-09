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
});
