import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PixelTetris } from "./PixelTetris";

describe("PixelTetris component", () => {
  it("renders a canvas element within container during SSR", () => {
    const html = renderToStaticMarkup(
      <PixelTetris
        cellSize={20}
        gap={1}
        rounded={20}
        boardColor="rgba(255, 255, 255, 0.059)"
        colors={["#FFFFFF", "#FFFFFF"]}
      />,
    );

    expect(html).toContain("<canvas");
    expect(html).toContain('role="presentation"');
    expect(html).toContain('aria-hidden="true"');
  });

  it("renders with transparent boardColor by default", () => {
    const html = renderToStaticMarkup(<PixelTetris />);
    expect(html).toContain("<canvas");
  });

  it("applies custom className and style correctly", () => {
    const html = renderToStaticMarkup(
      <PixelTetris
        className="test-tetris-class"
        style={{ height: "220px", opacity: 0.9 }}
      />,
    );

    expect(html).toContain("test-tetris-class");
    expect(html).toContain("height:220px");
  });

  it("supports responsive mobileCellSize, mobileMaxStackHeight, and mobilePrefillRows props", () => {
    const html = renderToStaticMarkup(
      <PixelTetris
        cellSize={20}
        mobileCellSize={10}
        maxStackHeight={6}
        mobileMaxStackHeight={9}
        prefillRows={5}
        mobilePrefillRows={7}
      />,
    );

    expect(html).toContain("<canvas");
    expect(html).toContain('role="presentation"');
  });
});
