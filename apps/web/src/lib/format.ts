const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function fmtRange(a: string, b: string): string {
  const da = new Date(a);
  const db = new Date(b);
  const sameMonth = da.getMonth() === db.getMonth() && da.getFullYear() === db.getFullYear();
  const yearSuffix = `, ${db.getFullYear()}`;
  if (sameMonth) return `${MONTHS[da.getMonth()]} ${da.getDate()}–${db.getDate()}${yearSuffix}`;
  if (da.getFullYear() === db.getFullYear()) {
    return `${MONTHS[da.getMonth()]} ${da.getDate()} – ${MONTHS[db.getMonth()]} ${db.getDate()}${yearSuffix}`;
  }
  return `${MONTHS[da.getMonth()]} ${da.getDate()}, ${da.getFullYear()} – ${MONTHS[db.getMonth()]} ${db.getDate()}, ${db.getFullYear()}`;
}

export function fmtDay(d: string): string {
  const x = new Date(d);
  return `${DAYS[x.getDay()]}, ${MONTHS[x.getMonth()]} ${x.getDate()}`;
}

export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

const PRESENCE = [
  "var(--vt-presence-1)",
  "var(--vt-presence-2)",
  "var(--vt-presence-3)",
  "var(--vt-presence-4)",
  "var(--vt-presence-5)",
  "var(--vt-presence-6)",
];

export function presenceColor(seed: string | number): string {
  if (typeof seed === "number") return PRESENCE[seed % PRESENCE.length]!;
  const s = String(seed || "?");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return PRESENCE[h % PRESENCE.length]!;
}

export function initials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]![0]! + (parts[1]?.[0] ?? "")).toUpperCase();
}
