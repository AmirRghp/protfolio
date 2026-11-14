import { type RefObject, useEffect, useRef } from "react";
import {
  type DomeLayout,
  prefersReducedMotionFallback,
  screenToPlanar,
} from "./pointer-helpers";

export type PointerFocus = {
  target: { x: number; y: number } | null;
  current: { x: number; y: number } | null;
  strength: number;
};

export function usePointerFocus(
  stageRef: RefObject<HTMLElement | null>,
  layout: DomeLayout,
  onWake: () => void
): RefObject<PointerFocus> {
  const focusRef = useRef<PointerFocus>({
    target: null,
    current: null,
    strength: 0,
  });

  useEffect(() => {
    const el = stageRef.current;
    if (!el || prefersReducedMotionFallback()) return;

    const focus = focusRef.current;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      const sx = e.clientX - (rect.left + rect.width * 0.5);
      const sy = e.clientY - (rect.top + rect.height * 0.5);
      focus.target = screenToPlanar(sx, sy, layout);
      onWake();
    };

    const onLeave = () => {
      focus.target = null;
      onWake();
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [stageRef, layout, onWake]);

  return focusRef;
}
