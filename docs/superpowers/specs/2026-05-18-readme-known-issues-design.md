# README Known Issues — Design

Date: 2026-05-18
Scope: every item under "Known issues" in `README.md` (3 Critical, 7 Important, 6 Minor — sixteen total). The "Planned" section is out of scope; each of those features needs its own design.

## Goal

Close out the known-issues backlog as a single coherent slice of work. Every fix should land verifiable behind `npm run typecheck`, `npm run build`, and an end-to-end `docker compose up --build` boot.

## Design calls

Four items have non-obvious choices; the rest follow remediation hints already written into the README.

1. **C2 (broken docker migration command)** — bake migrations into the API image and run them automatically at API startup via drizzle-orm's programmatic migrator. Alternatives rejected: a migrate sidecar service (extra compose surface) and host-side migrations (worst self-host UX).
2. **I2 (packing data-loss window)** — keep the 1s debounce for write coalescing, but add two additional flush triggers: persist immediately when a doc's active-client count drops to zero, and flush all pending persists on `SIGTERM`/`SIGINT`. No mirror back into `packing_item` rows — `trip_yjs_state` is the post-hydration source of truth and mirroring duplicates state.
3. **M1 (PWA icons)** — commit two static brand PNGs (192×192 and 512×512) at `apps/web/public/`. No new build-time dependency.
4. **M3 (Unix-only `&` in root dev script)** — add `concurrently` as a root devDependency and rewrite `npm run dev` to use it. Cross-platform, small, well-known.

## Changes by area

### Critical

#### C1. y-websocket cross-tab packing leak
- File: `apps/web/src/lib/yjs.tsx:46`
- Change `new WebsocketProvider(baseUrl, "", doc, ...)` to `new WebsocketProvider(baseUrl, tripId, doc, ...)`. The roomname is what y-websocket uses as the `BroadcastChannel` key inside a browser, so an empty string collides across trips.

#### C2. Docker self-host migration command broken
- The runtime API image has no `package.json`, no migration files, and no drizzle-kit — the documented command fails on every fresh self-host.
- Bake `packages/db/migrations/` into the API runtime image (copy from build stage).
- In `apps/api/src/index.ts`, before `serve(...)`, call drizzle-orm's programmatic migrator:
  ```ts
  await migrate(db, { migrationsFolder: "/app/migrations" });
  ```
  Use `drizzle-orm/postgres-js/migrator` (already a transitive dep through `drizzle-orm`).
- Add `AUTO_MIGRATE` env (default `"true"`) so operators can opt out for orchestrated rollouts.
- Update `README.md` self-host section to drop the broken `docker compose run --rm api npm run db:migrate` line.

#### C3. `engines.node` too loose
- File: root `package.json:21`
- Change `"node": ">=20"` to `"node": ">=20.12"`. `--env-file` needs ≥20.6 and `process.loadEnvFile` needs ≥20.12; pick the larger lower bound.

### Important

#### I1. Viewer role not enforced on write endpoints
- File: `apps/api/src/routes/trips.ts` (and any other mutating routes the audit turns up)
- Add a `requireWriteAccess(tripId, userId)` helper sibling to `requireMembership`. It returns the membership row when `role !== "viewer"` and `null` otherwise.
- Replace every mutation site (POST/PATCH/DELETE under `/trips/:id`, plus day/item/expense/invite mutations) so the membership check additionally rejects viewers with `403 { error: "forbidden" }`.
- Read-only `GET` routes keep the existing `requireMembership`.

#### I2. Packing data-loss window on api restart
- File: `apps/api/src/realtime/docs.ts`
- Track active-client count per doc entry. Increment in `attachConnection` (or just at `attachRealtime` upgrade time), decrement on `ws.on("close")`.
- When the count hits zero, run `persist()` immediately (clear any pending debounce timer first).
- Wire a SIGTERM/SIGINT handler in `apps/api/src/index.ts` that iterates the docs map, awaits `persist()` for any entry with `dirty: true`, then exits cleanly.
- Keep the existing 1s debounce for the normal hot path.

#### I3. `useMemo` opening the Yjs WebSocket
- File: `apps/web/src/lib/yjs.tsx:41`
- Replace the `useMemo` with `useState(() => ({...}))`. The construction runs once per mount; teardown stays in the existing `useEffect`.
- The current `useMemo` deps are `[tripId, user.id, user.name]`. Effective dep-change behavior is preserved by adding `key={tripId}` to the existing `<TripDocProvider>` mount in `apps/web/src/App.tsx` so the provider remounts when the open trip changes. The user identity can't change while a trip is open (auth flips would unmount `TripView` first), so no further key is needed.

#### I4. `setAcceptMode` during render
- File: `apps/web/src/App.tsx:123-125`
- Move the `setAcceptMode("preview")` reset into a `useEffect` watching `[state.status, pendingInvite]`. Render path stays side-effect-free.

#### I5. Invite tokens accumulate forever
- Files: `apps/api/src/routes/trips.ts` (invite create), `apps/web/src/screens/invite.tsx`
- On `POST /trips/:id/invites`, look up an existing non-revoked invite for `(tripId, role)` created by anyone (not just the caller). If one exists, return its token + role; otherwise create a new row.
- Idempotent server response means the existing client `useEffect` is safe — every mount/role-flip just gets the same token back. No web change required.

#### I6. Membership listing capped at 50
- File: `apps/api/src/routes/trips.ts:116-123`
- Split into a single-row authz check (`where tripId AND userId limit 1`) and an unbounded listing query. The listing joins the `user` table for names/emails as today.
- Combine with M5: the listing goes into the `Promise.all` batch.

#### I7. Day-item reorder no permutation validation
- File: `apps/api/src/routes/trips.ts:415-423`
- Before the `db.transaction(...)`, load the day's current item ids. Compare:
  - `ids.length === current.length`
  - `new Set(ids).size === ids.length` (no duplicates)
  - every `id` in `ids` ∈ `current`
- On mismatch, reject with `400 { error: "invalid_reorder" }` and skip the update.

### Minor

#### M1. PWA manifest icons empty
- Commit `apps/web/public/icon-192.png` and `apps/web/public/icon-512.png`. Solid brand background (`#3677c2`) with a centered white "V" glyph; pre-rendered, no build step.
- Update `apps/web/vite.config.ts` `manifest.icons` to list both with `purpose: "any maskable"`.

#### M2. Dead `useMemo`/`subscribe` in `useYArray`
- File: `apps/web/src/lib/yjs.tsx:81-97`
- Convert `useYArray` to `useSyncExternalStore` with a stable `subscribe` (using `useRef` or `useMemo` keyed on the array, no `void subscribe`). Matches the pattern in `usePresence`/`useConnection`.

#### M3. Unix-only `&` in root dev script
- File: root `package.json`
- Add `concurrently` as a root devDependency.
- Replace `"dev": "npm run dev:web & npm run dev:api"` with
  `"dev": "concurrently -k -n web,api \"npm:dev:web\" \"npm:dev:api\""`.
  `-k` kills siblings if one dies (matches the existing `&` behavior closely enough).

#### M4. No global Hono `app.onError`
- File: `apps/api/src/index.ts`
- Register `app.onError((err, c) => { console.error("[api] unhandled", err); return c.json({ error: "internal_error" }, 500); })`. Consistent JSON envelope; stack traces stay server-side.

#### M5. `GET /api/trips/:id` runs six queries serially
- File: `apps/api/src/routes/trips.ts:116-166`
- After the membership authz check (now I6), run trip / users / days / expenses / packing / docs concurrently via `Promise.all`. `items` still serializes after `days` because it needs `dayIds`.

#### M6. `Y.Doc` map never evicts
- File: `apps/api/src/realtime/docs.ts:14`
- Add `removeDoc(tripId)` that destroys the doc, persists if dirty, closes any active WebSocket clients, and removes the map entry.
- Hook into `DELETE /api/trips/:id` (already in `trips.ts:250-261`) to call `removeDoc(tripId)` before/after the DB delete.
- After last-client flush (I2), schedule eviction after a 30s idle grace window (cancelled if a new client connects in that window).

#### M7. Docker image ships devDeps
- File: `apps/api/Dockerfile`
- Add a third stage `prod-deps` that does an `npm install --omit=dev -w @visitrip/api --include-workspace-root` against just the api manifest tree. Runtime stage copies `node_modules` from `prod-deps` instead of `build`.
- Validation: image size after change vs. before, recorded in commit message.

## Ordering

Land changes in this order so verification stays meaningful at each step:

1. **Critical batch** — C1, C2, C3 (one PR-able commit each; C2 is the largest because of the Dockerfile + index.ts wiring + README update).
2. **Important batch** — I1 → I6 → I7 → I3 → I4 → I5 → I2 (auth gate first so subsequent work runs under the right invariants; I2 last because it touches realtime/index.ts again after C2).
3. **Minor batch** — M5 (depends on I6's split), then M2/M3/M4/M6/M7. M1 last; pure asset commit.

## Verification per batch

After each batch:
- `npm run typecheck`
- `npm run build`
- `node apps/api/dist/index.js` boots; `curl localhost:3001/health` returns `{"status":"ok"}`
- Touched UI screens spot-checked manually (packing, invite sheet, trip screen).

Final, after all batches:
- `docker compose down -v && docker compose up --build -d` from a clean state — proves C2 (auto-migrate) and M7 (slim image) together.
- Manual smoke: sign up, create a trip, add a day + item, add a packing item from two browser tabs (different trips, to prove C1), invite + accept (find-or-create per I5), viewer-role drag rejected (I1).

## Out of scope

- Anything under README "Planned" (Yjs migration for non-packing data, object storage, email delivery, profile preferences, offline, CI/tests/lint). Each will get its own brainstorm.
- Invite expiry / revoke UI — I5 fixes accumulation by find-or-create only.
- Mirroring Yjs state back into `packing_item` rows — explicitly rejected; `trip_yjs_state` is the source of truth after hydration.
