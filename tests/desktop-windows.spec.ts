import { expect, test, type Locator, type Page } from "@playwright/test";
import { clickRoomHotspot } from "./testHelpers";

const desktop = '[role="region"][aria-label="Amirreza workspace"]';
const monitorWindow = 'section[aria-labelledby="monitor-window-title"]';
const moveLayer = '[class*="moveLayer"]';

// The desktop is projected on a software rendered 3D scene, so these checks need more time on slow machines.
test.describe.configure({ timeout: 90_000 });

async function focusMonitor(page: Page, viewport = { width: 1440, height: 800 }) {
  await page.setViewportSize(viewport);
  await page.goto("/", { waitUntil: "networkidle" });
  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeVisible();
  // Let the camera reach the monitor pose before comparing projected geometry.
  await page.waitForTimeout(1_200);
}

function titleBar(window: Locator) {
  return window.locator(":scope > header");
}

async function boxOf(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  return box!;
}

async function dragFromTitleBar(page: Page, window: Locator, dx: number, dy: number) {
  const bar = await boxOf(titleBar(window));
  const start = { x: bar.x + Math.min(24, bar.width / 4), y: bar.y + bar.height / 2 };
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + dx, start.y + dy, { steps: 8 });
  await page.mouse.up();
}

async function attemptDrag(page: Page, locator: Locator, dx = 70, dy = 50) {
  const target = await boxOf(locator);
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2);
  await page.mouse.down();
  await page.mouse.move(target.x + target.width / 2 + dx, target.y + target.height / 2 + dy, { steps: 5 });
  await page.mouse.up();
}

function expectInside(inner: Awaited<ReturnType<typeof boxOf>>, outer: Awaited<ReturnType<typeof boxOf>>, tolerance = 2) {
  expect(inner.x).toBeGreaterThanOrEqual(outer.x - tolerance);
  expect(inner.y).toBeGreaterThanOrEqual(outer.y - tolerance);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + tolerance);
  expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + tolerance);
}

test("a title-bar drag moves the window, while controls, links and content do not start a drag", async ({ page }) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "Freelance Project Radar" }).click();
  const window = page.locator(monitorWindow);
  await expect(window).toBeVisible();

  const before = await boxOf(window);
  await dragFromTitleBar(page, window, 90, 60);
  await expect.poll(async () => (await boxOf(window)).x).toBeGreaterThan(before.x + 20);
  const moved = await boxOf(window);
  expect(moved.y).toBeGreaterThan(before.y + 10);

  const nonDraggable = [
    window.getByRole("button", { name: "Move window", exact: true }),
    window.getByRole("button", { name: "Maximize window", exact: true }),
    window.getByRole("button", { name: "Close", exact: true }),
    window.getByRole("link", { name: "Open GitHub repository" }),
  ];

  for (const target of nonDraggable) {
    const current = await boxOf(window);
    await attemptDrag(page, target);
    await page.waitForTimeout(80);
    const after = await boxOf(window);
    expect(Math.abs(after.x - current.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(after.y - current.y)).toBeLessThanOrEqual(1);
    await expect(page.locator(moveLayer)).toHaveCount(0);
  }

  const body = window.locator('[class*="windowBody"]');
  const current = await boxOf(window);
  await attemptDrag(page, body);
  const after = await boxOf(window);
  expect(Math.abs(after.x - current.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.y - current.y)).toBeLessThanOrEqual(1);

  // Re-activating the app that already owns the window must not throw away its geometry.
  const beforeSameApp = await boxOf(window);
  await page.getByRole("button", { name: "Freelance Project Radar" }).click();
  await page.waitForTimeout(100);
  const afterSameApp = await boxOf(window);
  expect(Math.abs(afterSameApp.x - beforeSameApp.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(afterSameApp.y - beforeSameApp.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(afterSameApp.width - beforeSameApp.width)).toBeLessThanOrEqual(1);
});

test("the title bar moves the window with arrow keys only when it itself has focus", async ({ page }) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  const bar = titleBar(window);
  await expect(bar).toHaveAttribute("tabindex", "0");
  await expect(bar).toHaveAccessibleName("about-me.txt window title bar");

  await bar.focus();
  const before = await boxOf(window);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await expect.poll(async () => (await boxOf(window)).x).toBeGreaterThan(before.x);
  const moved = await boxOf(window);
  expect(moved.y).toBeGreaterThan(before.y);
  await expect(bar).toBeFocused();

  // Put the window at the top-left edge, then verify further arrow keys cannot leave the desktop.
  await bar.focus();
  await dragFromTitleBar(page, window, -2_000, -1_400);
  const desktopBox = await boxOf(page.locator(desktop));
  const statusBox = await boxOf(page.locator(desktop).locator(":scope > header"));
  const atEdge = await boxOf(window);
  expect(atEdge.x).toBeGreaterThanOrEqual(desktopBox.x - 2);
  expect(atEdge.y).toBeGreaterThanOrEqual(statusBox.y + statusBox.height - 2);
  await bar.focus();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  const stillAtEdge = await boxOf(window);
  expect(Math.abs(stillAtEdge.x - atEdge.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(stillAtEdge.y - atEdge.y)).toBeLessThanOrEqual(1);

  await window.getByRole("button", { name: "Close", exact: true }).focus();
  const beforeButtonArrows = await boxOf(window);
  const beforeDesktop = await boxOf(page.locator(desktop));
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(80);
  const afterButtonArrows = await boxOf(window);
  const afterDesktop = await boxOf(page.locator(desktop));
  // Arrow keys on a button may scroll the page, but they must not change the window's local place.
  expect(Math.abs((afterButtonArrows.x - afterDesktop.x) - (beforeButtonArrows.x - beforeDesktop.x))).toBeLessThanOrEqual(1);
  expect(Math.abs((afterButtonArrows.y - afterDesktop.y) - (beforeButtonArrows.y - beforeDesktop.y))).toBeLessThanOrEqual(1);
});

test("maximize fills the workspace below the status bar and restore survives a resize", async ({ page }, testInfo) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  const maximize = window.getByRole("button", { name: "Maximize window", exact: true });
  await expect(maximize).toBeVisible();
  const initial = await boxOf(window);

  await maximize.click();
  const restore = window.getByRole("button", { name: "Restore window", exact: true });
  await expect(restore).toBeVisible();
  await expect(window.getByRole("button", { name: "Move window", exact: true })).toBeDisabled();
  await expect(window.getByRole("button", { name: "Close", exact: true })).toBeVisible();

  const desktopBox = await boxOf(page.locator(desktop));
  const statusBox = await boxOf(page.locator(desktop).locator(":scope > header"));
  const maximizedBox = await boxOf(window);
  expect(Math.abs(maximizedBox.x - desktopBox.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(maximizedBox.width - desktopBox.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(maximizedBox.y - (statusBox.y + statusBox.height))).toBeLessThanOrEqual(2);
  expect(Math.abs(maximizedBox.y + maximizedBox.height - (desktopBox.y + desktopBox.height))).toBeLessThanOrEqual(2);
  expectInside(await boxOf(titleBar(window)), maximizedBox);
  await page.screenshot({ path: testInfo.outputPath("window-maximized-1440.png") });

  await page.setViewportSize({ width: 1024, height: 800 });
  await page.waitForTimeout(700);
  const narrowerDesktop = await boxOf(page.locator(desktop));
  const narrowerStatus = await boxOf(page.locator(desktop).locator(":scope > header"));
  const narrowerMaximized = await boxOf(window);
  expect(Math.abs(narrowerMaximized.x - narrowerDesktop.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(narrowerMaximized.width - narrowerDesktop.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(narrowerMaximized.y - (narrowerStatus.y + narrowerStatus.height))).toBeLessThanOrEqual(2);
  expect(Math.abs(narrowerMaximized.y + narrowerMaximized.height - (narrowerDesktop.y + narrowerDesktop.height))).toBeLessThanOrEqual(2);

  await restore.click();
  const restored = await boxOf(window);
  expectInside(restored, narrowerDesktop);
  expect(restored.width).toBeLessThanOrEqual(narrowerDesktop.width - 8);
  await expect(window.getByRole("button", { name: "Maximize window", exact: true })).toBeVisible();
  await expect(window.getByRole("button", { name: "Move window", exact: true })).toBeEnabled();

  await window.getByRole("button", { name: "Close", exact: true }).click();
  await expect(window).toHaveCount(0);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(page.getByRole("button", { name: "Maximize window", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Move window", exact: true })).toBeEnabled();
  const reopened = await boxOf(page.locator(monitorWindow));
  expect(reopened.width).toBeLessThan(initial.width);

  // Closing a maximized window must not leave its restore state behind for another app.
  await page.getByRole("button", { name: "Maximize window", exact: true }).click();
  await expect(page.getByRole("button", { name: "Restore window", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await page.getByRole("button", { name: "Freelance Project Radar" }).click();
  const projectWindow = page.locator(monitorWindow);
  await expect(projectWindow.getByRole("heading", { name: "Freelance Project Radar" })).toBeVisible();
  await expect(projectWindow.getByRole("button", { name: "Maximize window", exact: true })).toBeVisible();
  await expect(projectWindow.getByRole("button", { name: "Restore window", exact: true })).toHaveCount(0);
});

test("the window geometry is not persisted across a reload", async ({ page }) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  await expect(window).toBeVisible();
  const initial = await boxOf(window);

  await dragFromTitleBar(page, window, 150, 90);
  await expect.poll(async () => (await boxOf(window)).x).toBeGreaterThan(initial.x + 20);

  await page.reload({ waitUntil: "networkidle" });
  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeVisible();
  await page.waitForTimeout(1_200);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const reopened = await boxOf(page.locator(monitorWindow));
  expect(Math.abs(reopened.x - initial.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(reopened.y - initial.y)).toBeLessThanOrEqual(2);
  expect(Math.abs(reopened.width - initial.width)).toBeLessThanOrEqual(2);
});

test("Move mode places the window without activating the content under the pointer", async ({ page }) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "Freelance Project Radar" }).click();
  const window = page.locator(monitorWindow);
  const move = window.getByRole("button", { name: "Move window", exact: true });
  const before = await boxOf(window);

  await move.click();
  await expect(page.locator(moveLayer)).toBeVisible();
  await expect(move).toHaveAttribute("aria-pressed", "true");
  await expect(move).toBeFocused();

  // This icon would open a different app if the placement layer let the click through.
  const destination = await boxOf(page.getByRole("button", { name: "Enterprise Knowledge Copilot" }));
  await page.mouse.click(destination.x + destination.width / 2, destination.y + destination.height / 2);

  await expect(page.locator(moveLayer)).toHaveCount(0);
  await expect(move).toHaveAttribute("aria-pressed", "false");
  await expect(move).toBeFocused();
  await expect(window.getByRole("heading", { name: "Freelance Project Radar" })).toBeVisible();
  await expect(window.getByRole("heading", { name: "Enterprise Knowledge Copilot" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enterprise Knowledge Copilot" })).toHaveCount(1);

  const after = await boxOf(window);
  expect(Math.hypot(after.x - before.x, after.y - before.y)).toBeGreaterThan(20);
  expectInside(await boxOf(titleBar(window)), await boxOf(page.locator(desktop)));
});

test("leaving the desktop while placing cancels Move mode and keeps the window", async ({ page }) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  const move = window.getByRole("button", { name: "Move window", exact: true });
  await move.click();
  await expect(page.locator(moveLayer)).toBeVisible();

  // This control is outside the projected desktop, so it must both navigate and end placement.
  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
  await expect(window).toBeVisible();
  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeFocused();
  await expect(page.locator(moveLayer)).toHaveCount(0);
  await expect(move).toHaveAttribute("aria-pressed", "false");

  // One Escape closes the restored window; if placement were still active, it would only cancel.
  await page.keyboard.press("Escape");
  await expect(window).toHaveCount(0);
  await expect(page.getByRole("button", { name: "about-me.txt" })).toBeFocused();
});

test("Escape cancels Move mode without closing the window", async ({ page }) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  const move = window.getByRole("button", { name: "Move window", exact: true });
  const before = await boxOf(window);

  await move.click();
  await expect(page.locator(moveLayer)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator(moveLayer)).toHaveCount(0);
  await expect(window).toBeVisible();
  await expect(move).toBeFocused();
  const afterCancel = await boxOf(window);
  expect(Math.abs(afterCancel.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(afterCancel.y - before.y)).toBeLessThanOrEqual(1);
  await page.waitForTimeout(100);

  await page.keyboard.press("Escape");
  await expect(window).toHaveCount(0);
  await expect(page.getByRole("button", { name: "about-me.txt" })).toBeFocused();
});

test("touch drag and Move mode move the window without opening an app underneath", async ({ browser }) => {
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
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Freelance Project Radar" }).tap();
  const window = page.locator(monitorWindow);
  await expect(window).toBeVisible();

  const beforeDrag = await boxOf(window);
  const bar = await boxOf(titleBar(window));
  const start = { x: bar.x + 18, y: bar.y + bar.height / 2 };
  const viewBefore = await page.evaluate(() => ({
    scrollY: globalThis.scrollY,
    scale: globalThis.visualViewport?.scale ?? 1,
  }));
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start.x, y: start.y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x + 70, y: start.y + 45 }] });
  await expect(titleBar(window)).toHaveAttribute("data-dragging", "true");
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(titleBar(window)).not.toHaveAttribute("data-dragging", "true");
  await expect.poll(async () => (await boxOf(window)).x).toBeGreaterThan(beforeDrag.x + 10);
  expect(await page.evaluate(() => ({
    scrollY: globalThis.scrollY,
    scale: globalThis.visualViewport?.scale ?? 1,
  }))).toEqual(viewBefore);

  const destination = await boxOf(page.getByRole("button", { name: "Enterprise Knowledge Copilot" }));
  const move = window.getByRole("button", { name: "Move window", exact: true });
  await move.tap();
  await expect(page.locator(moveLayer)).toBeVisible();
  await page.touchscreen.tap(destination.x + destination.width / 2, destination.y + destination.height / 2);
  await expect(page.locator(moveLayer)).toHaveCount(0);
  await expect(window.getByRole("heading", { name: "Freelance Project Radar" })).toBeVisible();
  await expect(window.getByRole("heading", { name: "Enterprise Knowledge Copilot" })).toHaveCount(0);

  await context.close();
});

test("changing the geometry never remounts the embedded app frame", async ({ page }) => {
  await page.route("https://github.com/**", (route) => route.fulfill({
    status: 200,
    contentType: "text/html",
    body: "<!doctype html><title>Embedded project</title><p>Embedded project loaded.</p>",
  }));
  await focusMonitor(page);
  await page.getByRole("button", { name: "Enterprise Knowledge Copilot" }).click();
  const window = page.locator(monitorWindow);
  const load = window.getByRole("button", { name: "Load inside this window" });
  await load.click();

  const frame = window.locator("iframe");
  await expect(frame).toBeVisible();
  await page.waitForTimeout(400);
  await frame.evaluate((element) => { element.dataset.testMarker = "kept"; });

  await dragFromTitleBar(page, window, 70, 40);
  await expect(frame).toHaveAttribute("data-test-marker", "kept");
  await expect(window.locator("iframe")).toHaveCount(1);

  await window.getByRole("button", { name: "Maximize window", exact: true }).click();
  await expect(window.getByRole("button", { name: "Restore window", exact: true })).toBeVisible();
  await expect(frame).toHaveAttribute("data-test-marker", "kept");
  await window.getByRole("button", { name: "Restore window", exact: true }).click();
  await expect(frame).toHaveAttribute("data-test-marker", "kept");
  await expect(window.locator("iframe")).toHaveCount(1);

  // Dragging inside the embedded document must not start a window drag.
  const before = await boxOf(window);
  const frameBox = await boxOf(frame);
  await page.mouse.move(frameBox.x + frameBox.width / 2, frameBox.y + frameBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(frameBox.x + frameBox.width / 2 + 80, frameBox.y + frameBox.height / 2 + 50, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(100);
  const after = await boxOf(window);
  expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  await expect(frame).toHaveAttribute("data-test-marker", "kept");
});

test("the default window keeps its title controls usable at narrow smoke widths", async ({ page }, testInfo) => {
  await focusMonitor(page, { width: 320, height: 900 });
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  await expect(window).toBeVisible();

  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(500);
    const windowBox = await boxOf(window);
    expectInside(await boxOf(titleBar(window)), windowBox);
    for (const name of ["Move window", "Maximize window", "Close"]) {
      const control = window.getByRole("button", { name, exact: true });
      await expect(control).toBeVisible();
      const controlBox = await boxOf(control);
      expect(controlBox.x + controlBox.width).toBeLessThanOrEqual(windowBox.x + windowBox.width + 2);
      expect(await control.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    }
    await page.screenshot({ path: testInfo.outputPath(`window-default-${width}.png`) });
  }
});

test("a moved window stays inside the desktop across the supported widths", async ({ page }, testInfo) => {
  await focusMonitor(page);
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  const window = page.locator(monitorWindow);
  await expect(window).toBeVisible();

  // Put the window at the bottom-right edge so the clamp is exercised on every resize.
  await dragFromTitleBar(page, window, 2_000, 1_400);
  await expectInside(await boxOf(window), await boxOf(page.locator(desktop)));

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(600);
    const screen = await boxOf(page.locator(desktop));
    const windowBox = await boxOf(window);
    expectInside(windowBox, screen);
    expectInside(await boxOf(titleBar(window)), windowBox);

    for (const name of ["Move window", "Maximize window", "Close"]) {
      const control = window.getByRole("button", { name, exact: true });
      await expect(control).toBeVisible();
      const controlBox = await boxOf(control);
      expect(controlBox.x + controlBox.width).toBeLessThanOrEqual(windowBox.x + windowBox.width + 2);
    }

    expect(await page.evaluate(() => (
      document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1
    ))).toBe(true);
    if (width === 320 || width === 768 || width === 1024 || width === 1440) {
      await page.screenshot({ path: testInfo.outputPath(`window-${width}.png`) });
    }
  }
});
