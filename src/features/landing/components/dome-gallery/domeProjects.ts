import { getAssetUrl } from "@/core/utils/assetUrl";
import { portfolioContent } from "@/data/content";
import type { DomeProject } from "./dome";

interface ProjectEnrichment {
  category: string;
  year: string;
  imagePath: string;
  alt: string;
  architecture: string;
  techStack: string[];
  highlights: string[];
}

const PROJECT_ENRICHMENT: Record<string, ProjectEnrichment> = {
  "covid-image-classification": {
    category: "Computer Vision",
    year: "2025",
    imagePath: "assets/projects/covid-image-classification.webp",
    alt: "Three minimalist translucent smoked-glass diagnostic plates in isometric alignment intersected by a thin ice-cyan laser line",
    architecture:
      "Multi-backbone convolutional ensemble combining ResNet-50, VGG-19, and EfficientNet feature extractors with meta-learner stacking for clinical radiography triage.",
    techStack: [
      "PyTorch",
      "ResNet-50",
      "VGG-19",
      "EfficientNet",
      "OpenCV",
      "Scikit-Learn",
      "Ensemble Stacking",
      "CUDA",
    ],
    highlights: [
      "End-to-end preprocessing, lung-field normalization, and stratified augmentation pipeline for chest X-ray datasets.",
      "Stacked generalization meta-classifier reducing single-backbone variance across multi-class thoracic findings.",
      "Class-wise sensitivity/specificity diagnostics and confusion-matrix calibration for imbalanced medical cohorts.",
    ],
  },
  "omnidoc-rag": {
    category: "Applied AI & RAG",
    year: "2026",
    imagePath: "assets/projects/omnidoc-rag.webp",
    alt: "Minimalist frosted optical glass cube-prism suspended between two matte-graphite slabs refracting a thin beam of cool cyan light",
    architecture:
      "Production hybrid Retrieval-Augmented Generation architecture pairing dense BGE-M3 embeddings with sparse BM25 lexical search, Reciprocal Rank Fusion (RRF), and self-correcting LangGraph state machines.",
    techStack: [
      "Python",
      "LangGraph",
      "Qdrant",
      "BGE-M3",
      "BM25 + RRF",
      "vLLM",
      "Ragas",
      "FastAPI",
    ],
    highlights: [
      "Hybrid Qdrant vector + lexical retrieval fused via Reciprocal Rank Fusion (RRF) for high-recall technical lookup.",
      "Agentic LangGraph verification loop that grades retrieved context relevance and rewrites ambiguous queries automatically.",
      "Automated Ragas evaluation harness benchmarking faithfulness, answer relevancy, and context precision.",
    ],
  },
  "omnidoc-vision": {
    category: "Multimodal AI",
    year: "2026",
    imagePath: "assets/projects/omnidoc-vision.webp",
    alt: "Sleek matte-black titanium aperture ring hovering above two minimalist frosted smoked-glass document planes",
    architecture:
      "Adaptive visual RAG system integrating Vision-Language Models (VLMs) with layout-aware PDF parsing to reason directly over complex tables, engineering schematics, and multi-column figures.",
    techStack: [
      "PyTorch",
      "Vision-Language Models",
      "Adaptive Visual RAG",
      "Qdrant",
      "PDF Layout Parsing",
      "FastAPI",
      "Multimodal Embeddings",
    ],
    highlights: [
      "Preserves spatial table hierarchies, mathematical notation, and multi-column diagrams lost by plain-text OCR.",
      "Dynamic routing between text-chunk retrieval and high-resolution page-patch VLM inspection.",
      "Grounded visual citations pinpointing exact document pages and bounding regions.",
    ],
  },
  "omniops-sre-agent": {
    category: "Autonomous Agents",
    year: "2026",
    imagePath: "assets/projects/omniops-sre-agent.webp",
    alt: "Matte-obsidian sphere nested inside a precision-machined dark gunmetal ring with a single thin cyan-teal luminous rim arc",
    architecture:
      "Autonomous Site Reliability Engineering (SRE) agent built on FastMCP (Model Context Protocol) and LangGraph for multi-signal telemetry correlation, root-cause hypothesis generation, and human-in-the-loop remediation.",
    techStack: [
      "FastMCP (MCP)",
      "LangGraph",
      "Python",
      "Telemetry Correlation",
      "Human-in-the-Loop",
      "Asyncio",
      "Docker",
    ],
    highlights: [
      "Standardized Model Context Protocol (MCP) tool servers exposing live metrics, log streams, and runbook actions.",
      "Stateful LangGraph incident triage graph correlating latency spikes, error budgets, and deployment events.",
      "Strict human-in-the-loop approval gates before executing mutating infrastructure remediation commands.",
    ],
  },
  "enterprise-knowledge-copilot": {
    category: "Enterprise AI",
    year: "2025",
    imagePath: "assets/projects/enterprise-knowledge-copilot.webp",
    alt: "Three minimalist vertical slabs of dark smoked optical glass in stepped formation with a subtle cool-white edge refraction",
    architecture:
      "Multi-tenant enterprise document intelligence platform featuring format-aware ingestion, role-based access control (RBAC), and strict inline citation verification.",
    techStack: [
      "Python",
      "FastAPI",
      "RAG",
      "Citation Verification",
      "PostgreSQL",
      "Vector Search",
      "RBAC Security",
      "Docker",
    ],
    highlights: [
      "Granular document ingestion pipeline supporting heterogeneous enterprise corpora with metadata-scoped retrieval.",
      "Inline claim-to-source verification preventing ungrounded synthesis in compliance-sensitive workflows.",
      "Modular FastAPI service boundary with structured audit logging and workspace isolation.",
    ],
  },
  "laya-finetuning-pipeline": {
    category: "LLM Fine-Tuning",
    year: "2025",
    imagePath: "assets/projects/laya-finetuning-pipeline.webp",
    alt: "Minimalist 3x3 isometric grid of matte-charcoal precision cubes with a single translucent violet optical glass cube at the center",
    architecture:
      "End-to-end parameter-efficient fine-tuning (LoRA / PEFT) pipeline for adapting large language models to Persian domain corpora and conversational instruction datasets.",
    techStack: [
      "Python",
      "PyTorch",
      "Hugging Face Transformers",
      "LoRA / PEFT",
      "Persian NLP",
      "Laya Training API",
      "Dataset Curation",
    ],
    highlights: [
      "Automated Persian text normalization, deduplication, and instruction-formatting pipeline for domain adaptation.",
      "Memory-efficient LoRA adapter training configuration with checkpoint resumption and loss telemetry.",
      "Held-out bilingual evaluation suite measuring instruction adherence and domain terminology accuracy.",
    ],
  },
  "video-kyc": {
    category: "Computer Vision",
    year: "2026",
    imagePath: "assets/projects/video-kyc.webp",
    alt: "Matte-black optical verification aperture ring hovering over a translucent smoked-glass plate pierced by a horizontal ice-cyan laser beam",
    architecture:
      "Three-service Dockerized verification architecture pairing a browser WebSocket client and Nginx proxy on an edge network with a FastAPI session orchestrator and an isolated MediaPipe + DeepFace inference container over an internal bridge.",
    techStack: [
      "Python",
      "FastAPI",
      "MediaPipe",
      "DeepFace (VGG-Face)",
      "OpenCV",
      "WebSockets",
      "Nginx",
      "Docker Compose",
    ],
    highlights: [
      "Stage 1 eye-aspect-ratio (EAR) liveness verification detecting 3 natural blinks via MediaPipe facial landmarks.",
      "Stage 2 randomized smile and head-turn pose challenges with 3-second hold windows and 10-second timeouts.",
      "Stage 3 VGG-Face embedding verification comparing live captured frames against the uploaded government ID photo.",
    ],
  },
  "kanban-studio": {
    category: "Full-Stack AI",
    year: "2026",
    imagePath: "assets/projects/kanban-studio.webp",
    alt: "Isometric arrangement of three matte-charcoal and smoked-glass Kanban columns beside a translucent sky-blue edge prism",
    architecture:
      "Single-container full-stack workspace combining a Next.js App Router and dnd-kit client with a Python 3.13 FastAPI backend, SQLite persistence, signed session auth, and server-proxied OpenRouter AI board assistance.",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "dnd-kit",
      "FastAPI",
      "SQLite",
      "Tailwind CSS",
      "Docker",
    ],
    highlights: [
      "Five-column drag-and-drop task workflow with multi-board isolation per user, inline card editing, and PBKDF2-SHA256 auth.",
      "Integrated AI Assistant sidebar executing board mutations server-side with OpenRouter credentials isolated from the browser.",
      "Revision-based If-Match optimistic concurrency control rejecting stale concurrent or AI edits with HTTP 409 conflict checks.",
    ],
  },
};

export const DOME_PROJECTS: DomeProject[] = portfolioContent.projects.map(
  (proj) => {
    const enrichment = PROJECT_ENRICHMENT[proj.id];
    return {
      id: proj.id,
      title: proj.title,
      category: enrichment?.category ?? "AI Engineering",
      year: enrichment?.year ?? "2025",
      image: getAssetUrl(
        enrichment?.imagePath ?? "assets/projects/omnidoc-rag.webp"
      ),
      alt: enrichment?.alt ?? `${proj.title} architectural visualization`,
      description: proj.brief,
      architecture: enrichment?.architecture ?? proj.brief,
      techStack: enrichment?.techStack ?? ["Python", "PyTorch", "FastAPI"],
      highlights: enrichment?.highlights ?? [proj.brief],
      githubUrl: proj.githubUrl,
    };
  }
);
