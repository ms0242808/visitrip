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
