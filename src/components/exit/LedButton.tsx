import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import styles from "./exitBar.module.css";

const NEBULA: [number, number, number][] = [
  [139, 92, 246], // violet
  [236, 72, 153], // pink
  [34, 211, 238], // cyan
  [251, 191, 36], // amber
];

const PITCH = 3;

export type LedButtonProps = {
  label: string;
  size?: "md" | "sm";
  star?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  buttonRef?: RefObject<HTMLButtonElement | null>;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
};

export default function LedButton({
  label,
  size = "md",
  star = true,
  onClick,
  className = "",
  buttonRef: externalButtonRef,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerUp,
}: LedButtonProps) {
  const localButtonRef = useRef<HTMLButtonElement>(null);
  const btnRef = externalButtonRef || localButtonRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHot, setIsHot] = useState(false);
  const stateRef = useRef({
    hover: 0,
    hot: 0,
    flash: 0,
    ph: 0,
    last: 0,
    raf: 0,
  });

  useEffect(() => {
    stateRef.current.ph = Math.random();
  }, []);

  useEffect(() => {
    const btn = btnRef.current;
    const cv = canvasRef.current;
    if (!btn || !cv) return;

    const g = cv.getContext("2d");
    if (!g) return;

    let W = 0;
    let H = 0;
    let dpr = 1;
    let dots: number[] = [];

    const layout = () => {
      const r = btn.getBoundingClientRect();
      W = r.width;
      H = r.height;
      if (!W || !H) return;

      dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);

      let borderRadius = H / 2;
      try {
        const computedRadius = parseFloat(window.getComputedStyle(btn).borderTopLeftRadius);
        if (!Number.isNaN(computedRadius)) {
          borderRadius = Math.min(H / 2, computedRadius);
        }
      } catch {
        // fallback
      }

      const R = borderRadius;
      const cols = Math.ceil(W / PITCH) + 2;
      const rows = Math.ceil(H / PITCH) + 2;
      const x0 = (W - (cols - 1) * PITCH) / 2;
      const y0 = (H - (rows - 1) * PITCH) / 2;

      dots = [];
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = x0 + i * PITCH;
          const y = y0 + j * PITCH;
          const dx = Math.max(R - x, x - (W - R), 0);
          const dy = Math.max(R - y, y - (H - R), 0);
          if (dx * dx + dy * dy > (R + 1.8) * (R + 1.8)) continue;
          const h = ((((i * 73856093) ^ (j * 19349663)) >>> 0) % 1000) / 1000;
          dots.push(x, y, h);
        }
      }
    };

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => layout());
      ro.observe(btn);
    }
    layout();

    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const s = stateRef.current;
    let running = true;

    const draw = (now: number) => {
      if (!running) return;
      const t = now / 1000;
      const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0.016);
      s.last = now;

      if (!W) layout();
      if (W && g) {
        s.hot += (s.hover - s.hot) * (1 - Math.exp(-8 * dt));
        s.flash = Math.max(0, s.flash - dt * 2.2);
        s.ph = (s.ph + dt * (reduced ? 0.12 : 0.36 + 0.34 * s.hot)) % 1;

        const bw = 26 + 10 * s.hot;
        const bx = s.ph < 0.7 ? -bw + (s.ph / 0.7) * (W + 2 * bw) : -1e4;

        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);

        const hz = 0.1 + 0.14 * s.hot;
        const fl = s.flash * s.flash;
        const [A, B, C, D] = NEBULA;

        for (let k = 0; k < dots.length; k += 3) {
          const x = dots[k];
          const y = dots[k + 1];
          const h = dots[k + 2];

          const u = x + (y - H / 2) * 0.55;
          const band = Math.exp(-Math.pow((u - bx) / bw, 2));
          const n1 = 0.5 + 0.5 * Math.sin(x * 0.045 + t * 0.7 + Math.sin(y * 0.15 - t * 0.5) * 1.2);
          const n2 = 0.5 + 0.5 * Math.sin(y * 0.11 - t * 0.9 + x * 0.018);
          const haze = 0.5 + 0.5 * Math.sin(x * 0.03 - t * 1.3 + y * 0.09);
          const tw = 0.5 + 0.5 * Math.sin(t * (3 + h * 5) + h * 40);
          const a = Math.min(1, 0.07 + band * (0.7 + 0.3 * tw) + haze * haze * hz + fl * 0.8);
          if (a < 0.03) continue;

          const wh = Math.min(1, Math.max(0, band - 0.55) * 1.2 + fl * 0.6);
          const r = (A[0] + (B[0] - A[0]) * n1) * (1 - n2) + (C[0] + (D[0] - C[0]) * n1) * n2;
          const gg = (A[1] + (B[1] - A[1]) * n1) * (1 - n2) + (C[1] + (D[1] - C[1]) * n1) * n2;
          const bb = (A[2] + (B[2] - A[2]) * n1) * (1 - n2) + (C[2] + (D[2] - C[2]) * n1) * n2;

          const R = r + (255 - r) * wh;
          const G = gg + (255 - gg) * wh;
          const Bc = bb + (255 - bb) * wh;

          if (a > 0.4) {
            g.fillStyle = `rgba(${R | 0},${G | 0},${Bc | 0},${(a * 0.22).toFixed(3)})`;
            g.fillRect(x - 1.7, y - 1.7, 3.4, 3.4);
          }
          g.fillStyle = `rgba(${R | 0},${G | 0},${Bc | 0},${a.toFixed(3)})`;
          g.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }

      s.raf = requestAnimationFrame(draw);
    };

    s.raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      if (s.raf) cancelAnimationFrame(s.raf);
      if (ro) ro.disconnect();
    };
  }, [btnRef]);

  const handlePointerEnter = () => {
    stateRef.current.hover = 1;
    setIsHot(true);
    onPointerEnter?.();
  };

  const handlePointerLeave = () => {
    stateRef.current.hover = 0;
    setIsHot(false);
    onPointerLeave?.();
  };

  const handlePointerDown = () => {
    onPointerDown?.();
  };

  const handlePointerUp = () => {
    onPointerUp?.();
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    stateRef.current.flash = 1;
    onClick?.(e);
  };

  const isSmall = size === "sm";

  return (
    <span
      className={`${styles.led} ${isSmall ? styles.ledSm : ""} ${isHot ? styles.hot : ""} ${className}`}
    >
      <span className={styles.ledAura} aria-hidden="true" />
      <button
        ref={btnRef as RefObject<HTMLButtonElement>}
        className={styles.ledBtn}
        type="button"
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <canvas ref={canvasRef} aria-hidden="true" />
        <span className={styles.ledLabel}>
          {star && (
            <svg className={styles.ledStar} viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
            </svg>
          )}
          {label}
        </span>
      </button>
    </span>
  );
}
