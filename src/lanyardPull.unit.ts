import test from "node:test";
import assert from "node:assert/strict";
import { LANYARD_PULL_MIN_PX, evaluatePullGesture, shouldSkipLanyardIntro } from "./lanyardPull";

test("threshold sits between 50px and 100px", () => {
  assert.equal(LANYARD_PULL_MIN_PX >= 50 && LANYARD_PULL_MIN_PX <= 100, true);
});

test("short touches and pulls under threshold do not trigger site load", () => {
  assert.equal(evaluatePullGesture(250, 250, 400, 400).triggered, false);
  assert.equal(evaluatePullGesture(250, 280, 400, 402).triggered, false);
  assert.equal(evaluatePullGesture(250, 250 + LANYARD_PULL_MIN_PX - 1, 400, 400).triggered, false);
});

test("deliberate downward pull at or above threshold triggers site load", () => {
  const result = evaluatePullGesture(250, 250 + LANYARD_PULL_MIN_PX, 400, 408);
  assert.equal(result.triggered, true);
  assert.equal(result.progress, 1);
});

test("query parameter check skips intro for autostart and deep destinations", () => {
  assert.equal(shouldSkipLanyardIntro(""), false);
  assert.equal(shouldSkipLanyardIntro("?autostart=1"), true);
  assert.equal(shouldSkipLanyardIntro("?destination=monitor"), true);
});
