import type { WebSocket as NodeWebSocket } from "ws";

export interface WSHandlers {
  message?: (data: ArrayBuffer | Buffer) => void;
  close?: () => void;
  error?: () => void;
}

// Cloudflare WebSockets expose the standard browser surface (readyState, send,
// binaryType) but no .on()/.off(); under Hibernation, message/close/error are
// delivered to the Durable Object class itself. This shim gives the existing
// y-protocols `attachConnection` (which calls ws.on(...)) somewhere to register
// its handlers — the DO then calls them from webSocketMessage/Close/Error.
export function makeWsShim(ws: WebSocket, handlers: WSHandlers): NodeWebSocket {
  const shim = {
    get readyState() {
      return ws.readyState;
    },
    OPEN: 1,
    binaryType: "arraybuffer" as string,
    send(data: ArrayBuffer | ArrayBufferView | string) {
      try {
        ws.send(data as ArrayBuffer);
      } catch {
        // socket closing
      }
    },
    on(event: "message" | "close" | "error", handler: (data?: ArrayBuffer | Buffer) => void) {
      handlers[event] = handler as never;
    },
  };
  return shim as unknown as NodeWebSocket;
}
