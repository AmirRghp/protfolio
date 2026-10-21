import { useEffect, useState } from "react";

const weekdayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long" });
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short" });
const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export type StatusTimestamp = {
  /** Machine readable instant for the `datetime` attribute. */
  iso: string;
  /** Human readable local weekday, date and time. */
  label: string;
};

export function formatStatusTimestamp(date: Date): StatusTimestamp {
  return {
    iso: date.toISOString(),
    label: [
      weekdayFormat.format(date),
      `${date.getDate()} ${monthFormat.format(date)}`,
      timeFormat.format(date),
    ].join(" · "),
  };
}

/** A local clock that follows the visitor's own time and rolls the day over at local midnight. */
export function useLiveClock(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}
