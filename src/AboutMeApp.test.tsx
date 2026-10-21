import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import AboutMeApp, { AboutMeFileIcon } from "./AboutMeApp";
import { aboutMeApp, desktopApps } from "./desktopApps";
import { portfolioContent } from "./content";

describe("about me file", () => {
  it("renders the owner identity and every experience entry from the shared content", () => {
    const html = renderToStaticMarkup(<AboutMeApp />);

    expect(html).toContain(portfolioContent.owner.name);
    expect(html).toContain(portfolioContent.owner.role);
    for (const role of portfolioContent.owner.experience) {
      expect(html).toContain(role.title);
      expect(html).toContain(role.company);
      expect(html).toContain(role.period);
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
