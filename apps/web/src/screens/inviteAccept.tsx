import { useEffect, useState } from "react";
import type { InvitePreview } from "@visitrip/shared";
import { Wordmark } from "../components/Brand";
import { TripCover } from "../components/TripCover";
import { Button, IconButton, NavBar } from "../components/ui";
import { daysBetween, fmtRange } from "../lib/format";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

interface InviteAcceptScreenProps {
  token: string;
  onCancel: () => void;
  onJoined: (tripId: string) => void;
  onSignInRequired: () => void;
}

export function InviteAcceptScreen({ token, onCancel, onJoined, onSignInRequired }: InviteAcceptScreenProps) {
  const { state } = useAuth();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getInvite(token)
      .then((data) => {
        if (cancelled) return;
        setInvite(data);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Invite not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const join = async () => {
    if (!invite) return;
    if (state.status !== "authed") {
      onSignInRequired();
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const { tripId } = await api.acceptInvite(token);
      onJoined(tripId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join");
      setJoining(false);
    }
  };

  return (
    <div className="vt-screen">
      <NavBar leading={<IconButton name="close" onClick={onCancel} />} title={<Wordmark size={16} />} />
      <div className="vt-scroll">
        <div className="vt-content-narrow" style={{ padding: "8px 16px 100px" }}>
        {loading && (
          <div style={{ padding: 32, textAlign: "center", color: "var(--vt-label-tertiary)" }}>
            Loading invite…
          </div>
        )}
        {!loading && error && (
          <div
            style={{
              padding: 32,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 700 }}>This invite isn't available</div>
            <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", maxWidth: 280, lineHeight: 1.5 }}>
              The link may have been revoked or no longer exists. Ask whoever shared it to send a new one.
            </div>
            <Button variant="primary" onClick={onCancel}>
              Back to trips
            </Button>
          </div>
        )}
        {!loading && invite && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <TripCover kind={invite.trip.cover} height={180}>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                  }}
                >
                  {invite.trip.location}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.018em",
                    marginTop: 4,
                    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                  }}
                >
                  {invite.trip.title}
                </div>
                <div style={{ fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                  {fmtRange(invite.trip.startDate, invite.trip.endDate)} ·{" "}
                  {daysBetween(invite.trip.startDate, invite.trip.endDate) + 1} days
                </div>
              </div>
            </TripCover>

            <div style={{ fontSize: 15, lineHeight: 1.5, color: "var(--vt-label-secondary)" }}>
              <b style={{ color: "var(--vt-label)" }}>{invite.inviter.name}</b> invited you to join this trip
              {" "}
              {invite.trip.memberCount > 0 && (
                <>
                  with {invite.trip.memberCount} other{invite.trip.memberCount === 1 ? "" : "s"}
                </>
              )}
              . You'll be able to {invite.role === "editor" ? "add plans, expenses, and packing items" : "see everything (read-only)"}.
            </div>

            {state.status !== "authed" && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "var(--vt-accent-tint)",
                  color: "var(--vt-accent)",
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                Sign in or create an account to join. We'll bring you right back here.
              </div>
            )}

            {error && <div style={{ fontSize: 13, color: "var(--vt-destructive)" }}>{error}</div>}

            <Button variant="primary" size="lg" block onClick={join} loading={joining}>
              {state.status === "authed" ? "Join trip" : "Sign in to join"}
            </Button>
            <Button variant="ghost" block onClick={onCancel}>
              Maybe later
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
