# Visitrip ✈️

A calm, colourful **day-by-day trip planner**. Lay out your sights, food,
transit, lodging and budget on one clean timeline — on desktop, tablet or phone.

## Features

- **Day-by-day timeline** — every plan sits on a vertical timeline with a
  colour-coded category node (sights, food, activity, transit, stay, shopping).
- **Editable trip header** — rename the trip, set the destination and date range
  inline; the day rail rebuilds itself automatically.
- **Budget tracking** — set a budget and watch an animated bar fill as your
  estimated spend adds up, with an over-budget warning.
- **Add / edit plans** — a polished sheet (bottom-sheet on mobile, modal on
  desktop) with category chips, time, cost, location and notes.
- **Animated stats** — count-up day / plan / spend totals.
- **Light & dark mode** — respects the system preference and remembers your
  choice, applied before first paint (no flash).
- **Offline-friendly** — your trip is saved to `localStorage`, so it’s there
  when you come back. Load the ready-made *Kyoto in Autumn* sample to explore.
- **Accessible & responsive** — keyboard focus rings, `prefers-reduced-motion`
  support, and layouts tuned for mobile, tablet and desktop.

## Tech

- [Next.js 15](https://nextjs.org) (App Router) + React 19
- [Tailwind CSS v4](https://tailwindcss.com) with a custom design-token system
- Deployed on Cloudflare via [OpenNext](https://opennext.js.org/cloudflare)

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run preview  # build + preview on Cloudflare Workers locally
npm run deploy   # build + deploy to Cloudflare
```

## Project layout

```
src/
  app/            # layout, page, global design system (globals.css)
  components/     # TripPlanner, TripHeader, DayRail, DayTimeline,
                  # ActivityCard, ActivitySheet, Landing, Icons, …
  lib/            # types, date helpers, sample data, localStorage store
```
