import { expect, test, type Page } from "@playwright/test";

const desktop = '[role="region"][aria-label="Amirreza workspace"]';
const monitorWindow = 'section[aria-labelledby="monitor-window-title"]';

// The desktop is projected on a software rendered 3D scene, so these checks need more time on slow machines.
test.describe.configure({ timeout: 90_000 });

async function focusMonitor(page: Page) {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Monitor", exact: true }).click();
  await expect(page.locator(desktop)).toBeVisible();
}

test("every project is an app on the monitor desktop", async ({ page }) => {
  await focusMonitor(page);

  for (const title of ["Enterprise Knowledge Copilot", "Laya Fine-tuning Pipeline", "Freelance Project Radar"]) {
    await expect(page.getByRole("button", { name: title })).toBeVisible();
  }
});

test("a project app shows the address, the summary and a direct link", async ({ page }) => {
  await focusMonitor(page);

  await page.getByRole("button", { name: "Enterprise Knowledge Copilot" }).click();
  const openWindow = page.locator(monitorWindow);
  await expect(openWindow).toBeVisible();
  await expect(openWindow.getByRole("heading", { name: "Enterprise Knowledge Copilot" })).toBeVisible();
  await expect(openWindow.getByText(/self-hosted assistant that retrieves/)).toBeVisible();
  await expect(openWindow.getByText("github.com/AmirRghp/enterprise-knowledge-copilot")).toBeVisible();
  await expect(openWindow.getByText("Authorized documents", { exact: true })).toBeVisible();
  await expect(openWindow.getByRole("link", { name: "Open GitHub repository" })).toHaveAttribute(
    "href",
    "https://github.com/AmirRghp/enterprise-knowledge-copilot",
  );
  await expect(openWindow.getByRole("link", { name: "Open in new tab" })).toHaveAttribute(
    "href",
    "https://github.com/AmirRghp/enterprise-knowledge-copilot",
  );
});

test("a blocked embed reports the error and keeps the direct link", async ({ page }) => {
  let release = () => {};
  const pending = new Promise<void>((resolve) => { release = resolve; });
  await page.route("https://github.com/**", async (route) => {
    await pending;
    await route.abort();
  });

  try {
    await focusMonitor(page);
    await page.getByRole("button", { name: "Enterprise Knowledge Copilot" }).click();
    const openWindow = page.locator(monitorWindow);
    await expect(openWindow).toBeVisible();

    await openWindow.getByRole("button", { name: "Load inside this window" }).click();
    await expect(openWindow.getByText(/cannot be displayed inside the window/i)).toBeVisible({ timeout: 20_000 });

    await expect(openWindow.getByRole("link", { name: "Open the site directly" })).toHaveAttribute(
      "href",
      "https://github.com/AmirRghp/enterprise-knowledge-copilot",
    );
    await expect(openWindow.getByRole("link", { name: "Open in new tab" })).toHaveAttribute(
      "href",
      "https://github.com/AmirRghp/enterprise-knowledge-copilot",
    );
  } finally {
    release();
  }
});

test("the project window takes the focus and returns it to its icon", async ({ page }) => {
  await focusMonitor(page);

  const icon = page.getByRole("button", { name: "Freelance Project Radar" });
  const close = page.getByRole("button", { name: "Close", exact: true });

  await icon.click();
  await expect(icon).toHaveAttribute("data-selected", "true");
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(icon).toBeFocused();
  await expect(icon).toHaveAttribute("data-selected", "true");

  await page.keyboard.press("Enter");
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(close).toBeFocused();

  await close.click();
  await expect(page.locator(monitorWindow)).toHaveCount(0);
  await expect(icon).toBeFocused();
});

test("selection follows project activation while hover and focus do not select icons", async ({ page }) => {
  await focusMonitor(page);

  const project = page.getByRole("button", { name: "Enterprise Knowledge Copilot" });
  const another = page.getByRole("button", { name: "Laya Fine-tuning Pipeline" });

  await project.hover();
  await expect(project).not.toHaveAttribute("data-selected", "true");
  await project.focus();
  await expect(project).not.toHaveAttribute("data-selected", "true");

  await project.click();
  await expect(project).toHaveAttribute("data-selected", "true");
  await expect(another).not.toHaveAttribute("data-selected", "true");
  await page.getByRole("button", { name: "Close", exact: true }).click();

  await another.click();
  await expect(another).toHaveAttribute("data-selected", "true");
  await expect(project).not.toHaveAttribute("data-selected", "true");
});

test("an icon can be dragged without opening its app", async ({ page }) => {
  await focusMonitor(page);

  const icon = page.getByRole("button", { name: "Enterprise Knowledge Copilot" });
  const before = await icon.boundingBox();
  await icon.hover();
  await page.mouse.down();
  await page.mouse.move(before!.x + 150, before!.y + 90, { steps: 12 });
  await page.mouse.up();

  await expect(page.locator(monitorWindow)).toHaveCount(0);
  const after = await icon.boundingBox();
  expect(after!.x - before!.x).toBeGreaterThan(60);
  expect(after!.y - before!.y).toBeGreaterThan(30);
});

test("a dragged icon stays inside the screen of the monitor", async ({ page }) => {
  await focusMonitor(page);

  const icon = page.getByRole("button", { name: "Freelance Project Radar" });
  const screen = await page.locator(desktop).boundingBox();
  const before = await icon.boundingBox();
  await icon.hover();
  await page.mouse.down();
  await page.mouse.move(screen!.x + screen!.width + 600, before!.y, { steps: 10 });
  await page.mouse.up();

  const after = await icon.boundingBox();
  expect(after!.x + after!.width).toBeLessThanOrEqual(screen!.x + screen!.width + 2);
  expect(after!.y).toBeGreaterThanOrEqual(screen!.y - 2);
});

test("every app icon stays inside the screen of the monitor", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole("button", { name: "Monitor", exact: true }).click();
    await expect(page.locator(desktop)).toBeVisible();
    await page.waitForTimeout(900);

    const icons = await page.evaluate(() => {
      const desktop = document.querySelector<HTMLElement>('[role="region"][aria-label="Amirreza workspace"]')!;
      const screen = desktop.getBoundingClientRect();
      return [...desktop.querySelectorAll<HTMLElement>("button[data-app-id]")].map((icon) => {
        const rect = icon.getBoundingClientRect();
        return {
          name: icon.textContent?.trim().slice(0, 24) ?? "",
          inside: rect.top >= screen.top - 1 && rect.bottom <= screen.bottom + 1
            && rect.left >= screen.left - 1 && rect.right <= screen.right + 1,
        };
      });
    });

    expect(icons).toHaveLength(4);
    for (const icon of icons) expect(icon.inside, `${icon.name} at ${width}px`).toBe(true);

    await page.getByRole("button", { name: "Back to room", exact: true }).click();
  }
});

test("icons stay inside the screen after a resize", async ({ page }) => {
  await focusMonitor(page);

  const icon = page.getByRole("button", { name: "Enterprise Knowledge Copilot" });
  const before = await icon.boundingBox();
  await icon.hover();
  await page.mouse.down();
  await page.mouse.move(before!.x + 250, before!.y + 160, { steps: 12 });
  await page.mouse.up();
  await expect(page.locator(monitorWindow)).toHaveCount(0);

  await page.setViewportSize({ width: 320, height: 800 });
  await page.waitForTimeout(1200);

  const icons = await page.evaluate(() => {
    const desktop = document.querySelector<HTMLElement>('[role="region"][aria-label="Amirreza workspace"]')!;
    const screen = desktop.getBoundingClientRect();
    return [...desktop.querySelectorAll<HTMLElement>("button[data-app-id]")].map((item) => {
      const rect = item.getBoundingClientRect();
      return {
        name: item.textContent?.trim().slice(0, 24) ?? "",
        inside: rect.top >= screen.top - 1 && rect.bottom <= screen.bottom + 1
          && rect.left >= screen.left - 1 && rect.right <= screen.right + 1,
      };
    });
  });

  expect(icons).toHaveLength(4);
  for (const item of icons) expect(item.inside, `${item.name} after the resize`).toBe(true);
});

test("a cancelled pointer does not swallow the next keyboard activation", async ({ page }) => {
  await focusMonitor(page);

  const icon = page.getByRole("button", { name: "Freelance Project Radar" });
  await icon.hover();
  await page.mouse.down();

  // The browser takes the gesture over, so the pointer is cancelled and no click follows.
  await icon.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", isPrimary: true });

  // The keyboard must still open the app.
  await page.keyboard.press("Enter");
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();

  await page.mouse.up();
});

test("a cancelled pointer does not break the about-me file", async ({ page }) => {
  await focusMonitor(page);

  const file = page.getByRole("button", { name: "about-me.txt" });
  await file.hover();
  await page.mouse.down();
  await file.dispatchEvent("pointercancel", { pointerId: 1, pointerType: "mouse", isPrimary: true });

  await page.keyboard.press("Enter");
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(page.getByRole("heading", { name: /about me/i })).toBeVisible();

  await page.mouse.up();
});

test("a touch drag moves an icon without opening its app", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Monitor", exact: true }).tap();
  await expect(page.locator(desktop)).toBeVisible();

  const icon = page.getByRole("button", { name: "Laya Fine-tuning Pipeline" });
  const before = await icon.boundingBox();
  const start = { x: before!.x + before!.width / 2, y: before!.y + before!.height / 2 };
  const session = await context.newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: start.x, y: start.y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: start.x + 80, y: start.y + 60 }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });

  await expect(page.locator(monitorWindow)).toHaveCount(0);
  const after = await icon.boundingBox();
  expect(after!.x - before!.x).toBeGreaterThan(30);

  await context.close();
});

test("a touch tap opens a project app", async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 768, height: 1024 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Monitor", exact: true }).tap();
  await expect(page.locator(desktop)).toBeVisible();

  await page.getByRole("button", { name: "Freelance Project Radar" }).tap();
  await expect(page.locator(monitorWindow)).toBeVisible();
  await expect(page.getByRole("button", { name: "Close", exact: true })).toBeFocused();

  await context.close();
});
