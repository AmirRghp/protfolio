import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useResponsiveDevice } from "@/core/utils/responsive";
import {
  captionFor,
  type DomeProject,
  formatMeta,
  getDomeLayout,
  isOffscreen,
  itemIndexAt,
  poseTransform,
  sampleSurface,
  shadeFor,
  type TilePose,
  wrapCentered,
  writePose,
} from "./dome";
import styles from "./DomeGallery.module.css";
import { type CellSlot, DomeTile } from "./dome-tile";
import { MobileWorkGrid } from "./mobile-work-grid";
import { type ActiveDetail, ProjectModal } from "./project-modal";
import { type DragStepArgs, useInfiniteDrag } from "./use-infinite-drag";
import { usePointerFocus } from "./use-pointer-focus";
import { useViewport, useWindowViewport } from "./use-viewport";

type DomeGalleryProps = {
  projects: DomeProject[];
};

type TileRecord = {
  el: HTMLButtonElement;
  img: HTMLImageElement;
  shade: HTMLDivElement;
  caption: HTMLDivElement;
  titleEl: HTMLElement;
  metaEl: HTMLElement;
  stackEl: HTMLDivElement | null;
  projectIdx: number;
  hidden: boolean;
  pose: TilePose;
};

const NEUTRAL_TILE_POSE: TilePose = {
  tx: 0,
  ty: 0,
  tz: 0,
  rotX: 0,
  rotY: 0,
  scale: 1,
  normR: 0,
};

export function DomeGallery({ projects }: DomeGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<Map<string, TileRecord>>(new Map());
  const scrollRef = useRef({ x: 0, y: 0 });
  const lastTouchTapRef = useRef<{ key: string; at: number } | null>(null);

  const device = useResponsiveDevice();
  const isMobileGrid = device.isMobile;

  const stageViewport = useViewport(stageRef);
  const windowViewport = useWindowViewport();
  const layout = useMemo(
    () => getDomeLayout(stageViewport.vw, stageViewport.vh),
    [stageViewport.vw, stageViewport.vh]
  );

  const [active, setActive] = useState<ActiveDetail | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const hasInteractedRef = useRef(false);

  const slots = useMemo<CellSlot[]>(() => {
    const out: CellSlot[] = [];
    const halfC = Math.floor(layout.cols / 2);
    const halfR = Math.floor(layout.rows / 2);
    for (let r = -halfR; r < -halfR + layout.rows; r++) {
      for (let c = -halfC; c < -halfC + layout.cols; c++) {
        out.push({ col: c, row: r, key: `${c}:${r}` });
      }
    }
    return out;
  }, [layout.cols, layout.rows]);

  const slotMap = useMemo(() => {
    const map = new Map<string, CellSlot>();
    for (const slot of slots) {
      map.set(slot.key, slot);
    }
    return map;
  }, [slots]);

  const resolveSlotProjectIndex = useCallback(
    (slot: CellSlot, scrollX: number, scrollY: number) => {
      const { strideX, strideY, spanX, spanY } = layout;
      const baseX = slot.col * strideX + scrollX;
      const baseY = slot.row * strideY + scrollY;
      const wx = wrapCentered(baseX, spanX);
      const wy = wrapCentered(baseY, spanY);
      const wrapShiftC = Math.round((wx - baseX) / strideX);
      const wrapShiftR = Math.round((wy - baseY) / strideY);
      const virtualCol = slot.col - wrapShiftC;
      const virtualRow = slot.row - wrapShiftR;
      return {
        wx,
        wy,
        pIdx: itemIndexAt(virtualCol, virtualRow, projects.length),
      };
    },
    [layout, projects.length]
  );

  const applyStep = useCallback(
    ({ x, y, focusX, focusY, focusStrength }: DragStepArgs) => {
      scrollRef.current.x = x;
      scrollRef.current.y = y;

      if (!hasInteractedRef.current && Math.hypot(x, y) > 24) {
        hasInteractedRef.current = true;
        setHasInteracted(true);
      }

      const count = projects.length;
      if (count === 0) return;

      const records = tilesRef.current;

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const rec = records.get(slot.key);
        if (!rec) continue;

        const { wx, wy, pIdx } = resolveSlotProjectIndex(slot, x, y);

        if (rec.projectIdx !== pIdx) {
          const proj = projects[pIdx];
          rec.projectIdx = pIdx;
          rec.img.src = proj.image;
          rec.img.alt = proj.alt;
          rec.titleEl.textContent = proj.title;
          rec.metaEl.textContent = formatMeta(proj);
          rec.el.dataset.projectId = proj.id;
          rec.el.setAttribute(
            "aria-label",
            `${proj.title} — ${proj.category} (${proj.year})`
          );
          if (rec.stackEl) {
            const chips = proj.techStack.slice(0, 3);
            rec.stackEl.innerHTML = chips
              .map(
                (t) =>
                  `<span class="${styles.tileStackChip}">${t}</span>`
              )
              .join("");
          }
        }

        const p = rec.pose;
        writePose(p, wx, wy, layout, focusX, focusY, focusStrength);

        if (isOffscreen(p, layout, stageViewport.vw, stageViewport.vh)) {
          if (!rec.hidden || rec.el.style.visibility !== "hidden") {
            rec.el.style.visibility = "hidden";
            rec.hidden = true;
          }
          continue;
        }
        if (rec.hidden || rec.el.style.visibility === "hidden") {
          rec.el.style.visibility = "visible";
          rec.hidden = false;
        }

        rec.el.style.transform = poseTransform(p);
        rec.shade.style.opacity = shadeFor(p.normR).toFixed(3);
        rec.caption.style.opacity = captionFor(p.normR).toFixed(3);
      }
    },
    [
      layout,
      projects,
      resolveSlotProjectIndex,
      slots,
      stageViewport.vw,
      stageViewport.vh,
    ]
  );

  const wakeBridgeRef = useRef<() => void>(() => {});
  const wakeBridge = useCallback(() => wakeBridgeRef.current(), []);
  const focusRef = usePointerFocus(stageRef, layout, wakeBridge);

  const openDomeSlot = useCallback(
    (slot: CellSlot, el: HTMLButtonElement) => {
      const { wx, wy, pIdx } = resolveSlotProjectIndex(
        slot,
        scrollRef.current.x,
        scrollRef.current.y
      );
      const project = projects[pIdx];
      if (!project) return;

      const fc = focusRef.current.current;
      const pose = sampleSurface(
        wx,
        wy,
        layout,
        fc ? fc.x : null,
        fc ? fc.y : null,
        focusRef.current.strength
      );

      setActive({
        project,
        index: pIdx,
        slotKey: slot.key,
        pose,
        sourceEl: el,
      });
    },
    [focusRef, layout, projects, resolveSlotProjectIndex]
  );

  const handleTouchTap = useCallback(
    (target: EventTarget | null) => {
      if (isMobileGrid || active !== null) return;
      const btn = (target as HTMLElement | null)?.closest(
        "button[data-slot]"
      ) as HTMLButtonElement | null;
      if (!btn || btn.style.visibility === "hidden") return;
      const slotKey = btn.dataset.slot;
      if (!slotKey) return;
      const slot = slotMap.get(slotKey);
      if (!slot) return;

      lastTouchTapRef.current = { key: slotKey, at: performance.now() };
      openDomeSlot(slot, btn);
    },
    [active, isMobileGrid, openDomeSlot, slotMap]
  );

  const { dragMovedRef, wake, nudge } = useInfiniteDrag({
    stageRef,
    focusRef,
    paused: active !== null,
    enabled: !isMobileGrid,
    onStep: applyStep,
    onTouchTap: handleTouchTap,
  });

  useEffect(() => {
    wakeBridgeRef.current = wake;
  }, [wake]);

  useEffect(() => {
    if (isMobileGrid) return;
    const fc = focusRef.current.current;
    applyStep({
      x: scrollRef.current.x,
      y: scrollRef.current.y,
      vx: 0,
      vy: 0,
      focusX: fc ? fc.x : null,
      focusY: fc ? fc.y : null,
      focusStrength: focusRef.current.strength,
    });
  }, [applyStep, focusRef, isMobileGrid]);

  const registerTile = useCallback(
    (slotKey: string, el: HTMLButtonElement | null) => {
      if (!el) {
        tilesRef.current.delete(slotKey);
        return;
      }
      const img = el.querySelector("img")!;
      const shade = el.querySelector("[data-shade]") as HTMLDivElement;
      const caption = el.querySelector("[data-title]")!
        .parentElement as HTMLDivElement;
      const titleEl = el.querySelector("[data-title]") as HTMLElement;
      const metaEl = el.querySelector("[data-meta]") as HTMLElement;
      const stackEl = el.querySelector("[data-stack]") as HTMLDivElement | null;
      el.style.visibility = "hidden";
      tilesRef.current.set(slotKey, {
        el,
        img,
        shade,
        caption,
        titleEl,
        metaEl,
        stackEl,
        projectIdx: -1,
        hidden: true,
        pose: { ...NEUTRAL_TILE_POSE },
      });
      wakeBridgeRef.current();
    },
    []
  );

  const handleTileClick = useCallback(
    (slot: CellSlot, el: HTMLButtonElement) => {
      const recentTouch = lastTouchTapRef.current;
      if (
        recentTouch &&
        recentTouch.key === slot.key &&
        performance.now() - recentTouch.at < 450
      ) {
        lastTouchTapRef.current = null;
        return;
      }
      if (dragMovedRef.current) return;
      openDomeSlot(slot, el);
    },
    [dragMovedRef, openDomeSlot]
  );

  const handleMobileSelect = useCallback(
    (
      project: DomeProject,
      index: number,
      mediaEl: HTMLElement,
      buttonEl: HTMLButtonElement
    ) => {
      setActive({
        project,
        index,
        slotKey: `mobile:${project.id}`,
        pose: NEUTRAL_TILE_POSE,
        sourceEl: mediaEl,
        focusReturnEl: buttonEl,
      });
    },
    []
  );

  const handleClose = useCallback(() => {
    setActive(null);
  }, []);

  const hintLabel = device.isTouch
    ? "Swipe horizontally or use arrows · Tap any card for details"
    : "Drag to explore · Click any project card for stack & details";

  return (
    <>
      <h2 className={styles.srOnly} data-pl-ignore="true">
        Selected Work
      </h2>

      <ul
        className={styles.srOnly}
        data-pl-ignore="true"
        aria-label="Selected work project index"
      >
        {projects.map((proj) => (
          <li key={proj.id}>
            <h3>{proj.title}</h3>
            <p>{proj.description}</p>
            <p>Tech Stack: {proj.techStack.join(", ")}</p>
            <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer">
              View {proj.title} on GitHub
            </a>
          </li>
        ))}
      </ul>

      {isMobileGrid ? (
        <MobileWorkGrid
          projects={projects}
          activeProjectId={active?.project.id ?? null}
          onSelectProject={handleMobileSelect}
        />
      ) : (
        <div
          ref={stageRef}
          tabIndex={0}
          role="region"
          aria-label="Selected work infinite dome gallery — drag or use arrow keys to explore"
          className={styles.domeStage}
          style={{ perspective: `${layout.perspective}px` }}
        >
          <div
            className={`${styles.stageHeaderBadge} ${
              active ? styles.stageFooterHidden : ""
            }`}
          >
            <div
              className={styles.hintPill}
              data-pl-text="Selected Work"
              data-pl-label="TAG // WORK"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                className={styles.badgeStarIcon}
              >
                <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
              </svg>
              <span>Selected Work</span>
            </div>
          </div>

          <div ref={worldRef} className={styles.domeWorld}>
            {slots.map((slot) => {
              const initialIdx = itemIndexAt(
                slot.col,
                slot.row,
                projects.length
              );
              const initialProject = projects[initialIdx];
              const isHidden = active?.slotKey === slot.key;

              return (
                <DomeTile
                  key={slot.key}
                  slot={slot}
                  layout={layout}
                  initialProject={initialProject}
                  isHidden={isHidden}
                  registerTile={registerTile}
                  onSelect={handleTileClick}
                />
              );
            })}
          </div>

          <div aria-hidden="true" className={styles.domeVignette} />

          <div
            className={`${styles.stageFooter} ${
              active ? styles.stageFooterHidden : ""
            }`}
          >
            <div
              aria-hidden="true"
              className={styles.hintPill}
              data-pl-text={hintLabel}
              data-pl-label="HINT // DOME"
              style={{ opacity: hasInteracted ? 0.65 : 1 }}
            >
              <span className={styles.hintDot} />
              <span>{hintLabel}</span>
            </div>

            <div
              data-dome-control="true"
              className={styles.nudgeGroup}
              role="group"
              aria-label="Pan dome grid"
            >
              <button
                type="button"
                className={styles.nudgeBtn}
                aria-label="Pan dome left"
                onClick={() => nudge(240, 0)}
              >
                ←
              </button>
              <button
                type="button"
                className={styles.nudgeBtn}
                aria-label="Pan dome up"
                onClick={() => nudge(0, 200)}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.nudgeBtn}
                aria-label="Pan dome down"
                onClick={() => nudge(0, -200)}
              >
                ↓
              </button>
              <button
                type="button"
                className={styles.nudgeBtn}
                aria-label="Pan dome right"
                onClick={() => nudge(-240, 0)}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectModal
        active={active}
        total={projects.length}
        perspective={layout.perspective}
        viewport={windowViewport}
        onRequestClose={handleClose}
      />
    </>
  );
}
