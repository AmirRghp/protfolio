import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Returns all visible, interactive focusable elements inside a container.
 */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) =>
      el.getAttribute("aria-hidden") !== "true" &&
      !el.hasAttribute("inert") &&
      (el.offsetParent !== null || el === document.activeElement || el.getClientRects().length > 0),
  );
}

/**
 * Cycles keyboard Tab / Shift+Tab focus strictly within the provided container element.
 */
export function trapTabKey(event: KeyboardEvent, container: HTMLElement | null): void {
  if (event.key !== "Tab" || !container) return;
  const focusables = getFocusableElements(container);
  if (focusables.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const current = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (!current || current === first || !container.contains(current)) {
      event.preventDefault();
      last.focus();
    }
  } else if (!current || current === last || !container.contains(current)) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * React hook that traps Tab / Shift+Tab focus within `containerRef` while `active` is true.
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    if (!active || typeof window === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        trapTabKey(event, containerRef.current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [containerRef, active]);
}
