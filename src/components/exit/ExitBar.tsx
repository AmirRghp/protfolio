import { useEffect, useRef, useState } from "react";
import { TactileButton } from "tactile-glass-ui";
import styles from "./exitBar.module.css";

const STRIP = 30; // height of the side strips
const PAD = 9; // white around the button
const SVG_H = 110; // room for the pill to lift

export type ExitBarProps = {
  onExit: () => void;
  visible?: boolean;
};

export default function ExitBar({ onExit, visible = true }: ExitBarProps) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  const [btnSize, setBtnSize] = useState({ w: 200, h: 56 });
  const [lift, setLift] = useState(0);
  const [goal, setGoal] = useState(0);

  const physicsRef = useRef({
    lift: 0,
    vel: 0,
    goal: 0,
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
    physicsRef.current.goal = goal;
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
  }, [goal]);

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

  return (
    <div
      id="exitbar"
      className={`${styles.exitbar} ${visible ? styles.on : ""}`}
      aria-label="Exit bar"
    >
      <svg
        className={styles.ebShape}
        viewBox={`0 0 ${W} ${B}`}
        aria-hidden="true"
      >
        <path d={pathD} />
      </svg>
      <div
        ref={ctaRef}
        className={styles.ebCta}
        style={{ transform: `translate(-50%, ${(-lift).toFixed(2)}px)` }}
      >
        <TactileButton
          onClick={onExit}
          onPointerEnter={() => setGoal(6)}
          onPointerLeave={() => setGoal(0)}
          onPointerDown={() => setGoal(-2)}
          onPointerUp={() => setGoal(6)}
        >
          Exit The Room
        </TactileButton>
      </div>
    </div>
  );
}
