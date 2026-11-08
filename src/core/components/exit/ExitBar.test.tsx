import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExitBar from "./ExitBar";

describe("ExitBar component", () => {
  it("renders the black gooey SVG shape and Exit The Room Tactile button without icons", () => {
    const html = renderToStaticMarkup(<ExitBar onExit={() => {}} visible={true} />);

    expect(html).toContain('id="exitbar"');
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).toContain("Exit The Room");
    expect(html).toContain("tactile-btn");
    expect(html).not.toContain("ledStar");
  });

  it("applies the active class when visible is true", () => {
    const html = renderToStaticMarkup(<ExitBar onExit={() => {}} visible={true} />);

    expect(html).toContain("on");
  });
});
