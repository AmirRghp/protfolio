import { type RefObject, useEffect, useState } from "react";

export type Viewport = { vw: number; vh: number };

const INITIAL: Viewport = { vw: 1280, vh: 800 };

export function useViewport(
  containerRef?: RefObject<HTMLElement | null>
): Viewport {
  const [vp, setVp] = useState<Viewport>(() => {
    if (typeof window === "undefined") return INITIAL;
    return {
      vw: window.innerWidth,
      vh: Math.min(window.innerHeight, 840),
    };
  });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = containerRef?.current;
        if (el && el.clientWidth > 0 && el.clientHeight > 0) {
          setVp({ vw: el.clientWidth, vh: el.clientHeight });
        } else {
          setVp({
            vw: window.innerWidth,
            vh: Math.min(window.innerHeight, 840),
          });
        }
      });
    };

    update();
    window.addEventListener("resize", update);

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef?.current) {
      observer = new ResizeObserver(update);
      observer.observe(containerRef.current);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [containerRef]);

  return vp;
}

export function useWindowViewport(): Viewport {
  const [vp, setVp] = useState<Viewport>(() =>
    typeof window === "undefined"
      ? INITIAL
      : { vw: window.innerWidth, vh: window.innerHeight }
  );

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setVp({ vw: window.innerWidth, vh: window.innerHeight });
      });
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return vp;
}
