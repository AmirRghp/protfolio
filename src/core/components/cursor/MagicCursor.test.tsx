import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MagicCursor, { OriginkitMagicCursor } from "./MagicCursor";

describe("MagicCursor component", () => {
  it("renders non-blocking container with pointerEvents none and high zIndex", () => {
    const html = renderToStaticMarkup(<MagicCursor />);

    expect(html).toContain('data-testid="magic-cursor-frame"');
    expect(html).toContain("pointer-events:none");
    expect(html).toContain("z-index:99999");
    expect(html).toContain("position:fixed");
  });

  it("renders SVG arrow with fill color #FFFFFF by default", () => {
    const html = renderToStaticMarkup(<MagicCursor />);

    expect(html).toContain("<svg");
    expect(html).toContain('fill="#FFFFFF"');
    expect(html).toContain('d="M0,0 L18,11 L9,13 L6,21 Z"');
  });

  it("does not render label when label=false", () => {
    const html = renderToStaticMarkup(<MagicCursor label={false} />);

    expect(html).not.toContain("HOVER AROUND");
  });

  it("renders custom fill color when overridden", () => {
    const html = renderToStaticMarkup(<OriginkitMagicCursor fillColor="#FF0000" />);

    expect(html).toContain('fill="#FF0000"');
  });
});
