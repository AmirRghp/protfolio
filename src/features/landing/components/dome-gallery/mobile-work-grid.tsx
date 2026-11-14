import { formatMeta, type DomeProject } from "./dome";
import styles from "./DomeGallery.module.css";

type MobileWorkGridProps = {
  projects: DomeProject[];
  activeProjectId: string | null;
  onSelectProject: (
    project: DomeProject,
    index: number,
    mediaEl: HTMLElement,
    buttonEl: HTMLButtonElement
  ) => void;
};

export function MobileWorkGrid({
  projects,
  activeProjectId,
  onSelectProject,
}: MobileWorkGridProps) {
  return (
    <div
      className={styles.mobileWorkSection}
      role="region"
      aria-label="Selected work project gallery"
    >
      <div className={styles.mobileWorkKicker}>
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
        </svg>
        <span>Selected Work</span>
      </div>

      <div className={styles.mobileWorkGrid}>
        {projects.map((project, index) => {
          const isHidden = activeProjectId === project.id;

          return (
            <button
              key={project.id}
              type="button"
              data-project-id={project.id}
              aria-label={`${project.title} — ${project.category} (${project.year})`}
              className={styles.mobileWorkCard}
              style={{
                opacity: isHidden ? 0 : 1,
                pointerEvents: isHidden ? "none" : undefined,
              }}
              onClick={(e) => {
                const btn = e.currentTarget;
                const frame =
                  (btn.querySelector("[data-mobile-frame]") as HTMLElement | null) ??
                  btn;
                onSelectProject(project, index, frame, btn);
              }}
            >
              <div data-mobile-frame className={styles.mobileTileFrame}>
                <img
                  src={project.image}
                  alt={project.alt}
                  draggable={false}
                  decoding="async"
                  className={styles.tileImage}
                />

                <div className={styles.mobileCardCaption}>
                  <span className={styles.mobileCardTitle}>{project.title}</span>
                  <span className={styles.captionMeta}>{formatMeta(project)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
