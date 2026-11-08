import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GithubActivitySection } from "./GithubActivitySection";

describe("GithubActivitySection", () => {
  it("renders header with kicker, title, and hint", () => {
    const html = renderToStaticMarkup(<GithubActivitySection />);
    expect(html).toContain("Activity");
    expect(html).toContain("Github Activity");
    expect(html).toContain("( 3D skyline of contributions )");
  });

  it("does not render the removed card head with '02 As a city' text", () => {
    const html = renderToStaticMarkup(<GithubActivitySection />);
    expect(html).not.toContain(">02<");
    expect(html).not.toContain("As a city");
    expect(html).not.toContain("Every day becomes a building");
  });

  it("renders canvas element with accessible label and replay button", () => {
    const html = renderToStaticMarkup(<GithubActivitySection />);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="GitHub contribution 3D skyline');
    expect(html).toContain("Replay");
    expect(html).toContain("github.com/AmirRghp");
  });
});
