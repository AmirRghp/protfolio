import { expect, test } from "@playwright/test";

test("production entry page loads without browser errors or horizontal overflow", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.locator(".intro__role")).toHaveText("AI Engineer");
  await expect(page.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Selected projects" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View Enterprise Knowledge Copilot on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/AmirRghp/enterprise-knowledge-copilot",
  );
  await expect(page.getByRole("link", { name: "View Laya Fine-tuning Pipeline on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/AmirRghp/laya-finetune",
  );
  await expect(page.getByRole("link", { name: "View Freelance Project Radar on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/AmirRghp/freelance-project-radar",
  );

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `page overflows horizontally at ${width}px`,
    ).toBe(true);
  }

  await page.screenshot({ path: testInfo.outputPath("entry-page.png"), fullPage: true });
  expect(browserErrors).toEqual([]);
});

test("room fills the viewport and keeps the HTML path keyboard accessible", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  await expect(canvas).toBeVisible();
  await expect.poll(() => canvas.evaluate((element) => Math.round(element.getBoundingClientRect().height))).toBe(900);
  await expect(page.getByText("The 3D view is unavailable.")).not.toBeVisible();
  await page.getByRole("link", { name: "Read portfolio" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "View Enterprise Knowledge Copilot on GitHub" })).toBeFocused();
  await expect(page.locator(":focus")).toHaveCSS("outline-style", "solid");

  await page.evaluate(() => window.scrollTo(0, 0));
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(canvas).toBeVisible();
    await expect.poll(() => canvas.evaluate((element) => Math.round(element.getBoundingClientRect().height))).toBe(900);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForTimeout(350);
    await page.screenshot({ path: testInfo.outputPath(`room-${width}.png`) });
  }
  expect(browserErrors).toEqual([]);
});

test("unavailable WebGL preserves all portfolio content and links", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes("webgl")) return null;
      return original.call(this, type as "2d", ...args);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("The 3D view is unavailable.");
  await expect(page.getByRole("heading", { name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.getByRole("button", { name: "Back to room", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
  await page.getByRole("link", { name: "Read portfolio" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
});


test("a lost wallpaper context leaves the room usable and stops its frame loop", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("canvas[data-engine]")).toBeVisible();
  const wallpaper = page.locator('[aria-label="Amirreza workspace"] canvas');
  await expect(wallpaper).toHaveCount(1);

  await page.evaluate(() => {
    type Stats = { wallpaperDraws: number };
    const stats: Stats = { wallpaperDraws: 0 };
    (window as unknown as { __r09WallpaperStats: Stats }).__r09WallpaperStats = stats;
    (window as unknown as { __r09WallpaperLost: boolean }).__r09WallpaperLost = false;
    const wallpaper = document.querySelector('[aria-label="Amirreza workspace"] canvas');
    wallpaper?.addEventListener("webglcontextlost", () => {
      (window as unknown as { __r09WallpaperLost: boolean }).__r09WallpaperLost = true;
    }, { once: true });
    const prototypes = [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype];
    for (const proto of prototypes) {
      if (!proto) continue;
      const record = proto as unknown as Record<string, unknown>;
      for (const name of ["drawArrays", "drawElements", "drawArraysInstanced", "drawElementsInstanced"]) {
        const original = record[name];
        if (typeof original !== "function") continue;
        record[name] = function (this: WebGLRenderingContext, ...args: unknown[]) {
          const canvas = this.canvas;
          if (!(canvas instanceof HTMLCanvasElement) || !canvas.dataset.engine) stats.wallpaperDraws += 1;
          return (original as (...params: unknown[]) => unknown).apply(this, args);
        };
      }
    }
  });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.getByRole("region", { name: "Amirreza workspace" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __r09WallpaperStats: { wallpaperDraws: number } }
  ).__r09WallpaperStats.wallpaperDraws)).toBeGreaterThan(3);

  await wallpaper.evaluate((canvas) => {
    (canvas as HTMLCanvasElement).getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await expect.poll(() => page.evaluate(() => (
    window as unknown as { __r09WallpaperLost: boolean }
  ).__r09WallpaperLost)).toBe(true);
  // Let the lost-context task finish before measuring the animation loop that follows it.
  await page.waitForTimeout(100);
  const afterLossStart = await page.evaluate(() => (
    window as unknown as { __r09WallpaperStats: { wallpaperDraws: number } }
  ).__r09WallpaperStats.wallpaperDraws);
  await page.waitForTimeout(1000);
  const afterLossEnd = await page.evaluate(() => (
    window as unknown as { __r09WallpaperStats: { wallpaperDraws: number } }
  ).__r09WallpaperStats.wallpaperDraws);

  expect(afterLossEnd - afterLossStart).toBeLessThan(5);
  await expect(page.locator("canvas[data-engine]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
  await expect(page.getByText("The 3D view is unavailable.")).not.toBeVisible();
});

test("a lost GPU context falls back without removing the HTML portfolio", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('canvas[data-engine]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-engine]');
    return !!canvas?.getContext("webgl2")?.getExtension("WEBGL_lose_context");
  })).toBe(true);
  await page.evaluate(() => {
    document.querySelector<HTMLCanvasElement>('canvas[data-engine]')!.getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext();
  });
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
});
