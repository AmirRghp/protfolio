import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExitBar, { EXIT_SHUTTER_DURATION_MS } from "./ExitBar";

describe("ExitBar component", () => {
  it("renders the black gooey SVG shape, roller-shutter curtain, and Exit The Room Tactile button without icons", () => {
    const html = renderToStaticMarkup(<ExitBar onExit={() => {}} visible={true} />);

    expect(html).toContain('id="exitbar"');
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).toContain("ebShutter");
    expect(html).toContain('data-shutter-state="idle"');
    expect(html).toContain("Exit The Room");
    expect(html).toContain("tactile-btn");
    expect(html).not.toContain("ledStar");
    expect(EXIT_SHUTTER_DURATION_MS).toBeGreaterThanOrEqual(500);
  });

  it("applies the active class when visible is true", () => {
    const html = renderToStaticMarkup(<ExitBar onExit={() => {}} visible={true} />);

    expect(html).toContain("on");
  });
});
