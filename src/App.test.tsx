import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("portfolio entry page", () => {
  it("renders the owner's name and current role as semantic content", () => {
    const html = renderToStaticMarkup(<App />);

    expect(html).toContain('<main class="intro" aria-labelledby="name">');
    expect(html).toContain("<h1 id=\"name\">Amirreza Gholipour</h1>");
    expect(html).toContain("AI Engineer");
  });
});
