import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExitBar from "./ExitBar";

describe("ExitBar component", () => {
  it("renders the gooey SVG shape and Exit The Room LED button", () => {
    const html = renderToStaticMarkup(<ExitBar onExit={() => {}} visible={true} />);

    expect(html).toContain('id="exitbar"');
    expect(html).toContain("<svg");
    expect(html).toContain("<path");
    expect(html).toContain("Exit The Room");
  });

  it("applies the active class when visible is true", () => {
    const html = renderToStaticMarkup(<ExitBar onExit={() => {}} visible={true} />);

    expect(html).toContain("on");
  });
});
