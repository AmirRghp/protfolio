import { useEffect, useState, type ReactNode } from "react";
import { portfolioContent } from "@/data/content";
import ProjectCarousel, { type CarouselProject } from "./ProjectCarousel";
import styles from "./flatLanding.module.css";

type BranchData = {
  id: string;
  name: string;
  color: string;
  line: string;
  icon: ReactNode;
  projects: CarouselProject[];
};

function buildCarouselProject(
  id: string,
  badge: string,
  tag: string,
): CarouselProject {
  const found = portfolioContent.projects.find((p) => p.id === id);
  if (!found) {
    throw new Error(`Unknown project id in WorkAccordion: ${id}`);
  }
  return {
    id: found.id,
    title: found.title,
    brief: found.brief,
    badge,
    tag,
    githubUrl: found.githubUrl,
    cta: "View on GitHub",
  };
}

const WORK_BRANCHES: BranchData[] = [
  {
    id: "applied-ai-rag",
    name: "Applied AI & RAG",
    color: "#3b82f6",
    line: "Enterprise hybrid RAG engines, CRAG state machines, and verified citation QA assistants.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
      </svg>
    ),
    projects: [
      buildCarouselProject("omnidoc-rag", "Featured", "LangGraph · Qdrant · vLLM · Ragas"),
      buildCarouselProject("enterprise-knowledge-copilot", "Self-Hosted", "Document QA · Verified Quotes"),
    ],
  },
  {
    id: "computer-vision",
    name: "Computer Vision",
    color: "#10b981",
    line: "Deep learning radiology diagnostics and multimodal visual document intelligence.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    projects: [
      buildCarouselProject("covid-image-classification", "PyTorch", "ResNet · EfficientNet · Radiology"),
      buildCarouselProject("omnidoc-vision", "Multimodal", "Visual RAG · Complex PDF Parsing"),
    ],
  },
  {
    id: "autonomous-agents",
    name: "Autonomous Agents",
    color: "#8b5cf6",
    line: "FastMCP and LangGraph powered agents for telemetry, triage, and site reliability.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
      </svg>
    ),
    projects: [
      buildCarouselProject("omniops-sre-agent", "FastMCP", "LangGraph · SRE · HITL Safety"),
    ],
  },
  {
    id: "pipelines-fine-tuning",
    name: "Pipelines & Fine-tuning",
    color: "#f59e0b",
    line: "End-to-end multilingual fine-tuning pipelines and reproducible training evaluations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 2 10 5-10 5L2 7l10-5Z" />
        <path d="m2 17 10 5 10-5" />
        <path d="m2 12 10 5 10-5" />
      </svg>
    ),
    projects: [
      buildCarouselProject("laya-finetuning-pipeline", "Fine-Tuning", "Persian RAG · Model Evaluation"),
    ],
  },
];

export default function WorkAccordion() {
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggleBranch = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  useEffect(() => {
    if (openIndex < 0) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setOpenIndex(-1);
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [openIndex]);

  const hasOpen = openIndex >= 0;

  return (
    <div className={`${styles.ldCols} ${hasOpen ? styles.hasOpen : ""}`}>
      {WORK_BRANCHES.map((branch, i) => {
        const isOpen = openIndex === i;

        return (
          <div
            key={branch.id}
            className={`${styles.ldCol} ${isOpen ? styles.open : ""}`}
            style={{ "--c": branch.color } as React.CSSProperties}
          >
            <button
              className={styles.ldColHit}
              type="button"
              aria-expanded={isOpen}
              aria-label={`${branch.name}, ${branch.projects.length} projects`}
              onClick={() => toggleBranch(i)}
            >
              <span className={styles.ldColMedia}>
                <span className={styles.tex} style={{ "--paint": branch.color } as React.CSSProperties} />
              </span>
              <span className={styles.ldColCloth}>
                <i>{branch.icon}</i>
              </span>
              <span className={styles.ldColText}>
                <b>{branch.name}</b>
                <span>{branch.projects.length} projects</span>
              </span>
            </button>

            <div className={styles.ldColBody}>
              <div className={styles.ldColInfo}>
                <div className={styles.ldColHead}>
                  <div className={styles.ldColTitleGroup}>
                    <span className={styles.ldColChip}>{branch.icon}</span>
                    <div className={styles.ldColTitleTexts}>
                      <h3>{branch.name}</h3>
                      <span className={styles.ldColCount}>{branch.projects.length} projects</span>
                    </div>
                  </div>
                  <button
                    className={styles.ldColClose}
                    type="button"
                    onClick={() => setOpenIndex(-1)}
                    aria-label={`Close ${branch.name}`}
                    title="Close"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
                <p className={styles.ldColLine}>{branch.line}</p>
              </div>
              <div className={styles.ldColCar}>
                <ProjectCarousel projects={branch.projects} color={branch.color} autoFocus={isOpen} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
