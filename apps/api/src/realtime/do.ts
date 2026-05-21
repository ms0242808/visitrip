import { DurableObject } from "cloudflare:workers";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { attachConnection } from "./protocol";
import { makeWsShim, type WSHandlers } from "./ws-shim";

interface DOEnv {
  VISITRIP_DB: D1Database;
}

interface SocketAttachment {
  clientId: number;
  tripId: string;
}

const PERSIST_DEBOUNCE_MS = 1_000;

export class TripDoc extends DurableObject<DOEnv> {
  private doc: Y.Doc;
  private awareness: Awareness;
  private handlers = new WeakMap<WebSocket, WSHandlers>();
  private nextClientId = 1;
  private dirty = false;
  private seeded = false;

  constructor(ctx: DurableObjectState, env: DOEnv) {
    super(ctx, env);
    this.doc = new Y.Doc();
    this.awareness = new Awareness(this.doc);

    this.doc.on("update", () => {
      this.dirty = true;
      void this.ctx.storage.setAlarm(Date.now() + PERSIST_DEBOUNCE_MS);
    });

    void this.ctx.blockConcurrencyWhile(async () => {
      const snapshot = await this.ctx.storage.get<Uint8Array>("snapshot");
      if (snapshot) {
        Y.applyUpdate(this.doc, snapshot);
        this.seeded = true;
      }
      for (const ws of this.ctx.getWebSockets()) {
        const att = ws.deserializeAttachment() as SocketAttachment | null;
        if (!att) continue;
        if (att.clientId >= this.nextClientId) this.nextClientId = att.clientId + 1;
        const handlers: WSHandlers = {};
        this.handlers.set(ws, handlers);
        attachConnection(makeWsShim(ws, handlers), this.doc, this.awareness, att.clientId);
      }
    });
  }

  private async seedFromD1(tripId: string) {
    if (this.seeded) return;
    const result = await this.env.VISITRIP_DB
      .prepare("SELECT id, category, label, done FROM packing_item WHERE trip_id = ? ORDER BY position ASC")
      .bind(tripId)
      .all<{ id: string; category: string; label: string; done: number }>();
    this.seeded = true;
    if (result.results.length === 0) return;
    const packing = this.doc.getArray<Y.Map<unknown>>("packing");
    this.doc.transact(() => {
      for (const it of result.results) {
        const m = new Y.Map<unknown>();
        m.set("id", it.id);
        m.set("category", it.category);
        m.set("label", it.label);
        m.set("done", !!it.done);
        packing.push([m]);
      }
    });
  }

  override async fetch(req: Request): Promise<Response> {
    if (req.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }
    const url = new URL(req.url);
    const tripId = url.searchParams.get("trip");
    if (!tripId) return new Response("Bad Request", { status: 400 });

    await this.seedFromD1(tripId);

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const clientId = this.nextClientId++;
    server.serializeAttachment({ clientId, tripId } satisfies SocketAttachment);
    this.ctx.acceptWebSocket(server);

    const handlers: WSHandlers = {};
    this.handlers.set(server, handlers);
    attachConnection(makeWsShim(server, handlers), this.doc, this.awareness, clientId);

    return new Response(null, { status: 101, webSocket: client });
  }

  override async webSocketMessage(ws: WebSocket, data: ArrayBuffer | string): Promise<void> {
    const h = this.handlers.get(ws);
    if (!h?.message) return;
    if (typeof data === "string") {
      h.message(new TextEncoder().encode(data).buffer as ArrayBuffer);
    } else {
      h.message(data);
    }
  }

  override async webSocketClose(ws: WebSocket): Promise<void> {
    const h = this.handlers.get(ws);
    h?.close?.();
    this.handlers.delete(ws);
    try {
      ws.close();
    } catch {
      // already closing
    }
  }

  override async webSocketError(ws: WebSocket): Promise<void> {
    const h = this.handlers.get(ws);
    h?.error?.();
    this.handlers.delete(ws);
  }

  override async alarm(): Promise<void> {
    if (!this.dirty) return;
    this.dirty = false;
    const state = Y.encodeStateAsUpdate(this.doc);
    await this.ctx.storage.put("snapshot", state);
  }
}
