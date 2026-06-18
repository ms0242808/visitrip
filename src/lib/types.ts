export type CategoryId =
  | "sightseeing"
  | "food"
  | "transport"
  | "lodging"
  | "activity"
  | "shopping";

export interface Category {
  id: CategoryId;
  label: string;
  /** CSS custom property name holding the colour */
  colorVar: string;
  emoji: string;
}

export interface Activity {
  id: string;
  /** ISO date (yyyy-mm-dd) of the day this belongs to */
  date: string;
  /** 24h time string "HH:MM" — optional (unscheduled ideas) */
  time?: string;
  title: string;
  category: CategoryId;
  location?: string;
  cost?: number;
  notes?: string;
  done?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string; // ISO yyyy-mm-dd
  currency: string; // symbol, e.g. "$"
  budget?: number;
  activities: Activity[];
  /** index into COVERS for the trip's cover gradient */
  cover: number;
  emoji: string;
  createdAt: number;
  updatedAt: number;
}

/** Cover gradient presets — pick one per trip for a distinct identity. */
export interface Cover {
  name: string;
  from: string;
  to: string;
}

export const COVERS: Cover[] = [
  { name: "Coral", from: "#ff7a59", to: "#ff5e7e" },
  { name: "Sunset", from: "#ff9966", to: "#ff5e62" },
  { name: "Ocean", from: "#2193b0", to: "#6dd5ed" },
  { name: "Lagoon", from: "#11998e", to: "#38ef7d" },
  { name: "Twilight", from: "#7367f0", to: "#ce9ffc" },
  { name: "Berry", from: "#c471ed", to: "#f64f59" },
  { name: "Citrus", from: "#f7971e", to: "#ffd200" },
  { name: "Indigo", from: "#4e54c8", to: "#8f94fb" },
];

export function coverGradient(i: number): string {
  const c = COVERS[((i % COVERS.length) + COVERS.length) % COVERS.length];
  return `linear-gradient(135deg, ${c.from}, ${c.to})`;
}

export const TRIP_EMOJIS = [
  "✈️", "🏝️", "🏔️", "🏙️", "🗺️", "🎒",
  "⛩️", "🗽", "🌋", "🐠", "🍷", "🚗",
];

export const CURRENCIES = ["$", "€", "£", "¥", "₹", "A$"];

export const CATEGORIES: Category[] = [
  { id: "sightseeing", label: "Sights", colorVar: "--c-sight", emoji: "🏛️" },
  { id: "food", label: "Food", colorVar: "--c-food", emoji: "🍜" },
  { id: "activity", label: "Activity", colorVar: "--c-activity", emoji: "🎒" },
  { id: "transport", label: "Transit", colorVar: "--c-transport", emoji: "🚆" },
  { id: "lodging", label: "Stay", colorVar: "--c-lodging", emoji: "🛏️" },
  { id: "shopping", label: "Shopping", colorVar: "--c-shopping", emoji: "🛍️" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = CATEGORIES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<CategoryId, Category>,
);
