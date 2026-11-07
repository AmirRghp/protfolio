/**
 * Captures an offscreen 2D canvas copy of the current 3D WebGL scene canvas.
 * Falls back to a clean dark-nocturnal gradient canvas if WebGL is unavailable.
 */
export function captureSceneSnapshot(rootElement?: HTMLElement | null): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  // Select the largest canvas (the 3D WebGL room canvas), avoiding any small UI/button canvases
  const searchRoot = rootElement || (typeof document !== "undefined" ? document.body : null);
  const canvases = searchRoot ? Array.from(searchRoot.querySelectorAll("canvas")) : [];
  const sourceCanvas = canvases.reduce<HTMLCanvasElement | null>((best, c) => {
    const area = (c.width || 0) * (c.height || 0);
    const bestArea = best ? (best.width || 0) * (best.height || 0) : 0;
    return area > bestArea ? c : best;
  }, null);

  if (sourceCanvas && sourceCanvas.width > 0 && sourceCanvas.height > 0) {
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      try {
        ctx.drawImage(sourceCanvas, 0, 0);
        return canvas;
      } catch {
        // Fall back to gradient canvas below
      }
    }
  }

  const width = typeof window !== "undefined" ? window.innerWidth * (window.devicePixelRatio || 1) : 1920;
  const height = typeof window !== "undefined" ? window.innerHeight * (window.devicePixelRatio || 1) : 1080;
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#13161f");
    grad.addColorStop(0.5, "#0b0c10");
    grad.addColorStop(1, "#180d1e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  return canvas;
}
