# Visitrip ✈️

A calm, colourful **day-by-day trip planner**. Lay out your sights, food,
transit, lodging and budget on one clean timeline — on desktop, tablet or phone.

## Features

- **A library of trips** — plan as many trips as you like. Each is a creative
  *boarding-pass* card (cover gradient, emoji, live countdown, status) you can
  open, duplicate, rename or delete. **Search**, **sort** (recent / date / name)
  and auto-grouping into *Upcoming & current* vs *Past trips* keep them organised.
- **Create trips your way** — a new-trip sheet with a live cover preview, emoji
  picker, gradient covers and currency.
- **Plan together** — invite friends and family from the **Share** panel: manage
  an access list with roles and copy an **invite link** that grants *Editor* or
  *Viewer* access. Opening a link shows a join screen and adds the trip to your
  device in the granted role — **viewers get a clean read-only experience**
  (avatar stack, “Shared by …” banner, no editing controls).
- **Day-by-day timeline** — every plan sits on a vertical timeline with a
  colour-coded category node (sights, food, activity, transit, stay, shopping).
- **Itinerary / Overview** — a segmented toggle switches between the focused
  day-by-day view and a whole-trip agenda; tap any day to jump straight to it.
- **Built for the road** — while you’re travelling, the planner opens straight
  to **today**, the day rail marks *Today*, and a live **“Now”** line plus an
  **“Up next”** badge show exactly what’s happening and what’s coming.
- **Tap for directions** — every plan’s location is a one-tap link into Maps
  (Apple Maps on Apple devices), with the destination appended for accuracy.
- **Editable trip header** — rename the trip, set the destination and date range
  inline; the day rail rebuilds itself automatically.
- **Restyle anytime** — tap the trip’s emoji to open a Customise sheet and change
  its icon and cover gradient whenever you like (live preview).
- **Budget tracking** — set a budget and watch a glanceable progress **ring**
  fill as your estimated spend adds up, turning red when you go over.
- **Add / edit plans** — a polished sheet (bottom-sheet on mobile, modal on
  desktop) with category chips, time, cost, location and notes.
- **Reschedule between days** — a day picker in the plan sheet moves any plan to
  another day; the planner follows it so you see where it landed.
- **Animated stats** — count-up day / plan / spend totals.
- **Light & dark mode** — respects the system preference and remembers your
  choice, applied before first paint (no flash).
- **Offline-friendly** — your trip is saved to `localStorage`, so it’s there
  when you come back. Load the ready-made *Kyoto in Autumn* sample to explore.
- **Accessible & responsive** — keyboard focus rings, `prefers-reduced-motion`
  support, and layouts tuned for mobile, tablet and desktop.
- **Apple-inspired design language** — the San Francisco system font stack, iOS
  grouped backgrounds and separators, translucent “material” nav bars, segmented
  controls, sheets with grabbers, and spring press feedback, following Apple’s
  Human Interface Guidelines.

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
  components/     # AppShell, TripsDashboard, TripCard, NewTripModal,
                  # PlannerView, TripHeader, DayRail, DayTimeline,
                  # ActivityCard, ActivitySheet, ConfirmDialog, Landing, …
  lib/            # types, date helpers, trip stats, sample data,
                  # multi-trip localStorage store (useTrips)
```
