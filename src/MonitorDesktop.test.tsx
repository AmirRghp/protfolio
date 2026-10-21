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

  it("renders the window owned by the room state", () => {
    const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} openAppId="about-me" />);

    expect(html).toContain("monitor-window-title");
    expect(html).toContain("Amirreza Gholipour");
  });

  it("does not render a window for an app that is not on the desktop", () => {
    const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} openAppId="missing" />);

    expect(html).not.toContain("monitor-window-title");
  });

  it("keeps a single click as the default activation of a desktop app", () => {
    const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} />);

    expect(html).not.toContain("aria-describedby");
    expect(html).not.toContain("Double-click");
  });

  it("describes every way a file that needs a double click can be opened", () => {
    const html = renderToStaticMarkup(
      <MonitorDesktop apps={[{ ...aboutMe, activation: "double-click" }]} />,
    );

    expect(html).toContain('aria-describedby="about-me-activation-hint"');
    expect(html).toContain("Double-click, double tap, or press Enter to open");
  });

  it("keeps the window content reachable with the keyboard", () => {
    const html = renderToStaticMarkup(
      <DesktopWindow title="about-me.txt" onClose={() => {}}>
        <p>Amirreza Gholipour</p>
      </DesktopWindow>,
    );

    expect(html).toContain('tabindex="0"');
    expect(html).toContain('role="group"');
  });
});
