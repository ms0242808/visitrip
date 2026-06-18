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
}

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
