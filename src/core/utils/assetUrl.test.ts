import { describe, expect, it } from "vitest";
import { getAssetUrl } from "./assetUrl";

describe("getAssetUrl", () => {
  it("prepends BASE_URL to paths without leading slash", () => {
    const url = getAssetUrl("assets/models/cup.glb");
    expect(url).toBe(`${import.meta.env.BASE_URL}assets/models/cup.glb`);
  });

  it("prepends BASE_URL to paths with leading slash without creating duplicate slashes", () => {
    const url = getAssetUrl("/assets/lanyard-photo.webp");
    expect(url).toBe(`${import.meta.env.BASE_URL}assets/lanyard-photo.webp`);
    expect(url).not.toContain("//assets");
  });

  it("handles nested asset paths correctly", () => {
    const url = getAssetUrl("assets/audio/oiia-spinning-cat.mp3");
    expect(url).toBe(`${import.meta.env.BASE_URL}assets/audio/oiia-spinning-cat.mp3`);
  });
});
