import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { resolveSkylineAnimationElapsed } from "@/data/githubContributions";
import { GithubActivitySection } from "./GithubActivitySection";

describe("GithubActivitySection", () => {
  it("renders header with kicker, title, and hint", () => {
    const html = renderToStaticMarkup(<GithubActivitySection />);
    expect(html).toContain("Activity");
    expect(html).toContain("Github Activity");
    expect(html).toContain("( 3D skyline of contributions )");
  });

  it("does not render the removed card head with '02 As a city' text", () => {
    const html = renderToStaticMarkup(<GithubActivitySection />);
    expect(html).not.toContain(">02<");
    expect(html).not.toContain("As a city");
    expect(html).not.toContain("Every day becomes a building");
  });

  it("renders canvas element with accessible label and replay button", () => {
    const html = renderToStaticMarkup(<GithubActivitySection />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="GitHub contribution 3D skyline');
    expect(html).toContain("Replay");
    expect(html).toContain("github.com/AmirRghp");
  });

  it("keeps animation at 0ms while off-screen on initial load and starts from 0ms when scrolled into view", () => {
    // 1. Initial ResizeObserver fires at page load (t = 100ms) while section is off-screen
    const initialLoad = resolveSkylineAnimationElapsed({
      now: 100,
      startTime: null,
      isIntersecting: false,
      prefersReduced: false,
    });
    expect(initialLoad.elapsed).toBe(0);
    expect(initialLoad.nextStartTime).toBeNull();
    expect(initialLoad.shouldScheduleNextFrame).toBe(false);

    // 2. User scrolls down 10 seconds later (t = 10,100ms) and reaches the chart
    const firstVisibleFrame = resolveSkylineAnimationElapsed({
      now: 10100,
      startTime: initialLoad.nextStartTime,
      isIntersecting: true,
      prefersReduced: false,
    });
    expect(firstVisibleFrame.elapsed).toBe(0);
    expect(firstVisibleFrame.nextStartTime).toBe(10100);
    expect(firstVisibleFrame.shouldScheduleNextFrame).toBe(true);

    // 3. Subsequent frames animate smoothly through the 4200ms wave + pin timeline
    const midWaveFrame = resolveSkylineAnimationElapsed({
      now: 11600,
      startTime: firstVisibleFrame.nextStartTime,
      isIntersecting: true,
      prefersReduced: false,
    });
    expect(midWaveFrame.elapsed).toBe(1500);
    expect(midWaveFrame.shouldScheduleNextFrame).toBe(true);

    // 4. After 4200ms, the animation completes and stops scheduling frames
    const completedFrame = resolveSkylineAnimationElapsed({
      now: 14500,
      startTime: firstVisibleFrame.nextStartTime,
      isIntersecting: true,
      prefersReduced: false,
    });
    expect(completedFrame.elapsed).toBe(4400);
    expect(completedFrame.shouldScheduleNextFrame).toBe(false);
  });

  it("renders completed skyline immediately when prefers-reduced-motion is enabled", () => {
    const reduced = resolveSkylineAnimationElapsed({
      now: 50,
      startTime: null,
      isIntersecting: false,
      prefersReduced: true,
    });
    expect(reduced.elapsed).toBe(Infinity);
    expect(reduced.shouldScheduleNextFrame).toBe(false);
  });
});
