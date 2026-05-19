import { useEffect, useState } from "react";

export type Appearance = "system" | "light" | "dark";
export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CAD" | "AUD" | "CHF";
export type WeekStart = "sun" | "mon";

interface Prefs {
  appearance: Appearance;
  currency: Currency;
  weekStart: WeekStart;
  notifyTripUpdates: boolean;
  notifyExpenses: boolean;
  syncTrips: boolean;
  saveOffline: boolean;
}

const DEFAULTS: Prefs = {
  appearance: "system",
  currency: "USD",
  weekStart: "mon",
  notifyTripUpdates: true,
  notifyExpenses: false,
  syncTrips: true,
  saveOffline: true,
};

const STORAGE_KEY = "visitrip:prefs";
const SUBS = new Set<() => void>();

let current: Prefs = (() => {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULTS;
  }
})();

function notify() {
  for (const s of SUBS) s();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {}
}

export function getPrefs(): Prefs {
  return current;
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  current = { ...current, [key]: value };
  persist();
  notify();
  if (key === "appearance") applyAppearance(current.appearance);
}

export function subscribePrefs(cb: () => void): () => void {
  SUBS.add(cb);
  return () => SUBS.delete(cb);
}

export function usePrefs(): Prefs {
  const [, force] = useState(0);
  useEffect(() => subscribePrefs(() => force((n) => n + 1)), []);
  return current;
}

export function applyAppearance(mode: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const inner = document.querySelector<HTMLElement>(".vt-frame__inner");
  const resolved =
    mode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  root.setAttribute("data-theme", resolved);
  if (inner) inner.setAttribute("data-theme", resolved);
}

let mq: MediaQueryList | null = null;
let mqListener: ((e: MediaQueryListEvent) => void) | null = null;

export function startAppearanceSync() {
  if (typeof window === "undefined") return;
  applyAppearance(current.appearance);
  if (mq && mqListener) mq.removeEventListener("change", mqListener);
  mq = window.matchMedia("(prefers-color-scheme: dark)");
  mqListener = () => {
    if (current.appearance === "system") applyAppearance("system");
  };
  mq.addEventListener("change", mqListener);
}

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: "US Dollar · $",
  EUR: "Euro · €",
  GBP: "British Pound · £",
  JPY: "Japanese Yen · ¥",
  CAD: "Canadian Dollar · CA$",
  AUD: "Australian Dollar · AU$",
  CHF: "Swiss Franc · CHF",
};

export const APPEARANCE_LABELS: Record<Appearance, string> = {
  system: "Auto · match device",
  light: "Light",
  dark: "Dark",
};

export const WEEK_START_LABELS: Record<WeekStart, string> = {
  mon: "Monday",
  sun: "Sunday",
};
