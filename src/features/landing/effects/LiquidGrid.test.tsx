import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LiquidGrid from "./LiquidGrid";

describe("LiquidGrid component", () => {
  it("renders a canvas element without crashing in static markup", () => {
    const html = renderToStaticMarkup(
      <LiquidGrid
        mode="dots"
        background="#000000"
        lineColor="#FFFFFF1A"
        glowColor="#2F2F2F"
        cellSize={16}
        lineWidth={1}
        radius={58}
        intensity={10}
        collide={true}
        clickRipple={true}
      />,
    );

    expect(html).toContain("<canvas");
    expect(html).toContain('pointer-events:none');
  });

  it("applies custom className and custom style", () => {
    const html = renderToStaticMarkup(
      <LiquidGrid
        className="custom-grid-canvas"
        style={{ opacity: 0.8 }}
      />,
    );

    expect(html).toContain('class="custom-grid-canvas"');
    expect(html).toContain("opacity:0.8");
  });

  it("renders with lines mode without crashing", () => {
    const html = renderToStaticMarkup(
      <LiquidGrid mode="lines" cellSize={24} lineWidth={2} intensity={25} />,
    );

    expect(html).toContain("<canvas");
  });
});
