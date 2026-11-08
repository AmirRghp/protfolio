import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TactileButton } from "tactile-glass-ui";

describe("TactileButton component", () => {
  it("renders with label text, button element, and canvas without any icons", () => {
    const html = renderToStaticMarkup(<TactileButton>Exit The Room</TactileButton>);

    expect(html).toContain("Exit The Room");
    expect(html).toContain("<button");
    expect(html).toContain("<canvas");
    expect(html).toContain("tactile-btn");
    expect(html).not.toContain("<svg");
  });

  it("renders compact Re-enter button without icons", () => {
    const html = renderToStaticMarkup(
      <TactileButton
        style={{
          "--btn-h": "38px",
          "--btn-pad-h": "18px",
          "--btn-radius": "999px",
          fontSize: "13px",
        } as React.CSSProperties}
      >
        Re-enter
      </TactileButton>,
    );

    expect(html).toContain("Re-enter");
    expect(html).toContain("tactile-btn");
    expect(html).not.toContain("<svg");
  });

  it("renders footer Enter The Room button without icons", () => {
    const html = renderToStaticMarkup(<TactileButton>Enter The Room</TactileButton>);

    expect(html).toContain("Enter The Room");
    expect(html).toContain("tactile-btn");
    expect(html).not.toContain("<svg");
  });
});
