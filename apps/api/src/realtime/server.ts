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
    // y-websocket's WebsocketProvider appends "/<roomname>" to the base URL,
    // so accept both "/api/realtime" and "/api/realtime/<anything>".
    if (pathname !== REALTIME_PATH && !pathname.startsWith(`${REALTIME_PATH}/`)) return;

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
