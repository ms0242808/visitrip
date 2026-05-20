// Mock data for the Trip design. Mirrors the prototype in src/data.jsx — kept
// inline because polls, activity, drifting cursors, and stylised maps don't
// have backend equivalents yet. Trips list / detail will be swapped to the
// real API once the schemas converge.

export type CoverVariant = "cover-lisbon" | "cover-paris" | "cover-kyoto" | "cover-iceland";

export interface Member {
  id: string;
  name: string;
  initials: string;
  hue: number;
  online: boolean;
  cursor?: { x: number; y: number };
}

export interface Trip {
  id: string;
  name: string;
  cover: CoverVariant;
  dates: string;
  daysAway: number;
  members: string[];
  days: number;
  places: number;
  status: "planning" | "past";
  budget: { spent: number; total: number; currency: string };
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  kind: "flight" | "stay" | "food" | "sight" | "transit" | "show";
  who: string;
  loc: string;
  icon: string;
  votes?: number;
}

export interface ItineraryDay {
  day: number;
  date: string;
  label: string;
  items: ItineraryItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  assigned: string;
}

export interface ChecklistSection {
  id: string;
  section: string;
  items: ChecklistItem[];
}

export interface Expense {
  id: string;
  label: string;
  amount: number;
  currency: string;
  paidBy: string;
  split: string[];
  date: string;
  category: "stay" | "food" | "sight" | "transit" | "show" | "flight";
}

export interface PollOption {
  id: string;
  label: string;
  sub: string;
  votes: string[];
  img?: CoverVariant;
}

export interface Poll {
  id: string;
  q: string;
  deadline: string;
  author: string;
  options: PollOption[];
}

export interface DocumentItem {
  id: string;
  name: string;
  type: "Flight" | "Hotel" | "Transit" | "Policy" | "IDs";
  meta: string;
  who: string;
  kind: "flight" | "hotel" | "transit" | "policy" | "id";
}

export interface ActivityEvent {
  id: string;
  who: string;
  text: string;
  at: string;
  icon: "vote" | "plus" | "cash" | "pin";
}

export const MEMBERS: Member[] = [
  { id: "u1", name: "You", initials: "YO", hue: 24, online: true, cursor: { x: 0.62, y: 0.18 } },
  { id: "u2", name: "Maya", initials: "MA", hue: 350, online: true, cursor: { x: 0.18, y: 0.42 } },
  { id: "u3", name: "Theo", initials: "TH", hue: 220, online: true, cursor: { x: 0.78, y: 0.66 } },
  { id: "u4", name: "Priya", initials: "PR", hue: 145, online: false },
  { id: "u5", name: "Léo", initials: "LE", hue: 280, online: true },
  { id: "u6", name: "Sana", initials: "SA", hue: 40, online: false },
];

export const TRIPS: Trip[] = [
  {
    id: "t1",
    name: "Lisbon long weekend",
    cover: "cover-lisbon",
    dates: "Jun 12 – Jun 16",
    daysAway: 24,
    members: ["u1", "u2", "u3", "u5"],
    days: 4,
    places: 11,
    status: "planning",
    budget: { spent: 642, total: 1800, currency: "€" },
  },
  {
    id: "t2",
    name: "Kyoto in autumn",
    cover: "cover-kyoto",
    dates: "Oct 28 – Nov 6",
    daysAway: 162,
    members: ["u1", "u2", "u4", "u6"],
    days: 9,
    places: 22,
    status: "planning",
    budget: { spent: 0, total: 3200, currency: "€" },
  },
  {
    id: "t3",
    name: "Iceland ring road",
    cover: "cover-iceland",
    dates: "Aug 4 – Aug 14",
    daysAway: 77,
    members: ["u1", "u3", "u5"],
    days: 10,
    places: 16,
    status: "planning",
    budget: { spent: 1200, total: 5400, currency: "€" },
  },
  {
    id: "t4",
    name: "Paris with mum",
    cover: "cover-paris",
    dates: "Mar 2 – Mar 6",
    daysAway: -52,
    members: ["u1", "u4"],
    days: 4,
    places: 9,
    status: "past",
    budget: { spent: 1240, total: 1500, currency: "€" },
  },
];

export const ITINERARY: ItineraryDay[] = [
  {
    day: 1,
    date: "Thu, Jun 12",
    label: "Arrive · Alfama",
    items: [
      { id: "i1", time: "14:30", title: "Land at LIS", kind: "flight", who: "u2", loc: "Humberto Delgado", icon: "plane" },
      { id: "i2", time: "16:00", title: "Check in — Memmo Alfama", kind: "stay", who: "u1", loc: "Alfama", icon: "bed" },
      { id: "i3", time: "19:30", title: "Dinner at Taberna da Rua das Flores", kind: "food", who: "u3", loc: "Chiado", icon: "fork", votes: 3 },
    ],
  },
  {
    day: 2,
    date: "Fri, Jun 13",
    label: "Belém · pastéis",
    items: [
      { id: "i4", time: "09:00", title: "Tram 28E from Martim Moniz", kind: "transit", who: "u2", loc: "Lisbon", icon: "tram" },
      { id: "i5", time: "10:30", title: "Jerónimos Monastery", kind: "sight", who: "u1", loc: "Belém", icon: "star" },
      { id: "i6", time: "12:00", title: "Pastéis de Belém (queue!)", kind: "food", who: "u5", loc: "Belém", icon: "fork" },
      { id: "i7", time: "15:00", title: "MAAT museum", kind: "sight", who: "u3", loc: "Belém", icon: "star" },
      { id: "i8", time: "20:00", title: "Fado at Mesa de Frades", kind: "show", who: "u2", loc: "Alfama", icon: "music", votes: 2 },
    ],
  },
  {
    day: 3,
    date: "Sat, Jun 14",
    label: "Sintra day trip",
    items: [
      { id: "i9", time: "08:15", title: "Train Rossio → Sintra", kind: "transit", who: "u3", loc: "40min", icon: "tram" },
      { id: "i10", time: "10:00", title: "Quinta da Regaleira", kind: "sight", who: "u1", loc: "Sintra", icon: "star" },
      { id: "i11", time: "13:30", title: "Lunch at Tascantiga", kind: "food", who: "u5", loc: "Sintra", icon: "fork" },
      { id: "i12", time: "21:00", title: "Sunset, Miradouro da Senhora do Monte", kind: "sight", who: "u2", loc: "Graça", icon: "star" },
    ],
  },
  {
    day: 4,
    date: "Sun, Jun 15",
    label: "Beach · fly",
    items: [
      { id: "i13", time: "10:00", title: "Train to Cascais beach", kind: "transit", who: "u1", loc: "30min", icon: "tram" },
      { id: "i14", time: "18:00", title: "Fly home — TP1372", kind: "flight", who: "u3", loc: "LIS → CDG", icon: "plane" },
    ],
  },
];

export const CHECKLIST: ChecklistSection[] = [
  {
    id: "c1",
    section: "Documents",
    items: [
      { id: "c11", text: "Passports valid 6+ months", done: true, assigned: "u1" },
      { id: "c12", text: "EU travel insurance", done: true, assigned: "u2" },
      { id: "c13", text: "Print boarding passes", done: false, assigned: "u3" },
      { id: "c14", text: "Screenshot hotel bookings", done: false, assigned: "u1" },
    ],
  },
  {
    id: "c2",
    section: "Pack",
    items: [
      { id: "c21", text: "Linen shirts × 3", done: true, assigned: "u1" },
      { id: "c22", text: "Walking shoes", done: true, assigned: "u1" },
      { id: "c23", text: "Sunscreen (reef-safe)", done: false, assigned: "u2" },
      { id: "c24", text: "Universal adapter (EU)", done: false, assigned: "u3" },
      { id: "c25", text: "Refillable water bottle", done: false, assigned: "u5" },
      { id: "c26", text: "Light jacket", done: false, assigned: "u1" },
    ],
  },
  {
    id: "c3",
    section: "Pre-trip",
    items: [
      { id: "c31", text: "Book Sintra train", done: false, assigned: "u3" },
      { id: "c32", text: "Reserve Mesa de Frades", done: true, assigned: "u2" },
      { id: "c33", text: "Currency swap (€200 cash)", done: false, assigned: "u1" },
    ],
  },
];

export const EXPENSES: Expense[] = [
  { id: "e1", label: "Memmo Alfama — 3 nights", amount: 612, currency: "€", paidBy: "u1", split: ["u1", "u2", "u3", "u5"], date: "Jun 12", category: "stay" },
  { id: "e2", label: "Tickets Quinta da Regaleira", amount: 48, currency: "€", paidBy: "u2", split: ["u1", "u2", "u3", "u5"], date: "Jun 14", category: "sight" },
  { id: "e3", label: "Dinner — Taberna", amount: 134, currency: "€", paidBy: "u3", split: ["u1", "u2", "u3", "u5"], date: "Jun 12", category: "food" },
  { id: "e4", label: "Tram tickets (24h)", amount: 26.4, currency: "€", paidBy: "u1", split: ["u1", "u2", "u3"], date: "Jun 13", category: "transit" },
  { id: "e5", label: "Pastéis (x2 each)", amount: 21.2, currency: "€", paidBy: "u5", split: ["u1", "u2", "u3", "u5"], date: "Jun 13", category: "food" },
];

export const POLLS: Poll[] = [
  {
    id: "p1",
    q: "Where to stay in Alfama?",
    deadline: "Closes Sun",
    author: "u2",
    options: [
      { id: "o1", label: "Memmo Alfama", sub: "€612 · 4★ · view", votes: ["u1", "u3", "u5"], img: "cover-lisbon" },
      { id: "o2", label: "Casa do Bairro", sub: "€420 · 4.6★ · cozy", votes: ["u2"], img: "cover-kyoto" },
      { id: "o3", label: "Solar dos Mouros", sub: "€540 · view · castle next door", votes: [], img: "cover-paris" },
    ],
  },
  {
    id: "p2",
    q: "Day 3 — beach or wine country?",
    deadline: "Closes Tue",
    author: "u3",
    options: [
      { id: "o4", label: "Cascais beach day", sub: "30 min by train", votes: ["u1", "u5"] },
      { id: "o5", label: "Setúbal wineries", sub: "Tour + lunch — €85pp", votes: ["u2", "u3"] },
    ],
  },
];

export const DOCUMENTS: DocumentItem[] = [
  { id: "d1", name: "TAP TP1349 — outbound", type: "Flight", meta: "CDG → LIS · Jun 12 · 14:30", who: "u1", kind: "flight" },
  { id: "d2", name: "TAP TP1372 — return", type: "Flight", meta: "LIS → CDG · Jun 15 · 18:00", who: "u1", kind: "flight" },
  { id: "d3", name: "Memmo Alfama booking", type: "Hotel", meta: "3 nights · 2 rooms · #M-92341", who: "u2", kind: "hotel" },
  { id: "d4", name: "Sintra train tickets", type: "Transit", meta: "CP train · Jun 14 · 4 pax", who: "u3", kind: "transit" },
  { id: "d5", name: "Travel insurance", type: "Policy", meta: "Allianz · ALZ-77291", who: "u2", kind: "policy" },
  { id: "d6", name: "Group passports.zip", type: "IDs", meta: "4 files · 3.2 MB", who: "u1", kind: "id" },
];

export const ACTIVITY: ActivityEvent[] = [
  { id: "a1", who: "u2", text: "voted for Memmo Alfama", at: "2m", icon: "vote" },
  { id: "a2", who: "u3", text: "added Mesa de Frades to Day 2", at: "18m", icon: "plus" },
  { id: "a3", who: "u5", text: "paid €21.20 for Pastéis", at: "1h", icon: "cash" },
  { id: "a4", who: "u1", text: "pinned Quinta da Regaleira", at: "3h", icon: "pin" },
];

export function memberById(id: string): Member {
  return MEMBERS.find((m) => m.id === id) ?? MEMBERS[0]!;
}
