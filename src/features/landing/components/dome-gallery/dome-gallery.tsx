import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

export function DomeGallery({ projects }: DomeGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<Map<string, TileRecord>>(new Map());
  const scrollRef = useRef({ x: 0, y: 0 });

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

  const { dragMovedRef, wake, nudge } = useInfiniteDrag({
    stageRef,
    focusRef,
    paused: active !== null,
    onStep: applyStep,
  });

  useEffect(() => {
    wakeBridgeRef.current = wake;
  }, [wake]);

  useEffect(() => {
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
  }, [applyStep, focusRef]);

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
      el.style.visibility = "visible";
      tilesRef.current.set(slotKey, {
        el,
        img,
        shade,
        caption,
        titleEl,
        metaEl,
        stackEl,
        projectIdx: -1,
        hidden: false,
        pose: {
          tx: 0,
          ty: 0,
          tz: 0,
          rotX: 0,
          rotY: 0,
          scale: 1,
          normR: 0,
        },
      });
    },
    []
  );

  const handleTileClick = useCallback(
    (slot: CellSlot, el: HTMLButtonElement) => {
      if (dragMovedRef.current) return;
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
    [dragMovedRef, focusRef, layout, projects, resolveSlotProjectIndex]
  );

  const handleClose = useCallback(() => {
    setActive(null);
  }, []);

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="region"
      aria-label="Selected work infinite dome gallery — drag or use arrow keys to explore"
      className={styles.domeStage}
      style={{ perspective: `${layout.perspective}px` }}
    >
      <h2 className={styles.srOnly}>Selected Work</h2>

      <div
        className={`${styles.stageHeaderBadge} ${
          active ? styles.stageFooterHidden : ""
        }`}
      >
        <div className={styles.hintPill}>
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

      <ul className={styles.srOnly} aria-label="Selected work project index">
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

      <div ref={worldRef} className={styles.domeWorld}>
        {slots.map((slot) => {
          const initialIdx = itemIndexAt(slot.col, slot.row, projects.length);
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
          style={{ opacity: hasInteracted ? 0.65 : 1 }}
        >
          <span className={styles.hintDot} />
          <span>Drag to explore · Click any project card for stack & details</span>
        </div>

        <div className={styles.nudgeGroup} role="group" aria-label="Pan dome grid">
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

      <ProjectModal
        active={active}
        total={projects.length}
        perspective={layout.perspective}
        viewport={windowViewport}
        onRequestClose={handleClose}
      />
    </div>
  );
}
