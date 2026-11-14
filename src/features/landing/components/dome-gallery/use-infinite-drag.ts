import { type RefObject, useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "./motion";
import type { PointerFocus } from "./use-pointer-focus";

export type DragStepArgs = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  focusX: number | null;
  focusY: number | null;
  focusStrength: number;
};

type UseInfiniteDragOptions = {
  stageRef: RefObject<HTMLElement | null>;
  focusRef: RefObject<PointerFocus>;
  paused: boolean;
  onStep: (args: DragStepArgs) => void;
};

const DRAG_THRESHOLD_PX = 6;
const LERP = 0.085;
const FOCUS_LERP = 0.12;
const FOCUS_STRENGTH_IN_LERP = 0.1;
const FOCUS_STRENGTH_OUT_LERP = 0.065;
const SETTLE_EPS = 0.08;
const KEY_STEP = 220;

export function useInfiniteDrag({
  stageRef,
  focusRef,
  paused,
  onStep,
}: UseInfiniteDragOptions) {
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const velRef = useRef({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);
  const pausedRef = useRef(paused);
  const onStepRef = useRef(onStep);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const target = targetRef.current;
    const current = currentRef.current;
    const vel = velRef.current;
    const reduced = prefersReducedMotion();

    let ticking = false;

    const tick = () => {
      const ratio = gsap.ticker.deltaRatio(60);
      const alpha = reduced ? 1 : 1 - Math.pow(1 - LERP, ratio);
      const prevX = current.x;
      const prevY = current.y;

      current.x += (target.x - current.x) * alpha;
      current.y += (target.y - current.y) * alpha;
      vel.x = current.x - prevX;
      vel.y = current.y - prevY;

      const focus = focusRef.current;
      let focusSettled = true;

      if (focus.target) {
        if (!focus.current) {
          focus.current = { x: focus.target.x, y: focus.target.y };
        } else {
          const fa = reduced ? 1 : 1 - Math.pow(1 - FOCUS_LERP, ratio);
          focus.current.x += (focus.target.x - focus.current.x) * fa;
          focus.current.y += (focus.target.y - focus.current.y) * fa;
        }
        const sa = reduced ? 1 : 1 - Math.pow(1 - FOCUS_STRENGTH_IN_LERP, ratio);
        focus.strength += (1 - focus.strength) * sa;

        const fdx = Math.abs(focus.target.x - focus.current.x);
        const fdy = Math.abs(focus.target.y - focus.current.y);
        const fds = Math.abs(1 - focus.strength);
        focusSettled = fdx < 0.4 && fdy < 0.4 && fds < 0.005;
      } else if (focus.current || focus.strength > 0) {
        const sa = reduced ? 1 : 1 - Math.pow(1 - FOCUS_STRENGTH_OUT_LERP, ratio);
        focus.strength += (0 - focus.strength) * sa;
        if (focus.strength < 0.003) {
          focus.strength = 0;
          focus.current = null;
          focusSettled = true;
        } else {
          focusSettled = false;
        }
      }

      onStepRef.current({
        x: current.x,
        y: current.y,
        vx: vel.x,
        vy: vel.y,
        focusX: focus.current ? focus.current.x : null,
        focusY: focus.current ? focus.current.y : null,
        focusStrength: focus.strength,
      });

      const dx = Math.abs(target.x - current.x);
      const dy = Math.abs(target.y - current.y);
      if (!dragging && dx < SETTLE_EPS && dy < SETTLE_EPS && focusSettled) {
        current.x = target.x;
        current.y = target.y;
        vel.x = 0;
        vel.y = 0;
        ticking = false;
        gsap.ticker.remove(tick);
      }
    };

    const wake = () => {
      if (!ticking) {
        ticking = true;
        gsap.ticker.add(tick);
      }
    };
    wakeRef.current = wake;

    let dragging = false;
    let activePointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let lastMoveT = 0;
    let moveVx = 0;
    let moveVy = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (pausedRef.current) return;
      if (e.button !== 0 && e.pointerType === "mouse") return;
      dragging = true;
      activePointerId = e.pointerId;
      dragMovedRef.current = false;
      startX = e.clientX;
      startY = e.clientY;
      originX = target.x;
      originY = target.y;
      moveVx = 0;
      moveVy = 0;
      lastMoveT = performance.now();
      el.dataset.dragging = "true";
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (
        !dragMovedRef.current &&
        Math.hypot(dx, dy) > DRAG_THRESHOLD_PX
      ) {
        dragMovedRef.current = true;
      }
      const now = performance.now();
      const dt = Math.max(8, now - lastMoveT);
      const nextX = originX + dx;
      const nextY = originY + dy;
      moveVx = ((nextX - target.x) / dt) * 16;
      moveVy = ((nextY - target.y) / dt) * 16;
      target.x = nextX;
      target.y = nextY;
      lastMoveT = now;
      wake();
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      dragging = false;
      activePointerId = null;
      delete el.dataset.dragging;
      const stale = performance.now() - lastMoveT > 80;
      if (!stale && !reduced) {
        const boost = 7;
        target.x += Math.max(-520, Math.min(520, moveVx * boost));
        target.y += Math.max(-520, Math.min(520, moveVy * boost));
      }
      wake();
    };

    const onWheel = (e: WheelEvent) => {
      if (pausedRef.current) return;
      const isHorizontalPan = Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.1;
      if (!isHorizontalPan && !e.shiftKey && !e.altKey) {
        return;
      }
      e.preventDefault();
      const modeScale = e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? 320 : 1;
      const dx = (e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX) * modeScale * 0.85;
      const dy = (e.shiftKey && e.deltaX === 0 ? 0 : e.deltaY) * modeScale * 0.85;
      target.x -= dx;
      target.y -= dy;
      wake();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (pausedRef.current) return;
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowLeft":
          target.x += KEY_STEP;
          break;
        case "ArrowRight":
          target.x -= KEY_STEP;
          break;
        case "ArrowUp":
          target.y += KEY_STEP;
          break;
        case "ArrowDown":
          target.y -= KEY_STEP;
          break;
        default:
          return;
      }
      e.preventDefault();
      wake();
    };

    wake();

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKeyDown);

    return () => {
      gsap.ticker.remove(tick);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKeyDown);
    };
  }, [stageRef, focusRef]);

  return {
    dragMovedRef,
    wake: () => wakeRef.current(),
    nudge: (dx: number, dy: number) => {
      targetRef.current.x += dx;
      targetRef.current.y += dy;
      wakeRef.current();
    },
  };
}
