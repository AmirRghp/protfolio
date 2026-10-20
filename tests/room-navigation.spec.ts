import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("local room GLBs load in the scene", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  const assets = ["room-furnishings.glb", "curved-monitor.glb", "arcade-cabinet.glb"].map((name) =>
    page.waitForResponse((response) => new URL(response.url()).pathname === `/assets/models/${name}`),
  );
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  for (const asset of assets) expect((await asset).status()).toBe(200);
  await expect(page.getByText("The 3D view is unavailable.")).not.toBeVisible();
  await page.locator("canvas").screenshot({ path: testInfo.outputPath("room-models-overview.png") });

  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await expect(page.getByText("Focused on Arcade.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Play game" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("arcade-model-focused.png"), fullPage: true });
  expect(browserErrors).toEqual([]);
});

for (const model of ["room-furnishings.glb", "curved-monitor.glb"]) {
  test(`a failed ${model} load preserves the HTML destinations and portfolio`, async ({ page }) => {
    await page.route(`**/assets/models/${model}`, (route) => route.abort());
    await page.goto("/");

    await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
    await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
    await page.getByRole("button", { name: "Monitor", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close · Back to room", exact: true }).click();
    await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
  });

  test(`a corrupt ${model} falls back without losing portfolio links`, async ({ page }) => {
    await page.route(`**/assets/models/${model}`, (route) =>
      route.fulfill({ contentType: "model/gltf-binary", body: "invalid GLB" }),
    );
    await page.goto("/");

    await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
    await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
  });

}

test("a failed arcade cabinet GLB load preserves the HTML portfolio path", async ({ page }) => {
  await page.route("**/assets/models/arcade-cabinet.glb", (route) => route.abort());
  await page.goto("/");

  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
  await page.getByRole("button", { name: "Project board", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "Open Enterprise Knowledge Copilot" })).toBeVisible();
});

function changedBytes(first: Buffer, second: Buffer) {
  if (first.length !== second.length) return Math.abs(first.length - second.length) + 1;
  let changed = 0;
  for (let i = 0; i < first.length; i++) if (first[i] !== second[i]) changed++;
  return changed;
}

test("idle parallax stays inside the room and returns to center around controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  const sceneFrame = () => page.screenshot({ clip: { x: 0, y: 180, width: 1440, height: 550 } });
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Read portfolio" }).hover();
  await page.waitForTimeout(350);
  const centered = await sceneFrame();

  await page.mouse.move(700, 395);
  await page.waitForTimeout(350);
  expect(changedBytes(centered, await sceneFrame())).toBe(0);

  await page.mouse.move(125, 690);
  await page.waitForTimeout(350);
  const shifted = await sceneFrame();
  const shift = changedBytes(centered, shifted);
  expect(shift).toBeGreaterThan(0);

  const monitor = page.getByRole("button", { name: "Monitor", exact: true });
  await monitor.hover();
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await sceneFrame())).toBe(0);

  await page.mouse.move(125, 690);
  await page.waitForTimeout(350);
  await monitor.focus();
  await expect(monitor).toHaveCSS("outline-style", "solid");
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await sceneFrame())).toBe(0);
});

test("live reduced motion removes idle movement and a resize retargets the return", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  const sceneFrame = () => page.screenshot({ clip: { x: 0, y: 180, width: 1440, height: 550 } });
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  const initial = await sceneFrame();
  await page.mouse.move(125, 690);
  await page.waitForTimeout(350);
  const shifted = await sceneFrame();
  expect(changedBytes(initial, shifted)).toBeGreaterThan(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const centered = await sceneFrame();
  expect(changedBytes(shifted, centered)).toBeGreaterThan(0);
  await page.mouse.move(1300, 690);
  await page.waitForTimeout(350);
  expect(changedBytes(centered, await sceneFrame())).toBe(0);

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.getByRole("link", { name: "Read portfolio" }).hover();
  await page.waitForTimeout(350);
  const overviewAt1024 = await page.screenshot({ clip: { x: 0, y: 180, width: 1024, height: 550 } });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.waitForTimeout(60);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await page.waitForTimeout(350);
  await expect(page.getByRole("button", { name: "Arcade", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(changedBytes(overviewAt1024, await page.screenshot({ clip: { x: 0, y: 180, width: 1024, height: 550 } }))).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);
});

test("HTML destination controls focus each room and return to the overview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  const overview = await canvas.screenshot();

  for (const destination of ["Monitor", "Project board", "Arcade"]) {
    const button = page.getByRole("button", { name: destination, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toBeVisible();
    await expect(page.getByText(`Focused on ${destination}.`)).toBeVisible();
    await page.waitForTimeout(350);
    expect(changedBytes(overview, await canvas.screenshot())).toBeGreaterThan(0);

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
    expect(changedBytes(overview, await canvas.screenshot())).toBe(0);
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
    // The curved monitor covers the old sample point; select the exposed board face.
    { destination: "Project board", x: 300, y: 430 },
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
  await page.waitForLoadState("networkidle");
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

test("arcade return restores keyboard focus to its destination control", async ({ page }) => {
  await page.goto("/");
  const arcade = page.getByRole("button", { name: "Arcade", exact: true });
  await arcade.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Play game" })).toBeFocused();

  const back = page.getByRole("button", { name: "Back to room", exact: true });
  await back.focus();
  await page.keyboard.press("Enter");
  await expect(back).toHaveCount(0);
  await expect(arcade).toBeFocused();
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
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
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

test("touch-emulated visitors can use the project board and arcade controls", async ({ browser }, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 375, height: 740 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  let gameRequests = 0;
  await page.route("https://www.ps1fun.com/play/crash-bandicoot/1212", async (route) => {
    gameRequests++;
    await route.fulfill({ contentType: "text/html", body: "<title>Game</title>" });
  });

  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(350);
  const touchFrame = () => page.screenshot({ clip: { x: 0, y: 180, width: 375, height: 450 } });
  const beforeTouch = await touchFrame();
  await page.touchscreen.tap(25, 650);
  await page.waitForTimeout(350);
  expect(changedBytes(beforeTouch, await touchFrame())).toBe(0);
  await page.getByRole("button", { name: "Project board", exact: true }).tap();
  const board = page.getByRole("dialog", { name: "Project board" });
  await expect(board).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("mobile-project-board.png") });
  await board.getByRole("button", { name: "Open Enterprise Knowledge Copilot" }).tap();
  await expect(board.getByRole("heading", { name: "Enterprise Knowledge Copilot" })).toBeVisible();
  await board.getByRole("button", { name: "Close board · Back to room" }).tap();

  await page.getByRole("button", { name: "Arcade", exact: true }).tap();
  const play = page.getByRole("button", { name: "Play game" });
  await expect(play).toBeInViewport();
  await expect(page.getByRole("link", { name: "Open game on PS1FUN" })).toBeInViewport();
  expect(gameRequests).toBe(0);
  await page.screenshot({ path: testInfo.outputPath("mobile-arcade-ready.png") });
  await play.tap();
  await expect.poll(() => gameRequests).toBe(1);
  const exit = page.getByRole("button", { name: "Exit game" });
  await expect(exit).toBeInViewport();
  await page.screenshot({ path: testInfo.outputPath("mobile-arcade-playing.png") });
  await exit.tap();
  await expect(page.getByTitle("Crash Bandicoot on PS1FUN")).toHaveCount(0);
  await expect(play).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

  await context.close();
});
