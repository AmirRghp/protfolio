import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import WorkAccordion from "./WorkAccordion";

describe("WorkAccordion component", () => {
  it("renders all four pillar branches", () => {
    const html = renderToStaticMarkup(<WorkAccordion />);

    expect(html).toContain("Applied AI &amp; RAG");
    expect(html).toContain("Computer Vision");
    expect(html).toContain("Autonomous Agents");
    expect(html).toContain("Pipelines &amp; Fine-tuning");
  });

  it("renders the close button with accessible title and aria-label", () => {
    const html = renderToStaticMarkup(<WorkAccordion />);

    expect(html).toContain('aria-label="Close Applied AI &amp; RAG"');
    expect(html).toContain('title="Close"');
    expect(html).toContain("ldColClose");
    expect(html).toContain("ldColHead");
  });
});
