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

// Run a list of independent statements atomically on both drivers. On D1 we
// dispatch to db.batch (one SQLite transaction inside the edge runtime); on
// Postgres we wrap them in a real transaction. The build callback receives
// whichever bound instance is appropriate so each statement executes against
// the right session.
export async function runBatch(build: (b: Db) => readonly unknown[]): Promise<void> {
  if (!_db) throw new Error("db accessed before setDb()");
  const anyDb = _db as unknown as {
    batch?: (statements: readonly unknown[]) => Promise<unknown>;
    transaction: (cb: (tx: Db) => Promise<void>) => Promise<void>;
  };
  if (typeof anyDb.batch === "function") {
    const stmts = build(_db);
    if (stmts.length === 0) return;
    await anyDb.batch(stmts);
    return;
  }
  await anyDb.transaction(async (tx) => {
    const stmts = build(tx);
    for (const s of stmts) await s;
  });
}
