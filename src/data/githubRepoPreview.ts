import type { PortfolioContent } from "./content";

type Project = PortfolioContent["projects"][number];

export interface GitHubFileEntry {
  name: string;
  path: string;
  type: "dir" | "file";
  summary: string;
}

export interface GitHubRepoSnapshot {
  owner: string;
  repo: string;
  branch: string;
  language: string;
  description: string;
  topics: string[];
  stars?: number;
  forks?: number;
  files: GitHubFileEntry[];
  readmeMarkdown: string;
  source: "live" | "cache" | "bundled";
}

const CACHE_PREFIX = "portfolio_gh_repo_preview_v1_";
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 8000;

interface CachedRepoEntry {
  savedAt: number;
  data: GitHubRepoSnapshot;
}

export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = /^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)\/([^/?#]+)/i.exec(url.trim());
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

const BUNDLED_REPOS: Record<string, Omit<GitHubRepoSnapshot, "owner" | "repo" | "source">> = {
  "covid-image-classification": {
    branch: "main",
    language: "Python · PyTorch",
    description:
      "Deep learning medical imaging pipeline using PyTorch for classifying COVID-19 radiology scans with custom dataset loaders and CNN stacking ensembles.",
    topics: ["pytorch", "deep-learning", "medical-imaging", "cnn", "ensemble-learning", "resnet50", "efficientnet"],
    files: [
      { name: "models", path: "models", type: "dir", summary: "Pre-trained CNN backbones (ResNet-50, VGG-19, EfficientNet) & meta-learner" },
      { name: "datasets", path: "datasets", type: "dir", summary: "Custom radiology image dataset loaders and augmentation transforms" },
      { name: "evaluation", path: "evaluation", type: "dir", summary: "Confusion matrix plotting, ROC curves, and classification metrics" },
      { name: "train.py", path: "train.py", type: "file", summary: "Training loop with learning rate scheduling and checkpoint saving" },
      { name: "ensemble.py", path: "ensemble.py", type: "file", summary: "Stacking ensemble combiner over CNN probability outputs" },
      { name: "requirements.txt", path: "requirements.txt", type: "file", summary: "PyTorch, torchvision, scikit-learn, and matplotlib dependencies" },
      { name: "README.md", path: "README.md", type: "file", summary: "Project architecture, dataset pipeline, and training documentation" },
    ],
    readmeMarkdown: `# COVID-19 Image Classification with PyTorch

A deep learning medical imaging pipeline built with **PyTorch** for classifying COVID-19 radiology scans.

## Key Capabilities

- **Custom Dataset Loaders:** End-to-end preprocessing, normalization, and data augmentation for chest radiology images.
- **Pre-Trained CNN Backbones:** Fine-tuned transfer learning pipelines across \`ResNet-50\`, \`VGG-19\`, and \`EfficientNet\` architectures.
- **Stacking Ensemble Classification:** Combines predictions across multiple convolutional backbones to improve generalization stability.
- **Evaluation Suite:** Automated tracking of training/validation loss curves, accuracy metrics, and confusion matrix visualization.

## Repository Structure

\`\`\`text
COVID-Image-Classification-with-PyTorch/
├── datasets/          # Custom PyTorch Dataset & DataLoader pipelines
├── models/            # ResNet-50, VGG-19, EfficientNet & ensemble heads
├── evaluation/        # Confusion matrix & accuracy/loss visualizations
├── train.py           # Main training & validation entrypoint
├── ensemble.py        # Stacking ensemble inference & evaluation
└── requirements.txt   # Python environment dependencies
\`\`\`

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/COVID-Image-Classification-with-PyTorch.git
cd COVID-Image-Classification-with-PyTorch
pip install -r requirements.txt
python train.py --backbone resnet50 --epochs 30
\`\`\``,
  },
  "omnidoc-rag": {
    branch: "main",
    language: "Python · LangGraph",
    description:
      "Enterprise-grade bilingual (Persian & English) technical RAG and evaluation engine for DevOps and infrastructure documentation.",
    topics: ["rag", "langgraph", "qdrant", "bge-m3", "bm25", "vllm", "ragas", "bilingual-nlp"],
    files: [
      { name: "src/retrieval", path: "src/retrieval", type: "dir", summary: "Dual-channel hybrid retrieval (dense BGE-M3 + sparse BM25 with RRF)" },
      { name: "src/graph", path: "src/graph", type: "dir", summary: "LangGraph Corrective RAG (CRAG) state machine & query rewriting" },
      { name: "src/reranker", path: "src/reranker", type: "dir", summary: "Cross-encoder reranking pipeline for high-precision context selection" },
      { name: "src/eval", path: "src/eval", type: "dir", summary: "Automated Ragas evaluation suite for faithfulness and recall" },
      { name: "docker-compose.yml", path: "docker-compose.yml", type: "file", summary: "Qdrant vector store and local vLLM inference service orchestration" },
      { name: "pyproject.toml", path: "pyproject.toml", type: "file", summary: "Package configuration and Python dependency lock" },
      { name: "README.md", path: "README.md", type: "file", summary: "Architecture guide, hybrid retrieval math, and CRAG state graph" },
    ],
    readmeMarkdown: `# OmniDoc RAG

An enterprise-grade, bilingual (**Persian & English**) technical Retrieval-Augmented Generation (RAG) and evaluation engine tailored for DevOps and infrastructure documentation.

## Core Architecture

1. **Dual-Channel Hybrid Retrieval:** Combines dense multilingual embeddings (\`BGE-M3\`) with sparse lexical matching (\`BM25\`) fused via Reciprocal Rank Fusion (\`RRF\`).
2. **Cross-Encoder Reranking:** Refines top candidate chunks before context injection.
3. **Corrective RAG (CRAG) with LangGraph:** Stateful graph workflow that grades retrieved documents, rewrites ambiguous queries, and prevents unsupported hallucinations.
4. **Vector Storage & Local Inference:** Powered by **Qdrant** and local **vLLM** serving.
5. **Automated Ragas Evaluation:** Quantitative tracking of context precision, recall, and answer faithfulness.

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/omnidoc-rag.git
cd omnidoc-rag
docker compose up -d qdrant
pip install -e .
\`\`\``,
  },
  "omnidoc-vision": {
    branch: "main",
    language: "Python · Multimodal AI",
    description:
      "Bilingual (Persian & English) Multimodal Document Intelligence and Adaptive Visual RAG platform for complex technical PDFs under a 16GB VRAM budget.",
    topics: ["multimodal-rag", "document-intelligence", "vision-language-models", "pdf-parsing", "qdrant", "persian-ocr"],
    files: [
      { name: "omnidoc_vision/parser", path: "omnidoc_vision/parser", type: "dir", summary: "Layout-aware PDF extraction for multi-header tables & diagrams" },
      { name: "omnidoc_vision/vlm", path: "omnidoc_vision/vlm", type: "dir", summary: "Quantized Vision-Language Model inference within 16GB VRAM" },
      { name: "omnidoc_vision/retrieval", path: "omnidoc_vision/retrieval", type: "dir", summary: "Adaptive visual + textual multi-vector indexing" },
      { name: "scripts", path: "scripts", type: "dir", summary: "Ingestion CLI and benchmark runners" },
      { name: "pyproject.toml", path: "pyproject.toml", type: "file", summary: "Project metadata and dependency specifications" },
      { name: "README.md", path: "README.md", type: "file", summary: "Visual RAG pipeline architecture and VRAM optimization notes" },
    ],
    readmeMarkdown: `# OmniDoc-Vision

A production-grade, bilingual (**Persian & English**) Multimodal Document Intelligence and Adaptive Visual RAG platform engineered to extract, index, and reason over complex technical PDFs.

## Highlights

- **Complex PDF Layout Parsing:** Preserves multi-header tables, system architecture diagrams, and throughput charts across bilingual documents.
- **16GB VRAM Budget Optimization:** Quantized multimodal vision-language inference pipeline designed to run reliably on single-GPU workstations.
- **Diagram & Chart Reasoning:** Joint visual-textual indexing enabling grounded answers over figures and tabular schematics.

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/omnidoc_vision.git
cd omnidoc_vision
pip install -e .
\`\`\``,
  },
  "omniops-sre-agent": {
    branch: "main",
    language: "Python · FastMCP & LangGraph",
    description:
      "Autonomous incident response and Site Reliability Engineering platform built on FastMCP (Model Context Protocol) and LangGraph with human-in-the-loop safety.",
    topics: ["mcp", "model-context-protocol", "langgraph", "sre", "incident-response", "ai-agents", "human-in-the-loop"],
    files: [
      { name: "mcp_servers", path: "mcp_servers", type: "dir", summary: "FastMCP tool servers for logs, metrics, and runbook inspection" },
      { name: "agent_graph", path: "agent_graph", type: "dir", summary: "LangGraph autonomous triage, correlation, and remediation workflow" },
      { name: "safety", path: "safety", type: "dir", summary: "Deterministic policy guards and human-in-the-loop approval gates" },
      { name: "tests", path: "tests", type: "dir", summary: "Deterministic incident simulation and tool verification suite" },
      { name: "pyproject.toml", path: "pyproject.toml", type: "file", summary: "FastMCP, LangGraph, and Pydantic configuration" },
      { name: "README.md", path: "README.md", type: "file", summary: "SRE agent topology, MCP protocol tools, and safety guardrails" },
    ],
    readmeMarkdown: `# OmniOps SRE Agent

An autonomous incident response and Site Reliability Engineering (SRE) platform built on **FastMCP (Model Context Protocol)** and **LangGraph**.

## Core Capabilities

- **Autonomous Alert Triage:** Ingests infrastructure alerts and correlates telemetry logs across distributed services.
- **Runbook Consultation:** Queries operational runbooks to synthesize root-cause hypotheses.
- **Human-in-the-Loop Safety Approvals:** Deterministic remediation tools are strictly gated by explicit operator approval before state-mutating actions execute.

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/omniops-sre-agent.git
cd omniops-sre-agent
pip install -e .
\`\`\``,
  },
  "enterprise-knowledge-copilot": {
    branch: "main",
    language: "Python · FastAPI & RAG",
    description:
      "Self-hosted assistant that retrieves from authorized documents and answers with source links and verified quotes, including manager tools for accounts and documents.",
    topics: ["enterprise-rag", "citation-verification", "access-control", "fastapi", "self-hosted-ai"],
    files: [
      { name: "app/retrieval", path: "app/retrieval", type: "dir", summary: "Permission-scoped document retrieval and quote extraction" },
      { name: "app/citations", path: "app/citations", type: "dir", summary: "Quote support verification and source link attachment" },
      { name: "app/admin", path: "app/admin", type: "dir", summary: "Manager tools for user accounts, roles, and document collections" },
      { name: "app/main.py", path: "app/main.py", type: "file", summary: "FastAPI application entrypoint and API routes" },
      { name: "docker-compose.yml", path: "docker-compose.yml", type: "file", summary: "Self-hosted deployment configuration" },
      { name: "README.md", path: "README.md", type: "file", summary: "System overview, citation verification guarantees, and setup" },
    ],
    readmeMarkdown: `# Enterprise Knowledge Copilot

A self-hosted assistant that retrieves from authorized documents and answers with source links and verified quotes.

## Key Features

- **Authorized Document Retrieval:** Enforces document-level access permissions before retrieval and synthesis.
- **Source Links & Verified Quotes:** Responses attach direct source links and verbatim supporting quotes. Citation checks confirm quote support in the source text.
- **Manager Administration Tools:** Built-in management interfaces for user accounts, access policies, and document ingestion.

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/enterprise-knowledge-copilot.git
cd enterprise-knowledge-copilot
docker compose up --build
\`\`\``,
  },
  "laya-finetuning-pipeline": {
    branch: "main",
    language: "Python · LLM Fine-Tuning",
    description:
      "Reproducible pipeline for preparing Persian RAG data and fine-tuning and evaluating the Laya Multilingual decision model.",
    topics: ["fine-tuning", "persian-nlp", "rag-dataset", "multilingual-llm", "evaluation-pipeline"],
    files: [
      { name: "data_prep", path: "data_prep", type: "dir", summary: "Persian RAG dataset cleaning, formatting, and split generation" },
      { name: "training", path: "training", type: "dir", summary: "Fine-tuning job orchestration via Laya training API" },
      { name: "evaluation", path: "evaluation", type: "dir", summary: "Decision accuracy and multilingual response evaluation scripts" },
      { name: "configs", path: "configs", type: "dir", summary: "Reproducible hyperparameter and dataset configuration files" },
      { name: "README.md", path: "README.md", type: "file", summary: "Dataset preparation workflow, training API usage, and evaluation notes" },
    ],
    readmeMarkdown: `# Laya Fine-Tuning Pipeline

A reproducible pipeline for preparing Persian RAG data and fine-tuning and evaluating the **Laya Multilingual** decision model.

## Overview

- **Persian RAG Data Preparation:** Structured preprocessing, deduplication, and instruction formatting for bilingual and Persian retrieval tasks.
- **Model Fine-Tuning:** Automates training job submission and checkpoint tracking using Laya's training API.
- **Reproducible Evaluation:** Evaluates decision routing accuracy and grounded generation quality across held-out test splits.

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/laya-finetune.git
cd laya-finetune
pip install -r requirements.txt
\`\`\``,
  },
  "video-kyc": {
    branch: "main",
    language: "Python · FastAPI & Computer Vision",
    description:
      "Real-time browser-based Video KYC identity verification pipeline combining MediaPipe blink liveness, active pose challenges, and DeepFace VGG-Face matching across three Dockerized services.",
    topics: ["video-kyc", "liveness-detection", "mediapipe", "deepface", "fastapi", "websockets", "docker-compose"],
    files: [
      { name: "services/ai", path: "services/ai", type: "dir", summary: "FastAPI inference engine (app.py, liveness.py, challenges.py, face_match.py)" },
      { name: "services/backend", path: "services/backend", type: "dir", summary: "FastAPI WebSocket & session orchestrator (main.py, ai_client.py)" },
      { name: "services/frontend", path: "services/frontend", type: "dir", summary: "Nginx proxy and browser camera/ID capture UI (index.html, nginx.conf)" },
      { name: "docker-compose.yml", path: "docker-compose.yml", type: "file", summary: "Three-service production orchestration across isolated edge & ai-internal networks" },
      { name: "docker-compose.dev.yml", path: "docker-compose.dev.yml", type: "file", summary: "Development compose override for hot-reload local iteration" },
      { name: "LICENSE", path: "LICENSE", type: "file", summary: "Open-source repository license" },
      { name: "README.md", path: "README.md", type: "file", summary: "3-stage verification pipeline, service topology, and Docker setup" },
    ],
    readmeMarkdown: `# Video KYC

A real-time browser-based **Video Identity Verification (KYC)** pipeline separated into three Dockerized microservices (\`frontend\`, \`backend\`, and \`ai\`).

## 3-Stage Verification Pipeline

1. **Blink Liveness (MediaPipe):** Tracks Eye Aspect Ratio (EAR) using \`face_landmarker.task\` to verify 3 natural blinks.
2. **Active Pose & Expression Challenges:** Issues 2 randomized smile or head-turn prompts with a 3-second hold requirement and 10-second timeout per challenge.
3. **ID Face Matching (DeepFace):** Compares captured live frames against the uploaded government ID portrait using \`VGG-Face\`.

## Service Topology

\`\`\`text
video-kyc/
├── services/frontend/   # Nginx reverse proxy & browser camera/ID UI (:3000)
├── services/backend/    # FastAPI WebSocket & verification orchestrator (:8000)
├── services/ai/         # Isolated FastAPI + MediaPipe + DeepFace service (:8001)
└── docker-compose.yml   # edge + ai-internal isolated networks & cache volumes
\`\`\`

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/video-kyc.git
cd video-kyc
docker compose up --build
\`\`\``,
  },
  "kanban-studio": {
    branch: "main",
    language: "TypeScript & Python · Next.js + FastAPI",
    description:
      "A Kanban board with an AI Assistant: multi-user 5-column workspace with Next.js drag-and-drop UI, FastAPI backend, SQLite persistence, and optimistic concurrency control.",
    topics: ["kanban", "ai-assistant", "nextjs", "react", "fastapi", "sqlite", "dnd-kit", "docker"],
    files: [
      { name: "frontend", path: "frontend", type: "dir", summary: "Next.js 16 + React 19 + dnd-kit board UI, Vitest & Playwright suites" },
      { name: "backend", path: "backend", type: "dir", summary: "Python 3.13 FastAPI API, PBKDF2-SHA256 auth, SQLite storage & OpenRouter AI proxy" },
      { name: "scripts", path: "scripts", type: "dir", summary: "Lifecycle helpers (start.sh, stop.sh, test.sh, test-unit.sh)" },
      { name: "docs", path: "docs", type: "dir", summary: "Architecture, database schema, and AI mutation specifications" },
      { name: "Dockerfile", path: "Dockerfile", type: "file", summary: "Single-container build serving Next.js static frontend + FastAPI backend" },
      { name: "docker-compose.yml", path: "docker-compose.yml", type: "file", summary: "Persistent pm-mvp SQLite volume and server-side env wiring" },
      { name: "README.md", path: "README.md", type: "file", summary: "Setup instructions, auth/board guarantees, and AI connectivity checks" },
    ],
    readmeMarkdown: `# Kanban Studio

A Kanban board with an **AI Assistant**, packaged cleanly as a single Dockerized full-stack application.

## Key Capabilities

- **5-Column Interactive Board:** Built with **Next.js 16**, **React 19**, and **@dnd-kit** for fluid drag-and-drop card scheduling across isolated user boards.
- **Multi-User Auth & SQLite Persistence:** PBKDF2-SHA256 password hashing with \`itsdangerous\` signed session cookies and durable storage on \`/app/data/app.db\`.
- **Server-Side AI Assistant:** Integrates an assistant sidebar via \`OPENROUTER_API_KEY\` kept strictly server-side (verified via \`GET /api/ai/ping\`).
- **Optimistic Concurrency Control:** Clients send \`If-Match\` board revision headers so stale concurrent or AI-driven edits fail safely with HTTP \`409\`.

## Quick Start

\`\`\`bash
git clone https://github.com/AmirRghp/kanban-studio.git
cd kanban-studio
./scripts/start.sh
\`\`\``,
  },
};

export function getBundledRepoSnapshot(project: Project): GitHubRepoSnapshot {
  const parsed = parseGitHubRepoUrl(project.githubUrl) ?? {
    owner: "AmirRghp",
    repo: project.id,
  };
  const bundled = BUNDLED_REPOS[project.id];
  if (bundled) {
    return {
      owner: parsed.owner,
      repo: parsed.repo,
      ...bundled,
      source: "bundled",
    };
  }
  return {
    owner: parsed.owner,
    repo: parsed.repo,
    branch: "main",
    language: "Python",
    description: project.brief,
    topics: project.highlights ?? [],
    files: [
      { name: "src", path: "src", type: "dir", summary: "Core implementation modules" },
      { name: "README.md", path: "README.md", type: "file", summary: "Project overview and documentation" },
    ],
    readmeMarkdown: `# ${project.title}\n\n${project.brief}`,
    source: "bundled",
  };
}

function isValidRepoSnapshot(data: unknown): data is GitHubRepoSnapshot {
  if (!data || typeof data !== "object") return false;
  const d = data as Partial<GitHubRepoSnapshot>;
  return (
    typeof d.owner === "string" &&
    typeof d.repo === "string" &&
    typeof d.branch === "string" &&
    typeof d.language === "string" &&
    typeof d.description === "string" &&
    Array.isArray(d.topics) &&
    d.topics.every((t) => typeof t === "string") &&
    Array.isArray(d.files) &&
    d.files.every(
      (f) =>
        Boolean(f) &&
        typeof f === "object" &&
        typeof f.name === "string" &&
        typeof f.path === "string" &&
        (f.type === "dir" || f.type === "file") &&
        typeof f.summary === "string",
    ) &&
    typeof d.readmeMarkdown === "string"
  );
}

function readCachedSnapshot(owner: string, repo: string): GitHubRepoSnapshot | null {
  try {
    const raw = window.localStorage.getItem(`${CACHE_PREFIX}${owner}_${repo}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRepoEntry;
    if (!parsed || typeof parsed.savedAt !== "number" || !isValidRepoSnapshot(parsed.data)) return null;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    return { ...parsed.data, source: "cache" };
  } catch {
    return null;
  }
}

function writeCachedSnapshot(snapshot: GitHubRepoSnapshot): void {
  try {
    const entry: CachedRepoEntry = {
      savedAt: Date.now(),
      data: snapshot,
    };
    window.localStorage.setItem(`${CACHE_PREFIX}${snapshot.owner}_${snapshot.repo}`, JSON.stringify(entry));
  } catch {
    // Ignore storage quota or private browsing errors
  }
}

export function getInitialRepoSnapshot(project: Project): GitHubRepoSnapshot {
  const parsed = parseGitHubRepoUrl(project.githubUrl);
  if (parsed && typeof window !== "undefined") {
    const cached = readCachedSnapshot(parsed.owner, parsed.repo);
    if (cached) return cached;
  }
  return getBundledRepoSnapshot(project);
}

export async function fetchGitHubRepoSnapshot(
  project: Project,
  signal?: AbortSignal,
): Promise<GitHubRepoSnapshot> {
  const base = getInitialRepoSnapshot(project);
  if (base.source === "cache") return base;

  const parsed = parseGitHubRepoUrl(project.githubUrl);
  if (!parsed) return base;

  const { owner, repo } = parsed;
  const timeoutController = new AbortController();
  const timeoutId = globalThis.setTimeout(() => timeoutController.abort(), FETCH_TIMEOUT_MS);
  const onExternalAbort = () => timeoutController.abort();
  if (signal) {
    if (signal.aborted) {
      timeoutController.abort();
    } else {
      signal.addEventListener("abort", onExternalAbort, { once: true });
    }
  }
  const activeSignal = timeoutController.signal;

  try {
    const [repoRes, contentsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        signal: activeSignal,
        headers: { Accept: "application/vnd.github+json" },
      }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
        signal: activeSignal,
        headers: { Accept: "application/vnd.github+json" },
      }),
    ]);

    let branch = base.branch;
    let description = base.description;
    let language = base.language;
    let topics = base.topics;
    let stars = base.stars;
    let forks = base.forks;

    if (repoRes.ok) {
      const repoJson = (await repoRes.json()) as {
        default_branch?: string;
        description?: string | null;
        language?: string | null;
        topics?: string[];
        stargazers_count?: number;
        forks_count?: number;
      };
      if (repoJson.default_branch) branch = repoJson.default_branch;
      if (repoJson.description) description = repoJson.description;
      if (repoJson.language) language = repoJson.language;
      if (Array.isArray(repoJson.topics) && repoJson.topics.length > 0) {
        topics = repoJson.topics;
      }
      if (typeof repoJson.stargazers_count === "number") stars = repoJson.stargazers_count;
      if (typeof repoJson.forks_count === "number") forks = repoJson.forks_count;
    }

    let files = base.files;
    if (contentsRes.ok) {
      const contentsJson = (await contentsRes.json()) as Array<{
        name?: string;
        path?: string;
        type?: string;
      }>;
      if (Array.isArray(contentsJson) && contentsJson.length > 0) {
        const sorted = [...contentsJson].sort((a, b) => {
          const aDir = a.type === "dir" ? 0 : 1;
          const bDir = b.type === "dir" ? 0 : 1;
          if (aDir !== bDir) return aDir - bDir;
          return (a.name ?? "").localeCompare(b.name ?? "");
        });
        files = sorted.slice(0, 18).map((item) => {
          const existing = base.files.find((f) => f.name.toLowerCase() === (item.name ?? "").toLowerCase());
          return {
            name: item.name ?? "file",
            path: item.path ?? item.name ?? "file",
            type: item.type === "dir" ? "dir" : "file",
            summary: existing?.summary ?? (item.type === "dir" ? "Repository directory" : "Repository source file"),
          };
        });
      }
    }

    let readmeMarkdown = base.readmeMarkdown;
    try {
      const readmeRes = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/README.md`,
        { signal: activeSignal },
      );
      if (readmeRes.ok) {
        const text = await readmeRes.text();
        if (text.trim().length > 40) {
          readmeMarkdown = text;
        }
      }
    } catch {
      // Keep bundled README markdown on raw fetch error
    }

    const liveSnapshot: GitHubRepoSnapshot = {
      owner,
      repo,
      branch,
      language,
      description,
      topics,
      stars,
      forks,
      files,
      readmeMarkdown,
      source: "live",
    };

    if (repoRes.ok || contentsRes.ok) {
      writeCachedSnapshot(liveSnapshot);
    }

    return liveSnapshot;
  } catch {
    return base;
  } finally {
    globalThis.clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInlineMarkdown(line: string, repoUrl: string, branch: string): string {
  let out = escapeHtml(line);
  // Inline code `code`
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold **text**
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic *text*
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  // Links [label](href)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label: string, rawHref: string) => {
    const trimmed = rawHref.trim();
    const hasExplicitOrEncodedScheme = /^[a-z][a-z0-9+.-]*:|&#\d+;|&#x[0-9a-f]+;/i.test(trimmed);
    if (hasExplicitOrEncodedScheme && !/^https?:\/\/|^mailto:/i.test(trimmed)) {
      return label;
    }
    const resolved = /^https?:\/\/|^mailto:/i.test(trimmed)
      ? trimmed
      : `${repoUrl}/blob/${branch}/${trimmed.replace(/^\.?\//, "")}`;
    return `<a href="${resolved}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  return out;
}

export function renderMarkdownToHtml(markdown: string, repoUrl: string, branch = "main"): string {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith("```")) {
      closeList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    if (!trimmed) {
      closeList();
      continue;
    }

    // Skip raw HTML badge blocks or markdown image-only lines that point to external shields
    if (/^!\[[^\]]*\]\([^)]+\)$/.test(trimmed)) {
      continue;
    }

    const headingMatch = /^(#{1,4})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${formatInlineMarkdown(headingMatch[2], repoUrl, branch)}</h${level}>`);
      continue;
    }

    const ulMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    if (ulMatch) {
      if (listType !== "ul") {
        closeList();
        listType = "ul";
        html.push("<ul>");
      }
      html.push(`<li>${formatInlineMarkdown(ulMatch[1], repoUrl, branch)}</li>`);
      continue;
    }

    const olMatch = /^\d+\.\s+(.+)$/.exec(trimmed);
    if (olMatch) {
      if (listType !== "ol") {
        closeList();
        listType = "ol";
        html.push("<ol>");
      }
      html.push(`<li>${formatInlineMarkdown(olMatch[1], repoUrl, branch)}</li>`);
      continue;
    }

    if (trimmed.startsWith(">")) {
      closeList();
      html.push(`<blockquote>${formatInlineMarkdown(trimmed.replace(/^>\s*/, ""), repoUrl, branch)}</blockquote>`);
      continue;
    }

    if (/^---+$/.test(trimmed)) {
      closeList();
      html.push("<hr />");
      continue;
    }

    closeList();
    html.push(`<p>${formatInlineMarkdown(trimmed, repoUrl, branch)}</p>`);
  }

  closeList();
  if (inCodeBlock && codeBuffer.length > 0) {
    html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}

export function renderRepoFilesHtml(snapshot: GitHubRepoSnapshot, repoUrl: string): string {
  return snapshot.files
    .map((file) => {
      const targetUrl =
        file.type === "dir"
          ? `${repoUrl}/tree/${snapshot.branch}/${escapeHtml(file.path)}`
          : `${repoUrl}/blob/${snapshot.branch}/${escapeHtml(file.path)}`;
      const iconSvg =
        file.type === "dir"
          ? `<svg class="file-icon dir" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>`
          : `<svg class="file-icon file" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/></svg>`;
      return `<div class="file-row">
        <div class="file-name-cell">
          ${iconSvg}
          <a class="file-link" href="${targetUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(file.name)}</a>
        </div>
        <span class="file-summary">${escapeHtml(file.summary)}</span>
      </div>`;
    })
    .join("\n");
}

export function buildGitHubRepoSrcDoc(project: Project, snapshot: GitHubRepoSnapshot): string {
  const repoUrl = project.githubUrl;
  const filesHtml = renderRepoFilesHtml(snapshot, repoUrl);
  const readmeHtml = renderMarkdownToHtml(snapshot.readmeMarkdown, repoUrl, snapshot.branch);
  const topicsHtml = snapshot.topics
    .map((topic) => `<span class="topic-tag">${escapeHtml(topic)}</span>`)
    .join(" · ");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(project.title)} — GitHub Repository</title>
  <style>
    :root {
      color-scheme: dark;
      --bg-canvas: #0d1117;
      --bg-surface: #161b22;
      --bg-elevated: #1f242c;
      --border-default: #30363d;
      --border-muted: #21262d;
      --fg-default: #e6edf3;
      --fg-muted: #8b949e;
      --fg-accent: #58a6ff;
      --btn-primary-bg: #238636;
      --btn-primary-hover: #2ea043;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg-canvas);
      color: var(--fg-default);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 13.5px;
      line-height: 1.55;
    }
    a {
      color: var(--fg-accent);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .repo-header {
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-default);
      padding: 12px 16px 0;
    }
    .repo-title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 10px;
    }
    .repo-path {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 15px;
      font-weight: 600;
      color: var(--fg-accent);
    }
    .repo-path svg {
      width: 16px;
      height: 16px;
      color: var(--fg-muted);
      flex-shrink: 0;
    }
    .repo-visibility {
      font-size: 11px;
      font-weight: 500;
      color: var(--fg-muted);
      border: 1px solid var(--border-default);
      border-radius: 4px;
      padding: 1px 6px;
      margin-left: 4px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .clone-btn, .gh-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--border-default);
      background: var(--bg-elevated);
      color: var(--fg-default);
      text-decoration: none;
    }
    .gh-btn.primary {
      background: var(--btn-primary-bg);
      border-color: rgba(240, 246, 252, 0.1);
      color: #ffffff;
    }
    .gh-btn.primary:hover {
      background: var(--btn-primary-hover);
      text-decoration: none;
    }
    .tabs {
      display: flex;
      gap: 4px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--fg-muted);
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .tab-btn[aria-selected="true"] {
      color: var(--fg-default);
      border-bottom-color: #f78166;
    }
    .container {
      max-width: 980px;
      margin: 0 auto;
      padding: 16px;
      display: grid;
      gap: 16px;
    }
    .meta-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: 6px;
    }
    .branch-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: var(--fg-default);
    }
    .lang-meta {
      font-size: 12px;
      color: var(--fg-muted);
      font-variant-numeric: tabular-nums;
    }
    .file-box {
      border: 1px solid var(--border-default);
      border-radius: 6px;
      overflow: hidden;
      background: var(--bg-canvas);
    }
    .file-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 12px;
      border-top: 1px solid var(--border-muted);
      font-size: 13px;
    }
    .file-row:first-child {
      border-top: none;
    }
    .file-row:hover {
      background: var(--bg-surface);
    }
    .file-name-cell {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .file-icon {
      width: 15px;
      height: 15px;
      flex-shrink: 0;
    }
    .file-icon.dir { color: #58a6ff; }
    .file-icon.file { color: #8b949e; }
    .file-link {
      color: var(--fg-default);
      font-weight: 500;
      white-space: nowrap;
    }
    .file-summary {
      color: var(--fg-muted);
      font-size: 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: right;
    }
    .readme-box {
      border: 1px solid var(--border-default);
      border-radius: 6px;
      background: var(--bg-canvas);
      overflow: hidden;
    }
    .readme-header {
      padding: 9px 14px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-default);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--fg-default);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .readme-body {
      padding: 18px 20px;
    }
    .readme-body h1, .readme-body h2, .readme-body h3 {
      margin: 16px 0 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-muted);
      line-height: 1.25;
    }
    .readme-body h1:first-child { margin-top: 0; font-size: 20px; }
    .readme-body h2 { font-size: 16px; }
    .readme-body h3 { font-size: 14px; border-bottom: none; }
    .readme-body p, .readme-body ul, .readme-body ol, .readme-body blockquote {
      margin: 0 0 12px;
    }
    .readme-body ul, .readme-body ol {
      padding-left: 20px;
    }
    .readme-body li {
      margin-bottom: 4px;
    }
    .readme-body code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      padding: 2px 5px;
      background: rgba(110, 118, 129, 0.25);
      border-radius: 4px;
    }
    .readme-body pre {
      margin: 0 0 12px;
      padding: 12px;
      background: var(--bg-surface);
      border: 1px solid var(--border-muted);
      border-radius: 6px;
      overflow-x: auto;
    }
    .readme-body pre code {
      padding: 0;
      background: none;
    }
    .about-card {
      padding: 12px 14px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: 6px;
    }
    .about-desc {
      margin: 0 0 8px;
      color: var(--fg-default);
    }
    .topics-line {
      font-size: 12px;
      color: var(--fg-muted);
    }
    .topic-tag {
      color: var(--fg-accent);
    }
    [hidden] { display: none !important; }
  </style>
</head>
<body>
  <header class="repo-header">
    <div class="repo-title-row">
      <div class="repo-path">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>
        <a href="https://github.com/${escapeHtml(snapshot.owner)}" target="_blank" rel="noopener noreferrer">${escapeHtml(snapshot.owner)}</a>
        <span>/</span>
        <a href="${repoUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(snapshot.repo)}</a>
        <span class="repo-visibility">Public</span>
      </div>
      <div class="header-actions">
        <button type="button" class="clone-btn" id="copy-clone-btn" data-clone="git clone ${repoUrl}.git">
          Copy clone command
        </button>
        <a class="gh-btn primary" href="${repoUrl}" target="_blank" rel="noopener noreferrer">
          Open on GitHub ↗
        </a>
      </div>
    </div>
    <nav class="tabs" role="tablist" aria-label="Repository views">
      <button type="button" class="tab-btn" role="tab" aria-selected="true" data-tab="code">Code &amp; README</button>
      <button type="button" class="tab-btn" role="tab" aria-selected="false" data-tab="files">Files (<span id="file-count">${snapshot.files.length}</span>)</button>
    </nav>
  </header>

  <main class="container">
    <section class="about-card" aria-label="Repository summary">
      <p class="about-desc" id="repo-desc">${escapeHtml(snapshot.description)}</p>
      <div class="topics-line" id="repo-topics">${topicsHtml}</div>
    </section>

    <div class="meta-bar">
      <span class="branch-label">Branch: <strong id="repo-branch">${escapeHtml(snapshot.branch)}</strong></span>
      <span class="lang-meta" id="repo-lang">${escapeHtml(snapshot.language)}</span>
    </div>

    <section class="file-box" id="files-section" aria-label="Repository files">
      <div id="files-list">
        ${filesHtml}
      </div>
    </section>

    <article class="readme-box" id="readme-section" aria-label="README.md">
      <div class="readme-header">
        <span>README.md</span>
        <a href="${repoUrl}#readme" target="_blank" rel="noopener noreferrer">Full view on GitHub ↗</a>
      </div>
      <div class="readme-body" id="readme-content">
        ${readmeHtml}
      </div>
    </article>
  </main>

  <script>
    (function () {
      var copyBtn = document.getElementById("copy-clone-btn");
      if (copyBtn) {
        copyBtn.addEventListener("click", function () {
          var cmd = copyBtn.getAttribute("data-clone") || "";
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(cmd).catch(function () {});
          }
          copyBtn.textContent = "Copied!";
          setTimeout(function () { copyBtn.textContent = "Copy clone command"; }, 1800);
        });
      }

      var tabs = document.querySelectorAll(".tab-btn");
      var readmeSection = document.getElementById("readme-section");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var mode = tab.getAttribute("data-tab");
          tabs.forEach(function (t) {
            t.setAttribute("aria-selected", t === tab ? "true" : "false");
          });
          if (readmeSection) {
            if (mode === "files") {
              readmeSection.setAttribute("hidden", "");
            } else {
              readmeSection.removeAttribute("hidden");
            }
          }
        });
      });

      window.addEventListener("message", function (event) {
        if (event.source !== window.parent) return;
        var msg = event.data;
        if (!msg || msg.type !== "gh-repo-update") return;
        if (msg.readmeHtml) {
          var el = document.getElementById("readme-content");
          if (el) el.innerHTML = msg.readmeHtml;
        }
        if (msg.filesHtml) {
          var fl = document.getElementById("files-list");
          if (fl) fl.innerHTML = msg.filesHtml;
        }
        if (typeof msg.fileCount === "number") {
          var fc = document.getElementById("file-count");
          if (fc) fc.textContent = String(msg.fileCount);
        }
        if (msg.branch) {
          var br = document.getElementById("repo-branch");
          if (br) br.textContent = msg.branch;
        }
        if (msg.language) {
          var lg = document.getElementById("repo-lang");
          if (lg) lg.textContent = msg.language;
        }
      });
    })();
  </script>
</body>
</html>`;
}
