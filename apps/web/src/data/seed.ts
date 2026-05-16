import type { Person, Trip } from "./types";

export const PEOPLE: Person[] = [
  { id: "p1", name: "Mira Castellan", handle: "mira", role: "Owner" },
  { id: "p2", name: "Theo Vance", handle: "theo", role: "Editor" },
  { id: "p3", name: "Anya Reyes", handle: "anya", role: "Editor" },
  { id: "p4", name: "Jonas Lindqvist", handle: "jonas", role: "Viewer" },
];

export const ME: Person = PEOPLE[0]!;

export function personById(id: string): Person {
  const p = PEOPLE.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown person ${id}`);
  return p;
}

export const TRIPS: Trip[] = [
  {
    id: "t1",
    title: "Lisbon & the Alentejo",
    cover: "cover-lisbon",
    location: "Portugal",
    start: "2026-04-12",
    end: "2026-04-21",
    members: ["p1", "p2", "p3", "p4"],
    summary:
      "Nine days. Lisbon for old-town wandering, then south through cork forests, fishing villages, and slow dinners on the coast.",
    budget: { spent: 1840, total: 3200, currency: "EUR" },
    days: [
      {
        id: "d1",
        date: "2026-04-12",
        label: "Sun · Arrive Lisbon",
        items: [
          { id: "i1", type: "flight", time: "07:25", title: "IAD → LIS · TAP TP218", sub: "Premium Economy · 7h 10m", icon: "plane", anchor: true },
          { id: "i2", type: "stay", time: "15:00", title: "Memmo Alfama check-in", sub: "Travessa das Merceeiras 27 · Booked", icon: "bed" },
          { id: "i3", type: "place", time: "18:00", title: "Sunset at Miradouro de Santa Luzia", sub: "Then dinner nearby", icon: "pin" },
          { id: "i4", type: "food", time: "20:30", title: "Dinner · A Travessa do Fado", sub: "Reservation for 4", icon: "fork", tag: "Reservation" },
        ],
      },
      {
        id: "d2",
        date: "2026-04-13",
        label: "Mon · Alfama & Belém",
        items: [
          { id: "i5", type: "food", time: "09:00", title: "Pastel de nata at Manteigaria", sub: "Walk-up, ~10 min wait", icon: "cup" },
          { id: "i6", type: "place", time: "10:30", title: "Mosteiro dos Jerónimos", sub: "Tickets booked · skip-the-line", icon: "pin", tag: "Tickets" },
          { id: "i7", type: "place", time: "13:00", title: "LX Factory for lunch + browsing", sub: "4 hr block", icon: "pin" },
          { id: "i8", type: "food", time: "20:00", title: "Dinner · Cervejaria Ramiro", sub: "No reservation — go early", icon: "fork", tag: "Walk-in" },
        ],
      },
      {
        id: "d3",
        date: "2026-04-14",
        label: "Tue · Sintra day trip",
        items: [
          { id: "i9", type: "transit", time: "08:45", title: "Train · Rossio → Sintra", sub: "40 min · €4.60 each way", icon: "car" },
          { id: "i10", type: "place", time: "10:00", title: "Quinta da Regaleira", sub: "Tickets booked · 10am entry", icon: "pin", tag: "Tickets" },
          { id: "i11", type: "food", time: "13:30", title: "Lunch · Tascantiga Sintra", sub: "Petiscos — share plates", icon: "fork" },
          { id: "i12", type: "place", time: "15:30", title: "Pena Palace", sub: "Bus 434 from town centre", icon: "pin" },
        ],
      },
      {
        id: "d4",
        date: "2026-04-15",
        label: "Wed · Drive south to Évora",
        items: [
          { id: "i13", type: "transit", time: "09:00", title: "Pick up rental · Sixt Lisbon Airport", sub: "Confirmation 8A2-PT", icon: "car", tag: "Booked" },
          { id: "i14", type: "place", time: "12:30", title: "Lunch stop · Vendas Novas", sub: "~1h drive", icon: "pin" },
          { id: "i15", type: "stay", time: "16:00", title: "Convento do Espinheiro · check-in", sub: "Outside Évora · 2 nights", icon: "bed" },
        ],
      },
      { id: "d5", date: "2026-04-16", label: "Thu · Évora & cork country", items: [] },
      { id: "d6", date: "2026-04-17", label: "Fri · Coast — Comporta", items: [] },
      { id: "d7", date: "2026-04-18", label: "Sat · Beach + market day", items: [] },
      { id: "d8", date: "2026-04-19", label: "Sun · Return to Lisbon", items: [] },
      { id: "d9", date: "2026-04-20", label: "Mon · Last day · Príncipe Real", items: [] },
      { id: "d10", date: "2026-04-21", label: "Tue · Fly home", items: [] },
    ],
    expenses: [
      { id: "e1", date: "2026-03-02", label: "Flights · TAP", amount: 1240, paidBy: "p1", currency: "EUR" },
      { id: "e2", date: "2026-03-08", label: "Memmo Alfama · 3 nights", amount: 420, paidBy: "p2", currency: "EUR" },
      { id: "e3", date: "2026-03-09", label: "Sintra train + Regaleira tix", amount: 96, paidBy: "p3", currency: "EUR" },
      { id: "e4", date: "2026-03-15", label: "Sixt rental car · 6 days", amount: 184, paidBy: "p1", currency: "EUR" },
    ],
    packing: [
      {
        cat: "Clothes",
        items: [
          { id: "pk1", label: "Linen shirts × 3", done: true },
          { id: "pk2", label: "Light jacket (evenings ~13°C)", done: true },
          { id: "pk3", label: "Walking shoes", done: false },
          { id: "pk4", label: "Swimsuit (Comporta)", done: false },
        ],
      },
      {
        cat: "Docs",
        items: [
          { id: "pk5", label: "Passports (expire after Oct)", done: true },
          { id: "pk6", label: "Insurance card printout", done: false },
          { id: "pk7", label: "Driver licence + IDP", done: false },
        ],
      },
      {
        cat: "Other",
        items: [
          { id: "pk8", label: "EU plug adapter × 2", done: false },
          { id: "pk9", label: "Reusable water bottles", done: false },
        ],
      },
    ],
    docs: [
      { id: "dc1", label: "TAP TP218 boarding pass", kind: "PDF", size: "142 KB", owner: "p1" },
      { id: "dc2", label: "Memmo Alfama confirmation", kind: "PDF", size: "88 KB", owner: "p2" },
      { id: "dc3", label: "Sixt rental contract", kind: "PDF", size: "212 KB", owner: "p1" },
      { id: "dc4", label: "Travel insurance · World Nomads", kind: "PDF", size: "356 KB", owner: "p1" },
    ],
  },
  {
    id: "t2",
    title: "Hokkaido in February",
    cover: "cover-hokkaido",
    location: "Japan",
    start: "2027-02-04",
    end: "2027-02-13",
    members: ["p1", "p2"],
    summary: "Snow trip — Sapporo, Niseko, Otaru. Skiing, sushi, onsens.",
    budget: { spent: 0, total: 4800, currency: "USD" },
    days: [],
    expenses: [],
    packing: [],
    docs: [],
  },
  {
    id: "t3",
    title: "Long weekend in Mexico City",
    cover: "cover-cdmx",
    location: "Mexico",
    start: "2025-11-13",
    end: "2025-11-17",
    members: ["p1", "p2", "p3"],
    summary: "Roma Norte, Condesa, food crawl. Bring an empty stomach.",
    budget: { spent: 920, total: 1100, currency: "USD" },
    days: [],
    expenses: [],
    packing: [],
    docs: [],
    archived: true,
  },
];
