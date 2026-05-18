import * as decoding from "lib0/decoding";
import * as encoding from "lib0/encoding";
import type { WebSocket } from "ws";
import { Awareness, applyAwarenessUpdate, encodeAwarenessUpdate, removeAwarenessStates } from "y-protocols/awareness";
import { readSyncMessage, writeSyncStep1, writeUpdate } from "y-protocols/sync";
import type * as Y from "yjs";

const MESSAGE_SYNC = 0;
const MESSAGE_AWARENESS = 1;

function safeSend(ws: WebSocket, payload: Uint8Array) {
  if (ws.readyState === ws.OPEN) {
    try {
      ws.send(payload);
    } catch {
      // ignore — socket likely closing
    }
  }
}

export function attachConnection(ws: WebSocket, doc: Y.Doc, awareness: Awareness, clientId: number) {
  ws.binaryType = "arraybuffer";

  const sendSyncStep1 = () => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    writeSyncStep1(encoder, doc);
    safeSend(ws, encoding.toUint8Array(encoder));
  };

  const sendInitialAwareness = () => {
    if (awareness.getStates().size === 0) return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(
      encoder,
      encodeAwarenessUpdate(awareness, Array.from(awareness.getStates().keys())),
    );
    safeSend(ws, encoding.toUint8Array(encoder));
  };

  sendSyncStep1();
  sendInitialAwareness();

  const updateHandler = (update: Uint8Array, origin: unknown) => {
    if (origin === ws) return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_SYNC);
    writeUpdate(encoder, update);
    safeSend(ws, encoding.toUint8Array(encoder));
  };
  doc.on("update", updateHandler);

  const awarenessUpdateHandler = (
    { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown,
  ) => {
    if (origin === ws) return;
    const changed = added.concat(updated, removed);
    if (changed.length === 0) return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MESSAGE_AWARENESS);
    encoding.writeVarUint8Array(encoder, encodeAwarenessUpdate(awareness, changed));
    safeSend(ws, encoding.toUint8Array(encoder));
  };
  awareness.on("update", awarenessUpdateHandler);

  ws.on("message", (data: ArrayBuffer | Buffer) => {
    const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : new Uint8Array(data);
    const decoder = decoding.createDecoder(bytes);
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
      case MESSAGE_SYNC: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MESSAGE_SYNC);
        readSyncMessage(decoder, encoder, doc, ws);
        if (encoding.length(encoder) > 1) {
          safeSend(ws, encoding.toUint8Array(encoder));
        }
        break;
      }
      case MESSAGE_AWARENESS: {
        applyAwarenessUpdate(awareness, decoding.readVarUint8Array(decoder), ws);
        break;
      }
    }
  });

  const cleanup = () => {
    doc.off("update", updateHandler);
    awareness.off("update", awarenessUpdateHandler);
    removeAwarenessStates(awareness, [clientId], ws);
  };
  ws.on("close", cleanup);
  ws.on("error", cleanup);
}
