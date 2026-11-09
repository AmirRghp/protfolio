import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import FlatLanding from "./FlatLanding";
import { portfolioContent } from "@/data/content";

describe("FlatLanding component", () => {
  it("renders the sticky header with Re-enter button, logo, and glisse Glass backdrop", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("AG");
    expect(html).toContain("AI Engineer");
    expect(html).toContain("Re-enter");
    expect(html).toContain("ldNavGlass");
    expect(html).toContain("lg-glass");
    expect(html).toContain("data-glisse-backdrop");
  });

  it("renders hero frame with looping ASCII room video and without featured card badge", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("<video");
    expect(html).toContain("ascii-room.webm");
    expect(html).toContain("ascii-room.webp");
    expect(html).toContain('aria-label="Nocturnal Room ASCII Loop"');
    expect(html).not.toContain("ldReelCap");
  });

  it("renders semantic h1 with owner name and full bio", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain('<main class="intro"');
    expect(html).toContain('data-glisse-backdrop');
    expect(html).toContain('id="name"');
    expect(html).toContain(portfolioContent.owner.name);
    expect(html).toContain(portfolioContent.owner.role);
    expect(html).toContain(portfolioContent.owner.headline.replaceAll("&", "&amp;"));
  });

  it("renders Hero CTA buttons with Glisse 'See my work' and ghost 'Get in Touch' scrolling to contact", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("See my work");
    expect(html).toContain("Get in Touch");
    expect(html).toContain('href="#ld-contact"');
    expect(html).not.toContain("Start a conversation");
  });

  it("renders capabilities strip with all 6 disciplines", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("Applied AI &amp; RAG");
    expect(html).toContain("Deep Learning &amp; PyTorch");
    expect(html).toContain("Computer Vision");
    expect(html).toContain("Autonomous Agents");
    expect(html).toContain("FastAPI &amp; MLOps");
    expect(html).toContain("Product Management");
  });

  it("renders the four work branches and all project cards", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("Applied AI &amp; RAG");
    expect(html).toContain("Computer Vision");
    expect(html).toContain("Autonomous Agents");
    expect(html).toContain("Pipelines &amp; Fine-tuning");

    for (const project of portfolioContent.projects) {
      expect(html).toContain(project.title);
      expect(html).toContain(`href="${project.githubUrl}"`);
    }
  });

  it("renders experience, education, and footer with Enter The Room button", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    for (const exp of portfolioContent.owner.experience) {
      expect(html).toContain(exp.company);
      if (exp.title) expect(html).toContain(exp.title);
      expect(html).toContain(exp.period);
    }

    for (const edu of portfolioContent.owner.education) {
      expect(html).toContain(edu.institution);
      expect(html).toContain(edu.degree);
    }

    expect(html).toContain("Enter The Room");
    expect(html).toContain(portfolioContent.owner.email);
    expect(html).toContain(portfolioContent.owner.githubUrl);
    expect(html).toContain("AMIRREZA GHOLIPOUR");
    expect(html).toContain("BACK TO TOP");
    expect(html).toContain("role=\"presentation\"");
  });

  it("renders key metrics in the numbers section with data-count for numeric metrics", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain('data-count="9"');
    expect(html).toContain("M.Sc.");
    expect(html).toContain("Babol, IR");
    expect(html).toContain("BASED");
    expect(html).toContain("UTC+3:30");
    expect(html).toContain("INTERNATIONAL");
    expect(html).toContain("OPEN");
    expect(html).toContain("RELOCATE OR REMOTE");
    expect(html).toContain("MUST · 2024–Present");
  });

  it("renders About Me kicker and updated statement text", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("About Me");
    expect(html).toContain("First and foremost, I thrive on challenging and distinctive engineering work.");
    expect(html).toContain("Beyond continuous learning, collaborative teamwork is my favorite part of engineering");
  });

  it("renders Tech Stack section between experience and contact with filter tabs and technology chips", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain('id="ld-techstack"');
    expect(html).toContain("Stacks");
    expect(html).toContain("Tech Stack");
    expect(html).toContain("( select tab to filter )");
    expect(html).toContain("Languages");
    expect(html).toContain("Frontend");
    expect(html).toContain("Backend");
    expect(html).toContain("Databases");
    expect(html).toContain("DevOps &amp; Cloud");
    expect(html).toContain("Data &amp; AI");
    expect(html).toContain("PyTorch");
    expect(html).toContain("LangChain");
    expect(html).toContain("Docker");
    expect(html).toContain("React");
    expect(html).toContain('href="#ld-techstack"');
  });

  it("renders Github Activity section between tech stack and contact with 3D skyline canvas and replay button", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain('id="ld-activity"');
    expect(html).toContain("Activity");
    expect(html).toContain("Github Activity");
    expect(html).toContain("( 3D skyline of contributions )");
    expect(html).toContain('aria-label="GitHub contribution 3D skyline');
    expect(html).toContain("Replay");
    expect(html).toContain('href="#ld-activity"');

    // Verify ordering in HTML: ld-techstack appears before ld-activity, which appears before ld-contact
    const techIdx = html.indexOf('id="ld-techstack"');
    const actIdx = html.indexOf('id="ld-activity"');
    const contactIdx = html.indexOf('id="ld-contact"');
    expect(techIdx).toBeGreaterThan(-1);
    expect(actIdx).toBeGreaterThan(techIdx);
    expect(contactIdx).toBeGreaterThan(actIdx);
  });

  it("renders with clean styles without lingering opacity: 0 on ldPage container", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).not.toContain('style="opacity: 0;"');
    expect(html).toContain("ldPage");
    expect(html).toContain("ldHero");
  });

  it("renders the interactive LiquidGrid background container when open", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("ldBackground");
    expect(html).toContain("<canvas");
  });

  it("does not render the LiquidGrid background container when closed", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={false} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).not.toContain("ldBackground");
  });

  it("renders the unified live-video portal with transition image backing and digital scanline overlay inside the hero reel", () => {
    const html = renderToStaticMarkup(
      <FlatLanding isOpen={true} snapshotCanvas={null} onReenter={() => {}} />,
    );

    expect(html).toContain("ldTransitionImg");
    expect(html).toContain("ascii-room.webp");
    expect(html).toContain("ldReelVideo");
    expect(html).toContain("ldPortalFx");
    expect(html).toContain("ldMatrixGrid");
    expect(html).toContain("ldScanCrest");
  });

  it("suppresses room re-entry buttons and provides Get in Touch pill when allowRoomEntry is false", () => {
    const html = renderToStaticMarkup(
      <FlatLanding
        isOpen={true}
        snapshotCanvas={null}
        onReenter={() => {}}
        allowRoomEntry={false}
      />,
    );

    // Header CTA: No Re-enter button, has Get in Touch anchor
    expect(html).not.toContain("Re-enter");
    expect(html).toContain("Get in Touch");
    expect(html).toContain('href="#ld-contact"');
    expect(html).toContain("ldNavContactBtn");

    // Footer CTA: No Enter The Room container
    expect(html).not.toContain("Enter The Room");
    expect(html).not.toContain("ldFootCta");
  });

  it("renders Re-enter in header and Enter The Room in footer when allowRoomEntry is true", () => {
    const html = renderToStaticMarkup(
      <FlatLanding
        isOpen={true}
        snapshotCanvas={null}
        onReenter={() => {}}
        allowRoomEntry={true}
      />,
    );

    expect(html).toContain("Re-enter");
    expect(html).toContain("Enter The Room");
    expect(html).toContain("ldFootCta");
  });
});

