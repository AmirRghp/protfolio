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

        {TABS.map((tab) => {
          const filteredItems =
            tab.id === "all"
              ? TECH_ITEMS
              : TECH_ITEMS.filter((item) => item.categories.includes(tab.id));

          return (
            <TabsContent key={tab.id} value={tab.id}>
              <div className={styles.techGrid}>
                {filteredItems.map((item) => (
                  <div key={item.name} className={styles.techChip}>
                    <TechIcon name={item.name} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
