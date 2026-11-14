import { useEffect, useRef, useState, type ReactNode } from "react";
import { projectTarget, type PortfolioContent } from "@/data/content";
import {
  buildGitHubRepoSrcDoc,
  fetchGitHubRepoSnapshot,
  getInitialRepoSnapshot,
  renderMarkdownToHtml,
  renderRepoFilesHtml,
} from "@/data/githubRepoPreview";
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

export function ScanGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M6 11V7a1 1 0 0 1 1-1h4M21 6h4a1 1 0 0 1 1 1v4M26 21v4a1 1 0 0 1-1 1h-4M11 26H7a1 1 0 0 1-1-1v-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M16 8v3.5M16 20.5V24M8 16h3.5M20.5 16H24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RagGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M7 5.5h11l7 7V25a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 25V7A1.5 1.5 0 0 1 7 5.5Z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M18 5.5V13h7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9.5 13.5h5M9.5 17.5h5M9.5 21.5h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21" cy="21" r="4" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="m24 24 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function VisionGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="5" y="6" width="22" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M7 16c2.5-4.5 5.5-7 9-7s6.5 2.5 9 7c-2.5 4.5-5.5 7-9 7s-6.5-2.5-9-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}

export function AgentGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="5.5" y="7.5" width="21" height="16" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M16 3.5v4M13.5 3.5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="m10 13 3 2.5-3 2.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 18h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M11.5 27.5h9M16 23.5v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

export function KycGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="4.5" y="6.5" width="23" height="19" rx="3" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <circle cx="13" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 21.5c1-2.5 2.7-3.5 4.5-3.5s3.5 1 4.5 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12.5h4.5M20 16.5h4.5M20 20.5h3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function KanbanGlyph() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="4.5" y="5.5" width="23" height="21" rx="3" fill="none" stroke="currentColor" strokeWidth="2.1" />
      <rect x="7.5" y="9" width="4.5" height="12" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="13.75" y="9" width="4.5" height="8.5" rx="1" fill="currentColor" opacity="0.72" />
      <rect x="20" y="9" width="4.5" height="14" rx="1" fill="currentColor" opacity="0.9" />
    </svg>
  );
}

/** The project app of the monitor desktop: the address of the project and an in-window browser view. */
export default function ProjectApp({ project, icon }: { project: Project; icon: ReactNode }) {
  const target = projectTarget(project);
  const isGitHub = /^https?:\/\/(www\.)?github\.com/i.test(target);
  const [embedState, setEmbedState] = useState<EmbedState>("preview");
  const timeout = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  const repoSrcDoc = isGitHub ? buildGitHubRepoSrcDoc(project, getInitialRepoSnapshot(project)) : undefined;

  const clearPending = () => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (abortRef.current !== null) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  useEffect(() => () => {
    clearPending();
  }, []);

  const embedLoaded = () => {
    if (timeout.current !== null) {
      window.clearTimeout(timeout.current);
      timeout.current = null;
    }
    setEmbedState("loaded");
  };

  const embedFailed = () => {
    clearPending();
    setEmbedState("failed");
  };

  const showPreview = () => {
    clearPending();
    setEmbedState("preview");
  };

  const startEmbed = () => {
    clearPending();
    setEmbedState("loading");
    timeout.current = window.setTimeout(() => embedFailed(), EMBED_TIMEOUT_MS);

    if (isGitHub) {
      const controller = new AbortController();
      abortRef.current = controller;

      // Verify repository reachability so blocked network routes report an error while normal browsers load the repo view.
      fetch(target, { mode: "no-cors", signal: controller.signal })
        .then(() => {
          if (!controller.signal.aborted) {
            embedLoaded();
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            embedFailed();
          }
        });

      // Enrich the in-frame GitHub view with live repository metadata and README content when online.
      fetchGitHubRepoSnapshot(project, controller.signal)
        .then((snapshot) => {
          if (controller.signal.aborted || snapshot.source !== "live") return;
          frameRef.current?.contentWindow?.postMessage(
            {
              type: "gh-repo-update",
              readmeHtml: renderMarkdownToHtml(snapshot.readmeMarkdown, project.githubUrl, snapshot.branch),
              filesHtml: renderRepoFilesHtml(snapshot, project.githubUrl),
              fileCount: snapshot.files.length,
              branch: snapshot.branch,
              language: snapshot.language,
            },
            "*",
          );
        })
        .catch(() => {
          // Bundled snapshot is already rendered in the iframe
        });
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.addressBar}>
        <LockIcon />
        <span className={styles.address}>{displayUrl(target)}</span>
        {embedState !== "preview" && (
          <button type="button" className={styles.barButton} onClick={showPreview}>
            Summary
          </button>
        )}
        <a className={styles.openLink} href={target} target="_blank" rel="noopener noreferrer">
          Open in new tab
        </a>
      </div>

      {(embedState === "loading" || embedState === "loaded") && (
        <div className={styles.embed}>
          {embedState === "loading" && (
            <p className={styles.loadingBanner} role="status">
              Loading preview…
            </p>
          )}
          <iframe
            ref={frameRef}
            className={styles.frame}
            src={isGitHub ? undefined : target}
            srcDoc={isGitHub ? repoSrcDoc : undefined}
            title={`${project.title} preview`}
            onLoad={isGitHub ? undefined : embedLoaded}
            onError={embedFailed}
            sandbox={isGitHub ? "allow-scripts allow-popups" : "allow-scripts allow-same-origin allow-forms allow-popups"}
            referrerPolicy="no-referrer"
          />
          <p className={styles.embedHint}>
            {isGitHub
              ? "Interactive GitHub repository view loaded inside the window. Use “Open in new tab” to visit GitHub directly."
              : "Some sites refuse to be shown inside a window. Use “Open in new tab” if the page stays empty."}
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
              Browse the repository structure and README directly inside this window, or open the full repository on GitHub.
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
