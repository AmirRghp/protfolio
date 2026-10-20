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
  const canvas = page.locator("canvas");
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
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
  await page.getByRole("link", { name: "Read portfolio" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
});


test("a lost GPU context falls back without removing the HTML portfolio", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    return !!canvas?.getContext("webgl2")?.getExtension("WEBGL_lose_context");
  })).toBe(true);
  await page.evaluate(() => {
    document.querySelector("canvas")!.getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext();
  });
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
});
