import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectCarousel, { type CarouselProject } from "./ProjectCarousel";

const SAMPLE_PROJECTS: CarouselProject[] = [
  {
    id: "omnidoc-rag",
    title: "OmniDoc RAG",
    brief: "Enterprise hybrid RAG and evaluation engine.",
    badge: "Featured",
    tag: "LangGraph · Qdrant",
    githubUrl: "https://github.com/AmirRghp/omnidoc-rag",
    cta: "View on GitHub",
  },
  {
    id: "enterprise-knowledge-copilot",
    title: "Enterprise Knowledge Copilot",
    brief: "Self-hosted assistant with verified quotes.",
    badge: "Self-Hosted",
    tag: "Document QA",
    githubUrl: "https://github.com/AmirRghp/enterprise-knowledge-copilot",
  },
];

describe("ProjectCarousel component", () => {
  it("renders accessible carousel region with all project cards, badges, tags, and GitHub links", () => {
    const html = renderToStaticMarkup(
      <ProjectCarousel projects={SAMPLE_PROJECTS} color="#3b82f6" />,
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Project carousel"');
    expect(html).toContain("OmniDoc RAG");
    expect(html).toContain("Enterprise Knowledge Copilot");
    expect(html).toContain("Featured");
    expect(html).toContain("Self-Hosted");
    expect(html).toContain("LangGraph · Qdrant");
    expect(html).toContain('href="https://github.com/AmirRghp/omnidoc-rag"');
    expect(html).toContain('href="https://github.com/AmirRghp/enterprise-knowledge-copilot"');
    expect(html).toContain('aria-label="View OmniDoc RAG on GitHub"');
  });

  it("marks the first project slot as active on initial render and applies paint color variable", () => {
    const html = renderToStaticMarkup(
      <ProjectCarousel projects={SAMPLE_PROJECTS} color="#10b981" />,
    );

    expect(html).toContain("--paint:#10b981");
    expect(html).toContain("translate3d(0, 0.0px, 0) scale(1.000)");
    expect(html).toContain("View on GitHub");
  });
});
