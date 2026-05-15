# Visitrip

Open-source app for organizing, sharing, and real-time collaborating on trips with friends.

> **Status:** very early. The repo is a working scaffold — installable, typechecks, builds, and the API boots — but there is no product UI yet. UI/UX design is in progress; feature wiring (auth, real-time, screens) starts once that lands.

## Planned features

- Plan trips: itinerary days, places, notes, costs, packing lists, documents
- Share trips with friends via invite link or email (viewer / editor roles)
- Real-time co-editing with live presence and cursors
- Email + password auth
- Installable PWA with offline support for already-loaded trips
- One-command self-host via Docker Compose

## Tech stack

| Area      | Choice                                                     |
| --------- | ---------------------------------------------------------- |
| Repo      | npm workspaces monorepo                                    |
| Web       | React 19, Vite 6, TypeScript, Tailwind CSS v4, vite-plugin-pwa |
| API       | Node 20, Hono, TypeScript (tsx dev, tsup build)            |
| Database  | PostgreSQL 17 + Drizzle ORM (postgres-js driver)           |
| Validation| Zod (shared between web and api via `@visitrip/shared`)    |
| Auth      | better-auth (email + password)                             |
| Real-time | Yjs over WebSocket *(not wired yet)*                       |
| Hosting   | Per-app Dockerfile + root `docker-compose.yml`             |

## Repo layout

```
visitrip/
├── apps/
│   ├── api/                Hono server, /health route
│   └── web/                React + Vite + Tailwind + PWA
├── packages/
│   ├── shared/             Zod schemas + inferred TS types
│   └── db/                 Drizzle schema, migrations, db client factory
├── docker-compose.yml      postgres + api + web
├── tsconfig.base.json      Shared TS compiler options
└── .env.example            Copy to .env before running Docker
```

## Quickstart (local dev)

Requirements: Node `>=20`, npm, Docker (only for the database, optional otherwise).

```bash
# 1. install workspace dependencies
npm install

# 2. start postgres (or point DATABASE_URL at your own)
docker compose up -d postgres

# 3. copy env defaults
cp .env.example .env

# 4. run web + api together
npm run dev
```

Then:

- Web: <http://localhost:5173>
- API: <http://localhost:3001/health>

The web dev server proxies `/api/*` to the API, so the frontend can call the backend without CORS in development.

To run only one side:

```bash
npm run dev:web   # vite dev server
npm run dev:api   # tsx watch on the Hono server
```

## Database

Drizzle schema lives in `packages/db/src/schema.ts`. After wiring better-auth, generate its tables with the better-auth CLI from `apps/api`, then:

```bash
npm run db:generate   # emit SQL migration from schema diff
npm run db:migrate    # apply pending migrations
npm run db:studio     # open Drizzle Studio
```

## Self-hosting with Docker

```bash
cp .env.example .env
# edit .env — at minimum, set BETTER_AUTH_SECRET (32+ random bytes)
docker compose up --build -d
```

Stack:

- `postgres` — Postgres 17 with a named volume for data
- `api`     — Hono server, exposed on `:3001`
- `web`     — built static bundle served by nginx on `:5173`

## Available scripts (root)

| Script                | What it does                                  |
| --------------------- | --------------------------------------------- |
| `npm run dev`         | Dev mode in every workspace that has it       |
| `npm run dev:web`     | Just the web app                              |
| `npm run dev:api`     | Just the API                                  |
| `npm run build`       | Production build in every workspace           |
| `npm run typecheck`   | `tsc --noEmit` across all workspaces          |
| `npm run lint`        | Lint where configured                         |
| `npm run db:generate` | Generate Drizzle migration                    |
| `npm run db:migrate`  | Apply Drizzle migrations                      |
| `npm run db:studio`   | Open Drizzle Studio                           |

## Contributing

Issues and pull requests are welcome once the product surface stabilizes. For now the codebase is moving fast; pin to a commit if you fork.

## License

TBD.
