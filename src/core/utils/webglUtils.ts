let cachedSoftwareGl: boolean | null = null;
let colorProbe: CanvasRenderingContext2D | null = null;

export function detectSoftwareGl(): boolean {
  if (cachedSoftwareGl !== null) {
    return cachedSoftwareGl;
  }
  if (typeof document === "undefined") {
    return false;
  }
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) {
      cachedSoftwareGl = true;
      return true;
    }
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    cachedSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    return cachedSoftwareGl;
  } catch {
    cachedSoftwareGl = false;
    return false;
  }
}

export function resetSoftwareGlCacheForTests(): void {
  cachedSoftwareGl = null;
}

export function parseNullableColor(
  value: string,
  fallback: [number, number, number] | null,
): [number, number, number] | null {
  const clean = value.trim();
  if (clean.toLowerCase() === "transparent") {
    return null;
  }

  const hexMatch = clean.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16) / 255,
        parseInt(hex[1] + hex[1], 16) / 255,
        parseInt(hex[2] + hex[2], 16) / 255,
      ];
    }
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    ];
  }

  const rgbMatch = clean.match(
    /^rgba?\(\s*([\d.]+)\s*[\s,]\s*([\d.]+)\s*[\s,]\s*([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/i,
  );
  if (rgbMatch) {
    if (rgbMatch[4] !== undefined && Number(rgbMatch[4]) === 0) {
      return null;
    }
    return [
      Math.min(255, Math.max(0, Number(rgbMatch[1]))) / 255,
      Math.min(255, Math.max(0, Number(rgbMatch[2]))) / 255,
      Math.min(255, Math.max(0, Number(rgbMatch[3]))) / 255,
    ];
  }

  if (typeof document === "undefined") {
    return fallback;
  }
  try {
    if (!colorProbe) {
      colorProbe = document.createElement("canvas").getContext("2d");
    }
    if (!colorProbe) {
      return fallback;
    }
    colorProbe.fillStyle = "#000000";
    colorProbe.fillStyle = clean;
    const resolved = colorProbe.fillStyle;
    if (resolved.startsWith("#")) {
      const n = Number.parseInt(resolved.slice(1), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }
    const match = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(resolved);
    if (!match) {
      return fallback;
    }
    if (match[4] !== undefined && Number(match[4]) === 0) {
      return null;
    }
    return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
  } catch {
    return fallback;
  }
}

export function parseColor(
  value: string,
  fallback: [number, number, number],
): [number, number, number] {
  return parseNullableColor(value, fallback) ?? fallback;
}
