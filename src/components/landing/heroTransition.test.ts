import nodeTest from "node:test";
import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
  computeHeroPortalGeometry,
  HERO_OPEN_TIMING,
  HERO_CLOSE_TIMING,
} from "./heroTransition";

const runSuite = (register: (name: string, fn: () => void) => void) => {
  register("computeHeroPortalGeometry computes distortion-free uniform scale and exact viewport coverage at 1440x900", () => {
    const viewport = { width: 1440, height: 900 };
    const frameRect = { left: 16, top: 64, width: 1408, height: 616 };

    const geo = computeHeroPortalGeometry(viewport, frameRect, 6);

    assert.ok(Math.abs(geo.scale - 900 / 616) < 1e-6);

    const renderedWidth = (frameRect.width - geo.fullscreenInsetX * 2) * geo.scale;
    const renderedHeight = (frameRect.height - geo.fullscreenInsetY * 2) * geo.scale;
    assert.ok(Math.abs(renderedWidth - viewport.width) < 0.05);
    assert.ok(Math.abs(renderedHeight - viewport.height) < 0.05);

    assert.equal(geo.translateX, 0);
    assert.equal(geo.translateY, 78);

    assert.equal(geo.dockedTransform, "translate3d(0px, 0px, 0px) scale(1)");
    assert.equal(geo.dockedClipPath, "inset(0px 0px 0px 0px round 6px)");
  });

  register("computeHeroPortalGeometry handles narrow mobile viewports where width ratio dominates", () => {
    const viewport = { width: 375, height: 800 };
    const frameRect = { left: 10, top: 64, width: 355, height: 496 };

    const geo = computeHeroPortalGeometry(viewport, frameRect, 6);

    const renderedWidth = (frameRect.width - geo.fullscreenInsetX * 2) * geo.scale;
    const renderedHeight = (frameRect.height - geo.fullscreenInsetY * 2) * geo.scale;
    assert.ok(Math.abs(renderedWidth - viewport.width) < 0.05);
    assert.ok(Math.abs(renderedHeight - viewport.height) < 0.05);
    assert.ok(geo.fullscreenClipPath.endsWith("round 0px)"));
  });

  register("open and close timing schedules keep backdrop faded before room dissolve to prevent black flashes", () => {
    assert.ok(
      HERO_CLOSE_TIMING.backdropFadeDuration <= HERO_CLOSE_TIMING.dissolveDelay,
      "Backdrop must be transparent before fullscreen ASCII portal dissolves into 3D room",
    );
    assert.ok(
      HERO_OPEN_TIMING.dockDelay < HERO_OPEN_TIMING.quantizeFadeDuration,
      "Docking should overlap with initial quantization fade for continuous motion",
    );
  });
};

if (process.env.VITEST) {
  describe("heroTransition", () => {
    runSuite(it);
  });
} else {
  runSuite(nodeTest);
}
