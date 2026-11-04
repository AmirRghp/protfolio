import { expect, test } from "@playwright/test";

test("project board supports selection, hierarchical return and keyboard focus", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?destination=board");

  const panel = page.getByRole("dialog", { name: "Project board" });
  await expect(panel.getByRole("heading", { name: "Selected projects" })).toBeFocused();
  await expect(page.getByText("Focused on Project board.")).toBeVisible();
  await expect.poll(() => page.locator('canvas[data-engine]').evaluate((canvas) => (canvas as HTMLCanvasElement).width)).toBeGreaterThan(300);
  await page.locator('canvas[data-engine]').screenshot({ path: testInfo.outputPath("project-board-scene.png") });
  const project = panel.getByRole("button", { name: "Open Enterprise Knowledge Copilot" });
  await project.click();
  await expect(panel.getByRole("heading", { name: "Enterprise Knowledge Copilot" })).toBeFocused();
  await expect(panel.getByText(/self-hosted assistant that retrieves/)).toBeVisible();
  await expect(panel.getByRole("link", { name: "View on GitHub" })).toHaveAttribute(
    "href",
    "https://github.com/AmirRghp/enterprise-knowledge-copilot",
  );

  await page.keyboard.press("Escape");
  await expect(project).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
  await expect(page.locator('[class*="preview"]')).toBeFocused();
});

test("project board remains readable and scrollable at target widths", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/?destination=board");
    const panel = page.getByRole("dialog", { name: "Project board" });
    await expect(panel.getByRole("button", { name: "Close board · Back to room" })).toBeInViewport();
    await panel.getByRole("button", { name: "Open Freelance Project Radar" }).scrollIntoViewIfNeeded();
    await expect(panel.getByRole("button", { name: "Open Freelance Project Radar" })).toBeInViewport();
    expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`project-board-${width}.png`) });
    await panel.getByRole("button", { name: "Close board · Back to room" }).click();
  }
});

test("project board remains usable when the WebGL scene fails", async ({ page }) => {
  await page.route("**/RoomScene-*.js", (route) => route.abort());
  await page.goto("/?destination=board");
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("You can read the full portfolio below.");
  await expect(page.getByRole("heading", { name: "Amirreza Gholipour" })).toBeVisible();
  const panel = page.getByRole("dialog", { name: "Project board" });
  await panel.getByRole("button", { name: "Open Laya Fine-tuning Pipeline" }).click();
  await expect(panel.getByRole("heading", { name: "Laya Fine-tuning Pipeline" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "View on GitHub" })).toHaveAttribute("href", "https://github.com/AmirRghp/laya-finetune");
});
