import { expect, test, type Page } from "@playwright/test";

const desktop = '[role="region"][aria-label="Amirreza workspace"]';
const monitorWindow = 'section[aria-labelledby="monitor-window-title"]';

// The desktop is projected on a software rendered 3D scene, so these checks need more time on slow machines.
test.describe.configure({ timeout: 90_000 });

async function focusMonitor(page: Page) {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator('canvas[data-engine]').click({ position: { x: 494, y: 297 } });
  await expect(page.locator(desktop)).toBeVisible();
}

test("the about-me file opens on a double click and shows the owner details", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });
  await expect(file).toBeVisible();
  await expect(file).toHaveAccessibleName("about-me.txt");
  await expect(file).toHaveAccessibleDescription("Double-click, double tap, or press Enter to open");
  await expect(file).toHaveAttribute("title", "Double-click, double tap, or press Enter to open");

  // A single click only focuses the file; the window opens on a double click.
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(file).toHaveAttribute("data-selected", "true");

  // The double activation window has to pass before the next pair of clicks.
  await page.waitForTimeout(700);
  await file.dblclick();
  const openWindow = page.locator(monitorWindow);
  await expect(openWindow).toBeVisible();
  await expect(openWindow.getByRole("heading", { name: /about me/i })).toBeVisible();
  await expect(openWindow.getByText("Amirreza Gholipour")).toBeVisible();
  await expect(openWindow.getByText("AI Engineer", { exact: true })).toBeVisible();
  await expect(openWindow.getByText("October 2025 – May 2026")).toBeVisible();
  await expect(openWindow.getByText("May 2026 – September 2026")).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("about-me-open.png") });
  expect(errors).toEqual([]);
});

test("the about-me window takes the focus and returns it to the file icon", async ({ page }) => {
  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });
  const close = page.getByRole("button", { name: "Close", exact: true });

  await file.dblclick();
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(file).toBeFocused();
  await expect(file).toHaveAttribute("data-selected", "true");

  // The focused file opens again with the keyboard.
  await page.keyboard.press("Enter");
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(close).toBeFocused();

  await close.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(file).toBeFocused();
});

test("the about-me window stays inside the screen of the monitor", async ({ page }) => {
  await focusMonitor(page);

  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const openWindow = page.locator(monitorWindow);
  await expect(openWindow).toBeVisible();

  const windowBox = await openWindow.boundingBox();
  const screenBox = await page.locator(desktop).boundingBox();
  expect(windowBox).not.toBeNull();
  expect(screenBox).not.toBeNull();
  expect(windowBox!.x).toBeGreaterThanOrEqual(screenBox!.x - 1);
  expect(windowBox!.y).toBeGreaterThanOrEqual(screenBox!.y - 1);
  expect(windowBox!.x + windowBox!.width).toBeLessThanOrEqual(screenBox!.x + screenBox!.width + 1);
  expect(windowBox!.y + windowBox!.height).toBeLessThanOrEqual(screenBox!.y + screenBox!.height + 1);

  // The document does not scroll sideways and its region is reachable with the keyboard.
  const body = page.locator('[class*="windowBody"]');
  await expect(body).toHaveAttribute("tabindex", "0");
  expect(await body.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);

  await page.getByRole("button", { name: "Close", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(body).toBeFocused();
});

test("a touch double tap opens the about-me file without zooming the page", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await page.touchscreen.tap(248, 448);
  await expect(page.locator(desktop)).toBeVisible();

  const file = page.getByRole("button", { name: "about-me.txt" });
  const box = (await file.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // The double activation window has to pass before the next pair of taps.
  await page.waitForTimeout(700);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();
  expect(await page.evaluate(() => window.visualViewport?.scale)).toBe(1);

  await context.close();
});

test("a pending activation is dropped by every other interaction", async ({ page }) => {
  // The frozen clock keeps every activation on the same timestamp, so a surviving pending activation is visible.
  await page.clock.setFixedTime(new Date(2026, 9, 21, 12, 0));
  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });
  const close = page.getByRole("button", { name: "Close", exact: true });

  // The first click only registers a pending activation.
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // The keyboard opens the file straight away and invalidates that pending activation.
  await file.press("Enter");
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(file).toBeFocused();

  // A single click afterwards must not open the file.
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
});

test("a click outside the file drops its pending activation", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 21, 12, 0));
  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // Another part of the desktop is a different interaction.
  await page.locator('[class*="wallpaper"]').click({ position: { x: 40, y: 40 } });
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // The pending activation is gone, so a single click on the file stays harmless.
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
});

test("a click on a control outside the desktop drops the pending activation", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 21, 12, 0));
  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });

  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // A click on the wallpaper drops pending activation.
  await page.locator('[class*="wallpaper"]').click({ position: { x: 40, y: 40 } });
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // The pending activation is gone, so a single click on the file stays harmless.
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
});

test("a keyboard interaction drops the pending activation", async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 9, 21, 12, 0));
  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });

  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // A Tab keypress moves focus, dropping the pending activation.
  await page.keyboard.press("Tab");
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  // The pending activation is gone, so a single click on the file stays harmless.
  await file.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
});

test("the owner details stay readable without the 3D scene", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes("webgl")) return null;
      return original.call(this, type as "2d", ...args);
    } as typeof original;
  });
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Experience" })).toBeVisible();
  await expect(page.getByText("October 2025 – May 2026")).toBeVisible();
  await expect(page.getByText("May 2026 – September 2026")).toBeVisible();
});
