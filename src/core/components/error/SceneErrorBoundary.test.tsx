import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SceneErrorBoundary } from "./SceneErrorBoundary";

describe("SceneErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    const html = renderToStaticMarkup(
      <SceneErrorBoundary fallback={<div data-testid="fallback">Fallback</div>}>
        <div data-testid="content">Scene Ready</div>
      </SceneErrorBoundary>,
    );
    expect(html).toContain("Scene Ready");
    expect(html).not.toContain("Fallback");
  });

  it("derives error state and invokes onError callback when a child fails", () => {
    const onError = vi.fn();
    const state = SceneErrorBoundary.getDerivedStateFromError();
    expect(state).toEqual({ hasError: true });

    const instance = new SceneErrorBoundary({
      children: null,
      fallback: <span>Recovered</span>,
      onError,
    });
    instance.state = state;
    const error = new Error("GLB chunk load failed");
    instance.componentDidCatch(error, { componentStack: "RoomScene" });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(error, { componentStack: "RoomScene" });
    const fallbackHtml = renderToStaticMarkup(<>{instance.render()}</>);
    expect(fallbackHtml).toContain("Recovered");
  });
});
