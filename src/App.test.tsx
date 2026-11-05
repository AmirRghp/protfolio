import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "./App";
import { portfolioContent } from "./content";

describe("portfolio entry page", () => {
  it("renders the owner's name and current role as semantic content", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('<main class="intro" aria-labelledby="name">');
    expect(html).toContain(`<h1 id="name">${portfolioContent.owner.name}</h1>`);
    expect(html).toContain(portfolioContent.owner.role);
  });

  it("renders every experience entry and project from the shared content", () => {
    const html = renderToStaticMarkup(<App />);

    for (const role of portfolioContent.owner.experience) {
      expect(html).toContain(role.company);
      expect(html).toContain(role.title);
      expect(html).toContain(role.period);
    }

    for (const project of portfolioContent.projects) {
      expect(html).toContain(project.title);
      expect(html).toContain(project.brief.replaceAll("&", "&amp;").replaceAll("'", "&#x27;"));
      expect(html).toContain(`href="${project.githubUrl}"`);
    }
  });

  it("keeps project identifiers unique and links each card to its GitHub repository", () => {
    const ids = portfolioContent.projects.map((project) => project.id);
    const urls = portfolioContent.projects.map((project) => project.githubUrl);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toEqual([
      "https://github.com/AmirRghp/COVID-Image-Classification-with-PyTorch",
      "https://github.com/AmirRghp/omnidoc-rag",
      "https://github.com/AmirRghp/omnidoc_vision",
      "https://github.com/AmirRghp/omniops-sre-agent",
      "https://github.com/AmirRghp/enterprise-knowledge-copilot",
      "https://github.com/AmirRghp/laya-finetune",
    ]);
  });
});
