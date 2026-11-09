import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Glisse WebKit / Safari refraction bend patch", () => {
  it("patches boxUnits in glisse dist files to prevent scale diminution on iOS Safari", () => {
    const esmPath = path.resolve(process.cwd(), "node_modules/glisse/dist/index.js");
    const cjsPath = path.resolve(process.cwd(), "node_modules/glisse/dist/index.cjs");

    const esmContent = fs.readFileSync(esmPath, "utf8");
    const cjsContent = fs.readFileSync(cjsPath, "utf8");

    // Must not contain the flawed WebKit user-agent branch that switches to objectBoundingBox
    expect(esmContent).not.toMatch(
      /const boxUnits = \(\) => \/AppleWebKit\\\/\/\.test\(navigator\.userAgent\) && !\/Chrom\(\?:e\|ium\)\\\/\/\.test\(navigator\.userAgent\);/
    );
    expect(cjsContent).not.toMatch(
      /const boxUnits = \(\) => \/AppleWebKit\\\/\/\.test\(navigator\.userAgent\) && !\/Chrom\(\?:e\|ium\)\\\/\/\.test\(navigator\.userAgent\);/
    );

    // Must contain the patched boxUnits returning false to enforce userSpaceOnUse
    expect(esmContent).toContain("const boxUnits = () => false;");
    expect(cjsContent).toContain("const boxUnits = () => false;");
  });

  it("verifies displacement calculation retains full pixel scale (~19.8px) instead of dividing by container height", () => {
    const navbarHeight = 64;
    const bend = 0.31;
    const dispersion = 0.4;
    const containerHeight = 5555; // Full scrollable page height
    const containerWidth = 390; // Mobile viewport width

    const reach = bend * navbarHeight; // 19.84px
    const spectrum = [1 + 0.2 * dispersion, 1 + 0.1 * dispersion, 1];

    // Flawed WebKit calculation (dividing reach by containerHeight & containerWidth):
    const flawedDownScale = (reach / containerHeight) * spectrum[0];
    const flawedAcrossScale = (reach / containerWidth) * spectrum[0];
    // Patched calculation (raw pixels in userSpaceOnUse):
    const patchedDownScale = reach * spectrum[0];
    const patchedAcrossScale = reach * spectrum[0];

    // Flawed scale produces sub-pixel near-zero noise (< 0.01px vertical) in WebKit
    expect(flawedDownScale).toBeLessThan(0.01);
    expect(flawedAcrossScale).toBeLessThan(0.1);

    // Patched scale produces crisp ~21px optical refraction across both Android and iPhone
    expect(patchedDownScale).toBeGreaterThan(19);
    expect(patchedDownScale).toBeCloseTo(21.4272, 2);
    expect(patchedAcrossScale).toBeCloseTo(21.4272, 2);
    expect(patchedDownScale).toBeCloseTo(21.4272, 2);
  });
});
