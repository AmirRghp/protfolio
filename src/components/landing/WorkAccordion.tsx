import { useEffect, useState, type ReactNode } from "react";
import ProjectCarousel, { type CarouselProject } from "./ProjectCarousel";
import styles from "./flatLanding.module.css";

export type BranchData = {
  id: string;
  name: string;
  color: string;
  line: string;
  icon: ReactNode;
  projects: CarouselProject[];
};

export const WORK_BRANCHES: BranchData[] = [
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
      {
        id: "omnidoc-rag",
        title: "OmniDoc RAG",
        brief:
          "An enterprise-grade, bilingual (Persian & English) technical RAG and evaluation engine for DevOps and infrastructure documentation. Features dual-channel hybrid retrieval (dense BGE-M3 + sparse BM25 with RRF and cross-encoder reranking), LangGraph Corrective RAG (CRAG) state machine, Qdrant vector store, local vLLM inference, and automated Ragas evaluation.",
        badge: "Featured",
        tag: "LangGraph · Qdrant · vLLM · Ragas",
        githubUrl: "https://github.com/AmirRghp/omnidoc-rag",
        cta: "View on GitHub",
      },
      {
        id: "enterprise-knowledge-copilot",
        title: "Enterprise Knowledge Copilot",
        brief:
          "A self-hosted assistant that retrieves from authorized documents and answers with source links and verified quotes. It includes manager tools for accounts and documents. Citation checks confirm quote support, not the semantic correctness of every model answer.",
        badge: "Self-Hosted",
        tag: "Document QA · Verified Quotes",
        githubUrl: "https://github.com/AmirRghp/enterprise-knowledge-copilot",
        cta: "View on GitHub",
      },
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
      {
        id: "covid-image-classification",
        title: "COVID-19 Image Classification",
        brief:
          "A deep learning medical imaging pipeline using PyTorch for classifying COVID-19 radiology scans. Features custom dataset loaders, pre-trained CNN architectures (ResNet-50, VGG-19, EfficientNet), and stacking ensemble classification with accuracy/loss tracking and confusion matrix evaluations.",
        badge: "PyTorch",
        tag: "ResNet · EfficientNet · Radiology",
        githubUrl: "https://github.com/AmirRghp/COVID-Image-Classification-with-PyTorch",
        cta: "View on GitHub",
      },
      {
        id: "omnidoc-vision",
        title: "OmniDoc-Vision",
        brief:
          "A production-grade, bilingual (Persian & English) Multimodal Document Intelligence and Adaptive Visual RAG platform engineered to extract, index, and reason over complex technical PDFs with multi-header tables, architecture diagrams, and throughput charts under a 16GB VRAM budget.",
        badge: "Multimodal",
        tag: "Visual RAG · Complex PDF Parsing",
        githubUrl: "https://github.com/AmirRghp/omnidoc_vision",
        cta: "View on GitHub",
      },
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
      {
        id: "omniops-sre-agent",
        title: "OmniOps SRE Agent",
        brief:
          "An autonomous incident response and Site Reliability Engineering platform built on FastMCP (Model Context Protocol) and LangGraph. Features autonomous alert triage, telemetry log correlation, runbook consultation, and deterministic remediation tools guarded by human-in-the-loop safety approvals.",
        badge: "FastMCP",
        tag: "LangGraph · SRE · HITL Safety",
        githubUrl: "https://github.com/AmirRghp/omniops-sre-agent",
        cta: "View on GitHub",
      },
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
      {
        id: "laya-finetuning-pipeline",
        title: "Laya Fine-tuning Pipeline",
        brief:
          "A reproducible pipeline for preparing Persian RAG data and fine-tuning and evaluating the Laya Multilingual decision model. It uses Laya's training API; saved run timings are historical estimates, not a current benchmark.",
        badge: "Fine-Tuning",
        tag: "Persian RAG · Model Evaluation",
        githubUrl: "https://github.com/AmirRghp/laya-finetune",
        cta: "View on GitHub",
      },
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
                <span className={styles.ldColChip}>{branch.icon}</span>
                <h3>{branch.name}</h3>
                <p>{branch.line}</p>
                <span className={styles.ldColCount}>{branch.projects.length} projects</span>
                <button
                  className={styles.ldColClose}
                  type="button"
                  onClick={() => setOpenIndex(-1)}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                  Close
                </button>
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
