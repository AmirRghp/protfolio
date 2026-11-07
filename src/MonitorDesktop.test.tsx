import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MonitorDesktop, { DesktopWindow, type DesktopApp } from "./MonitorDesktop";
import { oiiaAudio } from "./oiiaAudio";

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
    expect(html).toContain('data-selected="true"');
  });

  it("renders desktop icons without a selected state before an app is opened", () => {
    const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} />);

    expect(html).not.toContain("data-selected");
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

  it("gives the title bar its own keyboard handle and action controls", () => {
    const html = renderToStaticMarkup(
      <DesktopWindow title="about-me.txt" onClose={() => {}} onToggleMaximize={() => {}} />,
    );

    expect(html).toContain("about-me.txt window title bar");
    expect(html).toContain('aria-describedby="monitor-window-move-hint"');
    expect(html).toContain("Use the arrow keys or drag the title bar to move this window");
    expect(html).toContain("Maximize window");
    expect(html).toContain("Close");
    expect(html).toContain("windowControlIcon");
    expect(html).toContain('title="Close"');
  });

  it("labels the window controls precisely in the maximized state", () => {
    const html = renderToStaticMarkup(
      <DesktopWindow
        title="about-me.txt"
        onClose={() => {}}
        onToggleMaximize={() => {}}
        maximized
      />,
    );

    expect(html).toContain("Restore window");
    expect(html).toContain("This window is maximized");
  });

  it("renders the saved local geometry of an open window", () => {
    const html = renderToStaticMarkup(
      <DesktopWindow
        title="about-me.txt"
        onClose={() => {}}
        geometry={{ x: 40, y: 80, width: 640, height: 420 }}
      />,
    );

    expect(html).toContain("left:40px");
    expect(html).toContain("top:80px");
    expect(html).toContain("width:640px");
    expect(html).toContain("height:420px");
  });

  it("renders the GitHub contribution widget on the desktop wallpaper layer", () => {
    const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} />);

    expect(html).toContain("Round the year contribution graph");
    expect(html).toContain("CONTRIBUTIONS");
    expect(html).toContain("STREAK");
  });

  it("shows the Oiia Cat drop sync overlay and hides desktop items during drop rave", () => {
    const originalGetState = oiiaAudio.getState.bind(oiiaAudio);
    oiiaAudio.getState = () => ({
      isPlaying: true,
      currentTime: 35.0,
      duration: 134.0,
      bassEnergy: 0.8,
      overallEnergy: 0.9,
      isDrop: true,
      isMuted: false,
      volume: 0.85,
    });

    try {
      const html = renderToStaticMarkup(<MonitorDesktop apps={[aboutMe]} openAppId="about-me" />);
      expect(html).toContain("oiiaDropSyncOverlay");
      expect(html).toContain("hiddenDuringDrop");
      expect(html).not.toContain("monitor-window-title");
    } finally {
      oiiaAudio.getState = originalGetState;
    }
  });
});
