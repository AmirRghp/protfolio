import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import LanyardIntro from "./LanyardIntro";

describe("LanyardIntro", () => {
  it("renders an accessible entry loading overlay with interactive prompt button", () => {
    const html = renderToStaticMarkup(
      <LanyardIntro
        onEnter={vi.fn()}
        onDismissed={vi.fn()}
      />,
    );

    expect(html).toContain('data-testid="lanyard-intro"');
    expect(html).toContain('data-state="active"');
    expect(html).toContain('aria-label="Portfolio loading screen"');
    expect(html).toContain('type="button"');
    expect(html).toContain("Pull down to enter");
  });
});
