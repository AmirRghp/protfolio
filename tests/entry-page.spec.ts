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
