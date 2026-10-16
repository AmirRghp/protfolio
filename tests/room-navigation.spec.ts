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
