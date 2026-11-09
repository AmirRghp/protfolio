import { useSyncExternalStore } from "react";

export type ResponsiveDeviceState = {
  isMobile: boolean; // < 768px
  isTablet: boolean; // >= 768px && < 1024px
  isMobileOrTablet: boolean; // < 1024px
  isDesktop: boolean; // >= 1024px
  isTouch: boolean; // pointer: coarse
  allowRoom3D: boolean; // isDesktop && !isTouch (strictly >= 1024px AND pointer: fine)
};

export const DEFAULT_SERVER_DEVICE_STATE: ResponsiveDeviceState = Object.freeze({
  isMobile: false,
  isTablet: false,
  isMobileOrTablet: false,
  isDesktop: true,
  isTouch: false,
  allowRoom3D: true,
});

const QUERY_MOBILE = "(max-width: 767px)";
const QUERY_TABLET = "(min-width: 768px) and (max-width: 1023px)";
const QUERY_MOBILE_OR_TABLET = "(max-width: 1023px)";
const QUERY_DESKTOP = "(min-width: 1024px)";
const QUERY_COARSE = "(pointer: coarse)";
const QUERY_FINE = "(pointer: fine)";

let cachedSnapshot: ResponsiveDeviceState | null = null;
let testSnapshotOverride: ResponsiveDeviceState | null = null;

/**
 * Test override helper to force a specific device state in tests.
 * Pass `null` to restore dynamic detection.
 */
export function setDeviceSnapshotForTesting(override: ResponsiveDeviceState | null): void {
  testSnapshotOverride = override;
  cachedSnapshot = null;
}

/**
 * Computes the device state based on CSS media queries and window dimensions.
 */
export function computeDeviceSnapshot(): ResponsiveDeviceState {
  if (testSnapshotOverride) {
    return testSnapshotOverride;
  }

  if (typeof window === "undefined") {
    return DEFAULT_SERVER_DEVICE_STATE;
  }

  const hasMatchMedia = typeof window.matchMedia === "function";

  const isMobile = hasMatchMedia
    ? window.matchMedia(QUERY_MOBILE).matches
    : typeof window.innerWidth === "number"
      ? window.innerWidth < 768
      : false;

  const isTablet = hasMatchMedia
    ? window.matchMedia(QUERY_TABLET).matches
    : typeof window.innerWidth === "number"
      ? window.innerWidth >= 768 && window.innerWidth < 1024
      : false;

  const isMobileOrTablet = hasMatchMedia
    ? window.matchMedia(QUERY_MOBILE_OR_TABLET).matches
    : isMobile || isTablet || (typeof window.innerWidth === "number" && window.innerWidth < 1024);

  const isDesktop = hasMatchMedia
    ? window.matchMedia(QUERY_DESKTOP).matches
    : !isMobileOrTablet;

  const isTouch = hasMatchMedia ? window.matchMedia(QUERY_COARSE).matches : false;
  const isFine = hasMatchMedia ? window.matchMedia(QUERY_FINE).matches : !isTouch;

  // Dual-condition: strictly requires both viewport width >= 1024px AND pointer: fine (mouse/trackpad).
  // Any touch device (including landscape iPad Pro with pointer: coarse) or viewport < 1024px yields allowRoom3D = false.
  const allowRoom3D = isDesktop && isFine && !isTouch;

  return {
    isMobile,
    isTablet,
    isMobileOrTablet,
    isDesktop,
    isTouch,
    allowRoom3D,
  };
}

function areStatesEqual(a: ResponsiveDeviceState, b: ResponsiveDeviceState): boolean {
  return (
    a.isMobile === b.isMobile &&
    a.isTablet === b.isTablet &&
    a.isMobileOrTablet === b.isMobileOrTablet &&
    a.isDesktop === b.isDesktop &&
    a.isTouch === b.isTouch &&
    a.allowRoom3D === b.allowRoom3D
  );
}

/**
 * Snapshot getter for useSyncExternalStore on client side.
 * Returns a stable reference when properties have not changed.
 */
export function getClientSnapshot(): ResponsiveDeviceState {
  const next = computeDeviceSnapshot();
  if (cachedSnapshot && areStatesEqual(cachedSnapshot, next)) {
    return cachedSnapshot;
  }
  cachedSnapshot = next;
  return next;
}

/**
 * Snapshot getter for useSyncExternalStore during SSR / server render.
 */
export function getServerSnapshot(): ResponsiveDeviceState {
  return testSnapshotOverride ?? DEFAULT_SERVER_DEVICE_STATE;
}

/**
 * Subscribes to window media query changes and resize events.
 */
export function subscribeResponsiveDevice(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const queries = [
    QUERY_MOBILE,
    QUERY_TABLET,
    QUERY_MOBILE_OR_TABLET,
    QUERY_DESKTOP,
    QUERY_COARSE,
    QUERY_FINE,
  ];

  const cleanups: Array<() => void> = [];

  const handleChange = () => {
    // Invalidate cached snapshot and notify subscriber
    cachedSnapshot = null;
    onStoreChange();
  };

  if (typeof window.matchMedia === "function") {
    for (const q of queries) {
      try {
        const mql = window.matchMedia(q);
        if (typeof mql.addEventListener === "function") {
          mql.addEventListener("change", handleChange);
          cleanups.push(() => mql.removeEventListener("change", handleChange));
        } else if (typeof (mql as unknown as { addListener?: (fn: () => void) => void }).addListener === "function") {
          (mql as unknown as { addListener: (fn: () => void) => void }).addListener(handleChange);
          cleanups.push(() => {
            (mql as unknown as { removeListener: (fn: () => void) => void }).removeListener(handleChange);
          });
        }
      } catch {
        // Fallback for partial matchMedia implementations
      }
    }
  }

  window.addEventListener("resize", handleChange, { passive: true });
  cleanups.push(() => window.removeEventListener("resize", handleChange));

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

/**
 * React 19 hook providing reactive, SSR-safe device detection with zero hydration flashing.
 */
export function useResponsiveDevice(): ResponsiveDeviceState {
  return useSyncExternalStore(subscribeResponsiveDevice, getClientSnapshot, getServerSnapshot);
}
