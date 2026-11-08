import { describe, expect, it, vi } from "vitest";
import { OiiaAudioManager } from "./oiiaAudio";

describe("OiiaAudioManager audio and dance synchronization engine", () => {
  it("initializes in idle standing state with standard volume", () => {
    const manager = new OiiaAudioManager();
    const state = manager.getState();

    expect(state.isPlaying).toBe(false);
    expect(state.currentTime).toBe(0);
    expect(state.bassEnergy).toBe(0);
    expect(state.overallEnergy).toBe(0);
    expect(state.isDrop).toBe(false);
    expect(state.isMuted).toBe(false);
    expect(state.volume).toBeCloseTo(0.85);
  });

  it("toggles play and pause state correctly", async () => {
    const manager = new OiiaAudioManager();
    expect(manager.getState().isPlaying).toBe(false);

    await manager.play();
    expect(manager.getState().isPlaying).toBe(true);

    manager.pause();
    expect(manager.getState().isPlaying).toBe(false);

    await manager.toggle();
    expect(manager.getState().isPlaying).toBe(true);

    await manager.toggle();
    expect(manager.getState().isPlaying).toBe(false);
  });

  it("completely resets state to zero on reset()", async () => {
    const manager = new OiiaAudioManager();
    await manager.play();
    manager.updateTime(42.5); // Fast forward into drop

    const activeState = manager.getState();
    expect(activeState.isPlaying).toBe(true);
    expect(activeState.currentTime).toBeGreaterThan(0);

    // Perform complete reset (as when camera navigates away)
    manager.reset();
    const resetState = manager.getState();

    expect(resetState.isPlaying).toBe(false);
    expect(resetState.currentTime).toBe(0);
    expect(resetState.bassEnergy).toBe(0);
    expect(resetState.overallEnergy).toBe(0);
    expect(resetState.isDrop).toBe(false);
  });

  it("detects drop phases at 33s-57s and 81s-105s", async () => {
    const manager = new OiiaAudioManager();
    await manager.play();

    // At 10s (intro groove)
    manager.updateTime(10.0);
    let state = manager.getState();
    expect(state.isDrop).toBe(false);

    // At 35s (first drop / rave mode)
    manager.updateTime(25.0); // 10 + 25 = 35s
    state = manager.getState();
    expect(state.isDrop).toBe(true);
    expect(state.bassEnergy).toBeGreaterThan(0.2); // Drop bass energy boost

    // At 65s (interlude / build-up)
    manager.updateTime(30.0); // 35 + 30 = 65s
    state = manager.getState();
    expect(state.isDrop).toBe(false);

    // At 85s (second drop)
    manager.updateTime(20.0); // 65 + 20 = 85s
    state = manager.getState();
    expect(state.isDrop).toBe(true);
  });

  it("calculates 160 BPM kick pulses synchronously with rhythmic cadence", async () => {
    const manager = new OiiaAudioManager({ bpm: 160 });
    await manager.play();

    // Exactly at beat onset (t = 0.0s), energy should peak
    const onBeatState = manager.getState();
    expect(onBeatState.bassEnergy).toBeGreaterThan(0.6);

    // Mid beat (t = 0.20s into 0.375s period), energy should decay towards 0
    manager.updateTime(0.20);
    const midBeatState = manager.getState();
    expect(midBeatState.bassEnergy).toBeLessThan(onBeatState.bassEnergy);
  });

  it("manages volume and mute state with clamping", () => {
    const manager = new OiiaAudioManager();

    manager.setVolume(0.5);
    expect(manager.getState().volume).toBe(0.5);

    // Clamp upper bound
    manager.setVolume(1.8);
    expect(manager.getState().volume).toBe(1.0);

    // Clamp lower bound
    manager.setVolume(-0.4);
    expect(manager.getState().volume).toBe(0.0);

    manager.setMuted(true);
    expect(manager.getState().isMuted).toBe(true);

    manager.toggleMute();
    expect(manager.getState().isMuted).toBe(false);
  });

  it("notifies subscribers when audio state changes", async () => {
    const manager = new OiiaAudioManager();
    const listener = vi.fn();

    const unsubscribe = manager.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);

    await manager.play();
    expect(listener).toHaveBeenCalledTimes(2);

    manager.setMuted(true);
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    manager.pause();
    expect(listener).toHaveBeenCalledTimes(3); // Not called after unsubscribe
  });
});
