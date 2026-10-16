import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

function changedBytes(first: Buffer, second: Buffer) {
  if (first.length !== second.length) return Math.abs(first.length - second.length) + 1;
  let changed = 0;
  for (let i = 0; i < first.length; i++) if (first[i] !== second[i]) changed++;
  return changed;
}

test("HTML destination controls focus each room and return to the overview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(120);
  const overview = await canvas.screenshot();

  for (const destination of ["Monitor", "Project board", "Arcade"]) {
    const button = page.getByRole("button", { name: destination, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toBeVisible();
    await expect(page.getByText(`Focused on ${destination}.`)).toBeVisible();
    await page.waitForTimeout(350);
    expect(await canvas.screenshot()).not.toEqual(overview);

    if (destination === "Project board") {
      await page.getByRole("button", { name: "Close board · Back to room", exact: true }).click();
    } else if (destination === "Monitor") {
      await page.getByRole("button", { name: "Close · Back to room", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Back to room", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(350);
    expect(await canvas.screenshot()).toEqual(overview);
  }
});

test("quick destination changes and a mid-transition return restore overview controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  await page.getByRole("button", { name: "Project board" }).click();
  await page.getByRole("button", { name: "Close board · Back to room" }).click();
  await page.waitForTimeout(60);
  await page.getByRole("button", { name: "Arcade" }).click();
  await expect(page.getByText("Focused on Arcade.")).toBeVisible();
  await page.waitForTimeout(60);
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await page.waitForTimeout(350);

  await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Project board" })).toHaveAttribute("aria-pressed", "false");
});

test("room hotspots use the same destination state as the HTML menu", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  const hotspots = [
    { destination: "Project board", x: 490, y: 328 },
    { destination: "Monitor", x: 700, y: 395 },
    { destination: "Arcade", x: 1077, y: 362 },
  ];

  for (const hotspot of hotspots) {
    await canvas.click({ position: { x: hotspot.x, y: hotspot.y } });
    await expect(page.getByRole("button", { name: hotspot.destination, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(`Focused on ${hotspot.destination}.`)).toBeVisible();
    if (hotspot.destination === "Project board") {
      await page.getByRole("button", { name: "Close board · Back to room", exact: true }).click();
    } else if (hotspot.destination === "Monitor") {
      await page.getByRole("button", { name: "Close · Back to room", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Back to room", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
    if (hotspot.destination === "Monitor") {
      await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
    }
  }
});

test("reduced motion snaps to a destination without a camera transition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator("canvas");

  await page.getByRole("button", { name: "Arcade" }).click();
  await expect(page.getByText("Focused on Arcade.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Arcade" })).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(120);
  const focused = await canvas.screenshot();
  await page.waitForTimeout(350);
  expect(changedBytes(focused, await canvas.screenshot())).toBe(0);
});

test("destination controls and the return button work from the keyboard", async ({ page }) => {
  await page.goto("/");
  const board = page.getByRole("button", { name: "Project board" });
  await board.focus();
  await expect(board).toBeFocused();
  await expect(board).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(board).toHaveAttribute("aria-pressed", "true");

  const back = page.getByRole("button", { name: "Close board · Back to room", exact: true });
  await back.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
  await expect(board).toHaveAttribute("aria-pressed", "false");
});

test("arcade loads only on request, keeps an external exit, and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 740 });
  let gameRequests = 0;
  await page.route("https://www.ps1fun.com/play/crash-bandicoot/1212", async (route) => {
    gameRequests++;
    await route.fulfill({ contentType: "text/html", body: "<title>Game</title>" });
  });
  await page.goto("/");

  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();
  await expect(page.getByRole("link", { name: "Open game on PS1FUN" })).toBeVisible();
  expect(gameRequests).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

  await page.getByRole("button", { name: "Play game" }).click();
  const game = page.getByTitle("Crash Bandicoot on PS1FUN");
  await expect(game).toBeVisible();
  await expect(page.locator("[class*=arcadeViewport]")).toHaveCSS("overflow", "hidden");
  await expect(game).not.toHaveCSS("transform", "none");
  await expect.poll(() => gameRequests).toBe(1);
  await expect(page.getByRole("button", { name: "Exit game" })).toBeVisible();
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(game).toBeVisible();
    await expect(page.getByRole("button", { name: "Exit game" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 375, height: 740 });
  const exit = page.getByRole("button", { name: "Exit game" });
  await exit.focus();
  await expect(exit).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(game).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

  await page.getByRole("button", { name: "Play game" }).click();
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await expect(game).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open game on PS1FUN" })).toHaveCount(0);
});

test("arcade keeps the direct link available when the embed is offline", async ({ page }) => {
  await page.route("https://www.ps1fun.com/play/crash-bandicoot/1212", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play game" }).click();
  await expect(page.getByTitle("Crash Bandicoot on PS1FUN")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open game on PS1FUN" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Exit game" })).toBeVisible();
});
