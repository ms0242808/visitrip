export type PersonId = string;
export type TripId = string;
export type DayId = string;

export type Role = "Owner" | "Editor" | "Viewer";

export interface Person {
  id: PersonId;
  name: string;
  handle: string;
  role: Role;
}

export type DayItemKind = "flight" | "stay" | "place" | "food" | "transit";
export type IconName = string;

export interface DayItem {
  id: string;
  type: DayItemKind;
  time: string;
  title: string;
  sub: string;
  icon: IconName;
  anchor?: boolean;
  tag?: "Reservation" | "Tickets" | "Booked" | "Walk-in";
}

export interface Day {
  id: DayId;
  date: string;
  label: string;
  items: DayItem[];
}

export interface Expense {
  id: string;
  date: string;
  label: string;
  amount: number;
  paidBy: PersonId;
  currency: string;
}

export interface PackingItem {
  id: string;
  label: string;
  done: boolean;
}

export interface PackingGroup {
  cat: "Clothes" | "Docs" | "Other";
  items: PackingItem[];
}

export interface TripDoc {
  id: string;
  label: string;
  kind: string;
  size: string;
  owner: PersonId;
}

export type CoverKind = "cover-lisbon" | "cover-hokkaido" | "cover-cdmx";

export interface Trip {
  id: TripId;
  title: string;
  cover: CoverKind;
  location: string;
  start: string;
  end: string;
  members: PersonId[];
  summary: string;
  budget: { spent: number; total: number; currency: string };
  days: Day[];
  expenses: Expense[];
  packing: PackingGroup[];
  docs: TripDoc[];
  archived?: boolean;
}
