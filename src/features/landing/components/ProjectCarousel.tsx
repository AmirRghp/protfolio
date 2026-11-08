import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from "react";
import styles from "./ProjectCarousel.module.css";

export type CarouselProject = {
  id: string;
  title: string;
  brief: string;
  githubUrl: string;
  badge?: string;
  tag?: string;
  cta?: string;
};

export type ProjectCarouselProps = {
  projects: CarouselProject[];
  color: string;
  autoFocus?: boolean;
};

export default function ProjectCarousel({ projects, color, autoFocus = false }: ProjectCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const [target, setTarget] = useState(0);
  const n = projects.length;

  useEffect(() => {
    if (autoFocus && containerRef.current) {
      containerRef.current.focus();
    }
  }, [autoFocus]);

  const animRef = useRef({
    pos: 0,
    target: 0,
    last: 0,
    raf: 0,
    drag: null as { y: number; pos: number; v: number; t: number; ly: number } | null,
    moved: false,
    wheelTimer: 0,
  });

  const spacing = 320;

  useEffect(() => {
    animRef.current.target = target;
    const a = animRef.current;
    if (a.raf) return;

    let active = true;
    const tick = (now: number) => {
      if (!active) return;
      const dt = Math.min(0.05, a.last ? (now - a.last) / 1000 : 0.016);
      a.last = now;

      if (!a.drag) {
        a.pos += (a.target - a.pos) * (1 - Math.exp(-12 * dt));
      }
      setPos(a.pos);

      if (a.drag || Math.abs(a.target - a.pos) > 0.001) {
        a.raf = requestAnimationFrame(tick);
      } else {
        a.pos = a.target;
        setPos(a.target);
        a.raf = 0;
        a.last = 0;
      }
    };

    a.raf = requestAnimationFrame(tick);

    return () => {
      active = false;
      if (a.raf) cancelAnimationFrame(a.raf);
      a.raf = 0;
    };
  }, [target]);

  const goTo = (i: number) => {
    const clamped = Math.max(0, Math.min(n - 1, Math.round(i)));
    setTarget(clamped);
  };

  const handleWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const a = animRef.current;
    if (a.drag) return;

    const px = e.deltaY;
    const over = Math.max(0, -a.target, a.target - (n - 1));
    const nextTarget = Math.max(-0.45, Math.min(n - 0.55, a.target + px / spacing / (1 + over * 8)));
    a.target = nextTarget;
    setTarget(nextTarget);

    window.clearTimeout(a.wheelTimer);
    a.wheelTimer = window.setTimeout(() => {
      const rounded = Math.round(a.target);
      goTo(rounded);
    }, 120);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const a = animRef.current;
    a.drag = { y: e.clientY, pos: a.pos, v: 0, t: performance.now(), ly: e.clientY };
    a.moved = false;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const a = animRef.current;
    if (!a.drag) return;
    const dy = e.clientY - a.drag.y;
    if (Math.abs(dy) > 5) a.moved = true;
    const now = performance.now();
    a.drag.v = (e.clientY - a.drag.ly) / Math.max(1, now - a.drag.t);
    a.drag.t = now;
    a.drag.ly = e.clientY;
    a.pos = Math.max(-0.4, Math.min(n - 0.6, a.drag.pos - dy / spacing));
    setPos(a.pos);
  };

  const handlePointerUp = () => {
    const a = animRef.current;
    if (!a.drag) return;
    const flick = Math.abs(a.drag.v) > 0.25 ? Math.sign(a.drag.v) * -0.6 : 0;
    const to = Math.max(0, Math.min(n - 1, Math.round(a.pos + flick)));
    a.drag = null;
    goTo(to);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      goTo(target + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goTo(target - 1);
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.wc}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Project carousel"
    >
      <div className={`${styles.wcPb} ${styles.wcPbTop}`} aria-hidden="true" />
      <div className={styles.wcTrack}>
        {projects.map((project, i) => {
          const d = i - pos;
          const ad = Math.abs(d);
          const y = Math.sign(d) * (Math.min(ad, 1) + Math.max(0, ad - 1) * 0.42) * spacing;
          const s = 1 - Math.min(ad, 3) * 0.075;
          const opacity = Math.max(0, Math.min(1, 1 - (ad - 1.1) * 0.85));
          const zIndex = 100 - Math.round(ad * 10);
          const filter = ad < 0.04 ? "none" : `blur(${Math.min(8, ad * 4.2).toFixed(1)}px)`;
          const visibility = ad > 2.2 ? "hidden" : "visible";
          const isCurrent = ad < 0.45;

          return (
            <div
              key={project.id}
              className={`${styles.wcSlot} ${isCurrent ? styles.on : ""}`}
              style={{
                transform: `translate3d(0, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`,
                opacity: opacity.toFixed(3),
                zIndex,
                filter,
                visibility,
              }}
            >
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.wcCard}
                onClick={(e) => {
                  if (!isCurrent) {
                    e.preventDefault();
                    goTo(i);
                  }
                }}
              >
                <div
                  className={styles.wcMedia}
                  style={{ "--paint": color } as CSSProperties}
                >
                  <div className={styles.tex} />
                  <div className={styles.texNoise} />
                  <div className={styles.wcMediaIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </div>
                </div>
                <div className={styles.wcBody}>
                  <div className={styles.wcTop}>
                    <b>{project.title}</b>
                    {project.badge && <em>{project.badge}</em>}
                  </div>
                  {project.tag && <span className={styles.wcTag}>{project.tag}</span>}
                  <p>{project.brief}</p>
                  <span className={styles.wcCta}>
                    {project.cta || "View on GitHub"}
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5.5 4.5h6v6M11.5 4.5 4.5 11.5" />
                    </svg>
                  </span>
                </div>
              </a>
            </div>
          );
        })}
      </div>
      <div className={`${styles.wcPb} ${styles.wcPbBottom}`} aria-hidden="true" />
    </div>
  );
}
