import { describe, expect, it } from "vitest";
import {
  LANYARD_PULL_MIN_PX,
  evaluatePullGesture,
  getInitialIntroPhaseFromSearch,
  shouldSkipLanyardIntro,
} from "./lanyardPull";

describe("lanyard pull-down gesture evaluation", () => {
  it("keeps the minimum downward pull threshold within 50 to 100 pixels", () => {
    expect(LANYARD_PULL_MIN_PX).toBeGreaterThanOrEqual(50);
    expect(LANYARD_PULL_MIN_PX).toBeLessThanOrEqual(100);
  });

  it("does not trigger on a simple tap or short downward touch below threshold", () => {
    expect(evaluatePullGesture(300, 300, 500, 500).triggered).toBe(false);
    expect(evaluatePullGesture(300, 315, 500, 502).triggered).toBe(false);
    expect(evaluatePullGesture(300, 345, 500, 500).triggered).toBe(false);
    expect(evaluatePullGesture(300, 374, 500, 500).triggered).toBe(false);
  });

  it("triggers when pulled downward by at least the required threshold", () => {
    const atThreshold = evaluatePullGesture(300, 300 + LANYARD_PULL_MIN_PX, 500, 505);
    expect(atThreshold.triggered).toBe(true);
    expect(atThreshold.progress).toBe(1);
    expect(atThreshold.deltaY).toBe(LANYARD_PULL_MIN_PX);

    const beyondThreshold = evaluatePullGesture(300, 410, 500, 512);
    expect(beyondThreshold.triggered).toBe(true);
    expect(beyondThreshold.progress).toBe(1);
    expect(beyondThreshold.deltaY).toBe(110);
  });

  it("rejects upward drags or predominantly horizontal swings", () => {
    const upward = evaluatePullGesture(300, 210, 500, 500);
    expect(upward.deltaY).toBe(0);
    expect(upward.progress).toBe(0);
    expect(upward.triggered).toBe(false);

    const sideways = evaluatePullGesture(300, 380, 500, 720);
    expect(sideways.triggered).toBe(false);
  });

  it("skips intro only when autostart or deep-linked destination query params are present", () => {
    expect(shouldSkipLanyardIntro("")).toBe(false);
    expect(shouldSkipLanyardIntro("?autostart=1")).toBe(true);
    expect(shouldSkipLanyardIntro("?skipIntro=1")).toBe(true);
    expect(shouldSkipLanyardIntro("?destination=monitor")).toBe(true);
    expect(shouldSkipLanyardIntro("?destination=arcade")).toBe(true);
  });

  it("resolves initial intro phase for normal load, build preview, and webdriver modes", () => {
    expect(getInitialIntroPhaseFromSearch("", false)).toBe("active");
    expect(getInitialIntroPhaseFromSearch("", true)).toBe("ready");
    expect(getInitialIntroPhaseFromSearch("?intro=1", true)).toBe("active");
    expect(getInitialIntroPhaseFromSearch("?build=1", false)).toBe("building");
    expect(getInitialIntroPhaseFromSearch("?build=1", true)).toBe("building");
    expect(getInitialIntroPhaseFromSearch("?autostart=1", false)).toBe("ready");
  });
});

