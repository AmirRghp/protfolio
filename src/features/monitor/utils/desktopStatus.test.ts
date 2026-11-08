import { describe, expect, it } from "vitest";
import { formatStatusTimestamp } from "./desktopStatus";

describe("desktop status timestamp", () => {
  it("shows the local weekday, date and time of the workspace clock", () => {
    const timestamp = formatStatusTimestamp(new Date(2026, 9, 19, 18, 44));

    expect(timestamp.label).toBe("Monday · 19 Oct · 6:44 PM");
    expect(timestamp.iso).toBe(new Date(2026, 9, 19, 18, 44).toISOString());
  });

  it("keeps the midnight hour in the local twelve hour clock", () => {
    expect(formatStatusTimestamp(new Date(2026, 9, 20, 0, 5)).label).toBe("Tuesday · 20 Oct · 12:05 AM");
  });

  it("changes the weekday and the date when the local day rolls over", () => {
    const lastMinute = formatStatusTimestamp(new Date(2026, 9, 19, 23, 59));
    const firstMinute = formatStatusTimestamp(new Date(2026, 9, 20, 0, 0));

    expect(lastMinute.label).toBe("Monday · 19 Oct · 11:59 PM");
    expect(firstMinute.label).toBe("Tuesday · 20 Oct · 12:00 AM");
    expect(firstMinute.label).not.toBe(lastMinute.label);
  });
});
