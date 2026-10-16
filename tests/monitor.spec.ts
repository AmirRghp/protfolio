import { expect, test } from "@playwright/test";

test("monitor opens a modal with section navigation, work and focus return", async ({ page }) => {
  await page.goto("/");
  const monitor = page.getByRole("button", { name: "Monitor", exact: true });
  await monitor.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("dialog", { name: "About Amirreza" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "About", exact: true })).toBeFocused();
  await panel.getByRole("button", { name: "Contact", exact: true }).click();
  await expect(panel.getByRole("heading", { name: "Contact", exact: true })).toBeFocused();
  await expect(panel.getByText("Contact details are not published yet.")).toBeVisible();
  await panel.getByRole("button", { name: "About", exact: true }).click();
  await expect(panel.getByText("Daraei360", { exact: false })).toHaveCount(2);
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
  await expect(monitor).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Escape");
  await expect(monitor).toBeFocused();
  await page.keyboard.press("Space");
  await panel.getByRole("button", { name: "Work", exact: true }).click();
  await expect(panel).not.toBeVisible();
  await expect(page.getByRole("dialog", { name: "Project board" })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Project board" }).getByRole("heading", { name: "Selected projects" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Project board" })).toHaveAttribute("aria-pressed", "true");
});

test("monitor remains readable, modal and keyboard accessible at every target width", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.getByRole("button", { name: "Monitor", exact: true }).click();
    const panel = page.getByRole("dialog");
    const close = panel.getByRole("button", { name: "Close · Back to room" });
    await expect(close).toBeInViewport();
    await close.focus();
    await page.keyboard.press("Shift+Tab");
    expect(await panel.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await panel.getByRole("button", { name: "Work", exact: true }).focus();
    await page.keyboard.press("Tab");
    expect(await panel.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await close.focus();
    await page.keyboard.press("Tab");
    await expect(panel.getByRole("button", { name: "About", exact: true })).toBeFocused();
    await expect(panel.getByRole("button", { name: "About", exact: true })).toHaveCSS("outline-style", "solid");
    await panel.getByText("May 2026 – September 2026", { exact: false }).scrollIntoViewIfNeeded();
    await expect(panel.getByText("May 2026 – September 2026", { exact: false })).toBeInViewport();
    expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    expect(await page.locator("[id]").evaluateAll((elements) => new Set(elements.map((el) => el.id)).size === elements.length)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`monitor-${width}.png`) });
    await close.click();
    await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
  }
  expect(errors).toEqual([]);
});

test("monitor opens during loading and remains usable after graphics failure", async ({ page }) => {
  await page.route("**/RoomScene-*.js", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.goto("/");
  await expect(page.getByRole("status")).toHaveText("Loading study…");
  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("canvas")).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.querySelector("canvas")?.getContext("webgl2")?.getExtension("WEBGL_lose_context"))).toBe(true);
  await page.evaluate(() => document.querySelector("canvas")!.getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext());
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("AI Engineer", { exact: true })).toHaveCount(2);
  await page.getByRole("button", { name: "Close · Back to room" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
