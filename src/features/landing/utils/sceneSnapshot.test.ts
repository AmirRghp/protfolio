import { describe, expect, it } from "vitest";
import { captureSceneSnapshot } from "./sceneSnapshot";

describe("captureSceneSnapshot utility", () => {
  it("returns null when document is undefined (SSR environment)", () => {
    const origDoc = globalThis.document;
    // @ts-expect-error testing undefined document
    delete globalThis.document;
    try {
      const res = captureSceneSnapshot(null);
      expect(res).toBeNull();
    } finally {
      globalThis.document = origDoc;
    }
  });

  it("selects the largest canvas (the 3D WebGL scene) rather than small button canvases", () => {
    const smallBtnCanvas = {
      width: 160,
      height: 44,
    } as unknown as HTMLCanvasElement;

    const roomCanvas = {
      width: 1920,
      height: 1080,
    } as unknown as HTMLCanvasElement;

    const mockRoot = {
      querySelectorAll: (selector: string) => (selector === "canvas" ? [smallBtnCanvas, roomCanvas] : []),
    } as unknown as HTMLElement;

    const mockCreatedCanvas = {
      width: 0,
      height: 0,
      getContext: () => ({
        drawImage: () => {},
      }),
    };

    const origDoc = globalThis.document;
    globalThis.document = {
      createElement: (tag: string) => (tag === "canvas" ? mockCreatedCanvas : {}),
      body: mockRoot,
    } as unknown as Document;

    try {
      const snapshot = captureSceneSnapshot(mockRoot);
      expect(snapshot).not.toBeNull();
      expect(snapshot!.width).toBe(1920);
      expect(snapshot!.height).toBe(1080);
    } finally {
      globalThis.document = origDoc;
    }
  });
});
