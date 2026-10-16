import { useEffect, useRef } from "react";
import type { PortfolioContent } from "./content";
import styles from "./ProjectBoard.module.css";

type Project = PortfolioContent["projects"][number];

export default function ProjectBoard({ projects, selectedProjectId, onSelectProject, onClose }: {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousSelection = useRef<string | null>(null);
  const selectedProject = projects.find(({ id }) => id === selectedProjectId);

  useEffect(() => {
    const panel = dialog.current!;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    panel.showModal();
    heading.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      panel.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (selectedProject) {
      heading.current?.focus();
    } else if (previousSelection.current) {
      [...(dialog.current?.querySelectorAll<HTMLButtonElement>("[data-project-id]") ?? [])]
        .find((button) => button.dataset.projectId === previousSelection.current)?.focus();
    }
    previousSelection.current = selectedProject?.id ?? null;
  }, [selectedProject]);

  return (
    <dialog ref={dialog} className={styles.panel} aria-labelledby="project-board-title"
      onCancel={(event) => {
        event.preventDefault();
        if (selectedProject) onSelectProject(null);
        else onClose();
      }}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === heading.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}>
      <header className={styles.header}>
        <h2 id="project-board-title">Project board</h2>
        <button type="button" onClick={onClose}>Close board · Back to room</button>
      </header>
      {selectedProject ? (
        <section className={styles.detail} aria-labelledby="project-detail-title">
          <button type="button" onClick={() => onSelectProject(null)}>Back to project list</button>
          <h3 id="project-detail-title" ref={heading} tabIndex={-1}>{selectedProject.title}</h3>
          <p>{selectedProject.brief}</p>
          <a href={selectedProject.githubUrl}>View on GitHub</a>
        </section>
      ) : projects.length ? (
        <section className={styles.list} aria-labelledby="project-list-title">
          <h3 id="project-list-title" ref={heading} tabIndex={-1}>Selected projects</h3>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <button type="button" data-project-id={project.id} aria-label={`Open ${project.title}`} onClick={() => onSelectProject(project.id)}>
                  {project.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className={styles.empty} aria-labelledby="project-list-title">
          <h3 id="project-list-title" ref={heading} tabIndex={-1}>Selected projects</h3>
          <p>No projects published yet.</p>
        </section>
      )}
    </dialog>
  );
}
