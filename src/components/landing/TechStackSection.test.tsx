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

  it("renders all 7 tabs including Data & AI", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    expect(html).toContain("All");
    expect(html).toContain("Languages");
    expect(html).toContain("Frontend");
    expect(html).toContain("Backend");
    expect(html).toContain("Databases");
    expect(html).toContain("DevOps &amp; Cloud");
    expect(html).toContain("Data &amp; AI");
  });

  it("renders requested technologies from CV, prompt, and image", () => {
    const html = renderToStaticMarkup(<TechStackSection />);
    // From Prompt & Images
    const expectedTechs = [
      "JavaScript",
      "TypeScript",
      "Python",
      "C++",
      "React",
      "Next.js",
      "Tailwind CSS",
      "FastAPI",
      "Docker",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Qdrant",
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
    ];

    for (const tech of expectedTechs) {
      expect(html).toContain(tech);
    }
  });
});
