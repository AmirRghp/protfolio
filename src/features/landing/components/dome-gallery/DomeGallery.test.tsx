import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { setDeviceSnapshotForTesting } from "@/core/utils/responsive";
import { portfolioContent } from "@/data/content";
import { getDetailLayout } from "./detail-layout";
import {
  getDomeLayout,
  itemIndexAt,
  lightFalloff,
  mod,
  sampleSurface,
  screenToPlanar,
  wrapCentered,
} from "./dome";
import { DomeGallery } from "./dome-gallery";
import { DOME_PROJECTS } from "./domeProjects";
import { ProjectModalContent } from "./project-modal-content";

afterEach(() => {
  setDeviceSnapshotForTesting(null);
});

describe("DomeGallery & 3D Paraboloid Math", () => {
  it("maps all 8 real portfolio projects with bespoke WebP artwork and complete tech stacks", () => {
    expect(DOME_PROJECTS).toHaveLength(portfolioContent.projects.length);
    expect(DOME_PROJECTS).toHaveLength(8);

    for (const proj of DOME_PROJECTS) {
      expect(proj.image).toMatch(/assets\/projects\/[a-z0-9-]+\.webp$/);
      expect(proj.techStack.length).toBeGreaterThanOrEqual(6);
      expect(proj.highlights.length).toBeGreaterThanOrEqual(3);
      expect(proj.githubUrl).toMatch(/^https:\/\/github\.com\/AmirRghp\//);
    }
  });

  it("computes concave paraboloid surface poses with center closest to viewer and Gaussian cursor lens", () => {
    const layout = getDomeLayout(1280, 800);
    const centerPose = sampleSurface(0, 0, layout);
    const edgePose = sampleSurface(360, 240, layout);

    expect(centerPose.tz).toBeCloseTo(0, 4);
    expect(edgePose.tz).toBeLessThan(0);
    expect(centerPose.scale).toBeGreaterThan(edgePose.scale);

    // Cursor lens at (0, 0) boosts scale and z-depth near the focal point, scaled by focusStrength
    const focusedPose = sampleSurface(0, 0, layout, 0, 0, 1);
    const halfFocusedPose = sampleSurface(0, 0, layout, 0, 0, 0.5);
    const zeroFocusedPose = sampleSurface(0, 0, layout, 0, 0, 0);

    expect(focusedPose.tz).toBeGreaterThan(halfFocusedPose.tz);
    expect(halfFocusedPose.tz).toBeGreaterThan(centerPose.tz);
    expect(zeroFocusedPose.tz).toBeCloseTo(centerPose.tz, 6);
    expect(focusedPose.scale).toBeGreaterThan(centerPose.scale);
  });

  it("inverts screenToPlanar coordinates accurately across the viewport", () => {
    const layout = getDomeLayout(1280, 800);
    const sx = 220;
    const sy = -140;
    const planar = screenToPlanar(sx, sy, layout);
    const pose = sampleSurface(planar.x, planar.y, layout);

    const projectedSx =
      pose.tx * (layout.perspective / (layout.perspective - pose.tz));
    const projectedSy =
      pose.ty * (layout.perspective / (layout.perspective - pose.tz));

    expect(Math.abs(projectedSx - sx)).toBeLessThan(0.1);
    expect(Math.abs(projectedSy - sy)).toBeLessThan(0.1);
  });

  it("wraps modular coordinates, distributes all projects across every row, and computes smooth radial lightFalloff", () => {
    expect(mod(-3, 8)).toBe(5);
    expect(wrapCentered(510, 1000)).toBe(-490);
    expect(itemIndexAt(0, 0, 8)).toBe(0);
    const rowIndices = new Set(
      [0, 1, 2, 3, 4, 5, 6, 7].map((c) => itemIndexAt(c, 0, 8))
    );
    expect(rowIndices.size).toBe(8);
    expect(lightFalloff(0.2)).toBe(0);
    expect(lightFalloff(1.5)).toBe(1);
  });

  it("computes responsive detail modal layout for desktop row and mobile column", () => {
    const desktop = getDetailLayout(1440, 900);
    const mobile = getDetailLayout(375, 812);

    expect(desktop.direction).toBe("row");
    expect(desktop.panelW).toBeLessThanOrEqual(1020);
    expect(mobile.direction).toBe("column");
    expect(mobile.panelW).toBeLessThanOrEqual(375 - 24);
  });

  it("renders DomeGallery tiles, Selected Work top-left pill badge, and ProjectModalContent with tech stack badges and GitHub CTA", () => {
    const galleryHtml = renderToStaticMarkup(
      <DomeGallery projects={DOME_PROJECTS} />
    );
    expect(galleryHtml).toContain("Selected Work");
    expect(galleryHtml).toContain("COVID-19 Image Classification");
    expect(galleryHtml).toContain("OmniDoc RAG");
    expect(galleryHtml).toContain("OmniOps SRE Agent");
    expect(galleryHtml).toContain("Video KYC");
    expect(galleryHtml).toContain("Kanban Studio");

    const project = DOME_PROJECTS[1]; // OmniDoc RAG
    const detail = getDetailLayout(1280, 800);
    const modalHtml = renderToStaticMarkup(
      <ProjectModalContent
        project={project}
        index={1}
        total={DOME_PROJECTS.length}
        detail={detail}
        mediaRef={createRef()}
        copyRef={createRef()}
        closeBtnRef={createRef()}
        onClose={() => {}}
      />
    );

    expect(modalHtml).toContain("02 / 08");
    expect(modalHtml).toContain(project.title);
    expect(modalHtml).toContain(project.category.replaceAll("&", "&amp;"));
    expect(modalHtml).toContain(project.description.replaceAll("&", "&amp;"));
    expect(modalHtml).toContain(project.architecture);
    expect(modalHtml).toContain("Technology Stack");
    for (const tech of project.techStack) {
      expect(modalHtml).toContain(tech.replaceAll("&", "&amp;"));
    }
    expect(modalHtml).toContain(`href="${project.githubUrl}"`);
    expect(modalHtml).toContain("View on GitHub");

    const mobileDetail = getDetailLayout(375, 812);
    const mobileModalHtml = renderToStaticMarkup(
      <ProjectModalContent
        project={project}
        index={1}
        total={DOME_PROJECTS.length}
        detail={mobileDetail}
        mediaRef={createRef()}
        copyRef={createRef()}
        closeBtnRef={createRef()}
        onClose={() => {}}
      />
    );
    expect(mobileModalHtml).toContain("modalMediaCloseBtn");
    expect(mobileModalHtml.match(/aria-label="Close project details"/g)).toHaveLength(1);
  });

  it("renders flat MobileWorkGrid instead of 3D dome on mobile viewports (< 768px)", () => {
    setDeviceSnapshotForTesting({
      isMobile: true,
      isTablet: false,
      isMobileOrTablet: true,
      isDesktop: false,
      isTouch: true,
      allowRoom3D: false,
    });

    const mobileHtml = renderToStaticMarkup(
      <DomeGallery projects={DOME_PROJECTS} />
    );

    expect(mobileHtml).toContain("Selected Work");
    expect(mobileHtml).toContain("mobileWorkKicker");
    expect(mobileHtml).toContain("Selected work project gallery");
    expect(mobileHtml).not.toContain("Selected work infinite dome gallery");
    for (const proj of DOME_PROJECTS) {
      expect(mobileHtml).toContain(`data-project-id="${proj.id}"`);
    }
  });

  it("renders touch-adapted 3D dome with directional pan buttons on tablet touch viewports", () => {
    setDeviceSnapshotForTesting({
      isMobile: false,
      isTablet: true,
      isMobileOrTablet: true,
      isDesktop: false,
      isTouch: true,
      allowRoom3D: false,
    });

    const tabletHtml = renderToStaticMarkup(
      <DomeGallery projects={DOME_PROJECTS} />
    );

    expect(tabletHtml).toContain("Selected work infinite dome gallery");
    expect(tabletHtml).toContain(
      "Swipe horizontally or use arrows · Tap any card for details"
    );
    expect(tabletHtml).toContain("Pan dome left");
    expect(tabletHtml).toContain("Pan dome right");
  });
});
