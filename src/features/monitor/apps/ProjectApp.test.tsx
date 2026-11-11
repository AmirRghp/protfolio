import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { portfolioContent } from "@/data/content";
import {
  buildGitHubRepoSrcDoc,
  getBundledRepoSnapshot,
  parseGitHubRepoUrl,
  renderMarkdownToHtml,
} from "@/data/githubRepoPreview";
import ProjectApp, {
  AgentGlyph,
  ChatGlyph,
  LayersGlyph,
  RagGlyph,
  ScanGlyph,
  VisionGlyph,
} from "./ProjectApp";

describe("ProjectApp component & GitHub repository in-frame viewer", () => {
  it("renders repository preview with in-window notice and GitHub action link when websiteUrl is absent", () => {
    const project = portfolioContent.projects[0];
    const html = renderToStaticMarkup(
      <ProjectApp project={project} icon={<ScanGlyph />} />,
    );

    expect(html).toContain(project.title);
    expect(html).toContain(project.brief);
    expect(html).toContain("Browse the repository structure and README directly inside this window");
    expect(html).toContain("Open GitHub repository");
    expect(html).toContain("Load inside this window");
    expect(html).toContain("Open in new tab");
    expect(html).toContain(`href="${project.githubUrl}"`);
  });

  it("renders website action link and hides GitHub notice when project has a custom websiteUrl", () => {
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
    expect(html).not.toContain("Browse the repository structure and README directly inside this window");
    expect(html).toContain('href="https://omnidoc.example.com"');
  });

  it("builds a complete GitHub repository srcDoc for every project in portfolioContent", () => {
    for (const project of portfolioContent.projects) {
      const parsed = parseGitHubRepoUrl(project.githubUrl);
      expect(parsed).not.toBeNull();
      expect(parsed?.owner).toBe("AmirRghp");

      const snapshot = getBundledRepoSnapshot(project);
      expect(snapshot.files.length).toBeGreaterThan(0);
      expect(snapshot.readmeMarkdown.length).toBeGreaterThan(50);

      const srcDoc = buildGitHubRepoSrcDoc(project, snapshot);
      expect(srcDoc).toContain("<!doctype html>");
      expect(srcDoc).toContain(snapshot.repo);
      expect(srcDoc).toContain("README.md");
      expect(srcDoc).toContain("Copy clone command");
      expect(srcDoc).toContain(project.githubUrl);
    }
  });

  it("renders markdown headings, code blocks, lists, and relative links safely", () => {
    const md = [
      "# OmniDoc Engine",
      "Built with **PyTorch** and `LangGraph`. See [Config](configs/base.yaml).",
      "- Dense BGE-M3 retrieval",
      "- Sparse BM25 fusion",
      "```bash",
      "pip install -e .",
      "```",
    ].join("\n");

    const html = renderMarkdownToHtml(md, "https://github.com/AmirRghp/omnidoc-rag", "main");
    expect(html).toContain("<h1>OmniDoc Engine</h1>");
    expect(html).toContain("<strong>PyTorch</strong>");
    expect(html).toContain("<code>LangGraph</code>");
    expect(html).toContain('href="https://github.com/AmirRghp/omnidoc-rag/blob/main/configs/base.yaml"');
    expect(html).toContain("<li>Dense BGE-M3 retrieval</li>");
    expect(html).toContain("<pre><code>pip install -e .</code></pre>");
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
