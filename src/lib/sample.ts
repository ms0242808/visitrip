import type { Trip } from "./types";
import { addDays, toISODate } from "./dates";

/** Build a delightful, fully-populated sample trip starting next week. */
export function buildSampleTrip(): Trip {
  const start = addDays(toISODate(new Date()), 7);
  const d = (n: number) => addDays(start, n);
  const now = Date.now();

  return {
    id: "sample-kyoto",
    name: "Kyoto in Autumn",
    destination: "Kyoto, Japan",
    startDate: start,
    endDate: d(3),
    currency: "$",
    budget: 1200,
    cover: 0,
    emoji: "⛩️",
    createdAt: now,
    updatedAt: now,
    activities: [
      { id: "s1", date: d(0), time: "09:30", title: "Arrive at Kyoto Station", category: "transport", location: "Kyoto Station", cost: 0, notes: "Pick up the JR Pass at the booth." },
      { id: "s2", date: d(0), time: "11:00", title: "Check in at Machiya stay", category: "lodging", location: "Gion district", cost: 320 },
      { id: "s3", date: d(0), time: "13:00", title: "Ramen at Ippudo", category: "food", location: "Shijo St.", cost: 18 },
      { id: "s4", date: d(0), time: "15:30", title: "Stroll Higashiyama lanes", category: "sightseeing", location: "Higashiyama", cost: 0, notes: "Golden hour photos near Yasaka Pagoda." },
      { id: "s5", date: d(0), time: "19:30", title: "Kaiseki dinner", category: "food", location: "Pontocho Alley", cost: 65 },
      { id: "s6", date: d(1), time: "08:00", title: "Fushimi Inari at sunrise", category: "sightseeing", location: "Fushimi Inari Taisha", cost: 0, notes: "Beat the crowds — go before 8:30." },
      { id: "s7", date: d(1), time: "11:00", title: "Matcha & mochi break", category: "food", location: "Inari approach", cost: 12 },
      { id: "s8", date: d(1), time: "14:00", title: "Arashiyama bamboo grove", category: "sightseeing", location: "Arashiyama", cost: 0 },
      { id: "s9", date: d(1), time: "16:00", title: "Sagano romantic train", category: "activity", location: "Torokko Saga", cost: 8 },
      { id: "s10", date: d(2), time: "09:00", title: "Kinkaku-ji golden temple", category: "sightseeing", location: "Kinkaku-ji", cost: 5 },
      { id: "s11", date: d(2), time: "12:30", title: "Nishiki Market food crawl", category: "food", location: "Nishiki Market", cost: 30 },
      { id: "s12", date: d(2), time: "15:00", title: "Souvenir hunt", category: "shopping", location: "Teramachi arcade", cost: 45 },
      { id: "s13", date: d(3), time: "10:00", title: "Tea ceremony", category: "activity", location: "Camellia Garden", cost: 40 },
      { id: "s14", date: d(3), time: "13:30", title: "Shinkansen back", category: "transport", location: "Kyoto Station", cost: 95 },
    ],
  };
}

function buildLisbonTrip(): Trip {
  const start = addDays(toISODate(new Date()), 30);
  const d = (n: number) => addDays(start, n);
  const now = Date.now() - 1000;
  return {
    id: "sample-lisbon",
    name: "Lisbon Long Weekend",
    destination: "Lisbon, Portugal",
    startDate: start,
    endDate: d(2),
    currency: "€",
    budget: 700,
    cover: 6,
    emoji: "🌅",
    createdAt: now,
    updatedAt: now,
    activities: [
      { id: "l1", date: d(0), time: "10:00", title: "Tram 28 through Alfama", category: "sightseeing", location: "Alfama", cost: 3 },
      { id: "l2", date: d(0), time: "13:00", title: "Pastéis de nata", category: "food", location: "Manteigaria", cost: 6 },
      { id: "l3", date: d(0), time: "18:00", title: "Sunset at Miradouro", category: "sightseeing", location: "Senhora do Monte", cost: 0 },
      { id: "l4", date: d(1), time: "09:30", title: "Day trip to Sintra", category: "activity", location: "Pena Palace", cost: 14 },
      { id: "l5", date: d(2), time: "12:00", title: "Time Out Market lunch", category: "food", location: "Mercado da Ribeira", cost: 22 },
    ],
  };
}

function buildIcelandTrip(): Trip {
  const start = addDays(toISODate(new Date()), -40);
  const d = (n: number) => addDays(start, n);
  const now = Date.now() - 2000;
  return {
    id: "sample-iceland",
    name: "Iceland Ring Road",
    destination: "Reykjavík, Iceland",
    startDate: start,
    endDate: d(4),
    currency: "$",
    budget: 2400,
    cover: 2,
    emoji: "🏔️",
    createdAt: now,
    updatedAt: now,
    activities: [
      { id: "i1", date: d(0), time: "12:00", title: "Pick up camper van", category: "transport", location: "Keflavík", cost: 540 },
      { id: "i2", date: d(1), time: "10:00", title: "Golden Circle loop", category: "sightseeing", location: "Þingvellir", cost: 0 },
      { id: "i3", date: d(2), time: "14:00", title: "Black sand beach", category: "sightseeing", location: "Reynisfjara", cost: 0 },
      { id: "i4", date: d(3), time: "20:00", title: "Northern lights hunt", category: "activity", location: "Vík", cost: 0 },
    ],
  };
}

/** A starter set so the library has something to organise. */
export function buildSampleTrips(): Trip[] {
  return [buildSampleTrip(), buildLisbonTrip(), buildIcelandTrip()];
}

export function buildBlankTrip(): Trip {
  const start = toISODate(new Date());
  const now = Date.now();
  return {
    id: `trip-${now}`,
    name: "My Trip",
    destination: "",
    startDate: start,
    endDate: addDays(start, 2),
    currency: "$",
    budget: undefined,
    cover: 0,
    emoji: "✈️",
    createdAt: now,
    updatedAt: now,
    activities: [],
  };
}
