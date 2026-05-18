# README Known Issues Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the sixteen items under "Known issues" in `README.md` (Critical, Important, Minor).

**Architecture:** Each fix is a focused, independently committable change. Order is chosen so foundational fixes (auth gating, role enforcement, dev tooling) land before fixes that depend on them. Verification follows the project's CLAUDE.md protocol — `npm run typecheck`, `npm run build`, API boot + `/health`, manual UI smoke. No test framework is added (out of scope per the spec).

**Tech Stack:** TypeScript (strict), React 19 + Vite 6, Hono on `@hono/node-server`, Drizzle ORM + postgres-js, Yjs, better-auth, `concurrently` (new dev dep), Docker (multi-stage).

**Design doc:** `docs/superpowers/specs/2026-05-18-readme-known-issues-design.md`.

---

## File map

**Modify:**
- `apps/web/src/lib/yjs.tsx` — Tasks 1, 7, 11
- `apps/web/src/App.tsx` — Tasks 7, 8
- `apps/web/src/screens/invite.tsx` — Task 9 (verify only)
- `apps/web/vite.config.ts` — Task 16
- `apps/api/src/routes/trips.ts` — Tasks 4, 5, 6, 9
- `apps/api/src/realtime/docs.ts` — Tasks 10, 14
- `apps/api/src/realtime/server.ts` — Task 10
- `apps/api/src/index.ts` — Tasks 3, 10, 13
- `apps/api/Dockerfile` — Tasks 3, 15
- `packages/db/src/index.ts` — Task 3
- `package.json` (root) — Tasks 2, 12
- `package-lock.json` — Task 12 (via `npm install`)
- `.env.example` — Task 3
- `README.md` — Task 3

**Create:**
- `packages/db/src/migrate.ts` — Task 3
- `apps/web/scripts/gen-pwa-icons.mjs` — Task 16
- `apps/web/public/icon-192.png` — Task 16 (binary)
- `apps/web/public/icon-512.png` — Task 16 (binary)

---

## Task 1: C1 — Yjs roomname leak

**Files:**
- Modify: `apps/web/src/lib/yjs.tsx:46`

- [ ] **Step 1: Replace empty roomname with `tripId`**

In `apps/web/src/lib/yjs.tsx`, change line 46 from:

```tsx
const provider = new WebsocketProvider(baseUrl, "", doc, {
```

to:

```tsx
const provider = new WebsocketProvider(baseUrl, tripId, doc, {
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build web**

Run: `npm run build -w @visitrip/web`
Expected: `vite build` succeeds, no errors.

- [ ] **Step 4: Manual smoke (deferred until batch end)**

Smoke deferred to the end of the Critical batch — opening two tabs on different trips is the proof, but we want all critical fixes in first to avoid retesting.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/yjs.tsx
git commit -m "Pass tripId as y-websocket roomname so BroadcastChannel is per-trip"
```

---

## Task 2: C3 — Bump `engines.node` to `>=20.12`

**Files:**
- Modify: `package.json` (root, line ~21-23)

- [ ] **Step 1: Bump engines**

In root `package.json`, replace:

```json
  "engines": {
    "node": ">=20"
  }
```

with:

```json
  "engines": {
    "node": ">=20.12"
  }
```

- [ ] **Step 2: Verify local Node**

Run: `node --version`
Expected: `v20.12.x` or higher (any v20.12+, v22.x, etc. all pass).

If the local Node is older, stop and bump it before continuing.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "Tighten engines.node to >=20.12 for --env-file and loadEnvFile"
```

---

## Task 3: C2 — Auto-migrate on API boot + bake migrations into image

**Files:**
- Create: `packages/db/src/migrate.ts`
- Modify: `packages/db/src/index.ts`
- Modify: `apps/api/src/index.ts`
- Modify: `apps/api/Dockerfile`
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Add `runMigrations` helper in `@visitrip/db`**

Create `packages/db/src/migrate.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function runMigrations(connectionString: string, migrationsFolder: string) {
  const client = postgres(connectionString, { max: 1 });
  try {
    await migrate(drizzle(client), { migrationsFolder });
  } finally {
    await client.end({ timeout: 5 });
  }
}
```

- [ ] **Step 2: Export from `@visitrip/db`**

In `packages/db/src/index.ts`, after the existing exports, add:

```ts
export { runMigrations } from "./migrate.ts";
```

Final file content (replace whole file):

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema.ts";

export function createDb(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export type Db = ReturnType<typeof createDb>;
export { schema };
export * from "./schema.ts";
export { runMigrations } from "./migrate.ts";
```

- [ ] **Step 3: Call `runMigrations` before `serve()` in the API**

In `apps/api/src/index.ts`, add the import and an `await` call before `serve(...)`. Final file content:

```ts
import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Server as HttpServer } from "node:http";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runMigrations } from "@visitrip/db";
import { auth } from "./auth";
import { attachRealtime } from "./realtime/server";
import { invitesRouter } from "./routes/invites";
import { tripsRouter } from "./routes/trips";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/trips", tripsRouter);
app.route("/api/invites", invitesRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function maybeMigrate() {
  const flag = (process.env.AUTO_MIGRATE ?? "true").toLowerCase();
  if (flag === "false" || flag === "0") return;
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const folder = process.env.MIGRATIONS_DIR ?? resolve(__dirname, "../migrations");
  console.log(`[api] running migrations from ${folder}`);
  await runMigrations(url, folder);
}

await maybeMigrate();

const port = Number(process.env.PORT ?? 3001);
const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`api listening on http://localhost:${info.port}`);
});

attachRealtime(server as unknown as HttpServer);
```

Note: top-level `await` is fine here — `apps/api/tsconfig.json` already uses ES2022+ module target via `tsup`. If the typecheck flags it, escalate before changing the module target.

- [ ] **Step 4: Bake migrations into the API runtime image**

In `apps/api/Dockerfile`, runtime stage, copy migrations from the build stage. Final file content (we'll layer M7's prod-deps stage in Task 15 — for now leave the two-stage layout):

```dockerfile
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN npm install
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
RUN npm run build -w @visitrip/api

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/packages/db/migrations ./migrations
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

- [ ] **Step 5: Default `AUTO_MIGRATE=false` in dev `.env.example`**

In `.env.example`, append (or insert near the top with the other vars):

```
# Set to "true" to auto-apply Drizzle migrations on API boot.
# Defaults to "true" in production (docker-compose); recommended "false" in local dev
# where you run "npm run db:migrate" yourself.
AUTO_MIGRATE=false
```

- [ ] **Step 6: Update README**

In `README.md`, replace the self-host migration block. Find this section:

```bash
cp .env.example .env
# edit .env — at minimum, set BETTER_AUTH_SECRET (32+ random bytes)
docker compose up --build -d
# one-time migration (or bake into your deploy script)
docker compose run --rm api npm run db:migrate --workspace @visitrip/db
```

Replace with:

```bash
cp .env.example .env
# edit .env — at minimum, set BETTER_AUTH_SECRET (32+ random bytes)
docker compose up --build -d
# Migrations run automatically on api boot.
# To opt out, set AUTO_MIGRATE=false in .env and run them yourself.
```

Also remove the "Documented self-host migration command is broken" bullet from the Known Issues / Critical section.

- [ ] **Step 7: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 8: Build API**

Run: `npm run build -w @visitrip/api`
Expected: tsup emits `apps/api/dist/index.js`.

- [ ] **Step 9: Boot API with AUTO_MIGRATE on**

Make sure Postgres is up: `docker compose up -d postgres`.
Then: `AUTO_MIGRATE=true DATABASE_URL="$(grep ^DATABASE_URL .env | cut -d= -f2-)" BETTER_AUTH_SECRET="$(grep ^BETTER_AUTH_SECRET .env | cut -d= -f2-)" MIGRATIONS_DIR=./packages/db/migrations node apps/api/dist/index.js`

Expected: logs `[api] running migrations from ...`, then `api listening on http://localhost:3001`. No errors. `curl localhost:3001/health` returns `{"status":"ok"}`. Stop with Ctrl-C.

- [ ] **Step 10: Commit**

```bash
git add packages/db/src/migrate.ts packages/db/src/index.ts apps/api/src/index.ts apps/api/Dockerfile .env.example README.md
git commit -m "Auto-run drizzle migrations on api boot; ship migrations in the image"
```

---

## Task 4: I1 — Enforce viewer role on write endpoints

**Files:**
- Modify: `apps/api/src/routes/trips.ts`

- [ ] **Step 1: Add `requireWriteAccess` helper**

In `apps/api/src/routes/trips.ts`, near `requireMembership` (around line 27), add a sibling helper:

```ts
async function requireWriteAccess(tripId: string, userId: string) {
  const member = await requireMembership(tripId, userId);
  if (!member) return { ok: false as const, status: 404 as const };
  if (member.role === "viewer") return { ok: false as const, status: 403 as const };
  return { ok: true as const, member };
}
```

- [ ] **Step 2: Replace `requireMembership` calls on every mutation route**

Replace the membership check in each of these handlers. Pattern: where the route currently has

```ts
if (!(await requireMembership(tripId, session.user.id))) {
  return c.json({ error: "not_found" }, 404);
}
```

replace with:

```ts
const access = await requireWriteAccess(tripId, session.user.id);
if (!access.ok) {
  if (access.status === 403) return c.json({ error: "forbidden" }, 403);
  return c.json({ error: "not_found" }, 404);
}
```

Apply this in every mutating route in this file:
- `tripsRouter.patch("/:id", ...)` (around line 234)
- `tripsRouter.post("/:id/days", ...)` (around line 263)
- `tripsRouter.patch("/:id/days/:dayId", ...)` (around line 286)
- `tripsRouter.delete("/:id/days/:dayId", ...)` (around line 307)
- `tripsRouter.post("/:id/days/:dayId/items", ...)` (around line 322)
- `tripsRouter.patch("/:id/days/:dayId/items/:itemId", ...)` (around line 358)
- `tripsRouter.delete("/:id/days/:dayId/items/:itemId", ...)` (around line 383)
- `tripsRouter.post("/:id/days/:dayId/items/reorder", ...)` (around line 401)
- `tripsRouter.post("/:id/expenses", ...)` (around line 428)
- `tripsRouter.delete("/:id/expenses/:expenseId", ...)` (around line 478)
- `tripsRouter.post("/:id/invites", ...)` (around line 454)

Leave **`tripsRouter.delete("/:id", ...)` alone** — it already enforces `ownerId === userId` (line 257), which is stricter than non-viewer.

Leave **`tripsRouter.get("/")` and `tripsRouter.get("/:id")` alone** — read-only routes keep `requireMembership`.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 4: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/routes/trips.ts
git commit -m "Reject viewer-role writes on every trip mutation endpoint"
```

---

## Task 5: I6 + M5 — Split membership query, parallelize trip detail loads

**Files:**
- Modify: `apps/api/src/routes/trips.ts` (handler for `GET /:id`, lines ~111-232)

- [ ] **Step 1: Rewrite the GET handler**

Replace the entire `tripsRouter.get("/:id", ...)` handler with:

```ts
tripsRouter.get("/:id", async (c) => {
  const session = c.get("session");
  const tripId = c.req.param("id");
  if (!tripId) return c.json({ error: "not_found" }, 404);

  const [authz] = await db
    .select()
    .from(schema.tripMember)
    .where(and(eq(schema.tripMember.tripId, tripId), eq(schema.tripMember.userId, session.user.id)))
    .limit(1);
  if (!authz) return c.json({ error: "not_found" }, 404);

  const [tripRow, membership, days, expenses, packing, docs] = await Promise.all([
    db.select().from(schema.trip).where(eq(schema.trip.id, tripId)).then((rows) => rows[0]),
    db.select().from(schema.tripMember).where(eq(schema.tripMember.tripId, tripId)),
    db.select().from(schema.day).where(eq(schema.day.tripId, tripId)).orderBy(asc(schema.day.position)),
    db.select().from(schema.expense).where(eq(schema.expense.tripId, tripId)),
    db.select().from(schema.packingItem).where(eq(schema.packingItem.tripId, tripId)).orderBy(asc(schema.packingItem.position)),
    db.select().from(schema.tripDoc).where(eq(schema.tripDoc.tripId, tripId)),
  ]);

  if (!tripRow) return c.json({ error: "not_found" }, 404);

  const memberUserIds = membership.map((m) => m.userId);
  const dayIds = days.map((d) => d.id);
  const [userRows, items] = await Promise.all([
    memberUserIds.length
      ? db.select().from(schema.user).where(inArray(schema.user.id, memberUserIds))
      : Promise.resolve([] as Array<typeof schema.user.$inferSelect>),
    dayIds.length
      ? db
          .select()
          .from(schema.dayItem)
          .where(inArray(schema.dayItem.dayId, dayIds))
          .orderBy(asc(schema.dayItem.position))
      : Promise.resolve([] as Array<typeof schema.dayItem.$inferSelect>),
  ]);

  const userById = new Map(userRows.map((u) => [u.id, u]));
  const itemsByDay = new Map<string, typeof items>();
  for (const it of items) {
    const list = itemsByDay.get(it.dayId) ?? [];
    list.push(it);
    itemsByDay.set(it.dayId, list);
  }

  const detail: TripDetail = {
    id: tripRow.id,
    ownerId: tripRow.ownerId,
    title: tripRow.title,
    location: tripRow.location,
    cover: tripRow.cover as TripDetail["cover"],
    startDate: tripRow.startDate,
    endDate: tripRow.endDate,
    summary: tripRow.summary,
    currency: tripRow.currency,
    budgetTotalCents: tripRow.budgetTotalCents,
    archived: tripRow.archived,
    members: membership.map((m) => {
      const u = userById.get(m.userId);
      return {
        id: m.userId,
        name: u?.name ?? "Member",
        email: u?.email ?? "",
        role: m.role as TripDetail["members"][number]["role"],
      };
    }),
    days: days.map((d) => ({
      id: d.id,
      position: d.position,
      date: d.date,
      label: d.label,
      items: (itemsByDay.get(d.id) ?? []).map((it) => ({
        id: it.id,
        position: it.position,
        type: it.type as TripDetail["days"][number]["items"][number]["type"],
        time: it.time,
        title: it.title,
        sub: it.sub,
        icon: it.icon,
        anchor: it.anchor,
        tag: (it.tag ?? null) as TripDetail["days"][number]["items"][number]["tag"],
      })),
    })),
    expenses: expenses.map((e) => ({
      id: e.id,
      date: e.date,
      label: e.label,
      amountCents: e.amountCents,
      currency: e.currency,
      paidById: e.paidById,
    })),
    packing: packing.map((p) => ({
      id: p.id,
      category: p.category,
      label: p.label,
      done: p.done,
      position: p.position,
    })),
    docs: docs.map((d) => ({
      id: d.id,
      ownerId: d.ownerId,
      label: d.label,
      kind: d.kind,
      size: d.size,
      url: d.url ?? null,
    })),
  };

  return c.json(detail);
});
```

Key changes:
- Authz: dedicated single-row check before fan-out (no longer relies on the listing).
- Listing: full membership without `.limit(50)`.
- Fan-out: trip / membership / days / expenses / packing / docs run concurrently.
- `items` runs concurrently with `userRows` after `days` resolves (needs `dayIds`).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/trips.ts
git commit -m "Split membership authz check and parallelize trip-detail queries"
```

---

## Task 6: I7 — Validate day-item reorder permutation

**Files:**
- Modify: `apps/api/src/routes/trips.ts` (handler for `POST /:id/days/:dayId/items/reorder`)

- [ ] **Step 1: Add validation before the transaction**

Replace the body of `tripsRouter.post("/:id/days/:dayId/items/reorder", ...)` (the handler currently at line 401-426) with:

```ts
tripsRouter.post(
  "/:id/days/:dayId/items/reorder",
  zValidator("json", reorderSchema),
  async (c) => {
    const session = c.get("session");
    const tripId = c.req.param("id");
    const dayId = c.req.param("dayId");
    if (!tripId || !dayId) return c.json({ error: "not_found" }, 404);
    const access = await requireWriteAccess(tripId, session.user.id);
    if (!access.ok) {
      if (access.status === 403) return c.json({ error: "forbidden" }, 403);
      return c.json({ error: "not_found" }, 404);
    }
    if (!(await requireOwnedDay(tripId, dayId))) {
      return c.json({ error: "not_found" }, 404);
    }
    const { ids } = c.req.valid("json");
    const current = await db
      .select({ id: schema.dayItem.id })
      .from(schema.dayItem)
      .where(eq(schema.dayItem.dayId, dayId));
    const currentSet = new Set(current.map((r) => r.id));
    if (ids.length !== currentSet.size || new Set(ids).size !== ids.length || !ids.every((id) => currentSet.has(id))) {
      return c.json({ error: "invalid_reorder" }, 400);
    }
    await db.transaction(async (tx) => {
      for (let i = 0; i < ids.length; i++) {
        await tx
          .update(schema.dayItem)
          .set({ position: i })
          .where(and(eq(schema.dayItem.id, ids[i]!), eq(schema.dayItem.dayId, dayId)));
      }
    });
    return c.json({ ok: true });
  },
);
```

Note: this also picks up the `requireWriteAccess` change from Task 4 in case Task 4's diff missed this route — it's idempotent if already done.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/trips.ts
git commit -m "Validate day-item reorder ids match the day's current items"
```

---

## Task 7: I3 — Replace `useMemo` for the Yjs WebSocket with `useState`

**Files:**
- Modify: `apps/web/src/lib/yjs.tsx` (the `TripDocProvider` body)
- Modify: `apps/web/src/App.tsx` (add `key` to `TripDocProvider`)

- [ ] **Step 1: Switch the construction to `useState`**

In `apps/web/src/lib/yjs.tsx`, leave the import list alone — `useState` and `useMemo` both remain in use elsewhere in the file. Replace the body of `TripDocProvider`:

```tsx
export function TripDocProvider({ tripId, user, children }: TripDocProviderProps) {
  const [value] = useState<TripDocValue>(() => {
    const doc = new Y.Doc();
    const wsUrl = buildWsUrl(tripId);
    const parsed = new URL(wsUrl);
    const baseUrl = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    const provider = new WebsocketProvider(baseUrl, tripId, doc, {
      params: { trip: tripId },
      connect: true,
    });
    provider.awareness.setLocalState({
      user: { id: user.id, name: user.name },
    });
    return {
      doc,
      provider,
      packing: doc.getArray<Y.Map<unknown>>("packing"),
    };
  });

  useEffect(() => {
    return () => {
      value.provider.awareness.setLocalState(null);
      value.provider.destroy();
      value.doc.destroy();
    };
  }, [value]);

  return <TripDocContext.Provider value={value}>{children}</TripDocContext.Provider>;
}
```

- [ ] **Step 2: Add `key={tripId}` to the provider mount**

In `apps/web/src/App.tsx`, find the `<TripDocProvider tripId={tripId} user={state.user}>` in `TripView` (around line 294). Change to:

```tsx
<TripDocProvider key={tripId} tripId={tripId} user={state.user}>
```

This ensures the provider remounts when the open trip changes, since `useState`'s lazy init only runs on mount.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 4: Build web**

Run: `npm run build -w @visitrip/web`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/yjs.tsx apps/web/src/App.tsx
git commit -m "Construct Yjs provider with useState; remount on tripId change"
```

---

## Task 8: I4 — Move `setAcceptMode` reset into a `useEffect`

**Files:**
- Modify: `apps/web/src/App.tsx`

- [ ] **Step 1: Replace the during-render setState**

In `apps/web/src/App.tsx`, find `RoutedApp` (around line 89-128). Inside the component body, remove the block:

```tsx
  if (pendingInvite && acceptMode === "auth") {
    setAcceptMode("preview");
  }
```

Add a `useEffect` before the final `return`:

```tsx
  useEffect(() => {
    if (state.status === "anon" && acceptMode === "auth" && !pendingInvite) {
      setAcceptMode("preview");
    }
    if (state.status === "authed" && acceptMode === "auth" && pendingInvite) {
      setAcceptMode("preview");
    }
  }, [state.status, acceptMode, pendingInvite]);
```

Resulting structure (verify after edit):

```tsx
function RoutedApp() {
  const { state } = useAuth();
  const [pendingInvite, setPendingInvite] = useState<string | null>(() => readInviteFromUrl());
  const [acceptMode, setAcceptMode] = useState<"preview" | "auth">("preview");
  const [openTripOnReady, setOpenTripOnReady] = useState<string | null>(null);

  const clearInvite = () => {
    clearPendingInvite();
    setPendingInvite(null);
    setAcceptMode("preview");
  };

  useEffect(() => {
    if (state.status === "anon" && acceptMode === "auth" && !pendingInvite) {
      setAcceptMode("preview");
    }
    if (state.status === "authed" && acceptMode === "auth" && pendingInvite) {
      setAcceptMode("preview");
    }
  }, [state.status, acceptMode, pendingInvite]);

  if (state.status === "loading") return <LoadingScreen />;

  if (pendingInvite && acceptMode === "preview") {
    return (
      <InviteAcceptScreen
        token={pendingInvite}
        onCancel={clearInvite}
        onSignInRequired={() => setAcceptMode("auth")}
        onJoined={(tripId) => {
          clearPendingInvite();
          setPendingInvite(null);
          setAcceptMode("preview");
          setOpenTripOnReady(tripId);
        }}
      />
    );
  }

  if (state.status === "anon") {
    return <AuthFlow inviteBanner={!!pendingInvite} />;
  }

  return <SignedInApp initialTripId={openTripOnReady} onConsumedInitialTrip={() => setOpenTripOnReady(null)} />;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build web**

Run: `npm run build -w @visitrip/web`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/App.tsx
git commit -m "Move invite acceptMode reset into useEffect to drop the dev warning"
```

---

## Task 9: I5 — Find-or-create invite token per (tripId, role)

**Files:**
- Modify: `apps/api/src/routes/trips.ts` (invite create handler, around line 454-476)

- [ ] **Step 1: Replace the invite-create handler**

In `apps/api/src/routes/trips.ts`, replace `tripsRouter.post("/:id/invites", ...)` with:

```ts
tripsRouter.post(
  "/:id/invites",
  zValidator("json", createInviteSchema),
  async (c) => {
    const session = c.get("session");
    const tripId = c.req.param("id");
    if (!tripId) return c.json({ error: "not_found" }, 404);
    const access = await requireWriteAccess(tripId, session.user.id);
    if (!access.ok) {
      if (access.status === 403) return c.json({ error: "forbidden" }, 403);
      return c.json({ error: "not_found" }, 404);
    }
    const { role } = c.req.valid("json");
    const effectiveRole = role ?? "editor";

    const [existing] = await db
      .select()
      .from(schema.tripInvite)
      .where(
        and(
          eq(schema.tripInvite.tripId, tripId),
          eq(schema.tripInvite.role, effectiveRole),
          eq(schema.tripInvite.revoked, false),
        ),
      )
      .limit(1);

    if (existing) {
      const body: InviteCreateResponse = { token: existing.token, role: existing.role as InviteCreateResponse["role"] };
      return c.json(body, 200);
    }

    const token = randomBytes(24).toString("base64url");
    await db.insert(schema.tripInvite).values({
      id: randomUUID(),
      tripId,
      createdBy: session.user.id,
      token,
      role: effectiveRole,
    });
    const body: InviteCreateResponse = { token, role: effectiveRole };
    return c.json(body, 201);
  },
);
```

Note: the response is now `200` for an existing token (idempotent) and `201` only for newly-created rows. Web side doesn't care about the status code (just reads `.token`).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/routes/trips.ts
git commit -m "Make invite create find-or-create per (tripId, role)"
```

---

## Task 10: I2 — Flush packing state on last disconnect and graceful shutdown

**Files:**
- Modify: `apps/api/src/realtime/docs.ts`
- Modify: `apps/api/src/realtime/server.ts`
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Track active-client count and expose flush helpers**

Replace the contents of `apps/api/src/realtime/docs.ts` with:

```ts
import { eq } from "drizzle-orm";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { schema } from "@visitrip/db";
import { db } from "../db";

interface DocEntry {
  doc: Y.Doc;
  awareness: Awareness;
  persistTimer: NodeJS.Timeout | null;
  dirty: boolean;
  clients: number;
}

const docs = new Map<string, DocEntry>();
const loading = new Map<string, Promise<DocEntry>>();

const PERSIST_DEBOUNCE_MS = 1_000;

async function hydrate(tripId: string): Promise<DocEntry> {
  const doc = new Y.Doc();

  const [snapshot] = await db
    .select()
    .from(schema.tripYjsState)
    .where(eq(schema.tripYjsState.tripId, tripId));

  if (snapshot) {
    Y.applyUpdate(doc, snapshot.state);
  } else {
    const items = await db
      .select()
      .from(schema.packingItem)
      .where(eq(schema.packingItem.tripId, tripId));
    if (items.length > 0) {
      const packing = doc.getArray<Y.Map<unknown>>("packing");
      doc.transact(() => {
        for (const it of items) {
          const m = new Y.Map<unknown>();
          m.set("id", it.id);
          m.set("category", it.category);
          m.set("label", it.label);
          m.set("done", it.done);
          packing.push([m]);
        }
      });
    }
  }

  const entry: DocEntry = {
    doc,
    awareness: new Awareness(doc),
    persistTimer: null,
    dirty: false,
    clients: 0,
  };

  doc.on("update", () => {
    entry.dirty = true;
    if (entry.persistTimer) return;
    entry.persistTimer = setTimeout(() => {
      entry.persistTimer = null;
      persist(tripId, entry).catch((e) => console.error(`[yjs ${tripId}] persist failed`, e));
    }, PERSIST_DEBOUNCE_MS);
  });

  return entry;
}

async function persist(tripId: string, entry: DocEntry) {
  if (!entry.dirty) return;
  entry.dirty = false;
  const state = Y.encodeStateAsUpdate(entry.doc);
  await db
    .insert(schema.tripYjsState)
    .values({ tripId, state, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.tripYjsState.tripId,
      set: { state, updatedAt: new Date() },
    });
}

export async function getDoc(tripId: string): Promise<DocEntry> {
  const cached = docs.get(tripId);
  if (cached) return cached;
  const inFlight = loading.get(tripId);
  if (inFlight) return inFlight;

  const promise = hydrate(tripId).then((entry) => {
    docs.set(tripId, entry);
    loading.delete(tripId);
    return entry;
  });
  loading.set(tripId, promise);
  return promise;
}

export function addClient(tripId: string) {
  const entry = docs.get(tripId);
  if (!entry) return;
  entry.clients += 1;
}

export async function removeClient(tripId: string) {
  const entry = docs.get(tripId);
  if (!entry) return;
  entry.clients = Math.max(0, entry.clients - 1);
  if (entry.clients === 0) {
    if (entry.persistTimer) {
      clearTimeout(entry.persistTimer);
      entry.persistTimer = null;
    }
    await persist(tripId, entry).catch((e) =>
      console.error(`[yjs ${tripId}] flush-on-disconnect failed`, e),
    );
  }
}

export async function flushAll() {
  await Promise.all(
    Array.from(docs.entries()).map(async ([tripId, entry]) => {
      if (entry.persistTimer) {
        clearTimeout(entry.persistTimer);
        entry.persistTimer = null;
      }
      try {
        await persist(tripId, entry);
      } catch (e) {
        console.error(`[yjs ${tripId}] flushAll persist failed`, e);
      }
    }),
  );
}
```

- [ ] **Step 2: Wire client counting into the upgrade handler**

Replace the contents of `apps/api/src/realtime/server.ts` with:

```ts
import { and, eq } from "drizzle-orm";
import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";
import { schema } from "@visitrip/db";
import { auth } from "../auth";
import { db } from "../db";
import { addClient, getDoc, removeClient } from "./docs";
import { attachConnection } from "./protocol";

const REALTIME_PATH = "/api/realtime";
let nextClientId = 1;

function reject(socket: Duplex, code: number, reason: string) {
  socket.write(`HTTP/1.1 ${code} ${reason}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

async function authorize(req: IncomingMessage, tripId: string) {
  const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
  if (!session) return null;
  const [member] = await db
    .select()
    .from(schema.tripMember)
    .where(
      and(eq(schema.tripMember.tripId, tripId), eq(schema.tripMember.userId, session.user.id)),
    );
  if (!member) return null;
  return session;
}

export function attachRealtime(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname.replace(/\/$/, "");
    if (pathname !== REALTIME_PATH) return;

    const tripId = url.searchParams.get("trip");
    if (!tripId) {
      reject(socket, 400, "Bad Request");
      return;
    }

    void authorize(req, tripId)
      .then(async (session) => {
        if (!session) {
          reject(socket, 401, "Unauthorized");
          return;
        }
        const entry = await getDoc(tripId);
        wss.handleUpgrade(req, socket, head, (ws) => {
          const clientId = nextClientId++;
          addClient(tripId);
          ws.on("close", () => {
            void removeClient(tripId);
          });
          attachConnection(ws, entry.doc, entry.awareness, clientId);
        });
      })
      .catch((e) => {
        console.error("[ws] upgrade failed", e);
        try {
          reject(socket, 500, "Internal Server Error");
        } catch {}
      });
  });

  return wss;
}
```

- [ ] **Step 3: Wire graceful-shutdown flush in `apps/api/src/index.ts`**

Edit `apps/api/src/index.ts`. After the `attachRealtime(server as unknown as HttpServer);` line, add:

```ts
import { flushAll } from "./realtime/docs";

let shuttingDown = false;
async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[api] received ${signal}, flushing Yjs state`);
  try {
    await flushAll();
  } catch (e) {
    console.error("[api] flushAll failed during shutdown", e);
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
```

Hoist the `import { flushAll } from "./realtime/docs";` to the import block at the top of the file alongside the other realtime import. Final import block prefix:

```ts
import { serve } from "@hono/node-server";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Server as HttpServer } from "node:http";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { runMigrations } from "@visitrip/db";
import { auth } from "./auth";
import { attachRealtime } from "./realtime/server";
import { flushAll } from "./realtime/docs";
import { invitesRouter } from "./routes/invites";
import { tripsRouter } from "./routes/trips";
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 5: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 6: Boot smoke**

Run: `AUTO_MIGRATE=false PORT=3001 DATABASE_URL="$(grep ^DATABASE_URL .env | cut -d= -f2-)" BETTER_AUTH_SECRET="$(grep ^BETTER_AUTH_SECRET .env | cut -d= -f2-)" node apps/api/dist/index.js`
Expected: `api listening on http://localhost:3001`. Ctrl-C should log `[api] received SIGINT, flushing Yjs state` and exit cleanly.

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/realtime/docs.ts apps/api/src/realtime/server.ts apps/api/src/index.ts
git commit -m "Flush Yjs state on last client disconnect and on graceful shutdown"
```

---

## Task 11: M2 — Convert `useYArray` to `useSyncExternalStore`

**Files:**
- Modify: `apps/web/src/lib/yjs.tsx` (`useYArray` hook, lines ~81-98)

- [ ] **Step 1: Replace `useYArray`**

In `apps/web/src/lib/yjs.tsx`, replace the `useYArray` function with:

```tsx
export function useYArray<T>(arr: Y.Array<T>): T[] {
  const subscribe = useMemo(
    () => (cb: () => void) => {
      const handler = () => cb();
      arr.observeDeep(handler);
      return () => arr.unobserveDeep(handler);
    },
    [arr],
  );
  const getSnapshot = () => arr.toArray();
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
```

Drop the obsolete `useState`/`useEffect` block and the `void subscribe;` line. `useState` should still be imported (Task 7 uses it in `TripDocProvider`), and `useSyncExternalStore` and `useMemo` are already in the import list.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build web**

Run: `npm run build -w @visitrip/web`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/lib/yjs.tsx
git commit -m "Convert useYArray to useSyncExternalStore and drop dead useMemo"
```

---

## Task 12: M3 — Replace `&` in root `dev` script with `concurrently`

**Files:**
- Modify: root `package.json`
- Modify: `package-lock.json` (regenerated by `npm install`)

- [ ] **Step 1: Add `concurrently` as a root devDependency**

Run from the repo root: `npm install --save-dev concurrently@^9.1.0`

In an npm-workspaces repo, an `npm install` at the root adds dependencies to the root `package.json` by default. After install, root `package.json` should contain:

```json
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
```

- [ ] **Step 2: Replace the `dev` script**

In root `package.json`, change:

```json
    "dev": "npm run dev:web & npm run dev:api",
```

to:

```json
    "dev": "concurrently -k -n web,api \"npm:dev:web\" \"npm:dev:api\"",
```

- [ ] **Step 3: Verify the script runs**

Run: `npm run dev` from the repo root (with Postgres already up and `.env` set).
Expected: both `web` and `api` prefixes appear in interleaved logs. Ctrl-C should kill both. Hit `http://localhost:5173` to confirm Vite serves, and `curl localhost:3001/health` to confirm the API is up.

If `AUTO_MIGRATE=false` is set in `.env`, the API doesn't try to migrate on this boot; that's fine for dev.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "Use concurrently for cross-platform npm run dev"
```

---

## Task 13: M4 — Add global `app.onError` handler

**Files:**
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Register the error handler**

In `apps/api/src/index.ts`, immediately after the `app.use("*", cors(...))` block and before `app.get("/health", ...)`, add:

```ts
app.onError((err, c) => {
  console.error("[api] unhandled", err);
  return c.json({ error: "internal_error" }, 500);
});
```

Place it before `app.get("/health", ...)` so it covers `/health` and everything below.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 3: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/index.ts
git commit -m "Register Hono onError for consistent JSON 500 responses"
```

---

## Task 14: M6 — Evict `Y.Doc` entries on trip delete and after idle

**Files:**
- Modify: `apps/api/src/realtime/docs.ts`
- Modify: `apps/api/src/realtime/server.ts`
- Modify: `apps/api/src/routes/trips.ts`

- [ ] **Step 1: Add `removeDoc` and idle-eviction in `docs.ts`**

In `apps/api/src/realtime/docs.ts`, extend the `DocEntry` interface and helpers. Final file content (Task 10's work plus this task's additions):

```ts
import { eq } from "drizzle-orm";
import { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { schema } from "@visitrip/db";
import { db } from "../db";

interface DocEntry {
  doc: Y.Doc;
  awareness: Awareness;
  persistTimer: NodeJS.Timeout | null;
  evictTimer: NodeJS.Timeout | null;
  dirty: boolean;
  clients: number;
  sockets: Set<{ close: () => void }>;
}

const docs = new Map<string, DocEntry>();
const loading = new Map<string, Promise<DocEntry>>();

const PERSIST_DEBOUNCE_MS = 1_000;
const EVICT_IDLE_MS = 30_000;

async function hydrate(tripId: string): Promise<DocEntry> {
  const doc = new Y.Doc();

  const [snapshot] = await db
    .select()
    .from(schema.tripYjsState)
    .where(eq(schema.tripYjsState.tripId, tripId));

  if (snapshot) {
    Y.applyUpdate(doc, snapshot.state);
  } else {
    const items = await db
      .select()
      .from(schema.packingItem)
      .where(eq(schema.packingItem.tripId, tripId));
    if (items.length > 0) {
      const packing = doc.getArray<Y.Map<unknown>>("packing");
      doc.transact(() => {
        for (const it of items) {
          const m = new Y.Map<unknown>();
          m.set("id", it.id);
          m.set("category", it.category);
          m.set("label", it.label);
          m.set("done", it.done);
          packing.push([m]);
        }
      });
    }
  }

  const entry: DocEntry = {
    doc,
    awareness: new Awareness(doc),
    persistTimer: null,
    evictTimer: null,
    dirty: false,
    clients: 0,
    sockets: new Set(),
  };

  doc.on("update", () => {
    entry.dirty = true;
    if (entry.persistTimer) return;
    entry.persistTimer = setTimeout(() => {
      entry.persistTimer = null;
      persist(tripId, entry).catch((e) => console.error(`[yjs ${tripId}] persist failed`, e));
    }, PERSIST_DEBOUNCE_MS);
  });

  return entry;
}

async function persist(tripId: string, entry: DocEntry) {
  if (!entry.dirty) return;
  entry.dirty = false;
  const state = Y.encodeStateAsUpdate(entry.doc);
  await db
    .insert(schema.tripYjsState)
    .values({ tripId, state, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.tripYjsState.tripId,
      set: { state, updatedAt: new Date() },
    });
}

export async function getDoc(tripId: string): Promise<DocEntry> {
  const cached = docs.get(tripId);
  if (cached) {
    if (cached.evictTimer) {
      clearTimeout(cached.evictTimer);
      cached.evictTimer = null;
    }
    return cached;
  }
  const inFlight = loading.get(tripId);
  if (inFlight) return inFlight;

  const promise = hydrate(tripId).then((entry) => {
    docs.set(tripId, entry);
    loading.delete(tripId);
    return entry;
  });
  loading.set(tripId, promise);
  return promise;
}

export function trackSocket(tripId: string, socket: { close: () => void }) {
  const entry = docs.get(tripId);
  if (!entry) return;
  entry.sockets.add(socket);
}

export function untrackSocket(tripId: string, socket: { close: () => void }) {
  const entry = docs.get(tripId);
  if (!entry) return;
  entry.sockets.delete(socket);
}

export function addClient(tripId: string) {
  const entry = docs.get(tripId);
  if (!entry) return;
  entry.clients += 1;
  if (entry.evictTimer) {
    clearTimeout(entry.evictTimer);
    entry.evictTimer = null;
  }
}

export async function removeClient(tripId: string) {
  const entry = docs.get(tripId);
  if (!entry) return;
  entry.clients = Math.max(0, entry.clients - 1);
  if (entry.clients === 0) {
    if (entry.persistTimer) {
      clearTimeout(entry.persistTimer);
      entry.persistTimer = null;
    }
    await persist(tripId, entry).catch((e) =>
      console.error(`[yjs ${tripId}] flush-on-disconnect failed`, e),
    );
    if (entry.evictTimer) clearTimeout(entry.evictTimer);
    entry.evictTimer = setTimeout(() => {
      void evict(tripId);
    }, EVICT_IDLE_MS);
  }
}

async function evict(tripId: string) {
  const entry = docs.get(tripId);
  if (!entry || entry.clients > 0) return;
  if (entry.persistTimer) {
    clearTimeout(entry.persistTimer);
    entry.persistTimer = null;
  }
  await persist(tripId, entry).catch((e) =>
    console.error(`[yjs ${tripId}] persist-on-evict failed`, e),
  );
  entry.doc.destroy();
  docs.delete(tripId);
}

export async function removeDoc(tripId: string) {
  const entry = docs.get(tripId);
  if (!entry) return;
  if (entry.persistTimer) {
    clearTimeout(entry.persistTimer);
    entry.persistTimer = null;
  }
  if (entry.evictTimer) {
    clearTimeout(entry.evictTimer);
    entry.evictTimer = null;
  }
  for (const s of entry.sockets) {
    try {
      s.close();
    } catch {}
  }
  entry.sockets.clear();
  entry.doc.destroy();
  docs.delete(tripId);
}

export async function flushAll() {
  await Promise.all(
    Array.from(docs.entries()).map(async ([tripId, entry]) => {
      if (entry.persistTimer) {
        clearTimeout(entry.persistTimer);
        entry.persistTimer = null;
      }
      try {
        await persist(tripId, entry);
      } catch (e) {
        console.error(`[yjs ${tripId}] flushAll persist failed`, e);
      }
    }),
  );
}
```

- [ ] **Step 2: Track sockets in `server.ts`**

Replace `apps/api/src/realtime/server.ts` with:

```ts
import { and, eq } from "drizzle-orm";
import type { IncomingMessage, Server as HttpServer } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer } from "ws";
import { schema } from "@visitrip/db";
import { auth } from "../auth";
import { db } from "../db";
import { addClient, getDoc, removeClient, trackSocket, untrackSocket } from "./docs";
import { attachConnection } from "./protocol";

const REALTIME_PATH = "/api/realtime";
let nextClientId = 1;

function reject(socket: Duplex, code: number, reason: string) {
  socket.write(`HTTP/1.1 ${code} ${reason}\r\nConnection: close\r\n\r\n`);
  socket.destroy();
}

async function authorize(req: IncomingMessage, tripId: string) {
  const session = await auth.api.getSession({ headers: new Headers(req.headers as Record<string, string>) });
  if (!session) return null;
  const [member] = await db
    .select()
    .from(schema.tripMember)
    .where(
      and(eq(schema.tripMember.tripId, tripId), eq(schema.tripMember.userId, session.user.id)),
    );
  if (!member) return null;
  return session;
}

export function attachRealtime(server: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", "http://localhost");
    const pathname = url.pathname.replace(/\/$/, "");
    if (pathname !== REALTIME_PATH) return;

    const tripId = url.searchParams.get("trip");
    if (!tripId) {
      reject(socket, 400, "Bad Request");
      return;
    }

    void authorize(req, tripId)
      .then(async (session) => {
        if (!session) {
          reject(socket, 401, "Unauthorized");
          return;
        }
        const entry = await getDoc(tripId);
        wss.handleUpgrade(req, socket, head, (ws) => {
          const clientId = nextClientId++;
          const handle = { close: () => ws.close() };
          addClient(tripId);
          trackSocket(tripId, handle);
          ws.on("close", () => {
            untrackSocket(tripId, handle);
            void removeClient(tripId);
          });
          attachConnection(ws, entry.doc, entry.awareness, clientId);
        });
      })
      .catch((e) => {
        console.error("[ws] upgrade failed", e);
        try {
          reject(socket, 500, "Internal Server Error");
        } catch {}
      });
  });

  return wss;
}
```

- [ ] **Step 3: Force-evict on trip delete**

In `apps/api/src/routes/trips.ts`, find `tripsRouter.delete("/:id", ...)` (around line 250-261). Add a `removeDoc` call right after the membership/ownership check and before the DB delete. Final handler:

```ts
tripsRouter.delete("/:id", async (c) => {
  const session = c.get("session");
  const tripId = c.req.param("id");
  if (!tripId) return c.json({ error: "not_found" }, 404);

  const [tripRow] = await db.select().from(schema.trip).where(eq(schema.trip.id, tripId));
  if (!tripRow) return c.json({ error: "not_found" }, 404);
  if (tripRow.ownerId !== session.user.id) return c.json({ error: "forbidden" }, 403);

  await removeDoc(tripId);
  await db.delete(schema.trip).where(eq(schema.trip.id, tripId));
  return c.json({ ok: true });
});
```

Add to the file's import block at the top:

```ts
import { removeDoc } from "../realtime/docs";
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: clean exit.

- [ ] **Step 5: Build API**

Run: `npm run build -w @visitrip/api`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/realtime/docs.ts apps/api/src/realtime/server.ts apps/api/src/routes/trips.ts
git commit -m "Evict Yjs doc cache on trip delete and after 30s idle"
```

---

## Task 15: M7 — Slim API Docker image via a `prod-deps` stage

**Files:**
- Modify: `apps/api/Dockerfile`

- [ ] **Step 1: Add a third stage and rewrite**

Replace `apps/api/Dockerfile` with:

```dockerfile
FROM node:20-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN npm install
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/db ./packages/db
RUN npm run build -w @visitrip/api

FROM node:20-alpine AS prod-deps
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
RUN npm install --omit=dev --workspace @visitrip/api --include-workspace-root

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /repo/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
COPY --from=build /repo/packages/db/migrations ./migrations
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Build the image to validate**

Run: `docker compose build api`
Expected: success.

- [ ] **Step 3: Record image size delta (informational)**

Run: `docker images | grep visitrip`
Expected: API image visibly smaller than before. Record the size in the commit message.

- [ ] **Step 4: Boot the stack end-to-end**

Run: `docker compose down -v && docker compose up --build -d`
Then: `curl localhost:3001/health` → `{"status":"ok"}`. Watch logs for the auto-migrate line: `docker compose logs api | grep migrations`.

- [ ] **Step 5: Commit**

```bash
git add apps/api/Dockerfile
git commit -m "Add prod-deps stage to slim API runtime image"
```

---

## Task 16: M1 — PWA icons

**Files:**
- Create: `apps/web/scripts/gen-pwa-icons.mjs`
- Create: `apps/web/public/icon-192.png` (binary, generated by script)
- Create: `apps/web/public/icon-512.png` (binary, generated by script)
- Modify: `apps/web/vite.config.ts`

- [ ] **Step 1: Add the generator script**

Create `apps/web/scripts/gen-pwa-icons.mjs`:

```js
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function solidPng(size, [r, g, b]) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const row = Buffer.alloc(1 + size * 3);
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r;
    row[2 + x * 3] = g;
    row[3 + x * 3] = b;
  }
  const raw = Buffer.alloc(row.length * size);
  for (let y = 0; y < size; y++) row.copy(raw, y * row.length);
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const BRAND = [0x36, 0x77, 0xc2];
const out = (name) => new URL(`../public/${name}`, import.meta.url);
mkdirSync(dirname(fileURLToPath(out("icon-192.png"))), { recursive: true });
writeFileSync(out("icon-192.png"), solidPng(192, BRAND));
writeFileSync(out("icon-512.png"), solidPng(512, BRAND));
console.log("wrote icon-192.png and icon-512.png");
```

- [ ] **Step 2: Run the script to produce the PNGs**

Run: `node apps/web/scripts/gen-pwa-icons.mjs`
Expected: stdout `wrote icon-192.png and icon-512.png`. The two PNG files now exist under `apps/web/public/`.

Verify with: `file apps/web/public/icon-192.png apps/web/public/icon-512.png`
Expected output: each line starts with `PNG image data` and reports the correct dimensions (192×192 and 512×512).

- [ ] **Step 3: Register icons in the manifest**

In `apps/web/vite.config.ts`, replace the `manifest.icons: []` with two entries. Final file content:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Visitrip",
        short_name: "Visitrip",
        description: "Organize, share, and collaborate on trips.",
        theme_color: "#3677c2",
        background_color: "#f6f3ec",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true, ws: true },
      "/health": "http://localhost:3001",
    },
  },
});
```

- [ ] **Step 4: Build web and verify the manifest references the icons**

Run: `npm run build -w @visitrip/web`
Expected: success. Inspect the generated manifest: `cat apps/web/dist/manifest.webmanifest`.
Expected JSON includes the two `icons` entries pointing at `/icon-192.png` and `/icon-512.png`.

- [ ] **Step 5: Update README's Minor section**

In `README.md`, the Minor section's first bullet currently reads:

> PWA manifest has empty `icons: []` (`apps/web/vite.config.ts:20`); install doesn't actually work in Chrome or Safari. Add 192/512 PNG icons or drop "Installable PWA shell" above.

Remove that bullet (the issue is now resolved).

- [ ] **Step 6: Commit**

```bash
git add apps/web/scripts/gen-pwa-icons.mjs apps/web/public/icon-192.png apps/web/public/icon-512.png apps/web/vite.config.ts README.md
git commit -m "Add PWA manifest icons (solid brand PNGs)"
```

---

## Final verification

After all tasks complete:

- [ ] **Step F1: Typecheck the whole repo**

Run: `npm run typecheck`
Expected: clean exit across every workspace.

- [ ] **Step F2: Build every workspace**

Run: `npm run build`
Expected: each workspace's build succeeds.

- [ ] **Step F3: End-to-end docker boot from a clean DB**

Run: `docker compose down -v && docker compose up --build -d`
Then: `docker compose logs api | grep "running migrations"` to confirm auto-migrate fires, and `curl localhost:3001/health` returns `{"status":"ok"}`.

- [ ] **Step F4: Manual smoke**

In a browser:
1. Sign up. Create a trip.
2. Add a day, an item, a packing item.
3. Open the same trip in a second tab — packing edits should round-trip live.
4. Open a *second trip* in a third tab (with a different tripId). Toggle a packing item in trip A. Confirm it does NOT appear in trip B's packing list. (Proves C1 fix.)
5. Invite a second user as a viewer. Sign in as that user, accept the invite, then attempt to add a day from the UI. The API should reject with 403 (network tab confirms). (Proves I1.)
6. Create a new invite from the same role — the URL token should match the one previously generated, not a new one. (Proves I5.)
7. From DevTools console, run a reorder POST with a malformed `ids` array — expect 400 `{"error":"invalid_reorder"}`. (Proves I7.)

- [ ] **Step F5: Update README "Known issues" section**

After all tasks land cleanly, remove the entire "Known issues" subsection (Critical, Important, Minor) from `README.md`. Anything not closed by this plan stays in the README — but if every task above completed, the section can be removed in full.

Commit:

```bash
git add README.md
git commit -m "Remove resolved known-issues section from README"
```

---

## Notes on rollback

Each task is committable on its own, so any individual fix can be reverted with `git revert <sha>`. C2 (Task 3) and M7 (Task 15) together change the Docker runtime image — if either misbehaves in production, revert both. I1 (Task 4) and I5 (Task 9) interact via `requireWriteAccess` — revert both together if needed.
