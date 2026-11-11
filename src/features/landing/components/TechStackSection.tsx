import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/arc";
import { TechIcon } from "./techIcons";
import styles from "./techStack.module.css";

type TechCategory =
  | "all"
  | "languages"
  | "frontend"
  | "backend"
  | "databases"
  | "devops"
  | "ai"
  | "agent-harness";

interface TechItem {
  name: string;
  categories: TechCategory[];
}

const TECH_ITEMS: TechItem[] = [
  // Languages
  { name: "JavaScript", categories: ["languages", "frontend", "backend"] },
  { name: "TypeScript", categories: ["languages", "frontend", "backend"] },
  { name: "Python", categories: ["languages", "backend", "ai"] },
  { name: "HTML & CSS", categories: ["languages", "frontend"] },
  { name: "MATLAB", categories: ["languages", "ai"] },

  // Frontend
  { name: "React", categories: ["frontend"] },
  { name: "Next.js", categories: ["frontend"] },
  { name: "Three.js", categories: ["frontend"] },
  { name: "Tailwind CSS", categories: ["frontend"] },
  { name: "GSAP", categories: ["frontend"] },
  { name: "Streamlit", categories: ["frontend", "ai"] },
  { name: "Gradio", categories: ["frontend", "ai"] },
  { name: "PyQt", categories: ["frontend"] },

  // Backend
  { name: "FastAPI", categories: ["backend", "ai"] },
  { name: "REST APIs", categories: ["backend"] },
  { name: "Apache Kafka", categories: ["backend", "devops"] },
  { name: "N8N", categories: ["backend", "devops"] },
  { name: "Telegram Bot", categories: ["backend"] },
  { name: "JWT", categories: ["backend"] },

  // Databases
  { name: "PostgreSQL", categories: ["databases"] },
  { name: "Redis", categories: ["databases"] },
  { name: "Qdrant", categories: ["databases", "ai"] },
  { name: "ChromaDB", categories: ["databases", "ai"] },
  { name: "FAISS", categories: ["databases", "ai"] },
  { name: "MySQL", categories: ["databases"] },
  { name: "Microsoft SQL Server", categories: ["databases"] },

  // DevOps & Cloud
  { name: "Docker", categories: ["devops"] },
  { name: "Linux", categories: ["devops"] },
  { name: "Git", categories: ["devops"] },
  { name: "GitHub", categories: ["devops"] },
  { name: "GitLab", categories: ["devops"] },
  { name: "Playwright", categories: ["devops"] },
  { name: "Selenium", categories: ["devops"] },
  { name: "Postman", categories: ["devops"] },
  { name: "PostHog", categories: ["devops"] },
  { name: "Microsoft Clarity", categories: ["devops"] },
  { name: "Metabase", categories: ["devops", "ai"] },
  { name: "Unit Testing", categories: ["devops"] },
  { name: "Jira", categories: ["devops"] },

  // Data & AI
  { name: "PyTorch", categories: ["ai"] },
  { name: "TensorFlow", categories: ["ai"] },
  { name: "Keras", categories: ["ai"] },
  { name: "OpenCV", categories: ["ai"] },
  { name: "LangChain", categories: ["ai"] },
  { name: "LangGraph", categories: ["ai"] },
  { name: "RAG", categories: ["ai"] },
  { name: "MCP", categories: ["ai"] },
  { name: "vLLM", categories: ["ai"] },
  { name: "Ollama", categories: ["ai"] },
  { name: "AI Agents", categories: ["ai"] },
  { name: "OpenAI API", categories: ["ai"] },
  { name: "Claude API", categories: ["ai"] },
  { name: "Gemini API", categories: ["ai"] },
  { name: "OpenRouter API", categories: ["ai"] },

  // Agent Harness
  { name: "CODEX", categories: ["agent-harness"] },
  { name: "Claude Code", categories: ["agent-harness"] },
  { name: "Antigravity", categories: ["agent-harness"] },
  { name: "zCode", categories: ["agent-harness"] },
  { name: "Cursor", categories: ["agent-harness"] },
  { name: "Open Code", categories: ["agent-harness"] },
];

const TABS: { id: TechCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "languages", label: "Languages" },
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "databases", label: "Databases" },
  { id: "devops", label: "DevOps & Cloud" },
  { id: "ai", label: "Data & AI" },
  { id: "agent-harness", label: "Agent Harness" },
];

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface TechTabPanelProps {
  tab: { id: TechCategory; label: string };
}

function TechTabPanel({ tab }: TechTabPanelProps) {
  const filteredItems = useMemo(
    () =>
      tab.id === "all"
        ? TECH_ITEMS
        : TECH_ITEMS.filter((item) => item.categories.includes(tab.id)),
    [tab.id]
  );

  // SSR / initial render estimate: on desktop, > 16 items (All: 60, Data & AI: 24) exceed 2 rows,
  // while DevOps (15), Frontend (11), Backend (9), Databases (7), Agent Harness (6), Languages (5) fit in <= 2 rows.
  // Immediately upon mount and on any viewport resize (including mobile), useIsomorphicLayoutEffect measures exact DOM rows.
  const [hasMore, setHasMore] = useState(() => filteredItems.length > 16);
  const [isExpanded, setIsExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | null>(null);
  const [fullHeight, setFullHeight] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const measure = () => {
      const chips = Array.from(el.children) as HTMLElement[];
      if (chips.length === 0 || el.clientWidth === 0) {
        return;
      }

      const rowTops: number[] = [];
      let secondRowBottom = 0;

      for (let i = 0; i < chips.length; i++) {
        const chip = chips[i];
        const top = chip.offsetTop;
        if (!rowTops.some((r) => Math.abs(r - top) <= 2)) {
          rowTops.push(top);
        }
        if (rowTops.length >= 2 && Math.abs(top - rowTops[1]) <= 2) {
          secondRowBottom = Math.max(secondRowBottom, top + chip.offsetHeight);
        }
      }

      const exceedsTwoRows = rowTops.length > 2;
      setHasMore(exceedsTwoRows);
      if (!exceedsTwoRows) {
        setIsExpanded(false);
      }
      if (secondRowBottom > 0) {
        setCollapsedHeight(secondRowBottom);
      }
      setFullHeight(el.scrollHeight);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [filteredItems]);

  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>('#ld-techstack [role="tabpanel"]');
    panels.forEach((p) => {
      p.style.height = "";
      p.style.overflow = "";
    });
  }, [isExpanded, hasMore]);

  const handleToggle = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      if (!next && typeof window !== "undefined") {
        const header = document.getElementById("ld-techstack");
        if (header) {
          const rect = header.getBoundingClientRect();
          if (rect.top < 0) {
            header.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
      return next;
    });
  };

  const wrapperMaxHeight = !hasMore
    ? undefined
    : isExpanded
      ? fullHeight > 0
        ? `${fullHeight + 12}px`
        : undefined
      : collapsedHeight !== null
        ? `${collapsedHeight}px`
        : undefined;

  return (
    <div className={styles.techListContainer}>
      <div
        id={hasMore ? `tech-more-${tab.id}` : undefined}
        className={`${styles.techMoreWrapper} ${
          !hasMore
            ? styles.notOverflowing
            : isExpanded
              ? styles.expanded
              : styles.collapsed
        }`}
        style={wrapperMaxHeight ? { maxHeight: wrapperMaxHeight } : undefined}
      >
        <div ref={gridRef} className={styles.techGrid}>
          {filteredItems.map((item) => (
            <div key={item.name} className={styles.techChip}>
              <TechIcon name={item.name} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <>
          <div
            className={`${styles.techBlurOverlay} ${isExpanded ? styles.blurHidden : ""}`}
            aria-hidden="true"
          />
          <div className={styles.techAction}>
            <button
              type="button"
              className={styles.techExpandBtn}
              onClick={handleToggle}
              aria-expanded={isExpanded}
              aria-controls={`tech-more-${tab.id}`}
              aria-label={
                isExpanded
                  ? "Collapse tech stack list"
                  : `View all ${filteredItems.length} technologies in ${tab.label}`
              }
            >
              <span>
                {isExpanded
                  ? "COLLAPSE STACK"
                  : `VIEW ALL TECHNOLOGIES (${filteredItems.length})`}
              </span>
              <svg
                className={`${styles.techArrowIcon} ${isExpanded ? styles.arrowUp : ""}`}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function TechStackSection() {
  return (
    <div className={styles.techSection}>
      <div className={styles.techHead}>
        <div>
          <div className={styles.techKicker}>
            <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
            </svg>
            Stacks
          </div>
          <h2 className={styles.techTitle}>Tech Stack</h2>
        </div>
        <span className={styles.techHint}>( select tab to filter )</span>
      </div>

      <Tabs defaultValue="all">
        <TabsList aria-label="Tech Stack Categories">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <TechTabPanel tab={tab} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
