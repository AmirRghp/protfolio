import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { portfolioContent, projectTarget } from "./content";
import { aboutMeApp, desktopApps, projectApps } from "./desktopApps";
import { clampIconOffset } from "./desktopDrag";
import ProjectApp from "./ProjectApp";

describe("desktop apps", () => {
  it("turns every project of the shared content into an app", () => {
    expect(projectApps.map((app) => app.id)).toEqual(portfolioContent.projects.map((project) => project.id));
    expect(desktopApps).toHaveLength(portfolioContent.projects.length + 1);
    expect(desktopApps[0]).toBe(aboutMeApp);

    for (const project of portfolioContent.projects) {
      const app = projectApps.find((candidate) => candidate.id === project.id)!;
      expect(app.title).toBe(project.title);
      expect(app.label).toBe(project.title);
      expect(app.activation).toBe("double-click");
    }
  });

  it("uses the website of a project when it has one and the repository otherwise", () => {
    const project = portfolioContent.projects[0];

    expect(projectTarget(project)).toBe(project.githubUrl);
    expect(projectTarget({ ...project, websiteUrl: "https://example.com/copilot" })).toBe("https://example.com/copilot");
  });

  it("shows the address, the summary and a direct link of a project", () => {
    const project = portfolioContent.projects[0];
    const html = renderToStaticMarkup(<ProjectApp project={project} icon={<span>glyph</span>} />);

    expect(html).toContain("github.com/AmirRghp/enterprise-knowledge-copilot");
    expect(html).toContain(`href="${project.githubUrl}"`);
    expect(html).toContain(project.title);
    expect(html).toContain(project.brief);
    expect(html).toContain("Authorized documents");
  });

  it("keeps a dragged icon inside the desktop", () => {
    const base = { x: 20, y: 60, width: 60, height: 60 };
    const bounds = { width: 1000, height: 600, top: 30 };

    expect(clampIconOffset(base, { x: 5000, y: 5000 }, bounds)).toEqual({ x: 920, y: 480 });
    expect(clampIconOffset(base, { x: -5000, y: -5000 }, bounds)).toEqual({ x: -20, y: -30 });
    expect(clampIconOffset(base, { x: 120, y: 40 }, bounds)).toEqual({ x: 120, y: 40 });
  });
});
