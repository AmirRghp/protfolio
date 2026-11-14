import { type RefObject } from "react";
import type { DetailLayout } from "./detail-layout";
import { formatMeta, type DomeProject } from "./dome";
import styles from "./DomeGallery.module.css";

type ProjectModalContentProps = {
  project: DomeProject;
  index: number;
  total: number;
  detail: DetailLayout;
  mediaRef: RefObject<HTMLDivElement | null>;
  copyRef: RefObject<HTMLDivElement | null>;
  closeBtnRef: RefObject<HTMLButtonElement | null>;
  mobileOverlayRef?: RefObject<HTMLDivElement | null>;
  showMobileOverlay?: boolean;
  onClose: () => void;
};

export function ProjectModalContent({
  project,
  index,
  total,
  detail,
  mediaRef,
  copyRef,
  closeBtnRef,
  mobileOverlayRef,
  showMobileOverlay = false,
  onClose,
}: ProjectModalContentProps) {
  const indexLabel = `${String(index + 1).padStart(2, "0")} / ${String(
    total
  ).padStart(2, "0")}`;

  const isMobileLayout = detail.direction === "column";

  const copyWidth = isMobileLayout
    ? detail.panelW
    : detail.panelW - detail.mediaW;
  const copyHeight = isMobileLayout
    ? detail.panelH - detail.mediaH
    : detail.panelH;

  const closeIcon = (
    <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 2L10 10M10 2L2 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <>
      <div
        ref={mediaRef}
        className={styles.modalMedia}
        style={{ width: detail.mediaW, height: detail.mediaH }}
      >
        <img
          src={project.image}
          alt={project.alt}
          draggable={false}
          className={styles.modalMediaImg}
        />
        <div className={styles.modalMediaOverlay} />
        {showMobileOverlay && (
          <div
            ref={mobileOverlayRef}
            aria-hidden="true"
            className={styles.mobileCardCaption}
          >
            <span className={styles.mobileCardTitle}>{project.title}</span>
            <span className={styles.captionMeta}>{formatMeta(project)}</span>
          </div>
        )}
        {isMobileLayout && (
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className={`${styles.modalCloseBtn} ${styles.modalMediaCloseBtn}`}
          >
            {closeIcon}
          </button>
        )}
      </div>

      <div
        ref={copyRef}
        className={styles.modalCopy}
        style={{
          width: copyWidth,
          height: copyHeight,
          padding: detail.copyPadding,
        }}
      >
        <div className={styles.modalHeaderRow}>
          <div className={styles.modalIndexMeta}>
            <span>{indexLabel}</span>
            <span>·</span>
            <span className={styles.modalCategoryBadge}>{project.category}</span>
          </div>
          {!isMobileLayout && (
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className={styles.modalCloseBtn}
            >
              {closeIcon}
            </button>
          )}
        </div>

        <div className={styles.modalBody} style={{ gap: detail.copyGap }}>
          <div>
            <h3 id="dome-project-modal-title" className={styles.modalTitle}>
              {project.title}
            </h3>
          </div>

          <p className={styles.modalDescription}>{project.description}</p>

          <p className={styles.modalArchitecture}>{project.architecture}</p>

          <div>
            <h4 className={styles.modalSectionLabel}>Technology Stack</h4>
            <div className={styles.modalStackList} aria-label="Project tech stack">
              {project.techStack.map((tech) => (
                <span key={tech} className={styles.modalStackBadge}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className={styles.modalSectionLabel}>Key Highlights</h4>
            <ul className={styles.modalHighlights}>
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.modalFooterRow}>
          <div className={styles.modalYearMeta}>
            <span>Released</span>
            <span>·</span>
            <span>{project.year}</span>
          </div>

          <div className={styles.modalActions}>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.modalGithubBtn}
            >
              <span>View on GitHub</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
