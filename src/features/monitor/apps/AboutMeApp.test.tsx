import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AboutMeApp, { AboutMeFileIcon } from "./AboutMeApp";
import { aboutMeApp, desktopApps } from "@/features/monitor/components/desktopApps";
import { portfolioContent } from "@/data/content";

describe("about me file", () => {
  it("renders the owner identity, bio, experience, education, skills, courses, and projects from the shared content", () => {
    const html = renderToStaticMarkup(<AboutMeApp />);

    expect(html).toContain(portfolioContent.owner.name);
    expect(html).toContain(portfolioContent.owner.role);
    expect(html).toContain(portfolioContent.owner.email);
    expect(html).toContain(portfolioContent.owner.location);
    expect(html).toContain(portfolioContent.owner.githubUrl);
    expect(html).toContain("GitHub Profile");
    expect(html).not.toContain("View Resume PDF");

    for (const role of portfolioContent.owner.experience) {
      expect(html).toContain(role.title);
      expect(html).toContain(role.company);
      expect(html).toContain(role.period);
    }

    for (const edu of portfolioContent.owner.education) {
      expect(html).toContain(edu.field);
      expect(html).toContain(edu.institution);
    }

    for (const group of portfolioContent.owner.skillGroups) {
      expect(html).toContain(group.category.replaceAll("&", "&amp;"));
      for (const skill of group.skills) {
        expect(html).toContain(skill.name.replaceAll("&", "&amp;"));
        if (skill.level) {
          expect(html).toContain(skill.level);
        }
      }
    }

    for (const course of portfolioContent.owner.courses) {
      expect(html).toContain(course.provider);
    }

    for (const project of portfolioContent.projects) {
      expect(html).toContain(project.title);
      expect(html).toContain(`href="${project.githubUrl}"`);
    }
  });

  it("exposes the file as a desktop app that opens on a double click", () => {
    expect(aboutMeApp.id).toBe("about-me");
    expect(aboutMeApp.label).toBe("about-me.txt");
    expect(aboutMeApp.title).toBe("about-me.txt");
    expect(aboutMeApp.activation).toBe("double-click");
    expect(desktopApps.map((app) => app.id)).toContain("about-me");
  });

  it("draws a document icon for the file", () => {
    const html = renderToStaticMarkup(<AboutMeFileIcon />);

    expect(html).toContain("<svg");
  });
});
