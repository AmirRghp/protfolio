import { Fragment, useEffect, useState, type RefObject } from "react";
import {
  computeColumnGuides,
  computeLoaderProgress,
  computeScannerLinePercent,
  isBlueprintBoxActive,
  LOADER_HOLD_BEFORE_WIPE_MS,
  LOADER_TEXT_THRESHOLD,
  LOADER_WIPE_DURATION_MS,
  scanBlueprintBoxes,
  type BlueprintBox,
} from "@/features/landing/utils";
import styles from "./portfolioLoader.module.css";

export interface PortfolioLoaderProps {
  duration?: number;
  scopeRef?: RefObject<HTMLElement | null>;
  onDone?: () => void;
}

export function PortfolioLoader({
  duration = 2900,
  scopeRef,
  onDone,
}: PortfolioLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [boxes, setBoxes] = useState<BlueprintBox[]>([]);
  const [stage, setStage] = useState<"active" | "wipe" | "done">("active");

  // Scan live DOM elements inside the landing viewport on mount and on resize
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let hasScanned = false;
    const runScan = (force = false) => {
      if (hasScanned && !force) return;
      const scanned = scanBlueprintBoxes(scopeRef?.current ?? null);
      if (scanned.length > 0) {
        hasScanned = true;
        setBoxes(scanned);
      }
    };

    const initialTimer = window.setTimeout(() => runScan(true), 0);
    const fallbackTimer = window.setTimeout(() => runScan(false), 80);
    const handleResize = () => runScan(true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [scopeRef]);

  // Drive 0..100 ease-in-out progress counter
  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let isDocumentReady = document.readyState === "complete";
    const handleLoad = () => {
      isDocumentReady = true;
    };
    if (!isDocumentReady) {
      window.addEventListener("load", handleLoad, { once: true });
    }

    let rafId = 0;
    const t0 = performance.now();

    const step = (now: number) => {
      if (reducedMotion) {
        setStage("done");
        onDone?.();
        return;
      }
      const elapsed = now - t0;
      const nextProgress = computeLoaderProgress(elapsed, duration, isDocumentReady);
      setProgress((prev) => (nextProgress > prev ? nextProgress : prev));
      if (nextProgress < 100) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("load", handleLoad);
    };
  }, [duration, onDone]);

  // Trigger wipe and completion once progress reaches 100
  useEffect(() => {
    if (progress < 100) return undefined;

    const wipeTimer = window.setTimeout(
      () => setStage("wipe"),
      LOADER_HOLD_BEFORE_WIPE_MS,
    );
    const doneTimer = window.setTimeout(() => {
      setStage("done");
      onDone?.();
    }, LOADER_HOLD_BEFORE_WIPE_MS + LOADER_WIPE_DURATION_MS);

    return () => {
      window.clearTimeout(wipeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [progress, onDone]);

  if (stage === "done") {
    return null;
  }

  const phase =
    stage === "wipe"
      ? "wipe"
      : progress >= LOADER_TEXT_THRESHOLD
        ? "text"
        : "draw";

  const guides = computeColumnGuides(boxes);
  const scannerTopPercent = computeScannerLinePercent(progress);
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const statusPhaseLabel =
    phase === "draw"
      ? "MAPPING DOM"
      : phase === "text"
        ? "LOCKING TYPE"
        : "REVEALING";

  return (
    <div
      className={[
        styles.plRoot,
        "pl-root",
        progress > 2 ? styles.plGuidesOn : "",
        progress > 1 && phase === "draw" ? styles.plScanActive : "",
        phase === "text" || phase === "wipe" ? styles.plText : "",
        phase === "wipe" ? styles.plWipe : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-pl-ignore="true"
      data-pl-phase={phase}
      aria-hidden="true"
    >
      <div className={`${styles.plSheet} pl-sheet`}>
        {/* Downward spatial calibration laser beam */}
        <div
          className={styles.plScanBeam}
          style={{ top: `${scannerTopPercent}%` }}
        />

        {guides && (
          <>
            <div className={styles.plGuideV} style={{ left: guides.l }}>
              <span className={styles.plGuideCoord}>
                X:{Math.round(guides.l)}
              </span>
            </div>
            <div className={styles.plGuideV} style={{ left: guides.r }}>
              <span
                className={`${styles.plGuideCoord} ${styles.plGuideCoordRight}`}
              >
                X:{Math.round(guides.r)}
              </span>
            </div>
          </>
        )}

        <div className={`${styles.plNote} ${styles.plNoteLeft}`}>
          <span className={styles.plPulseDot} />
          <span>
            SYS.CALIBRATE // {String(progress).padStart(3, "0")}% ·{" "}
            {statusPhaseLabel}
          </span>
          <span className={styles.plMiniTrack}>
            <span
              className={styles.plMiniFill}
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </span>
        </div>

        {guides && (
          <div className={`${styles.plNote} ${styles.plNoteRight}`}>
            MATRIX {Math.round(guides.r - guides.l)}PX · {boxes.length} NODES
          </div>
        )}

        {boxes.map((box, index) => {
          const effectiveW = box.boxW || box.w;
          const isActive = isBlueprintBoxActive(
            progress,
            index,
            boxes.length,
            box.y,
            vh,
          );
          const showDim =
            box.kind === "text" &&
            box.w >= 240 &&
            box.h >= 20 &&
            !box.textStyle?.centerVertically;
          const showCoordBadge = effectiveW >= 140 && box.h >= 34;
          const isHeroBanner = box.kind === "media" && effectiveW > 240;
          const svgW = Math.max(Math.round(effectiveW), 100);
          const svgH = Math.max(Math.round(box.h), 100);
          const reticleX = Math.round(svgW * (effectiveW >= 720 ? 0.74 : 0.78));
          const reticleY = Math.round(svgH * (effectiveW >= 720 ? 0.48 : 0.34));
          const outerR = Math.round(Math.min(svgW, svgH) * (effectiveW >= 720 ? 0.13 : 0.1));
          const innerR = Math.round(outerR * 0.5);
          const armLen = Math.round(outerR * 1.45);

          const kindClass =
            box.kind === "media"
              ? styles.media
              : box.kind === "text"
                ? styles.text
                : box.kind === "btn"
                  ? styles.btn
                  : styles.card;

          return (
            <Fragment key={index}>
              <div
                className={[
                  styles.plBox,
                  "pl-box",
                  kindClass,
                  isActive ? styles.on : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  left: box.x,
                  top: box.y,
                  width: effectiveW,
                  height: box.h,
                  borderRadius: box.radius || "3px",
                }}
              >
                <div className={styles.fill} />
                <span className={styles.corners} />

                {isHeroBanner ? (
                  <svg
                    className={styles.diag}
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Rule-of-thirds spatial calibration grid */}
                    <path
                      className={styles.diagGrid}
                      d={`M${Math.round(svgW / 3)} 0 V${svgH} M${Math.round((svgW * 2) / 3)} 0 V${svgH} M0 ${Math.round(svgH / 3)} H${svgW} M0 ${Math.round((svgH * 2) / 3)} H${svgW}`}
                    />
                    {/* Corner vector ticks */}
                    <path
                      className={styles.diagCross}
                      d={`M0 0 L${Math.round(svgW * 0.14)} ${Math.round(svgH * 0.18)} M${svgW} 0 L${Math.round(svgW * 0.86)} ${Math.round(svgH * 0.18)} M0 ${svgH} L${Math.round(svgW * 0.14)} ${Math.round(svgH * 0.82)} M${svgW} ${svgH} L${Math.round(svgW * 0.86)} ${Math.round(svgH * 0.82)}`}
                    />
                    {/* Target reticle crosshair lines */}
                    <path
                      className={styles.diagReticle}
                      d={`M${reticleX - armLen} ${reticleY} H${reticleX + armLen} M${reticleX} ${reticleY - armLen} V${reticleY + armLen}`}
                    />
                    <circle
                      className={styles.diagReticle}
                      cx={reticleX}
                      cy={reticleY}
                      r={outerR}
                    />
                    <circle
                      className={styles.diagReticleInner}
                      cx={reticleX}
                      cy={reticleY}
                      r={innerR}
                    />
                  </svg>
                ) : (
                  box.kind === "media" && (
                    <svg
                      className={styles.diag}
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <path
                        className={styles.diagCross}
                        d="M0 0 L100 100 M100 0 L0 100"
                      />
                    </svg>
                  )
                )}

                <span className={`${styles.plChip} ${styles.lab}`}>
                  {box.label}
                </span>

                {showCoordBadge && (
                  <span className={styles.dimBadge}>
                    {Math.round(effectiveW)}×{Math.round(box.h)}
                  </span>
                )}

                {box.text && box.textStyle && (
                  <div
                    className={[
                      styles.ghost,
                      box.textStyle.centerVertically ? styles.ghostCentered : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    style={{
                      fontFamily: box.textStyle.fontFamily,
                      fontSize: box.textStyle.fontSize,
                      fontWeight: box.textStyle.fontWeight,
                      fontStyle: box.textStyle.fontStyle,
                      lineHeight: box.textStyle.lineHeight,
                      letterSpacing: box.textStyle.letterSpacing,
                      textAlign:
                        box.kind === "btn" || box.textStyle.centerVertically
                          ? "center"
                          : (box.textStyle.textAlign as
                              | "left"
                              | "right"
                              | "center"
                              | "justify"),
                      padding:
                        box.kind === "btn" || !box.pad
                          ? 0
                          : box.textStyle.centerVertically
                            ? `0 ${box.pad.r}px 0 ${box.pad.l}px`
                            : `${box.pad.t}px ${box.pad.r}px 0 ${box.pad.l}px`,
                    }}
                  >
                    {box.text}
                  </div>
                )}
              </div>

              {showDim && (
                <div
                  className={[styles.plDim, isActive ? styles.on : ""]
                    .filter(Boolean)
                    .join(" ")}
                  style={{
                    left: box.x,
                    top: box.y + box.h + 7,
                    width: effectiveW,
                  }}
                >
                  <span className={styles.plChip}>{Math.round(box.w)} PX</span>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
      <div className={`${styles.plEdge} pl-edge`} />
    </div>
  );
}
