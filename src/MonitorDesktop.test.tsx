import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MonitorDesktop, { DesktopWindow, type DesktopApp } from "./MonitorDesktop";

const aboutMe: DesktopApp = {
  id: "about-me",
  label: "about-me.txt",
  title: "about-me.txt",
  icon: <span>doc</span>,
  content: <p>Amirreza Gholipour</p>,
};

describe("monitor desktop", () => {
  it("shows the workspace status bar with a live clock and no open window", () => {
    const html = renderToStaticMarkup(<MonitorDesktop />);

    expect(html).toContain("Amirreza Workspace");
    expect(html).toContain("<time");
    expect(html).toContain("aria-label=\"Amirreza workspace\"");
    expect(html).not.toContain("monitor-window-title");
  });

  it("lists every desktop app in the left column", () => {
    const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} />);

    expect(html).toContain("about-me.txt");
    expect(html).toContain("doc");
  });

  it("renders the window shell with its title and a close control", () => {
    const html = renderToStaticMarkup(
      <DesktopWindow title="about-me.txt" onClose={() => {}}>
        <p>Amirreza Gholipour</p>
      </DesktopWindow>,
    );

    expect(html).toContain("about-me.txt");
    expect(html).toContain("Close");
    expect(html).toContain("Amirreza Gholipour");
  });
});
