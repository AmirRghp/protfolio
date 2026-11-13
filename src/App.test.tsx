import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { portfolioContent } from "@/data/content";
import { setDeviceSnapshotForTesting } from "@/core";

describe("portfolio entry page", () => {
  afterEach(() => {
    setDeviceSnapshotForTesting(null);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the owner's name and current role as semantic content", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('<main class="intro"');
    expect(html).toContain("ldNavGlass");
    expect(html).toContain("lg-glass");
    expect(html).not.toContain("data-glisse-backdrop");
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

  it("renders the black lanyard loading overlay with English pull-down prompt on initial load", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('data-testid="lanyard-intro"');
    expect(html).toContain("Pull down to enter");
  });

  it("completely unmounts RoomPreview, disables MagicCursor, and forces flat view on mobile", () => {
    setDeviceSnapshotForTesting({
      isMobile: true,
      isTablet: false,
      isMobileOrTablet: true,
      isDesktop: false,
      isTouch: true,
      allowRoom3D: false,
    });

    const html = renderToStaticMarkup(<App />);

    // View mode is forced to flat
    expect(html).toContain('data-view-mode="flat"');

    // RoomPreview is completely unmounted: no Exit The Room button from RoomPreview's ExitBar
    expect(html).not.toContain("Exit The Room");

    // MagicCursor is not rendered on mobile / touch
    expect(html).not.toContain('data-testid="magic-cursor-frame"');

    // Room re-entry buttons suppressed in FlatLanding
    expect(html).not.toContain("Re-enter");
    expect(html).toContain("Get in Touch");
    expect(html).not.toContain("Enter The Room");
  });

  it("completely unmounts RoomPreview and disables MagicCursor on touch tablets (e.g. iPad)", () => {
    setDeviceSnapshotForTesting({
      isMobile: false,
      isTablet: true,
      isMobileOrTablet: true,
      isDesktop: false,
      isTouch: true,
      allowRoom3D: false,
    });

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('data-view-mode="flat"');
    expect(html).not.toContain("Exit The Room");
    expect(html).not.toContain('data-testid="magic-cursor-frame"');
    expect(html).not.toContain("Re-enter");
    expect(html).toContain("Get in Touch");
  });

  it("mounts RoomPreview and MagicCursor on desktop baseline with fine pointer", () => {
    setDeviceSnapshotForTesting({
      isMobile: false,
      isTablet: false,
      isMobileOrTablet: false,
      isDesktop: true,
      isTouch: false,
      allowRoom3D: true,
    });

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('data-view-mode="room"');
    expect(html).toContain("Exit The Room");
    expect(html).toContain('data-testid="magic-cursor-frame"');
    expect(html).toContain("Re-enter");
    expect(html).toContain("Enter The Room");
  });

  it("unmounts RoomPreview and disables MagicCursor on large touch screens (e.g. iPad Pro landscape)", () => {
    setDeviceSnapshotForTesting({
      isMobile: false,
      isTablet: false,
      isMobileOrTablet: false,
      isDesktop: true,
      isTouch: true,
      allowRoom3D: false,
    });

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('data-view-mode="flat"');
    expect(html).not.toContain("Exit The Room");
    expect(html).not.toContain('data-testid="magic-cursor-frame"');
    expect(html).not.toContain("Re-enter");
    expect(html).toContain("Get in Touch");
    expect(html).not.toContain("Enter The Room");
  });

  it("deep-links directly to flat mode with MobileArcadeModal open on #arcade hash", () => {
    vi.stubGlobal("window", {
      location: { hash: "#arcade", search: "" },
      addEventListener: () => {},
      removeEventListener: () => {},
      innerWidth: 390,
      innerHeight: 844,
    });
    vi.stubGlobal("navigator", { webdriver: false });

    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('data-intro-phase="ready"');
    expect(html).toContain('data-view-mode="flat"');
    expect(html).not.toContain('data-testid="lanyard-intro"');
    expect(html).toContain('data-testid="mobile-arcade-modal"');
  });
});

