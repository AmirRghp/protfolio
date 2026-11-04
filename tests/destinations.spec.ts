import { expect, test, type Page } from "@playwright/test";
import { clickRoomHotspot } from "./testHelpers";

const desktop = '[role="region"][aria-label="Amirreza workspace"]';
const monitorWindow = 'section[aria-labelledby="monitor-window-title"]';
const layer = '[class*="desktopLayer"]';
const gameUrl = "https://www.ps1fun.com/play/crash-bandicoot/1212";

// The desktop is projected on a software rendered 3D scene, so these checks need more time on slow machines.
test.describe.configure({ timeout: 90_000 });

async function focusMonitor(page: Page) {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeVisible();
}

async function expectLayerInert(page: Page, expected: boolean) {
  expect(await page.locator(layer).evaluate((element) => element.hasAttribute("inert"))).toBe(expected);
}

test("an open window survives the overview with the same desktop and wallpaper", async ({ page }, testInfo) => {
  await focusMonitor(page);
  const file = page.getByRole("button", { name: "about-me.txt" });
  const openWindow = page.locator(monitorWindow);

  await file.dblclick();
  await expect(openWindow).toBeVisible();
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();

  await page.evaluate(({ desktopSelector, windowSelector }) => {
    document.querySelector<HTMLElement>(desktopSelector)!.dataset.instance = "kept";
    document.querySelector<HTMLElement>(windowSelector)!.dataset.instance = "kept";
    document.querySelector<HTMLElement>(`${desktopSelector} canvas`)!.dataset.instance = "kept";
  }, { desktopSelector: desktop, windowSelector: monitorWindow });

  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
  await expectLayerInert(page, true);
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");
  await expect(openWindow).toBeVisible();
  await expect(page.locator(`${desktop}[data-instance="kept"]`)).toHaveCount(1);
  await expect(page.locator(`${monitorWindow}[data-instance="kept"]`)).toHaveCount(1);
  await expect(page.locator(`${desktop} canvas[data-instance="kept"]`)).toHaveCount(1);
  await expect(page.getByLabel("Study room overview")).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("window-preserved-in-overview.png") });

  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeFocused();
  await expect(openWindow).toBeVisible();
  await expect(page.getByRole("button", { name: "Go Back (ESC)", exact: true })).toBeVisible();
  await expectLayerInert(page, false);
  await page.screenshot({ path: testInfo.outputPath("window-restored-on-monitor.png") });

  // The first Escape closes the restored window; the next one returns to the overview.
  await page.keyboard.press("Escape");
  await expect(openWindow).toHaveCount(0);
  await expect(file).toBeFocused();
  await expect(page.getByText("Focused on Monitor.")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
  await expect(page.getByLabel("Study room overview")).toBeFocused();
  await expectLayerInert(page, true);
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");
});

test("arcade discards a window that survived the overview", async ({ page }) => {
  await focusMonitor(page);
  const file = page.getByRole("button", { name: "about-me.txt" });
  const openWindow = page.locator(monitorWindow);

  await file.dblclick();
  await expect(openWindow).toBeVisible();
  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(openWindow).toBeVisible();

  await clickRoomHotspot(page, "arcade");
  await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();
  await expect(openWindow).toHaveCount(0);
  await expectLayerInert(page, true);
  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(page.getByLabel("Study room overview")).toBeFocused();

  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeFocused();
  await expect(openWindow).toHaveCount(0);
});

test("arcade game starts, runs, and can be exited", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  let gameRequests = 0;
  await page.route(gameUrl, async (route) => {
    gameRequests++;
    await route.fulfill({ contentType: "text/html", body: "<title>Game</title>" });
  });
  await page.goto("/", { waitUntil: "networkidle" });

  await clickRoomHotspot(page, "arcade");
  await page.getByRole("button", { name: "Play game" }).click();
  const game = page.getByTitle("Crash Bandicoot on PS1FUN");
  await expect(game).toBeVisible();
  await expect(page.getByRole("button", { name: "Exit game" })).toBeFocused();
  await expect.poll(() => gameRequests).toBe(1);

  await page.getByRole("button", { name: "Exit game" }).click();
  await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();
  await expect(game).toHaveCount(0);

  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
});

test("a game frame that never loads falls back to the direct link and an outside exit", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  let release = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route(gameUrl, async (route) => {
    await pending;
    await route.abort();
  });

  try {
    await page.setViewportSize({ width: 1440, height: 800 });
    await page.goto("/", { waitUntil: "networkidle" });
    await clickRoomHotspot(page, "arcade");
    await page.getByRole("button", { name: "Play game" }).click();

    const exit = page.getByRole("button", { name: "Exit game" });
    await expect(exit).toBeFocused();
    await expect(page.getByRole("status")).toContainText("did not appear in the arcade within 8 seconds", { timeout: 15_000 });
    await expect(page.getByText("If the game does not appear, open it directly on PS1FUN.")).toHaveCount(0);

    const direct = page.getByRole("link", { name: "Open game on PS1FUN" });
    await expect(page.getByTitle("Crash Bandicoot on PS1FUN")).toHaveCount(0);
    await expect(direct).toBeVisible();
    await expect(direct).toHaveAttribute("href", gameUrl);
    await expect(direct).toHaveAttribute("target", "_blank");
    await expect(exit).toBeVisible();
    await expect(exit).toBeFocused();
    await page.screenshot({ path: testInfo.outputPath("arcade-iframe-fallback.png") });

    await exit.click();
    await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();
    await expect(page.getByRole("status")).toHaveCount(0);
  } finally {
    release();
  }
});

test("reduced motion keeps the preserved window and every return control usable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await focusMonitor(page);
  const file = page.getByRole("button", { name: "about-me.txt" });
  const openWindow = page.locator(monitorWindow);

  await file.dblclick();
  await expect(openWindow).toBeVisible();
  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(openWindow).toBeVisible();
  await expect(page.getByLabel("Study room overview")).toBeFocused();

  await clickRoomHotspot(page, "monitor");
  await expect(page.locator(desktop)).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(openWindow).toHaveCount(0);
  await expect(file).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByLabel("Study room overview")).toBeFocused();
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");

  await clickRoomHotspot(page, "arcade");
  await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();
  await page.getByRole("button", { name: "Go Back (ESC)", exact: true }).click();
  await expect(page.getByLabel("Study room overview")).toBeFocused();
});

test("arcade menu displays 4 games, allows switching selection, and shows coming soon for unplayable games", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?destination=arcade", { waitUntil: "networkidle" });

  const screen = page.getByRole("region", { name: "Crash Bandicoot arcade screen" });
  await expect(screen).toBeVisible();

  // Verify all 4 games exist in the list
  await expect(page.getByRole("option", { name: /Crash Bandicoot/i })).toBeVisible();
  await expect(page.getByRole("option", { name: /Pixel Tetris/i })).toBeVisible();
  await expect(page.getByRole("option", { name: /Snake Grid/i })).toBeVisible();
  await expect(page.getByRole("option", { name: /Deparkanoid/i })).toBeVisible();

  // Crash Bandicoot is initially selected and playable
  await expect(page.getByRole("button", { name: "Play game" })).toBeVisible();

  // Pressing ArrowDown moves exactly ONE step to Pixel Tetris (does not skip to Snake Grid)
  await page.keyboard.press("ArrowDown");
  await expect(page.getByText("Arcade Puzzle · 1984")).toBeVisible();
  await expect(page.getByRole("option", { name: /Pixel Tetris/i })).toHaveAttribute("data-selected", "true");

  // Pressing ArrowDown again moves to Snake Grid
  await page.keyboard.press("ArrowDown");
  await expect(page.getByText("Retro Arcade · 1997")).toBeVisible();
  await expect(page.getByRole("option", { name: /Snake Grid/i })).toHaveAttribute("data-selected", "true");

  // Pressing ArrowUp moves back to Pixel Tetris
  await page.keyboard.press("ArrowUp");
  await expect(page.getByText("Arcade Puzzle · 1984")).toBeVisible();
  await expect(page.getByRole("option", { name: /Pixel Tetris/i })).toHaveAttribute("data-selected", "true");

  // Click on Pixel Tetris
  await page.getByRole("option", { name: /Pixel Tetris/i }).click();
  await expect(page.getByRole("button", { name: "Play game" })).toHaveCount(0);
  await expect(page.getByText("Arcade Puzzle · 1984")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("arcade-menu-tetris.png") });

  // Click on Snake Grid
  await page.getByRole("option", { name: /Snake Grid/i }).click();
  await expect(page.getByText("Retro Arcade · 1997")).toBeVisible();

  // Return to Crash Bandicoot
  await page.getByRole("option", { name: /Crash Bandicoot/i }).click();
  await expect(page.getByRole("button", { name: "Play game" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("arcade-menu-crash.png") });

  // CLOSE [ESC] button returns to room overview
  await page.getByRole("button", { name: "Close arcade and return to room" }).click();
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
});

test("outside-screen cursor hint shows [Go Back] and clicking outside returns to room overview for monitor and arcade", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const hint = page.locator('[class*="backCursorHint"]');
  const desktopElem = page.locator(desktop);
  const desktopLayer = page.locator(layer);
  const arcadeLayer = page.locator('[class*="arcadeLayer"]');

  // 1. Focus on monitor
  await page.goto("/?destination=monitor", { waitUntil: "networkidle" });
  await expect(desktopElem).toBeVisible();
  await expect(hint).toHaveAttribute("data-visible", "false");
  await expect(desktopLayer).toHaveAttribute("data-outside-hover", "false");

  // Hover over the desktop screen: hint should stay hidden and outside-hover inactive
  const aboutMeFile = page.getByRole("button", { name: "about-me.txt" });
  await aboutMeFile.hover();
  await expect(hint).toHaveAttribute("data-visible", "false");
  await expect(desktopLayer).toHaveAttribute("data-outside-hover", "false");

  // Move mouse outside the monitor screen (top-left corner outside screen bounds):
  // Should activate outside hover highlight and show [Go Back] hint
  await page.mouse.move(80, 80);
  await expect(hint).toHaveAttribute("data-visible", "true");
  await expect(hint).toHaveText("[Go Back]");
  await expect(desktopLayer).toHaveAttribute("data-outside-hover", "true");
  await expect(desktopElem).toHaveAttribute("data-outside-hover", "true");
  await page.screenshot({ path: testInfo.outputPath("monitor-back-hint.png") });

  // Moving mouse back over desktop hides the hint and clears outside-hover highlight
  await aboutMeFile.hover();
  await expect(hint).toHaveAttribute("data-visible", "false");
  await expect(desktopLayer).toHaveAttribute("data-outside-hover", "false");
  await expect(desktopElem).not.toHaveAttribute("data-outside-hover", "true");

  // Move back outside and click: should navigate back to room overview
  await page.mouse.move(80, 80);
  await expect(hint).toHaveAttribute("data-visible", "true");
  await page.mouse.click(80, 80);
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
  await expect(hint).toHaveAttribute("data-visible", "false");

  // 2. Focus on arcade
  await page.goto("/?destination=arcade", { waitUntil: "networkidle" });
  const screen = page.getByRole("region", { name: "Crash Bandicoot arcade screen" });
  await expect(screen).toBeVisible();
  await expect(hint).toHaveAttribute("data-visible", "false");
  await expect(arcadeLayer).toHaveAttribute("data-outside-hover", "false");

  // Hover over the arcade menu screen: hint and outside-hover should stay inactive
  const firstOption = page.getByRole("option", { name: /Crash Bandicoot/i });
  await firstOption.hover();
  await expect(hint).toHaveAttribute("data-visible", "false");
  await expect(arcadeLayer).toHaveAttribute("data-outside-hover", "false");

  // Move mouse outside the arcade screen (top-left corner):
  // Should activate outside hover CRT highlight and show [Go Back] hint
  await page.mouse.move(80, 80);
  await expect(hint).toHaveAttribute("data-visible", "true");
  await expect(hint).toHaveText("[Go Back]");
  await expect(arcadeLayer).toHaveAttribute("data-outside-hover", "true");
  await expect(screen).toHaveAttribute("data-outside-hover", "true");
  await page.screenshot({ path: testInfo.outputPath("arcade-back-hint.png") });

  // Moving mouse back over arcade menu hides hint and deactivates outside hover
  await firstOption.hover();
  await expect(hint).toHaveAttribute("data-visible", "false");
  await expect(arcadeLayer).toHaveAttribute("data-outside-hover", "false");
  await expect(screen).not.toHaveAttribute("data-outside-hover", "true");

  // Move outside and click: returns to room overview
  await page.mouse.move(80, 80);
  await expect(hint).toHaveAttribute("data-visible", "true");
  await page.mouse.click(80, 80);
  await expect(page.getByText("Study overview", { exact: false })).toBeVisible();
  await expect(hint).toHaveAttribute("data-visible", "false");
});

