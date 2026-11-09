import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TechStackSection } from "./TechStackSection";

describe("TechStackSection", () => {
  it("renders header with kicker, title, and filter hint", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    expect(html).toContain("Stacks");
    expect(html).toContain("Tech Stack");
    expect(html).toContain("( select tab to filter )");
  });

  it("renders all 8 tabs including Data & AI and Agent Harness", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    expect(html).toContain("All");
    expect(html).toContain("Languages");
    expect(html).toContain("Frontend");
    expect(html).toContain("Backend");
    expect(html).toContain("Databases");
    expect(html).toContain("DevOps &amp; Cloud");
    expect(html).toContain("Data &amp; AI");
    expect(html).toContain("Agent Harness");
  });

  it("renders requested technologies including newly added AI and Agent Harness items", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    const expectedTechs = [
      "JavaScript",
      "TypeScript",
      "Python",
      "React",
      "Next.js",
      "Three.js",
      "Tailwind CSS",
      "FastAPI",
      "Docker",
      "PostgreSQL",
      "Redis",
      "Qdrant",
      "ChromaDB",
      "FAISS",
      "PyTorch",
      "TensorFlow",
      "Keras",
      "OpenCV",
      "LangChain",
      "LangGraph",
      "RAG",
      "MCP",
      "vLLM",
      "Ollama",
      "PostHog",
      "Telegram Bot",
      "PyQt",
      "Metabase",
      "Microsoft Clarity",
      "N8N",
      "Playwright",
      "Claude API",
      "OpenRouter API",
      "Streamlit",
      "Gradio",
      "CODEX",
      "Claude Code",
      "Antigravity",
      "zCode",
      "Cursor",
      "Open Code",
    ];

    for (const tech of expectedTechs) {
      expect(html).toContain(tech);
    }
  });

  it("does not render removed items from stack", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    const removedTechs = [
      ">C++<",
      ">Framer Motion<",
      ">Node.js<",
      ">Express.js<",
      ">Socket.IO<",
      ">Passport<",
      ">Google OAuth<",
      ">MongoDB<",
      ">Mongoose<",
      ">AWS<",
      ">Vercel<",
      ">Mistral AI<",
    ];

    for (const tech of removedTechs) {
      expect(html).not.toContain(tech);
    }
  });

  it("renders expand button with initial collapsed state and blur overlay for All category", () => {
    const html = renderToStaticMarkup(<TechStackSection />);

    expect(html).toContain("VIEW ALL TECHNOLOGIES (60)");
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain("techBlurOverlay");
    expect(html).toContain("techArrowIcon");
    expect(html).toContain("techMoreWrapper");
  });

  it("does not render expand button for categories with 10 or fewer items like languages", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    // In Languages tab (5 items), there is no 'tech-more-languages'
    expect(html).not.toContain('id="tech-more-languages"');
    // But 'tech-more-all' is present
    expect(html).toContain('id="tech-more-all"');
  });
});
