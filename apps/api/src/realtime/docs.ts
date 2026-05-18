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
