import assert from "node:assert/strict";
import {
  LANYARD_EXIT_LEAD_MS,
  ROOM_BUILD_DURATION_MS,
  ROOM_BUILD_REDUCED_MOTION_MS,
  createCompletedRoomBuildState,
  createIdleRoomBuildState,
  evaluateRoomBuildState,
} from "./roomBuildAnimation";

const registerSuite = async () => {
  const testFn: (name: string, fn: () => void) => void = process.env.VITEST
    ? (await import("vitest")).test
    : (await import("node:test")).test;

  testFn("starts in blackout stage while lanyard card exits into black", () => {
    const idle = createIdleRoomBuildState();
    assert.equal(idle.stage, "idle");
    assert.equal(idle.revealProgress, 0);
    assert.equal(idle.desktopOverlayOpacity, 0);

    const lead = evaluateRoomBuildState(100);
    assert.equal(lead.stage, "blackout");
    assert.equal(lead.wireframeStrength, 0);
    assert.equal(lead.revealProgress, 0);
    assert.equal(lead.desktopOverlayOpacity, 0);
  });

  testFn("constructs room and items sequentially in wireframe + dither wave stage before revealing lit room", () => {
    const earlyWireframe = evaluateRoomBuildState(LANYARD_EXIT_LEAD_MS + ROOM_BUILD_DURATION_MS * 0.22);
    assert.equal(earlyWireframe.stage, "wireframe");
    assert.ok(earlyWireframe.wireframeStrength > 0.9);
    assert.ok(earlyWireframe.ditherWaveStrength > 0.9);
    assert.equal(earlyWireframe.revealProgress, 0);
    assert.equal(earlyWireframe.desktopOverlayOpacity, 0);
    assert.ok(earlyWireframe.itemProgress.architecture > earlyWireframe.itemProgress.shelvesAndArcade);
    assert.ok(earlyWireframe.itemProgress.shelvesAndArcade > earlyWireframe.itemProgress.monitor);
    assert.ok(earlyWireframe.itemProgress.monitor > earlyWireframe.itemProgress.peripherals);
    assert.ok(earlyWireframe.itemProgress.peripherals >= earlyWireframe.itemProgress.props);

    const lateWireframe = evaluateRoomBuildState(LANYARD_EXIT_LEAD_MS + ROOM_BUILD_DURATION_MS * 0.58);
    assert.equal(lateWireframe.stage, "wireframe");
    assert.equal(lateWireframe.itemProgress.architecture, 1);
    assert.equal(lateWireframe.itemProgress.shelvesAndArcade, 1);
    assert.equal(lateWireframe.itemProgress.monitor, 1);
    assert.equal(lateWireframe.itemProgress.peripherals, 1);
    assert.ok(lateWireframe.itemProgress.props > 0.9);
    assert.equal(lateWireframe.revealProgress, 0);
  });

  testFn("dissolves wireframe into pixelated dither frontier during materializing stage and completes cleanly", () => {
    const materializing = evaluateRoomBuildState(LANYARD_EXIT_LEAD_MS + ROOM_BUILD_DURATION_MS * 0.78);
    assert.equal(materializing.stage, "materializing");
    assert.ok(materializing.wireframeStrength < 0.15);
    assert.ok(materializing.ditherWaveStrength > 0.8);
    assert.ok(materializing.revealProgress > 0.35 && materializing.revealProgress < 0.85);

    const finished = evaluateRoomBuildState(LANYARD_EXIT_LEAD_MS + ROOM_BUILD_DURATION_MS + 50);
    assert.deepEqual(finished, createCompletedRoomBuildState());
    assert.equal(finished.stage, "complete");
    assert.equal(finished.revealProgress, 1);
    assert.equal(finished.desktopOverlayOpacity, 1);
    assert.equal(finished.wireframeStrength, 0);
    assert.equal(finished.ditherWaveStrength, 0);
  });

  testFn("honors prefers-reduced-motion with a fast non-flashing reveal", () => {
    const midReduced = evaluateRoomBuildState(ROOM_BUILD_REDUCED_MOTION_MS * 0.5, true);
    assert.equal(midReduced.wireframeStrength, 0);
    assert.equal(midReduced.ditherWaveStrength, 0);
    assert.ok(midReduced.revealProgress > 0 && midReduced.revealProgress < 1);

    const doneReduced = evaluateRoomBuildState(ROOM_BUILD_REDUCED_MOTION_MS + 10, true);
    assert.equal(doneReduced.stage, "complete");
    assert.equal(doneReduced.revealProgress, 1);
  });
};

await registerSuite();
