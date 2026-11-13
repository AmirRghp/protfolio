"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { createContext, useCallback, useContext, useId, useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithoutRef, SVGProps } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import type { Variants } from "motion/react";
import { motionTokens } from "./motion-tokens";
import styles from "./tabs.module.css";

function NavArrowLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function NavArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

type RootProps = ComponentPropsWithoutRef<typeof TabsPrimitive.Root>;

const TabsContext = createContext<{
  active: string;
  layoutId: string;
  direction: number;
}>({
  active: "",
  layoutId: "tabs",
  direction: 1,
});

export function Tabs({ value, defaultValue, onValueChange, className, ...props }: RootProps) {
  const [internal, setInternal] = useState(defaultValue ?? "");
  const [direction, setDirection] = useState(1);
  const active = value ?? internal;
  const layoutId = useId();
  const root = useRef<HTMLDivElement>(null);

  function handleChange(next: string) {
    const frame = root.current;
    const order = frame
      ? Array.from(frame.querySelectorAll<HTMLElement>('[role="tab"][data-value]'))
          .filter((tab) => tab.closest(`.${styles.root}`) === frame)
          .map((tab) => tab.dataset.value)
      : [];
    const from = order.indexOf(active);
    const to = order.indexOf(next);
    if (from >= 0 && to >= 0 && from !== to) {
      setDirection(to > from ? 1 : -1);
    }
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ active, layoutId, direction }}>
      <LayoutGroup id={layoutId}>
        <TabsPrimitive.Root
          {...props}
          ref={root}
          className={[styles.root, className].filter(Boolean).join(" ")}
          value={active}
          onValueChange={handleChange}
        />
      </LayoutGroup>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const { active } = useContext(TabsContext);
  const reduced = useReducedMotion();
  const shell = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ overflow: false, left: false, right: false });
  const [indicator, setIndicator] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);

  const update = useCallback(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    const content = list.current;
    if (!frame || !scroll) return;
    const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
    const next = {
      overflow: scroll.scrollWidth > frame.clientWidth + 1,
      left: scroll.scrollLeft > 1,
      right: scroll.scrollLeft < max - 1,
    };
    setEdges((prev) =>
      prev.overflow === next.overflow && prev.left === next.left && prev.right === next.right ? prev : next
    );

    if (content) {
      const tab = content.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (tab) {
        setIndicator({
          left: tab.offsetLeft,
          width: tab.offsetWidth,
          top: tab.offsetTop,
          height: tab.offsetHeight,
        });
      }
    }
  }, []);

  const reveal = useCallback(
    (tab: HTMLElement | null) => {
      const scroll = viewport.current;
      if (!scroll || !tab) return;
      const frame = scroll.getBoundingClientRect();
      const item = tab.getBoundingClientRect();
      const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth);
      const left = frame.left + (scroll.scrollLeft > 1 ? 34 : 0);
      const right = frame.right - (scroll.scrollLeft < max - 1 ? 34 : 0);
      const delta = item.left < left ? item.left - left : item.right > right ? item.right - right : 0;
      if (delta) scroll.scrollBy({ left: delta, behavior: reduced ? "instant" : "smooth" });
    },
    [reduced]
  );

  useLayoutEffect(() => {
    const frame = shell.current;
    const scroll = viewport.current;
    const content = list.current;
    if (!frame || !scroll || !content) return;
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    observer.observe(scroll);
    observer.observe(content);
    scroll.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      scroll.removeEventListener("scroll", update);
    };
  }, [update]);

  useLayoutEffect(() => {
    const content = list.current;
    if (!content) return;
    const tab = content.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
    if (tab) {
      setIndicator({
        left: tab.offsetLeft,
        width: tab.offsetWidth,
        top: tab.offsetTop,
        height: tab.offsetHeight,
      });
      reveal(tab);
    }
  }, [active, reveal]);

  const scrollTabs = (dir: number) => {
    viewport.current?.scrollBy({
      left: dir * (viewport.current?.clientWidth ?? 0) * 0.75,
      behavior: reduced ? "instant" : "smooth",
    });
  };

  return (
    <div
      ref={shell}
      className={styles.listShell}
      data-overflow={edges.overflow}
      data-left={edges.left}
      data-right={edges.right}
    >
      {edges.overflow && (
        <button
          type="button"
          className={`${styles.scrollButton} ${styles.scrollLeft}`}
          aria-label="Scroll tabs left"
          disabled={!edges.left}
          onClick={() => scrollTabs(-1)}
        >
          <NavArrowLeft width={17} height={17} aria-hidden="true" />
        </button>
      )}
      <div
        ref={viewport}
        className={styles.viewport}
        onFocusCapture={(event) => {
          if (event.target instanceof HTMLElement && event.target.getAttribute("role") === "tab") {
            reveal(event.target);
          }
        }}
      >
        <TabsPrimitive.List {...props} ref={list} className={[styles.list, className].filter(Boolean).join(" ")}>
          {indicator && (
            <motion.span
              className={styles.selection}
              initial={false}
              animate={{
                x: indicator.left,
                width: indicator.width,
                top: indicator.top,
                height: indicator.height,
              }}
              transition={reduced ? { duration: 0 } : motionTokens.spring.morph}
              aria-hidden="true"
            />
          )}
          {children}
        </TabsPrimitive.List>
      </div>
      {edges.overflow && (
        <button
          type="button"
          className={`${styles.scrollButton} ${styles.scrollRight}`}
          aria-label="Scroll tabs right"
          disabled={!edges.right}
          onClick={() => scrollTabs(1)}
        >
          <NavArrowRight width={17} height={17} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function TabsTrigger({ className, children, value, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      {...props}
      value={value}
      data-value={value}
      className={[styles.trigger, className].filter(Boolean).join(" ")}
    >
      <span className={styles.triggerLabel}>{children}</span>
    </TabsPrimitive.Trigger>
  );
}

const panelMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 8 }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      opacity: { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] },
      x: motionTokens.spring.smooth,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -6,
    transition: { duration: motionTokens.duration.instant, ease: [...motionTokens.ease.standard] },
  }),
};

const panelFade: Variants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: motionTokens.duration.instant } },
  exit: { opacity: 0, x: 0, transition: { duration: 0.1 } },
};

export function TabsContent({ className, value, forceMount, children, ...props }: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  const { active, direction } = useContext(TabsContext);
  const reduced = useReducedMotion();
  const selected = active === value;
  const classes = [styles.content, className].filter(Boolean).join(" ");

  if (forceMount) {
    return (
      <TabsPrimitive.Content {...props} value={value} forceMount className={classes}>
        {children}
      </TabsPrimitive.Content>
    );
  }

  if (!selected) {
    return null;
  }

  return (
    <TabsPrimitive.Content {...props} key={value} value={value} forceMount asChild>
      <motion.div
        className={classes}
        custom={direction}
        variants={reduced ? panelFade : panelMotion}
        initial="enter"
        animate="center"
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}
