import type { Db } from "@visitrip/db";

let _db: Db | null = null;

export function setDb(database: Db) {
  _db = database;
}

// Proxy so route files keep `import { db } from "../db"` working across both
// Node (postgres-js) and Workers (D1) entrypoints. Methods are bound to the
// real instance so Drizzle's internal `this` lookups resolve correctly.
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    if (!_db) throw new Error("db accessed before setDb()");
    const value = Reflect.get(_db as object, prop);
    return typeof value === "function" ? value.bind(_db) : value;
  },
});

// D1 rejects raw BEGIN/COMMIT, so drizzle's d1 transaction throws. On
// Postgres we still want a real transaction. This wrapper picks the right
// path at runtime; on D1 the callback runs sequentially without atomicity,
// which is good enough for current callsites (single-trip create, packing
// reorder). Promote to db.batch if a future callsite needs real atomicity.
export async function inTransaction<T>(cb: (tx: Db) => Promise<T>): Promise<T> {
  if (!_db) throw new Error("db accessed before setDb()");
  const anyDb = _db as unknown as { batch?: unknown; transaction: (cb: (tx: Db) => Promise<T>) => Promise<T> };
  if (typeof anyDb.batch === "function") {
    return cb(db);
  }
  return anyDb.transaction(cb);
}
