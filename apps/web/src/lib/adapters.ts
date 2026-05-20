// Maps backend models (from @visitrip/shared) into the view models the new
// Trip design speaks. The design's own data shapes live alongside in lib/data.ts
// (mock-only sections: polls, map pins, global activity feed).

import type {
  CoverKind,
  Day,
  DayItem,
  DayItemKind,
  Doc,
  Expense,
  Member,
  PackingItem,
  TripDetail,
  TripSummary,
} from "@visitrip/shared";
import type {
  ActivityEvent,
  ChecklistItem,
  ChecklistSection,
  DocumentItem,
  Expense as ViewExpense,
  ItineraryDay,
  ItineraryItem,
  Member as ViewMember,
  Trip as ViewTrip,
} from "./data";

const MS_PER_DAY = 86_400_000;
const ME_PLACEHOLDER_ID = "u1"; // legacy; replaced by real auth user id at call sites

// ── Deterministic, hash-based hue & initials for any user id ──────────────
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
export function hueFor(id: string): number {
  return hashCode(id) % 360;
}
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

// ── Date helpers ──────────────────────────────────────────────────────────
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseIsoDate(iso: string): Date {
  // Treat as local-noon to avoid DST/timezone day-rollover surprises.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12, 0, 0);
}

function fmtShort(iso: string): string {
  const d = parseIsoDate(iso);
  return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function fmtFullDay(iso: string): string {
  const d = parseIsoDate(iso);
  return `${WEEKDAYS_SHORT[d.getDay()]}, ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysBetween(target: Date, ref: Date = new Date()): number {
  return Math.round(
    (startOfLocalDay(target).getTime() - startOfLocalDay(ref).getTime()) / MS_PER_DAY,
  );
}

// ── Member ────────────────────────────────────────────────────────────────
export function adaptMember(m: Member): ViewMember {
  return {
    id: m.id,
    name: m.name || m.email,
    initials: initialsFor(m.name || m.email || "?"),
    hue: hueFor(m.id),
    online: false,
  };
}

export interface MemberDirectory {
  byId: Map<string, ViewMember>;
  me: ViewMember;
  ids: string[];
  /** Returns a synthesised "guest" member when a referenced id isn't in this trip. */
  resolve(id: string): ViewMember;
}

export function buildDirectory(
  members: Member[],
  me: { id: string; name: string; email: string } | null,
  presence: Iterable<string> = [],
): MemberDirectory {
  const onlineIds = new Set(presence);
  const byId = new Map<string, ViewMember>();
  for (const m of members) {
    const v = adaptMember(m);
    if (onlineIds.has(m.id)) v.online = true;
    byId.set(m.id, v);
  }
  const meId = me?.id ?? ME_PLACEHOLDER_ID;
  const meView: ViewMember = byId.get(meId) ?? {
    id: meId,
    name: me?.name || me?.email || "You",
    initials: initialsFor(me?.name || me?.email || "You"),
    hue: hueFor(meId),
    online: true,
  };
  if (!byId.has(meId)) byId.set(meId, meView);

  function resolve(id: string): ViewMember {
    const found = byId.get(id);
    if (found) return found;
    return {
      id,
      name: id.slice(0, 6),
      initials: initialsFor(id.slice(0, 2)),
      hue: hueFor(id),
      online: false,
    };
  }

  return { byId, me: meView, ids: members.map((m) => m.id), resolve };
}

// ── Item kind <-> design kind ────────────────────────────────────────────
const KIND_TO_DESIGN: Record<DayItemKind, ItineraryItem["kind"]> = {
  flight: "flight",
  stay: "stay",
  food: "food",
  transit: "transit",
  place: "sight",
};
const DESIGN_TO_KIND: Record<ItineraryItem["kind"], DayItemKind> = {
  flight: "flight",
  stay: "stay",
  food: "food",
  transit: "transit",
  sight: "place",
  show: "place",
};
const DEFAULT_ICON: Record<ItineraryItem["kind"], string> = {
  flight: "plane",
  stay: "bed",
  food: "fork",
  transit: "tram",
  sight: "star",
  show: "music",
};

export function designKind(k: DayItemKind): ItineraryItem["kind"] {
  return KIND_TO_DESIGN[k];
}
export function backendKind(k: ItineraryItem["kind"]): DayItemKind {
  return DESIGN_TO_KIND[k];
}
export function defaultIconFor(k: ItineraryItem["kind"]): string {
  return DEFAULT_ICON[k];
}

// ── Itinerary item ────────────────────────────────────────────────────────
export function adaptDayItem(item: DayItem, who: string): ItineraryItem {
  const kind = designKind(item.type);
  return {
    id: item.id,
    time: item.time,
    title: item.title,
    kind,
    who,
    loc: item.sub || "",
    icon: item.icon || DEFAULT_ICON[kind],
  };
}

export function adaptDay(d: Day, who: string): ItineraryDay {
  return {
    day: d.position + 1,
    date: fmtFullDay(d.date),
    label: d.label,
    items: d.items.map((it) => adaptDayItem(it, who)),
  };
}

// ── Cover  ────────────────────────────────────────────────────────────────
// CSS in index.css ships gradients for every CoverKind. Pass through as-is.
export function adaptCover(c: CoverKind): string {
  return c;
}

// ── Trip summary (lists) ─────────────────────────────────────────────────
export function adaptTripSummary(s: TripSummary): Pick<ViewTrip, "id" | "name" | "cover" | "dates" | "daysAway" | "days" | "places" | "status"> & {
  memberCount: number;
} {
  const start = parseIsoDate(s.startDate);
  const end = parseIsoDate(s.endDate);
  const daysAway = daysBetween(start);
  const days = Math.max(1, daysBetween(end, start) + 1);
  const status: ViewTrip["status"] = s.archived || daysAway < -1 ? "past" : "planning";
  return {
    id: s.id,
    name: s.title,
    cover: adaptCover(s.cover) as ViewTrip["cover"],
    dates: `${fmtShort(s.startDate)} – ${fmtShort(s.endDate)}`,
    daysAway,
    days,
    places: 0, // not exposed on summary
    status,
    memberCount: s.memberCount,
  };
}

// ── Trip detail ──────────────────────────────────────────────────────────
export function adaptTripDetail(t: TripDetail): ViewTrip {
  const start = parseIsoDate(t.startDate);
  const end = parseIsoDate(t.endDate);
  const daysAway = daysBetween(start);
  const totalDays = Math.max(1, daysBetween(end, start) + 1);
  const places = t.days.reduce((n, d) => n + d.items.length, 0);
  const spentCents = t.expenses.reduce((n, e) => n + e.amountCents, 0);
  const currencySymbol = currencySymbolFor(t.currency);
  return {
    id: t.id,
    name: t.title,
    cover: adaptCover(t.cover) as ViewTrip["cover"],
    dates: `${fmtShort(t.startDate)} – ${fmtShort(t.endDate)}`,
    daysAway,
    members: t.members.map((m) => m.id),
    days: t.days.length || totalDays,
    places,
    status: t.archived || daysAway < -1 ? "past" : "planning",
    budget: {
      spent: spentCents / 100,
      total: t.budgetTotalCents / 100,
      currency: currencySymbol,
    },
  };
}

// ── Currency  ─────────────────────────────────────────────────────────────
const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  JPY: "¥",
  CAD: "CA$",
  AUD: "AU$",
  CHF: "CHF",
};
export function currencySymbolFor(code: string): string {
  return CURRENCY_SYMBOLS[code] ?? code;
}

// ── Expense ───────────────────────────────────────────────────────────────
export function adaptExpense(
  e: Expense,
  allMemberIds: string[],
  currencySymbol = "€",
): ViewExpense {
  return {
    id: e.id,
    label: e.label,
    amount: e.amountCents / 100,
    currency: currencySymbolFor(e.currency) || currencySymbol,
    paidBy: e.paidById,
    split: allMemberIds,
    date: fmtShort(e.date),
    category: inferExpenseCategory(e.label),
  };
}

const CATEGORY_HINTS: Array<[RegExp, ViewExpense["category"]]> = [
  [/flight|airline|plane|airfare|TAP/i, "flight"],
  [/hotel|hostel|airbnb|stay|night|room/i, "stay"],
  [/dinner|lunch|breakfast|cafe|restaurant|food|pastéis|tasca|beer|wine/i, "food"],
  [/tram|train|bus|taxi|uber|metro|transit|ferry/i, "transit"],
  [/show|concert|fado|theater|opera/i, "show"],
  [/museum|sight|tickets?|tour|park/i, "sight"],
];
function inferExpenseCategory(label: string): ViewExpense["category"] {
  for (const [re, cat] of CATEGORY_HINTS) if (re.test(label)) return cat;
  return "food";
}

// ── Packing → Checklist ───────────────────────────────────────────────────
export function adaptPackingToChecklist(items: PackingItem[]): ChecklistSection[] {
  const grouped = new Map<string, ChecklistItem[]>();
  for (const it of items) {
    const list = grouped.get(it.category) ?? [];
    list.push({ id: it.id, text: it.label, done: it.done, assigned: "" });
    grouped.set(it.category, list);
  }
  const out: ChecklistSection[] = [];
  for (const [section, list] of grouped) {
    out.push({ id: section, section, items: list });
  }
  out.sort((a, b) => a.section.localeCompare(b.section));
  return out;
}

// ── Yjs packing array → checklist sections ────────────────────────────────
export interface YPackingShape {
  id: string;
  category: string;
  label: string;
  done: boolean;
  position: number;
}

export function yPackingToChecklist(items: YPackingShape[]): ChecklistSection[] {
  return adaptPackingToChecklist(
    items.map(
      (it) =>
        ({
          id: it.id,
          category: it.category,
          label: it.label,
          done: it.done,
          position: it.position,
        }) as PackingItem,
    ),
  );
}

// ── Documents ─────────────────────────────────────────────────────────────
const DOC_TYPE_LABEL: Record<string, DocumentItem["type"]> = {
  flight: "Flight",
  hotel: "Hotel",
  stay: "Hotel",
  transit: "Transit",
  policy: "Policy",
  id: "IDs",
  passport: "IDs",
};
const DOC_KIND_NORMALIZED: Record<string, DocumentItem["kind"]> = {
  flight: "flight",
  hotel: "hotel",
  stay: "hotel",
  transit: "transit",
  policy: "policy",
  id: "id",
  passport: "id",
};

export function adaptDoc(d: Doc, ownerHint?: string): DocumentItem {
  const lower = (d.kind || "").toLowerCase();
  const type = DOC_TYPE_LABEL[lower] ?? "Policy";
  const kind = DOC_KIND_NORMALIZED[lower] ?? "policy";
  return {
    id: d.id,
    name: d.label,
    type,
    meta: d.size || "—",
    who: d.ownerId || ownerHint || "",
    kind,
  };
}

// ── Activity (no backend feed): expose a derived placeholder for trip overview
export function defaultActivityFor(memberId: string): ActivityEvent[] {
  return [{ id: "live", who: memberId, text: "is exploring this trip", at: "now", icon: "pin" }];
}
