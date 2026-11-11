import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { portfolioContent } from "@/data/content";
import ProjectApp, {
  AgentGlyph,
  ChatGlyph,
  LayersGlyph,
  RagGlyph,
  ScanGlyph,
  VisionGlyph,
} from "./ProjectApp";

describe("ProjectApp component", () => {
  it("renders repository preview with security notice and GitHub action link when websiteUrl is absent", () => {
    const project = portfolioContent.projects[0];
    const html = renderToStaticMarkup(
      <ProjectApp project={project} icon={<ScanGlyph />} />,
    );

    expect(html).toContain(project.title);
    expect(html).toContain(project.brief);
    expect(html).toContain("GitHub repositories block inline embedded viewing via security policies.");
    expect(html).toContain("Open GitHub repository");
    expect(html).toContain("Load inside this window");
    expect(html).toContain("Open in new tab");
    expect(html).toContain(`href="${project.githubUrl}"`);
  });

  it("renders website action link and hides GitHub security notice when project has a custom websiteUrl", () => {
    const baseProject = portfolioContent.projects[1];
    const liveProject = {
      ...baseProject,
      websiteUrl: "https://omnidoc.example.com" as const,
    };

    const html = renderToStaticMarkup(
      <ProjectApp project={liveProject} icon={<RagGlyph />} />,
    );

    expect(html).toContain("omnidoc.example.com");
    expect(html).toContain("Open project website");
    expect(html).not.toContain("GitHub repositories block inline embedded viewing");
    expect(html).toContain('href="https://omnidoc.example.com"');
  });

  it("renders all exported project glyphs as accessible hidden SVGs", () => {
    const glyphs = [
      <ScanGlyph key="scan" />,
      <RagGlyph key="rag" />,
      <VisionGlyph key="vision" />,
      <AgentGlyph key="agent" />,
      <ChatGlyph key="chat" />,
      <LayersGlyph key="layers" />,
    ];

    for (const glyph of glyphs) {
      const html = renderToStaticMarkup(glyph);
      expect(html).toContain("<svg");
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('focusable="false"');
    }
  });
});
