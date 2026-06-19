/** Date helpers that work purely on yyyy-mm-dd strings to avoid TZ drift. */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a yyyy-mm-dd string into a local Date at midnight. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, n: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Inclusive list of ISO dates from start to end. */
export function dateRange(startISO: string, endISO: string): string[] {
  if (!startISO || !endISO) return [];
  const out: string[] = [];
  let cur = startISO;
  let guard = 0;
  while (cur <= endISO && guard < 366) {
    out.push(cur);
    cur = addDays(cur, 1);
    guard++;
  }
  return out;
}

export function dayCount(startISO: string, endISO: string): number {
  return dateRange(startISO, endISO).length;
}

export function formatDay(iso: string): { weekday: string; day: string; month: string } {
  const d = fromISODate(iso);
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day: `${d.getDate()}`,
    month: d.toLocaleDateString(undefined, { month: "short" }),
  };
}

export function formatRange(startISO: string, endISO: string): string {
  if (!startISO || !endISO) return "Dates not set";
  const s = fromISODate(startISO);
  const e = fromISODate(endISO);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const sMonth = s.toLocaleDateString(undefined, { month: "short" });
  const eMonth = e.toLocaleDateString(undefined, { month: "short" });
  if (sameMonth) {
    return `${sMonth} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${e.getFullYear()}`;
}

/** True when the ISO date is the local "today". */
export function isToday(iso: string): boolean {
  return iso === toISODate(new Date());
}

/** Current local time as "HH:MM" (24h). */
export function nowHM(): string {
  const d = new Date();
  return `${`${d.getHours()}`.padStart(2, "0")}:${`${d.getMinutes()}`.padStart(2, "0")}`;
}

export function prettyTime(time?: string): string {
  if (!time) return "";
  const [hStr, m] = time.split(":");
  let h = Number(hStr);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
