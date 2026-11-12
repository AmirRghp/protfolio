import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Button as GlisseButton } from "glisse";
import {
  computeAssistiveSnapPosition,
  type FabPosition,
  EDGE_MARGIN,
  TOP_SAFE_MARGIN,
  DRAG_THRESHOLD_PX,
} from "../utils/mobileFabUtils";
import styles from "./MobileArcadeFab.module.css";

export type MobileArcadeFabProps = {
  onClick: () => void;
};

export default function MobileArcadeFab({ onClick }: MobileArcadeFabProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<FabPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragStateRef = useRef<{
    pointerId: number | null;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
    btnSize: number;
    moved: boolean;
  }>({
    pointerId: null,
    startClientX: 0,
    startClientY: 0,
    originX: 0,
    originY: 0,
    btnSize: 58,
    moved: false,
  });

  // Initialize and keep position docked inside viewport on resize/orientation change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateForViewport = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const btnSize = vw >= 768 ? 64 : 58;

      setPosition((prev) => {
        if (!prev) {
          const initialY = Math.max(TOP_SAFE_MARGIN, vh - btnSize - 24);
          return computeAssistiveSnapPosition(vw - btnSize - EDGE_MARGIN, initialY, vw, vh, btnSize)
            .snapped;
        }
        const targetX = prev.dockSide === "left" ? EDGE_MARGIN : vw - btnSize - EDGE_MARGIN;
        return computeAssistiveSnapPosition(targetX, prev.y, vw, vh, btnSize).snapped;
      });
    };

    updateForViewport();
    window.addEventListener("resize", updateForViewport, { passive: true });
    return () => window.removeEventListener("resize", updateForViewport);
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (e.button !== undefined && e.button !== 0) return;
      const el = containerRef.current;
      if (!el || typeof window === "undefined") return;

      const rect = el.getBoundingClientRect();
      const btnSize = rect.width || (window.innerWidth >= 768 ? 64 : 58);
      const currentX = position ? position.x : rect.left;
      const currentY = position ? position.y : rect.top;

      dragStateRef.current = {
        pointerId: e.pointerId,
        startClientX: e.clientX,
        startClientY: e.clientY,
        originX: currentX,
        originY: currentY,
        btnSize,
        moved: false,
      };

      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // Ignore in synthetic test environments
      }
    },
    [position]
  );

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (state.pointerId !== e.pointerId || typeof window === "undefined") return;

    const dx = e.clientX - state.startClientX;
    const dy = e.clientY - state.startClientY;
    const dist = Math.hypot(dx, dy);

    if (!state.moved && dist > DRAG_THRESHOLD_PX) {
      state.moved = true;
      setIsDragging(true);
    }

    if (state.moved) {
      const nextRawX = state.originX + dx;
      const nextRawY = state.originY + dy;
      const { clamped, snapped } = computeAssistiveSnapPosition(
        nextRawX,
        nextRawY,
        window.innerWidth,
        window.innerHeight,
        state.btnSize
      );
      setPosition({
        x: clamped.x,
        y: clamped.y,
        dockSide: snapped.dockSide,
      });
    }
  }, []);

  const suppressClickUntilRef = useRef<number>(0);

  const finishPointerInteraction = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (state.pointerId !== e.pointerId) return;

    const el = containerRef.current;
    if (el) {
      try {
        if (el.hasPointerCapture?.(e.pointerId)) {
          el.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Ignore
      }
    }

    const wasMoved = state.moved;
    state.moved = false;
    state.pointerId = null;

    if (wasMoved && typeof window !== "undefined") {
      suppressClickUntilRef.current = performance.now() + 90;
      const dx = e.clientX - state.startClientX;
      const dy = e.clientY - state.startClientY;
      const { snapped } = computeAssistiveSnapPosition(
        state.originX + dx,
        state.originY + dy,
        window.innerWidth,
        window.innerHeight,
        state.btnSize
      );
      setIsDragging(false);
      setPosition(snapped);
    } else {
      setIsDragging(false);
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    if (typeof performance !== "undefined" && performance.now() < suppressClickUntilRef.current) {
      return;
    }
    onClick();
  }, [onClick]);

  const arcadeAssistiveIcon = (
    <span className={styles.assistiveOrb} aria-hidden="true">
      <span className={styles.assistiveOuterRing} />
      <span className={styles.assistiveInnerCore}>
        <svg
          className={styles.gamepadSvg}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="6" width="20" height="12" rx="6" />
          <path d="M6 12h4" />
          <path d="M8 10v4" />
          <circle cx="15" cy="11" r="1" fill="currentColor" />
          <circle cx="17.5" cy="13" r="1" fill="currentColor" />
        </svg>
      </span>
    </span>
  );

  const inlineStyle = position
    ? {
        left: 0,
        top: 0,
        right: "auto",
        bottom: "auto",
        transform: `translate3d(${Math.round(position.x)}px, ${Math.round(position.y)}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={styles.fabContainer}
      style={inlineStyle}
      data-theme="dark"
      data-pl-ignore="true"
      data-dragging={isDragging ? "true" : "false"}
      data-dock-side={position?.dockSide ?? "right"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerInteraction}
      onPointerCancel={finishPointerInteraction}
    >
      <GlisseButton
        type="button"
        className={styles.assistiveBtn}
        icon={arcadeAssistiveIcon}
        onClick={handleButtonClick}
        aria-label="Play Arcade · 5 Games"
        data-testid="mobile-arcade-fab"
      />
    </div>
  );
}
