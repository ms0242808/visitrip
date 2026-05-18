# CLAUDE.md

Guidance for Claude (or any AI coding assistant) working in this repo.

## What this project is

Visitrip is an open-source web app for organizing, sharing, and real-time collaborating on trips with friends. It is designed to be easily self-hostable via Docker Compose.

## Stack (locked in)

- **Monorepo:** npm workspaces (no pnpm, no yarn, no Turborepo unless explicitly requested)
- **Web:** React 19 + Vite 6 + TypeScript + Tailwind CSS v4 + vite-plugin-pwa
- **API:** Node 20 + Hono on `@hono/node-server`; `tsx` for dev, `tsup` for production bundle
- **DB:** PostgreSQL + Drizzle ORM (postgres-js driver)
- **Validation:** Zod, defined once in `packages/shared`, consumed by both web and api
- **Auth:** better-auth, email + password only (no OAuth providers at launch)
- **Real-time:** Yjs over WebSocket — chosen but not wired yet
- **Container:** per-app multi-stage Dockerfile + root `docker-compose.yml`

Do not swap any of these without asking.

## Repo layout

```
apps/
  api/      Hono server
  web/      React + Vite SPA
packages/
  shared/   Zod schemas + inferred types (source-only, no build step)
  db/       Drizzle schema, db client factory, drizzle-kit config
```

Workspace packages are referenced as `@visitrip/<name>` and are source-only (their `exports` point at `./src/*.ts`). The API bundles them in via `tsup`'s `noExternal: [/^@visitrip\//]`. Vite handles them natively for the web app.

## Conventions

- TypeScript strict mode everywhere. No `any` without a comment justifying it.
- All shared types flow from Zod schemas via `z.infer<>`. Add new request/response shapes to `packages/shared/src/` first, then use on both sides.
- No comments that explain *what* the code does — well-named identifiers do that. Only add a comment when the *why* is non-obvious.
- Don't add abstractions, helpers, or feature-flag scaffolding for hypothetical future requirements. Wait until the second or third use site.
- No README/markdown files unless explicitly requested.
- Don't introduce new dependencies casually. If a stdlib or existing dep can do the job in <30 lines, prefer that.

## Design

UI/UX follows Apple Human Interface Guidelines (clarity, deference, depth).
The prototype screens (sign-in / sign-up, trips list, trip detail with
itinerary / map / expenses / packing / documents tabs, day detail, place
sheet, invite sheet, new-trip sheet, profile) live in `apps/web/src/screens/`.
Visual primitives are in `apps/web/src/components/` and tokens in
`apps/web/src/styles/`. Don't invent new visual styling — extend the existing
tokens and primitives.

## Common commands

```bash
npm install           # install (root, hoists workspace deps)
npm run dev           # vite + tsx watch in parallel
npm run dev:web       # just web
npm run dev:api       # just api
npm run build         # build every workspace
npm run typecheck     # tsc --noEmit across the repo
npm run db:generate   # drizzle-kit generate
npm run db:migrate    # drizzle-kit migrate
docker compose up -d postgres   # local DB only
docker compose up --build       # full stack (web + api + postgres)
```

API listens on `:3001`, web on `:5173`. Vite dev server proxies `/api/*` and `/health` to the API.

## Environment

`.env.example` documents all variables. The API requires `DATABASE_URL` and `BETTER_AUTH_SECRET`. Generate the secret with `openssl rand -base64 32` — never commit a real one.

## Branching and commits

- Develop on the active feature branch (currently `claude/restructure-project-3Qmyg`); ask before switching or creating a new one.
- Commit messages: short imperative subject, optional body explaining *why*. No co-author trailers, no AI-attribution lines, no model identifiers anywhere in commits, PRs, or code.
- Do not push to `main` directly.
- Do not amend pushed commits. Add a new commit instead.

## Things to verify before reporting work done

1. `npm run typecheck` is clean.
2. `npm run build` succeeds in all workspaces.
3. If touching the API: it boots (`node apps/api/dist/index.js`) and `/health` returns `{"status":"ok"}`.
4. If touching the web app: `vite build` succeeds and the PWA manifest still generates.
5. For UI work, actually open the page in a browser — type checks don't verify rendering.

## Things not built yet (don't claim they are)

- Real router. App.tsx is a state-machine; the one URL we honor is
  `/invite/<token>`, parsed once on mount.
- **Document uploads** — the trip_doc table and read endpoint exist, but
  there's no object storage wired up (S3/R2). The "Attach a file" button
  in the Documents tab is still a no-op.
- **Email delivery** — invite tokens are real, the share link works, but
  the "Email invite" / forgot-password flows have no SMTP/provider wired,
  so the reset screen is a placeholder that always reports success.
- **Profile preferences** — the settings rows (appearance, default currency,
  default week-start, notification toggles, "save offline") are not backed
  by a `user_settings` table.
- **Discover / Inbox tabs** — placeholders; no feature spec yet.
- **Cross-user live updates beyond packing** — day / day-item / expense
  mutations are REST-only. Other members see them on next load. Migrate to
  the Yjs doc to make them live (packing is the worked example).
- CI, tests, linting config.

## Dev workflow now requires Postgres

Before `npm run dev:api`, postgres has to be reachable at the URL in `.env`
(`DATABASE_URL`). Easiest path:

```bash
cp .env.example .env                 # fill in BETTER_AUTH_SECRET
docker compose up -d postgres        # or: sudo service postgresql start
npm run db:migrate                   # apply drizzle migrations
npm run dev                          # web + api
```

## Auth

`apps/api/src/auth.ts` instantiates better-auth with the Drizzle adapter and
email+password. The handler is mounted in `apps/api/src/index.ts` at
`/api/auth/*`. The web client at `apps/web/src/lib/auth.tsx` exposes
`AuthProvider` + `useAuth()`; routes gate on the session state.

In docker-compose the web container's nginx proxies `/api/*` to the api
service so the better-auth session cookie stays same-origin in production —
matching the Vite proxy in dev.

## Real-time

A Yjs WebSocket server lives in `apps/api/src/realtime/`:

- `server.ts` attaches a `WebSocketServer` to the http.Server, gates each
  upgrade on the better-auth session cookie and trip-membership, and hands
  off to `protocol.ts`.
- `protocol.ts` implements the standard y-websocket wire format
  (sync + awareness) using `y-protocols`. No third-party server lib.
- `docs.ts` keeps one `Y.Doc` per trip in memory. On first connection it
  hydrates from the `trip_yjs_state` snapshot row, or seeds from the
  `packing_item` rows if no snapshot exists. Doc updates schedule a
  debounced (1s) write back to `trip_yjs_state` as a binary blob.

The web client (`apps/web/src/lib/yjs.tsx`) exposes `TripDocProvider`,
`useTripDoc`, `useYArray`, `usePresence`, `useConnection`. The provider is
mounted in `App.tsx` at the trip route so the doc lifetime matches the
screen lifetime.

`PackingPanel` is the reference: it reads from a `Y.Array<Y.Map>` and writes
through it, so toggles / adds / removes broadcast to every other client on
the trip. Awareness drives the green dot on the member avatar stack
(`PresenceStack` in `screens/trip.tsx`).

To make a new panel collaborative, mirror the packing pattern: pick a Y type
on the trip doc, hydrate from Postgres in `docs.ts`'s `hydrate()` when no
snapshot exists, and read/write from the React component via `useYArray`
(or a Y.Map equivalent).

## Data flow

All shared types live in `@visitrip/shared` (Zod schemas, `z.infer<>`'d into
TypeScript). The web never imports from `@visitrip/db` — it only sees the API
shapes. New write endpoints belong in `apps/api/src/routes/`, behind the
`requireAuth` middleware, validated with `@hono/zod-validator` against a Zod
schema from shared.

Current routes (all under `/api`, member-gated unless noted):

```
POST   /api/auth/sign-up/email                       better-auth
POST   /api/auth/sign-in/email                       better-auth
POST   /api/auth/sign-out                            better-auth
GET    /api/auth/get-session                         better-auth (public)

GET    /api/trips                                    list caller's trips
POST   /api/trips                                    create a trip
GET    /api/trips/:id                                full TripDetail
PATCH  /api/trips/:id                                update title/dates/cover/...
DELETE /api/trips/:id                                owner-only

POST   /api/trips/:id/days                           create day (auto-position)
PATCH  /api/trips/:id/days/:dayId                    update day
DELETE /api/trips/:id/days/:dayId

POST   /api/trips/:id/days/:dayId/items              create day item
PATCH  /api/trips/:id/days/:dayId/items/:itemId      update item
DELETE /api/trips/:id/days/:dayId/items/:itemId
POST   /api/trips/:id/days/:dayId/items/reorder      whole-list ids reorder

POST   /api/trips/:id/expenses                       create expense
DELETE /api/trips/:id/expenses/:expenseId

POST   /api/trips/:id/invites                        create invite token
GET    /api/invites/:token                           public preview
POST   /api/invites/:token/accept                    auth; add caller as member
```

Web-side fetch helpers are in `apps/web/src/lib/api.ts`; React hooks in
`apps/web/src/lib/trips.ts` (`useTrips`, `useTrip`). All requests go with
`credentials: "include"` so the session cookie rides along.
