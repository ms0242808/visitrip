import type { Trip } from "./types";
import { addDays, toISODate } from "./dates";

/** Build a delightful, fully-populated sample trip starting next week. */
export function buildSampleTrip(): Trip {
  const start = addDays(toISODate(new Date()), 7);
  const d = (n: number) => addDays(start, n);

  return {
    id: "sample-kyoto",
    name: "Kyoto in Autumn",
    destination: "Kyoto, Japan",
    startDate: start,
    endDate: d(3),
    currency: "$",
    budget: 1200,
    activities: [
      // Day 1
      { id: "s1", date: d(0), time: "09:30", title: "Arrive at Kyoto Station", category: "transport", location: "Kyoto Station", cost: 0, notes: "Pick up the JR Pass at the booth." },
      { id: "s2", date: d(0), time: "11:00", title: "Check in at Machiya stay", category: "lodging", location: "Gion district", cost: 320 },
      { id: "s3", date: d(0), time: "13:00", title: "Ramen at Ippudo", category: "food", location: "Shijo St.", cost: 18 },
      { id: "s4", date: d(0), time: "15:30", title: "Stroll Higashiyama lanes", category: "sightseeing", location: "Higashiyama", cost: 0, notes: "Golden hour photos near Yasaka Pagoda." },
      { id: "s5", date: d(0), time: "19:30", title: "Kaiseki dinner", category: "food", location: "Pontocho Alley", cost: 65 },
      // Day 2
      { id: "s6", date: d(1), time: "08:00", title: "Fushimi Inari at sunrise", category: "sightseeing", location: "Fushimi Inari Taisha", cost: 0, notes: "Beat the crowds — go before 8:30." },
      { id: "s7", date: d(1), time: "11:00", title: "Matcha & mochi break", category: "food", location: "Inari approach", cost: 12 },
      { id: "s8", date: d(1), time: "14:00", title: "Arashiyama bamboo grove", category: "sightseeing", location: "Arashiyama", cost: 0 },
      { id: "s9", date: d(1), time: "16:00", title: "Sagano romantic train", category: "activity", location: "Torokko Saga", cost: 8 },
      // Day 3
      { id: "s10", date: d(2), time: "09:00", title: "Kinkaku-ji golden temple", category: "sightseeing", location: "Kinkaku-ji", cost: 5 },
      { id: "s11", date: d(2), time: "12:30", title: "Nishiki Market food crawl", category: "food", location: "Nishiki Market", cost: 30 },
      { id: "s12", date: d(2), time: "15:00", title: "Souvenir hunt", category: "shopping", location: "Teramachi arcade", cost: 45 },
      // Day 4
      { id: "s13", date: d(3), time: "10:00", title: "Tea ceremony", category: "activity", location: "Camellia Garden", cost: 40 },
      { id: "s14", date: d(3), time: "13:30", title: "Shinkansen back", category: "transport", location: "Kyoto Station", cost: 95 },
    ],
  };
}

export function buildBlankTrip(): Trip {
  const start = toISODate(new Date());
  return {
    id: `trip-${Date.now()}`,
    name: "My Trip",
    destination: "",
    startDate: start,
    endDate: addDays(start, 2),
    currency: "$",
    budget: undefined,
    activities: [],
  };
}
