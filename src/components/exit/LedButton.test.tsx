import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LedButton from "./LedButton";

describe("LedButton component", () => {
  it("renders with label, button element, and star SVG by default", () => {
    const html = renderToStaticMarkup(<LedButton label="Exit The Room" />);

    expect(html).toContain("Exit The Room");
    expect(html).toContain("<button");
    expect(html).toContain("<canvas");
    expect(html).toContain("<svg");
    expect(html).toContain("led");
  });

  it("renders small size when specified", () => {
    const html = renderToStaticMarkup(<LedButton label="Re-enter" size="sm" />);

    expect(html).toContain("Re-enter");
    expect(html).toContain("ledSm");
  });

  it("omits star icon when star prop is false", () => {
    const html = renderToStaticMarkup(<LedButton label="Plain" star={false} />);

    expect(html).toContain("Plain");
    expect(html).not.toContain("ledStar");
  });
});
