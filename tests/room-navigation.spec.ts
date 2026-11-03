import { expect, test, type Page } from "@playwright/test";

test.describe.configure({ mode: "serial" });

type OverviewHotspot = {
  destination: "Project board" | "Monitor" | "Arcade";
  id: "board" | "monitor" | "arcade";
  x: number;
  y: number;
};

// Shared by click and hover checks so a future camera change only updates one place.
const overviewHotspots: OverviewHotspot[] = [
  // The curved monitor covers the old sample point; select the exposed board face.
  { destination: "Project board", id: "board", x: 300, y: 430 },
  { destination: "Monitor", id: "monitor", x: 640, y: 390 },
  { destination: "Arcade", id: "arcade", x: 1077, y: 362 },
];

function hotspot(id: OverviewHotspot["id"]) {
  return overviewHotspots.find((candidate) => candidate.id === id)!;
}

test("local room GLBs load in the scene", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  const assets = [
    "room-furnishings.glb",
    "curved-monitor.glb",
    "compact-keyboard.glb",
    "computer-mouse.glb",
    "arcade-cabinet.glb",
  ].map((name) =>
    page.waitForResponse((response) => new URL(response.url()).pathname === `/assets/models/${name}`),
  );
  await page.goto("/");
  await expect(page.locator('canvas[data-engine]')).toBeVisible();
  for (const asset of assets) expect((await asset).status()).toBe(200);
  await expect(page.getByText("The 3D view is unavailable.")).not.toBeVisible();
  await page.locator('canvas[data-engine]').screenshot({ path: testInfo.outputPath("room-models-overview.png") });

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
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Back to room", exact: true }).click();
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

/**
 * A band of the room below the page header and above the monitor screen, so camera moves stay
 * comparable while the animated wallpaper on the screen is not part of the frame.
 */
async function roomFrame(page: Page) {
  const clip = await page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-engine]')!;
    const box = canvas.getBoundingClientRect();
    const screen = document.querySelector<HTMLElement>('[role="region"]')?.getBoundingClientRect();
    const top = box.y + 120;
    const bottom = screen && screen.top > top + 60 ? screen.top - 20 : box.y + box.height - 60;
    return { x: box.x, y: top, width: box.width, height: Math.max(60, bottom - top) };
  });
  return page.screenshot({ clip });
}

test("idle parallax stays inside the room at every corner and returns to center around controls", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  const sceneFrame = () => roomFrame(page);
  const foregroundFrame = async () => {
    const clip = await page.evaluate(() => {
      const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-engine]')!;
      const box = canvas.getBoundingClientRect();
      const screen = document.querySelector<HTMLElement>('[role="region"]')?.getBoundingClientRect();
      const caption = [...document.querySelectorAll<HTMLElement>("p")]
        .find((element) => element.textContent?.startsWith("Study overview"))
        ?.getBoundingClientRect();
      const top = screen && screen.bottom > box.y ? Math.min(screen.bottom + 16, box.bottom - 120) : box.y + box.height * 0.55;
      const bottom = caption && caption.top > top + 80 ? caption.top - 8 : box.bottom - 40;
      return { x: box.x, y: top, width: box.width, height: Math.max(80, bottom - top) };
    });
    return page.screenshot({ clip });
  };
  const controlBoxes = () => page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>('nav[aria-label="Study destinations"] button')].map((button) => {
      const box = button.getBoundingClientRect();
      return { text: button.textContent, x: box.x, y: box.y, width: box.width, height: box.height };
    }),
  );
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  await page.getByRole("link", { name: "Read portfolio" }).hover();
  await page.waitForTimeout(700);
  const centered = await foregroundFrame();
  const controlsBefore = await controlBoxes();

  const corners = [
    { name: "top-left", x: 12, y: 120 },
    { name: "top-right", x: 1428, y: 120 },
    { name: "bottom-left", x: 12, y: 880 },
    { name: "bottom-right", x: 1428, y: 880 },
  ] as const;
  const cornersSeen: Buffer[] = [];
  for (const corner of corners) {
    await page.mouse.move(corner.x, corner.y);
    await page.waitForTimeout(700);
    const frame = await foregroundFrame();
    expect(changedBytes(centered, frame), `${corner.name} should move the room`).toBeGreaterThan(0);
    cornersSeen.push(frame);
  }
  // Moving on both axes must be visible, not just a uniform camera pan.
  expect(changedBytes(cornersSeen[0], cornersSeen[1])).toBeGreaterThan(0);
  expect(changedBytes(cornersSeen[0], cornersSeen[2])).toBeGreaterThan(0);
  expect(await controlBoxes()).toEqual(controlsBefore);

  await page.mouse.move(hotspot("board").x, hotspot("board").y);
  await page.waitForTimeout(700);
  const boardHover = await sceneFrame();
  await page.mouse.move(hotspot("board").x + 24, hotspot("board").y + 12);
  await page.waitForTimeout(700);
  expect(changedBytes(boardHover, await sceneFrame())).toBeGreaterThan(0);

  const monitor = page.getByRole("button", { name: "Monitor", exact: true });
  await monitor.hover();
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBe(0);

  await page.mouse.move(125, 690);
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBeGreaterThan(0);
  await monitor.focus();
  await expect(monitor).toHaveCSS("outline-style", "solid");
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBe(0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

  await page.mouse.move(12, 700);
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBeGreaterThan(0);
  await page.evaluate(() => {
    document.querySelector<HTMLCanvasElement>('canvas[data-engine]')!
      .dispatchEvent(new PointerEvent("pointercancel", { bubbles: true, pointerType: "mouse" }));
  });
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBe(0);

  await page.mouse.move(1428, 700);
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBeGreaterThan(0);
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBe(0);

  await page.mouse.move(12, 700);
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBeGreaterThan(0);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
    Reflect.deleteProperty(document, "hidden");
  });
  await page.waitForTimeout(700);
  expect(changedBytes(centered, await foregroundFrame())).toBe(0);
});

test("live reduced motion removes idle movement and a resize retargets the return", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  const sceneFrame = () => roomFrame(page);
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
  // The aspect-dependent camera travel takes 0.7s; capture only after it has settled so the
  // comparison measures the posed room rather than a mid-transition frame.
  await page.waitForTimeout(900);
  const overviewAt1024 = await roomFrame(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(350);
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.waitForTimeout(60);
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await page.waitForTimeout(900);
  // Normalize idle parallax to the same neutral pointer state as the first capture.
  await page.getByRole("link", { name: "Read portfolio" }).hover();
  await page.waitForTimeout(350);
  await expect(page.getByRole("button", { name: "Arcade", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect(changedBytes(overviewAt1024, await roomFrame(page))).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1024);
});

test("HTML destination controls focus each room and return to the overview", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  const overview = await roomFrame(page);

  for (const destination of ["Monitor", "Project board", "Arcade"]) {
    const button = page.getByRole("button", { name: destination, exact: true });
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toBeVisible();
    await expect(page.getByText(`Focused on ${destination}.`)).toBeVisible();
    await page.waitForTimeout(350);
    expect(changedBytes(overview, await roomFrame(page))).toBeGreaterThan(0);

    if (destination === "Project board") {
      await page.getByRole("button", { name: "Close board · Back to room", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Back to room", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
    await expect(button).toHaveAttribute("aria-pressed", "false");
    await page.waitForTimeout(900);
    expect(changedBytes(overview, await roomFrame(page))).toBe(0);
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
  await page.waitForTimeout(900);

  await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Project board" })).toHaveAttribute("aria-pressed", "false");
});

test("room hotspots use the same destination state as the HTML menu", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');

  for (const hotspot of overviewHotspots) {
    await canvas.click({ position: { x: hotspot.x, y: hotspot.y } });
    await expect(page.getByRole("button", { name: hotspot.destination, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(`Focused on ${hotspot.destination}.`)).toBeVisible();
    if (hotspot.destination === "Project board") {
      await page.getByRole("button", { name: "Close board · Back to room", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Back to room", exact: true }).click();
    }
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toHaveCount(0);
    if (hotspot.destination === "Project board") {
      await expect(page.getByRole("button", { name: "Project board", exact: true })).toBeFocused();
    } else if (hotspot.destination === "Monitor") {
      await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
    } else {
      await expect(page.getByRole("button", { name: "Arcade", exact: true })).toBeFocused();
    }
  }
});

test("room hotspots highlight under real pointer hover and only the monitor shows USE COMPUTER", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  const room = page.locator('section[aria-label="Study room overview"]');
  const hint = page.getByText("USE COMPUTER", { exact: true });
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  await expect(hint).toBeHidden();

  const box = (await canvas.boundingBox())!;
  const hover = async (id: OverviewHotspot["id"]) => {
    const point = hotspot(id);
    await page.mouse.move(box.x + point.x, box.y + point.y);
    return { x: box.x + point.x, y: box.y + point.y };
  };

  await hover("board");
  await expect(room).toHaveAttribute("data-hovered-hotspot", "board");
  await expect(hint).toBeHidden();

  const position = await hover("monitor");
  await expect(room).toHaveAttribute("data-hovered-hotspot", "monitor");
  await expect(hint).toBeVisible();
  await expect(hint).toHaveCSS("pointer-events", "none");
  const firstHint = (await hint.boundingBox())!;
  expect(firstHint.x).toBeGreaterThanOrEqual(0);
  expect(firstHint.y).toBeGreaterThan(position.y);
  expect(firstHint.x + firstHint.width).toBeLessThanOrEqual(1440);
  expect(firstHint.y + firstHint.height).toBeLessThanOrEqual(900);

  await page.mouse.move(position.x + 30, position.y + 20);
  await page.waitForTimeout(100);
  const movedHint = (await hint.boundingBox())!;
  expect(movedHint.x).toBeGreaterThan(firstHint.x);

  await hover("arcade");
  await expect(room).toHaveAttribute("data-hovered-hotspot", "arcade");
  await expect(hint).toBeHidden();

  await page.mouse.move(box.x + 40, box.y + 720);
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();
  await expect(hint).toBeHidden();

  await hover("monitor");
  await expect(hint).toBeVisible();
  await canvas.click({ position: { x: hotspot("monitor").x, y: hotspot("monitor").y } });
  await expect(page.getByRole("button", { name: "Monitor", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(hint).toBeHidden();
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();
});

test("hover feedback clears on exit, keyboard focus, blur, destination changes, and context loss", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  const room = page.locator('section[aria-label="Study room overview"]');
  const hint = page.getByText("USE COMPUTER", { exact: true });
  const monitor = hotspot("monitor");
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");
  const hoverMonitor = async () => page.mouse.move(monitor.x, monitor.y);

  await hoverMonitor();
  await expect(room).toHaveAttribute("data-hovered-hotspot", "monitor");
  await expect(hint).toBeVisible();
  await page.mouse.move(80, 700);
  await expect(hint).toBeHidden();
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();

  await hoverMonitor();
  await expect(hint).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(hint).toBeHidden();
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();

  // Hover remains a pointer affordance after keyboard focus moves to a control.
  await hoverMonitor();
  await expect(hint).toBeVisible();

  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(hint).toBeHidden();
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();

  await hoverMonitor();
  await expect(hint).toBeVisible();
  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(hint).toBeHidden();
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await page.waitForTimeout(900);
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();

  await hoverMonitor();
  await expect(hint).toBeVisible();
  const lost = await page.evaluate(() => {
    const context = document.querySelector<HTMLCanvasElement>('canvas[data-engine]')?.getContext("webgl2");
    const extension = context?.getExtension("WEBGL_lose_context");
    extension?.loseContext();
    return Boolean(extension);
  });
  expect(lost).toBe(true);
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible({ timeout: 15_000 });
  await expect(hint).toBeHidden();
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();
});

test("reduced motion keeps the hotspot highlight but hides the monitor hint", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const canvas = page.locator('canvas[data-engine]');
  const room = page.locator('section[aria-label="Study room overview"]');
  const hint = page.getByText("USE COMPUTER", { exact: true });
  await expect(canvas).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.mouse.move(hotspot("monitor").x, hotspot("monitor").y);
  await expect(room).toHaveAttribute("data-hovered-hotspot", "monitor");
  await expect(hint).toBeHidden();

  await page.mouse.move(60, 700);
  await expect.poll(() => room.getAttribute("data-hovered-hotspot")).toBeNull();
});

test("a scene failure during hover clears the monitor hint", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  let release = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/assets/models/room-furnishings.glb", async (route) => {
    await pending;
    await route.abort();
  });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const canvas = page.locator('canvas[data-engine]');
  const hint = page.getByText("USE COMPUTER", { exact: true });
  await expect(canvas).toBeVisible();
  await page.mouse.move(hotspot("monitor").x, hotspot("monitor").y);
  await expect(hint).toBeVisible();

  release();
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible({ timeout: 15_000 });
  await expect(hint).toBeHidden();
});

test("the monitor hint stays inside narrow viewports", async ({ page }) => {
  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    const canvas = page.locator('canvas[data-engine]');
    const room = page.locator('section[aria-label="Study room overview"]');
    const hint = page.getByText("USE COMPUTER", { exact: true });
    await expect(canvas).toBeVisible();
    await page.waitForLoadState("networkidle");

    await page.mouse.move(width / 2, 400);
    await expect(room).toHaveAttribute("data-hovered-hotspot", "monitor");
    await expect(hint).toBeVisible();
    const tooltip = (await hint.boundingBox())!;
    expect(tooltip.x).toBeGreaterThanOrEqual(0);
    expect(tooltip.y).toBeGreaterThanOrEqual(0);
    expect(tooltip.x + tooltip.width).toBeLessThanOrEqual(width);
    expect(tooltip.y + tooltip.height).toBeLessThanOrEqual(800);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test("reduced motion snaps to a destination without a camera transition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Arcade" }).click();
  await expect(page.getByText("Focused on Arcade.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Arcade" })).toHaveAttribute("aria-pressed", "true");
  await page.waitForTimeout(120);
  const focused = await roomFrame(page);
  await page.waitForTimeout(350);
  expect(changedBytes(focused, await roomFrame(page))).toBe(0);
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
  await expect(page.getByRole("button", { name: "Exit game" })).toBeFocused();
  await expect(page.getByText("If the game does not appear, open it directly on PS1FUN.")).toBeVisible();
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

test("an aborted game request still leaves usable guidance and the direct link", async ({ page }, testInfo) => {
  // A cross-origin iframe can fire load for the browser's error page, so the parent cannot call
  // this a confirmed failure. The outside guidance must remain usable regardless.
  await page.route("https://www.ps1fun.com/play/crash-bandicoot/1212", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "Arcade", exact: true }).click();
  await page.getByRole("button", { name: "Play game" }).click();

  const exit = page.getByRole("button", { name: "Exit game" });
  await expect(exit).toBeFocused();
  await expect(page.getByTitle("Crash Bandicoot on PS1FUN")).toBeVisible();
  await expect(page.getByText("If the game does not appear, open it directly on PS1FUN.")).toBeVisible();
  const direct = page.getByRole("link", { name: "Open game on PS1FUN" });
  await expect(direct).toBeVisible();
  await expect(direct).toHaveAttribute("href", "https://www.ps1fun.com/play/crash-bandicoot/1212");
  await expect(direct).toHaveAttribute("target", "_blank");
  await expect(exit).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("arcade-abort-guidance.png") });
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
  await expect(page.locator('canvas[data-engine]')).toBeVisible();
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
