import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectBoard from "./ProjectBoard";
import { portfolioContent } from "./content";

const project = (id: number) => ({
  id: `project-${id}`,
  title: `Project ${id}`,
  brief: `Brief ${id}`,
  githubUrl: `https://github.com/example/project-${id}` as const,
});

describe("project board", () => {
  it("shows an empty state when no projects exist", () => {
    const html = renderToStaticMarkup(<ProjectBoard projects={[]} selectedProjectId={null} onSelectProject={() => {}} onClose={() => {}} />);

    expect(html).toContain("No projects published yet.");
    expect(html).not.toContain("data-project-id=");
  });

  it("renders the shared project card shape for three and twenty projects", () => {
    for (const projects of [portfolioContent.projects, Array.from({ length: 20 }, (_, index) => project(index + 1))]) {
      const html = renderToStaticMarkup(<ProjectBoard projects={projects} selectedProjectId={null} onSelectProject={() => {}} onClose={() => {}} />);

      expect(html.match(/data-project-id=/g)).toHaveLength(projects.length);
      for (const item of projects) expect(html).toContain(item.title);
    }
  });
});
