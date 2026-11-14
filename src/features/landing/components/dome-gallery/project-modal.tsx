import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CardCaption } from "./card-caption";
import { getDetailLayout } from "./detail-layout";
import type { DomeProject, TilePose } from "./dome";
import styles from "./DomeGallery.module.css";
import { gsap, MORPH_EASE, prefersReducedMotion } from "./motion";
import { ProjectModalContent } from "./project-modal-content";
import { type Viewport } from "./use-viewport";

export type ActiveDetail = {
  project: DomeProject;
  index: number;
  slotKey: string;
  pose: TilePose;
  sourceEl: HTMLElement;
};

type ProjectModalProps = {
  active: ActiveDetail | null;
  total: number;
  perspective: number;
  viewport: Viewport;
  onRequestClose: () => void;
};

const COMPACT_RADIUS = 10;
const EXPANDED_RADIUS = 18;

export function ProjectModal({
  active,
  total,
  perspective,
  viewport,
  onRequestClose,
}: ProjectModalProps) {
  const scrimRef = useRef<HTMLDivElement>(null);
  const morphStageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const detail = getDetailLayout(viewport.vw, viewport.vh);

  const measureSource = useCallback((el: HTMLElement) => {
    const projected = el.getBoundingClientRect();
    return {
      left: projected.left,
      top: projected.top,
      w: projected.width,
      h: projected.height,
    };
  }, []);

  useLayoutEffect(() => {
    if (!active) return;
    const scrim = scrimRef.current;
    const card = cardRef.current;
    const media = mediaRef.current;
    const copy = copyRef.current;
    const caption = captionRef.current;
    if (!scrim || !card || !media || !copy) return;

    closingRef.current = false;
    tlRef.current?.kill();

    const reduced = prefersReducedMotion();
    const d = getDetailLayout(viewport.vw, viewport.vh);
    const src = measureSource(active.sourceEl);
    const { pose } = active;

    if (reduced) {
      gsap.set(scrim, { autoAlpha: 1 });
      gsap.set(card, {
        x: d.panelLeft,
        y: d.panelTop,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        width: d.panelW,
        height: d.panelH,
        borderRadius: EXPANDED_RADIUS,
        overflow: "hidden",
      });
      gsap.set(media, { width: d.mediaW, height: d.mediaH });
      gsap.set(copy, { autoAlpha: 1, x: 0 });
      if (caption) gsap.set(caption, { autoAlpha: 0 });
      closeBtnRef.current?.focus();
      return;
    }

    gsap.set(scrim, { autoAlpha: 0 });
    gsap.set(card, {
      x: src.left,
      y: src.top,
      z: 0,
      rotationX: pose.rotX,
      rotationY: pose.rotY,
      width: src.w,
      height: src.h,
      borderRadius: COMPACT_RADIUS,
      overflow: "visible",
      transformOrigin: "50% 50%",
    });
    gsap.set(media, { width: src.w, height: src.h });
    gsap.set(copy, { autoAlpha: 0, x: 18 });
    if (caption) gsap.set(caption, { autoAlpha: 1, y: 0 });

    const tl = gsap.timeline({
      defaults: { ease: MORPH_EASE },
      onComplete: () => {
        closeBtnRef.current?.focus();
      },
    });
    tlRef.current = tl;

    tl.to(scrim, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0);

    if (caption) {
      tl.to(
        caption,
        { autoAlpha: 0, y: -4, duration: 0.16, ease: "power2.out" },
        0
      );
    }

    tl.set(card, { overflow: "hidden" }, 0.12);

    tl.to(
      card,
      {
        x: d.panelLeft,
        y: d.panelTop,
        rotationX: 0,
        rotationY: 0,
        width: d.panelW,
        height: d.panelH,
        borderRadius: EXPANDED_RADIUS,
        duration: 0.68,
      },
      0
    );

    tl.to(
      media,
      {
        width: d.mediaW,
        height: d.mediaH,
        duration: 0.68,
      },
      0
    );

    tl.to(
      copy,
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.36,
        ease: "power2.out",
      },
      0.32
    );

    return () => {
      tl.kill();
    };
  }, [active, viewport.vw, viewport.vh, measureSource]);

  const animateClose = useCallback(() => {
    if (!active || closingRef.current) return;
    closingRef.current = true;
    tlRef.current?.kill();

    const scrim = scrimRef.current;
    const card = cardRef.current;
    const media = mediaRef.current;
    const copy = copyRef.current;
    const caption = captionRef.current;
    const sourceEl = active.sourceEl;

    const finish = () => {
      onRequestClose();
      sourceEl?.focus?.();
    };

    if (!scrim || !card || !media || !copy || prefersReducedMotion()) {
      finish();
      return;
    }

    const src = measureSource(sourceEl);
    const { pose } = active;

    const tl = gsap.timeline({
      defaults: { ease: MORPH_EASE },
      onComplete: finish,
    });
    tlRef.current = tl;

    tl.to(
      copy,
      { autoAlpha: 0, x: 12, duration: 0.16, ease: "power2.in" },
      0
    );

    tl.to(
      card,
      {
        x: src.left,
        y: src.top,
        rotationX: pose.rotX,
        rotationY: pose.rotY,
        width: src.w,
        height: src.h,
        borderRadius: COMPACT_RADIUS,
        duration: 0.56,
      },
      0.04
    );

    tl.to(
      media,
      {
        width: src.w,
        height: src.h,
        duration: 0.56,
      },
      0.04
    );

    tl.to(scrim, { autoAlpha: 0, duration: 0.38, ease: "power2.inOut" }, 0.1);

    if (caption) {
      tl.set(card, { overflow: "visible" }, 0.38);
      tl.to(
        caption,
        { autoAlpha: 1, y: 0, duration: 0.2, ease: "power2.out" },
        0.4
      );
    }
  }, [active, measureSource, onRequestClose]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        animateClose();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKey, { capture: true });
  }, [active, animateClose]);

  if (!active) return null;

  const { project, index } = active;

  const modalNode = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dome-project-modal-title"
      className={styles.modalRoot}
    >
      <div
        ref={scrimRef}
        onClick={animateClose}
        className={styles.modalScrim}
      />

      <div
        ref={morphStageRef}
        className={styles.modalMorphStage}
        style={{ perspective: `${perspective}px` }}
      >
        <div
          ref={cardRef}
          className={styles.modalCard}
          style={{
            width: detail.panelW,
            height: detail.panelH,
            flexDirection: detail.direction,
            borderRadius: EXPANDED_RADIUS,
          }}
        >
          <ProjectModalContent
            project={project}
            index={index}
            total={total}
            detail={detail}
            mediaRef={mediaRef}
            copyRef={copyRef}
            closeBtnRef={closeBtnRef}
            onClose={animateClose}
          />

          <CardCaption
            id="dome-project-modal-caption"
            captionRef={captionRef}
            project={project}
          />
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined" && document.body) {
    return createPortal(modalNode, document.body);
  }

  return modalNode;
}
