import { useEffect, useRef, useState } from "react";
import { TactileButton } from "tactile-glass-ui";
import styles from "./exitBar.module.css";

const STRIP = 30; // height of the side strips
const PAD = 9; // white around the button
const SVG_H = 110; // room for the pill to lift
export const EXIT_SHUTTER_DURATION_MS = 680;

export type ExitBarProps = {
  onExit: () => void;
  visible?: boolean;
  isAway?: boolean;
  isReentering?: boolean;
};

export default function ExitBar({
  onExit,
  visible = true,
  isAway = false,
  isReentering = false,
}: ExitBarProps) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const isExitingRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const [isShutting, setIsShutting] = useState(false);
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  const [btnSize, setBtnSize] = useState({ w: 200, h: 56 });
  const [lift, setLift] = useState(() => (isAway || isReentering ? -22 : 0));
  const [goal, setGoal] = useState(() => (isAway || isReentering ? -22 : 0));

  const physicsRef = useRef({
    lift: isAway || isReentering ? -22 : 0,
    vel: 0,
    goal: isAway || isReentering ? -22 : 0,
    last: 0,
    raf: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      const clientWidth = typeof document !== "undefined" && document.documentElement.clientWidth;
      setWidth(clientWidth || window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const updateSize = () => {
      const btn = cta.querySelector("button") || (cta.firstElementChild as HTMLElement);
      if (btn && btn.offsetWidth && btn.offsetHeight) {
        setBtnSize({ w: btn.offsetWidth, h: btn.offsetHeight });
      }
    };
    updateSize();
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(updateSize);
    }
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(updateSize);
      const target = cta.querySelector("button") || cta;
      ro.observe(target);
    }
    return () => ro?.disconnect();
  }, []);

  useEffect(() => {
    const targetGoal = isAway || isReentering || isShutting ? -22 : goal;
    physicsRef.current.goal = targetGoal;
    const p = physicsRef.current;

    if (p.raf) return;

    let active = true;
    const step = (now: number) => {
      if (!active) return;
      const dt = Math.min(0.033, p.last ? (now - p.last) / 1000 : 0.016);
      p.last = now;

      p.vel += ((p.goal - p.lift) * 260 - p.vel * 19) * dt;
      p.lift += p.vel * dt;

      setLift(p.lift);

      if (Math.abs(p.goal - p.lift) > 0.01 || Math.abs(p.vel) > 0.01) {
        p.raf = requestAnimationFrame(step);
      } else {
        p.lift = p.goal;
        p.vel = 0;
        setLift(p.goal);
        p.raf = 0;
        p.last = 0;
      }
    };

    p.raf = requestAnimationFrame(step);

    return () => {
      active = false;
      if (p.raf) cancelAnimationFrame(p.raf);
      p.raf = 0;
    };
  }, [goal, isAway, isReentering, isShutting]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  // Compute SVG fillet path
  const btnWidth = btnSize.w;
  const btnHeight = btnSize.h;
  const W = width;
  const B = SVG_H;
  const w = btnWidth + PAD * 2;
  const h = btnHeight + PAD * 2;
  const R = h / 2;
  const yS = B - STRIP;
  const yc = B - R - lift;
  const cx = W / 2;
  const xl = cx - w / 2 + R;
  const xr = cx + w / 2 - R;
  const f = 15 + Math.max(0, lift) * 2.6;
  const dy = yS - f - yc;
  const dx = Math.sqrt(Math.max(0, Math.pow(R + f, 2) - dy * dy));
  const k = R / (R + f);
  const tlx = xl - dx * k;
  const tly = yc + dy * k;
  const trx = xr + dx * k;
  const n = (v: number) => v.toFixed(2);

  const pathD =
    `M0 ${B}V${yS}H${n(xl - dx)}` +
    `A${n(f)} ${n(f)} 0 0 0 ${n(tlx)} ${n(tly)}` +
    `A${n(R)} ${n(R)} 0 0 1 ${n(xl)} ${n(yc - R)}` +
    `H${n(xr)}` +
    `A${n(R)} ${n(R)} 0 0 1 ${n(trx)} ${n(tly)}` +
    `A${n(f)} ${n(f)} 0 0 0 ${n(xr + dx)} ${yS}` +
    `H${W}V${B}Z`;

  const handleExitClick = () => {
    if (isExitingRef.current || isReentering) return;
    isExitingRef.current = true;
    setGoal(0);

    const reducedMotion =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);

    if (reducedMotion || typeof window === "undefined") {
      onExit();
      isExitingRef.current = false;
      return;
    }

    setIsShutting(true);
    exitTimerRef.current = window.setTimeout(() => {
      onExit();
      window.setTimeout(() => {
        setIsShutting(false);
        isExitingRef.current = false;
      }, 160);
    }, EXIT_SHUTTER_DURATION_MS);
  };

  const effectiveShutting = isShutting && !isReentering;
  const shutterState = effectiveShutting
    ? "closing"
    : isReentering
      ? "opening"
      : isAway
        ? "away"
        : "idle";

  return (
    <div
      id="exitbar"
      className={[
        styles.exitbar,
        visible && !isAway && !isReentering ? styles.on : "",
        effectiveShutting ? styles.shutting : "",
        isAway && !effectiveShutting && !isReentering ? styles.away : "",
        isReentering ? styles.reentering : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-shutter-state={shutterState}
      aria-label="Exit bar"
    >
      <svg
        className={styles.ebShape}
        viewBox={`0 0 ${W} ${B}`}
        aria-hidden="true"
      >
        <path d={pathD} />
      </svg>
      <div className={styles.ebShutter} aria-hidden="true" />
      <div
        ref={ctaRef}
        className={styles.ebCta}
        style={{ transform: `translate(-50%, ${(-lift).toFixed(2)}px)` }}
      >
        <TactileButton
          onClick={handleExitClick}
          onPointerEnter={() => {
            if (!isExitingRef.current && !isAway && !isReentering) setGoal(6);
          }}
          onPointerLeave={() => {
            if (!isExitingRef.current && !isAway && !isReentering) setGoal(0);
          }}
          onPointerDown={() => {
            if (!isExitingRef.current && !isAway && !isReentering) setGoal(-2);
          }}
          onPointerUp={() => {
            if (!isExitingRef.current && !isAway && !isReentering) setGoal(6);
          }}
        >
          Exit The Room
        </TactileButton>
      </div>
    </div>
  );
}
