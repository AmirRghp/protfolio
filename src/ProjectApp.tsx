import { useEffect, useRef, useState, type ReactNode } from "react";
import { projectTarget, type PortfolioContent } from "./content";
import styles from "./ProjectApp.module.css";

type Project = PortfolioContent["projects"][number];

/** How long the embedded page may take before the window reports that it cannot be shown. */
const EMBED_TIMEOUT_MS = 6000;

type EmbedState = "preview" | "loading" | "loaded" | "failed";

/** The address without its scheme, as a browser shows it. */
function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "");
}

function LockIcon() {
  return (
    <svg className={styles.lock} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="5.5" y="10.5" width="13" height="9" rx="2" fill="currentColor" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function ChatGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M27 15.5A9.5 9.5 0 0 1 17.5 25c-1.6 0-3.1-.4-4.4-1.1L7 26l1.6-5.2A9.5 9.5 0 1 1 27 15.5Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M12 13.5h8M12 17.5h5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function LayersGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4 27 10l-11 6-11-6 11-6Z" fill="currentColor" opacity="0.95" />
      <path d="m6 15 10 5.5L26 15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m6 21 10 5.5L26 21" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RadarGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 16 23 9" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.4" fill="currentColor" />
      <path d="M16 6a10 10 0 0 1 8.5 4.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** The project app of the monitor desktop: the address of the project and a summary of it. */
export default function ProjectApp({ project, icon }: { project: Project; icon: ReactNode }) {
  const target = projectTarget(project);
  const isGitHub = /^https?:\/\/(www\.)?github\.com/i.test(target);
  const [embedState, setEmbedState] = useState<EmbedState>("preview");
  const timeout = useRef<number | null>(null);

  useEffect(() => () => {
    if (timeout.current !== null) window.clearTimeout(timeout.current);
  }, []);

  const startEmbed = () => {
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    setEmbedState("loading");
    timeout.current = window.setTimeout(() => setEmbedState("failed"), EMBED_TIMEOUT_MS);
  };

  const embedLoaded = () => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
    setEmbedState("loaded");
  };

  return (
    <div className={styles.app}>
      <div className={styles.addressBar}>
        <LockIcon />
        <span className={styles.address}>{displayUrl(target)}</span>
        <a className={styles.openLink} href={target} target="_blank" rel="noopener noreferrer">
          Open in new tab
        </a>
      </div>

      {(embedState === "loading" || embedState === "loaded") && (
        <div className={styles.embed}>
          <iframe
            className={styles.frame}
            src={target}
            title={`${project.title} preview`}
            onLoad={embedLoaded}
            sandbox="allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer"
          />
          <p className={styles.embedHint}>
            Some sites refuse to be shown inside a window. Use “Open in new tab” if the page stays empty.
          </p>
        </div>
      )}

      {embedState === "failed" && (
        <div className={styles.error} role="status">
          <p className={styles.errorTitle}>This site cannot be displayed inside the window.</p>
          <p className={styles.errorText}>
            The address may block embedded pages or may still be loading. Open it directly instead.
          </p>
          <div className={styles.errorActions}>
            <a className={styles.primaryLink} href={target} target="_blank" rel="noopener noreferrer">
              Open the site directly
            </a>
            <button type="button" className={styles.secondaryButton} onClick={startEmbed}>Try again</button>
          </div>
        </div>
      )}

      {embedState === "preview" && (
        <div className={styles.preview}>
          <span className={styles.appIcon} aria-hidden="true">{icon}</span>
          <div className={styles.summary}>
            <h2 className={styles.title}>{project.title}</h2>
            <p className={styles.brief}>{project.brief}</p>
          </div>
          {isGitHub && (
            <p className={styles.embedNotice}>
              GitHub repositories block inline embedded viewing via security policies. We recommend opening directly in a new tab.
            </p>
          )}
          {project.highlights && (
            <ul className={styles.chips}>
              {project.highlights.map((highlight) => <li key={highlight} className={styles.chip}>{highlight}</li>)}
            </ul>
          )}
          <div className={styles.actions}>
            <a className={styles.primaryLink} href={target} target="_blank" rel="noopener noreferrer">
              {project.websiteUrl ? "Open project website" : "Open GitHub repository"}
            </a>
            <button type="button" className={styles.secondaryButton} onClick={startEmbed}>
              Load inside this window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
