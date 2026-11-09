import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeDeviceSnapshot,
  DEFAULT_SERVER_DEVICE_STATE,
  getClientSnapshot,
  getServerSnapshot,
  setDeviceSnapshotForTesting,
  subscribeResponsiveDevice,
} from "./responsive";

describe("responsive device detection", () => {
  beforeEach(() => {
    setDeviceSnapshotForTesting(null);
  });

  afterEach(() => {
    setDeviceSnapshotForTesting(null);
    vi.restoreAllMocks();
  });

  it("returns default desktop state in SSR / server snapshot", () => {
    const serverState = getServerSnapshot();
    expect(serverState).toEqual(DEFAULT_SERVER_DEVICE_STATE);
    expect(serverState.isDesktop).toBe(true);
    expect(serverState.isMobile).toBe(false);
    expect(serverState.isTablet).toBe(false);
    expect(serverState.isTouch).toBe(false);
    expect(serverState.allowRoom3D).toBe(true);
  });

  it("returns a stable object reference across repeated getClientSnapshot calls without changes", () => {
    const s1 = getClientSnapshot();
    const s2 = getClientSnapshot();
    expect(s1).toBe(s2);
  });

  it("honors test snapshot override for testing environments", () => {
    setDeviceSnapshotForTesting({
      isMobile: true,
      isTablet: false,
      isMobileOrTablet: true,
      isDesktop: false,
      isTouch: true,
      allowRoom3D: false,
    });

    const client = getClientSnapshot();
    const server = getServerSnapshot();

    expect(client.isMobile).toBe(true);
    expect(client.allowRoom3D).toBe(false);
    expect(server.isMobile).toBe(true);
    expect(server.allowRoom3D).toBe(false);
  });

  describe("media query evaluation", () => {
    function setupMatchMedia(matches: Record<string, boolean>) {
      const listeners: Record<string, Array<() => void>> = {};

      const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: Boolean(matches[query]),
        media: query,
        addEventListener: vi.fn((event: string, cb: () => void) => {
          if (event === "change") {
            listeners[query] = listeners[query] || [];
            listeners[query].push(cb);
          }
        }),
        removeEventListener: vi.fn((event: string, cb: () => void) => {
          if (event === "change" && listeners[query]) {
            listeners[query] = listeners[query].filter((fn) => fn !== cb);
          }
        }),
      }));

      const mockWindow = {
        matchMedia: mockMatchMedia,
        innerWidth: 1024,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      };

      vi.stubGlobal("window", mockWindow);
      return { listeners, mockMatchMedia, mockWindow };
    }


    it("evaluates mobile correctly (< 768px)", () => {
      setupMatchMedia({
        "(max-width: 767px)": true,
        "(min-width: 768px) and (max-width: 1023px)": false,
        "(max-width: 1023px)": true,
        "(min-width: 1024px)": false,
        "(pointer: coarse)": true,
        "(pointer: fine)": false,
      });

      const snapshot = computeDeviceSnapshot();
      expect(snapshot.isMobile).toBe(true);
      expect(snapshot.isTablet).toBe(false);
      expect(snapshot.isMobileOrTablet).toBe(true);
      expect(snapshot.isDesktop).toBe(false);
      expect(snapshot.isTouch).toBe(true);
      expect(snapshot.allowRoom3D).toBe(false);
    });

    it("evaluates tablet correctly (768px - 1023px)", () => {
      setupMatchMedia({
        "(max-width: 767px)": false,
        "(min-width: 768px) and (max-width: 1023px)": true,
        "(max-width: 1023px)": true,
        "(min-width: 1024px)": false,
        "(pointer: coarse)": true,
        "(pointer: fine)": false,
      });

      const snapshot = computeDeviceSnapshot();
      expect(snapshot.isMobile).toBe(false);
      expect(snapshot.isTablet).toBe(true);
      expect(snapshot.isMobileOrTablet).toBe(true);
      expect(snapshot.isDesktop).toBe(false);
      expect(snapshot.isTouch).toBe(true);
      expect(snapshot.allowRoom3D).toBe(false);
    });

    it("strictly requires pointer: fine for allowRoom3D on large touch screens (e.g. iPad Pro landscape)", () => {
      // Screen width is >= 1024px, but primary pointer is coarse (finger)
      setupMatchMedia({
        "(max-width: 767px)": false,
        "(min-width: 768px) and (max-width: 1023px)": false,
        "(max-width: 1023px)": false,
        "(min-width: 1024px)": true,
        "(pointer: coarse)": true,
        "(pointer: fine)": false,
      });

      const snapshot = computeDeviceSnapshot();
      expect(snapshot.isMobile).toBe(false);
      expect(snapshot.isTablet).toBe(false);
      expect(snapshot.isMobileOrTablet).toBe(false);
      expect(snapshot.isDesktop).toBe(true);
      expect(snapshot.isTouch).toBe(true);
      // Even though isDesktop is true, touch pointer prevents 3D room
      expect(snapshot.allowRoom3D).toBe(false);
    });

    it("enables allowRoom3D on desktop baseline (>= 1024px and pointer: fine)", () => {
      setupMatchMedia({
        "(max-width: 767px)": false,
        "(min-width: 768px) and (max-width: 1023px)": false,
        "(max-width: 1023px)": false,
        "(min-width: 1024px)": true,
        "(pointer: coarse)": false,
        "(pointer: fine)": true,
      });

      const snapshot = computeDeviceSnapshot();
      expect(snapshot.isDesktop).toBe(true);
      expect(snapshot.isTouch).toBe(false);
      expect(snapshot.allowRoom3D).toBe(true);
    });

    it("denies allowRoom3D when pointer is neither fine nor coarse (fine is false)", () => {
      setupMatchMedia({
        "(max-width: 767px)": false,
        "(min-width: 768px) and (max-width: 1023px)": false,
        "(max-width: 1023px)": false,
        "(min-width: 1024px)": true,
        "(pointer: coarse)": false,
        "(pointer: fine)": false,
      });

      const snapshot = computeDeviceSnapshot();
      expect(snapshot.isDesktop).toBe(true);
      expect(snapshot.isTouch).toBe(false);
      expect(snapshot.allowRoom3D).toBe(false);
    });

    it("subscribes to changes and cleans up correctly", () => {
      const { listeners } = setupMatchMedia({
        "(max-width: 767px)": false,
        "(min-width: 1024px)": true,
      });

      const addResizeSpy = vi.spyOn(window, "addEventListener");
      const removeResizeSpy = vi.spyOn(window, "removeEventListener");

      const onStoreChange = vi.fn();
      const unsubscribe = subscribeResponsiveDevice(onStoreChange);

      expect(addResizeSpy).toHaveBeenCalledWith("resize", expect.any(Function), { passive: true });

      // Trigger a media query change
      const mobileListeners = listeners["(max-width: 767px)"];
      expect(mobileListeners && mobileListeners.length > 0).toBe(true);
      mobileListeners?.[0]?.();
      expect(onStoreChange).toHaveBeenCalledTimes(1);

      // Clean up
      unsubscribe();
      expect(removeResizeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    });
  });
});
