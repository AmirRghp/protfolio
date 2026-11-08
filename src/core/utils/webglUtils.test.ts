import { describe, expect, it } from "vitest";
import { parseColor, parseNullableColor } from "./webglUtils";

describe("webglUtils", () => {
  it("parses 6-digit and 3-digit hex colors into normalized RGB tuples", () => {
    expect(parseColor("#ff0080", [0, 0, 0])).toEqual([1, 0, 128 / 255]);
    expect(parseColor("#f0f", [0, 0, 0])).toEqual([1, 0, 1]);
  });

  it("parses rgb() and rgba() strings and clamps out-of-range channels", () => {
    expect(parseColor("rgb(255, 128, 0)", [0, 0, 0])).toEqual([1, 128 / 255, 0]);
    expect(parseColor("rgba(300 0 51 / 0.5)", [0, 0, 0])).toEqual([1, 0, 51 / 255]);
  });

  it("returns null for transparent colors in parseNullableColor", () => {
    expect(parseNullableColor("transparent", [1, 1, 1])).toBeNull();
    expect(parseNullableColor("rgba(0, 0, 0, 0)", [1, 1, 1])).toBeNull();
  });

  it("returns fallback tuple when color string is invalid", () => {
    expect(parseColor("not-a-color", [0.1, 0.2, 0.3])).toEqual([0.1, 0.2, 0.3]);
  });
});
