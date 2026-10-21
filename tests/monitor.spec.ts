import { expect, test, type Page } from "@playwright/test";

const desktop = '[role="region"][aria-label="Amirreza workspace"]';
const layer = '[class*="desktopLayer"]';
const monitorWindow = 'section[aria-labelledby="monitor-window-title"]';

type Placement = {
  canvas: { x: number; y: number; width: number; height: number };
  local: { width: number; height: number };
  corners: { x: number; y: number }[];
  clipPoints: number;
};

async function readPlacement(page: Page): Promise<Placement> {
  return page.evaluate((selector) => {
    const element = document.querySelector<HTMLElement>(selector)!;
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-engine]')!;
    const matrix = new DOMMatrix(element.style.transform);
    const width = Number.parseFloat(element.style.width);
    const height = Number.parseFloat(element.style.height);
    const corner = (x: number, y: number) => {
      const weight = matrix.m14 * x + matrix.m24 * y + matrix.m44;
      return {
        x: (matrix.m11 * x + matrix.m21 * y + matrix.m41) / weight,
        y: (matrix.m12 * x + matrix.m22 * y + matrix.m42) / weight,
      };
    };
    const canvasBox = canvas.getBoundingClientRect();
    return {
      canvas: { x: canvasBox.x, y: canvasBox.y, width: canvasBox.width, height: canvasBox.height },
      local: { width, height },
      corners: [corner(0, 0), corner(width, 0), corner(width, height), corner(0, height)],
      clipPoints: element.style.clipPath.split(", ").length,
    };
  }, desktop);
}

/** The camera moves for a moment after a destination change, so the overlay is only measured once it settles. */
async function waitForSettledPlacement(page: Page) {
  let previous = "";
  await expect.poll(async () => {
    const placement = await readPlacement(page);
    const signature = placement.corners.map((corner) => `${corner.x.toFixed(1)},${corner.y.toFixed(1)}`).join(" ");
    const settled = signature === previous;
    previous = signature;
    return settled;
  }, { timeout: 5000 }).toBe(true);
}

test("the desktop opens inside the physical screen of the monitor", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.locator(layer)).toHaveAttribute("data-active", "true");
  await waitForSettledPlacement(page);

  const placement = await readPlacement(page);

  // The display panel is flat and faces the camera, so the overlay keeps no keystone.
  const topWidth = placement.corners[1].x - placement.corners[0].x;
  const bottomWidth = placement.corners[2].x - placement.corners[3].x;
  expect(bottomWidth).toBeCloseTo(topWidth, 0);

  // Every corner stays on the canvas, and the desktop fills the screen it is projected on.
  for (const corner of placement.corners) {
    expect(corner.x).toBeGreaterThan(placement.canvas.x);
    expect(corner.x).toBeLessThan(placement.canvas.x + placement.canvas.width);
    expect(corner.y).toBeGreaterThan(placement.canvas.y);
    expect(corner.y).toBeLessThan(placement.canvas.y + placement.canvas.height);
  }
  expect(topWidth).toBeGreaterThan(placement.canvas.width * 0.6);
  expect(bottomWidth).toBeGreaterThan(placement.canvas.width * 0.6);
  expect(placement.clipPoints).toBeGreaterThan(8);

  const centreX = placement.corners.reduce((sum, corner) => sum + corner.x, 0) / 4;
  expect(Math.abs(centreX - (placement.canvas.x + placement.canvas.width / 2))).toBeLessThan(6);

  await expect(page.getByText("Amirreza Workspace")).toBeVisible();
  await expect(page.locator(`${desktop} time`)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("monitor-desktop.png") });
  expect(errors).toEqual([]);
});

test("the monitor shows the same wallpaper in the overview and in the focus", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);

  const overview = await page.evaluate(() => {
    const desktop = document.querySelector<HTMLElement>('[role="region"]')!;
    const waves = desktop.querySelector("canvas")!;
    waves.dataset.marker = "overview";
    const rect = desktop.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  });
  expect(overview.width).toBeGreaterThan(100);

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await page.waitForTimeout(1200);

  const focus = await page.evaluate(() => {
    const desktop = document.querySelector<HTMLElement>('[role="region"]')!;
    const waves = desktop.querySelector("canvas")!;
    const rect = desktop.getBoundingClientRect();
    return { width: rect.width, height: rect.height, marker: waves.dataset.marker ?? null };
  });

  // The same canvas instance is projected on the physical screen in both poses, so the wallpaper
  // is never swapped while the camera moves.
  expect(focus.marker).toBe("overview");
  expect(focus.width).toBeGreaterThan(overview.width);
});

test("the animated wallpaper keeps the HTML controls usable during the monitor focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.locator(desktop)).toBeVisible();
  await expect(page.locator(`${desktop} canvas`)).toBeVisible();
  await page.waitForTimeout(1000);

  // A click on the animated wallpaper must not break the controls around it.
  await page.mouse.click(500, 520);
  await page.waitForTimeout(200);
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
  await expect(page.getByText("Focused on Monitor.")).not.toBeVisible();
});

test("the status bar clock follows the local time and rolls the day over at midnight", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.clock.setFixedTime(new Date(2026, 9, 19, 18, 44));
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.getByText("Monday · 19 Oct · 6:44 PM")).toBeVisible();

  await page.clock.setFixedTime(new Date(2026, 9, 19, 18, 45));
  await expect(page.getByText("Monday · 19 Oct · 6:45 PM")).toBeVisible({ timeout: 5000 });

  await page.clock.setFixedTime(new Date(2026, 9, 20, 0, 0));
  await expect(page.getByText("Tuesday · 20 Oct · 12:00 AM")).toBeVisible({ timeout: 5000 });
});

test("the status bar stays readable on the monitor screen", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.locator(desktop)).toBeVisible();
  await waitForSettledPlacement(page);

  const hits = await page.evaluate((selector) => {
    const element = document.querySelector<HTMLElement>(selector)!;
    const targets = [element.querySelector("time")!, element.querySelector("header span")!];
    return targets.map((target) => {
      const rect = target.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
      return { inside: hit ? element.contains(hit) : false };
    });
  }, desktop);

  // The curved edge of the screen must not cut the status bar text away.
  for (const hit of hits) expect(hit.inside).toBe(true);
});

test("the desktop takes the keyboard focus and returns to the room", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  const monitor = page.getByRole("button", { name: "Monitor", exact: true });

  await monitor.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(desktop)).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.getByText("Study overview · Choose a destination above or select the monitor, project board, or arcade in the room.")).toBeVisible();
  await expect(monitor).toBeFocused();
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");

  await page.keyboard.press("Enter");
  await expect(page.locator(desktop)).toBeFocused();
  await page.getByRole("button", { name: "Back to room", exact: true }).click();
  await expect(monitor).toBeFocused();
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");
});

test("the desktop stays on the screen at every target width", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "networkidle" });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "Monitor", exact: true }).click();
    await expect(page.locator(layer)).toHaveAttribute("data-active", "true");
    await waitForSettledPlacement(page);
    const placement = await readPlacement(page);
    for (const corner of placement.corners) {
      expect(corner.x).toBeGreaterThanOrEqual(placement.canvas.x - 1);
      expect(corner.x).toBeLessThanOrEqual(placement.canvas.x + placement.canvas.width + 1);
      expect(corner.y).toBeGreaterThanOrEqual(placement.canvas.y - 1);
      expect(corner.y).toBeLessThanOrEqual(placement.canvas.y + placement.canvas.height + 1);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath(`monitor-desktop-${width}.png`) });
    await page.getByRole("button", { name: "Back to room", exact: true }).click();
  }
});

test("the desktop lands on the screen without a camera transition under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.locator(layer)).toHaveAttribute("data-active", "true");
  await expect(page.locator(desktop)).toBeVisible();
  await waitForSettledPlacement(page);

  const placement = await readPlacement(page);
  const topWidth = placement.corners[1].x - placement.corners[0].x;
  const bottomWidth = placement.corners[2].x - placement.corners[3].x;
  expect(bottomWidth).toBeCloseTo(topWidth, 0);
  const centreX = placement.corners.reduce((sum, corner) => sum + corner.x, 0) / 4;
  expect(Math.abs(centreX - (placement.canvas.x + placement.canvas.width / 2))).toBeLessThan(6);
});

test("a pending curved monitor asset does not block the HTML path or the return", async ({ page }) => {
  let release = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  let requested = false;
  await page.route("**/assets/models/curved-monitor.glb", async (route) => {
    requested = true;
    await pending;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect.poll(() => requested).toBe(true);
    await page.getByRole("button", { name: "Monitor", exact: true }).click();
    await expect(page.getByRole("button", { name: "Back to room", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
    await page.getByRole("button", { name: "Back to room", exact: true }).click();
    await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
    const response = page.waitForResponse("**/assets/models/curved-monitor.glb");
    release();
    expect((await response).status()).toBe(200);
    await expect(page.getByText("The 3D view is unavailable.")).not.toBeVisible();
  } finally {
    release();
  }
});

test("the desktop stays hidden when the 3D view is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.includes("webgl")) return null;
      return original.call(this, type as "2d", ...args);
    } as typeof original;
  });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");
  await expect(page.locator(layer)).toHaveAttribute("inert", "");
  await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
  await expect(page.getByRole("link", { name: /View .* on GitHub/ })).toHaveCount(3);
});

test("the desktop disappears and releases focus when the graphics context is lost", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.locator(desktop)).toBeVisible();
  await page.getByRole("button", { name: "about-me.txt" }).dblclick();
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect.poll(() => page.evaluate(() => !!document.querySelector<HTMLCanvasElement>('canvas[data-engine]')?.getContext("webgl2")?.getExtension("WEBGL_lose_context"))).toBe(true);
  await page.evaluate(() => document.querySelector<HTMLCanvasElement>('canvas[data-engine]')!.getContext("webgl2")!.getExtension("WEBGL_lose_context")!.loseContext());

  await expect(page.getByText("The 3D view is unavailable.")).toBeVisible();
  await expect(page.locator(desktop)).toBeHidden();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(page.locator(layer)).toHaveAttribute("data-active", "false");
  await expect(page.locator(layer)).toHaveAttribute("inert", "");
  await expect(page.getByRole("button", { name: "Monitor", exact: true })).toBeFocused();
  await expect(page.getByRole("heading", { level: 1, name: "Amirreza Gholipour" })).toBeVisible();
});
