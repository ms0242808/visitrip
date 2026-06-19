import type { Trip } from "./types";

export interface InvitePayload {
  trip: Trip;
  role: "editor" | "viewer";
  from: string;
}

// URL-safe base64 of a UTF-8 string
function toB64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(b64: string): string {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64.length + 3) % 4);
  const bin = atob(padded);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Encode a trip + role into a compact invite token. */
export function encodeInvite(trip: Trip, role: "editor" | "viewer", from: string): string {
  const payload: InvitePayload = {
    // share a clean snapshot; recipient's role/collaborators are set on accept
    trip: { ...trip, role: "owner", collaborators: [], sharedBy: undefined },
    role,
    from,
  };
  return toB64Url(JSON.stringify(payload));
}

export function decodeInvite(token: string): InvitePayload | null {
  try {
    const data = JSON.parse(fromB64Url(token)) as InvitePayload;
    if (!data?.trip?.name || (data.role !== "editor" && data.role !== "viewer")) return null;
    return data;
  } catch {
    return null;
  }
}

export function buildInviteLink(trip: Trip, role: "editor" | "viewer", from: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/#join=${encodeInvite(trip, role, from)}`;
}

/** Read a #join=... token from the current URL, if any. */
export function readJoinToken(): string | null {
  if (typeof window === "undefined") return null;
  const m = window.location.hash.match(/[#&]join=([^&]+)/);
  return m ? m[1] : null;
}

export function clearJoinToken(): void {
  if (typeof window === "undefined") return;
  history.replaceState(null, "", window.location.pathname + window.location.search);
}
