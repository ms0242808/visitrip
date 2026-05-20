import { useEffect, useState } from "react";
import type { InvitePreview } from "@visitrip/shared";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { Icon } from "../components/Icon";
import { Cover } from "../components/ui";

interface InviteAcceptScreenProps {
  token: string;
  onCancel: () => void;
  onJoined: (tripId: string) => void;
  onSignInRequired: () => void;
}

export function InviteAcceptScreen({
  token,
  onCancel,
  onJoined,
  onSignInRequired,
}: InviteAcceptScreenProps) {
  const { state } = useAuth();
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .getInvite(token)
      .then((data) => alive && setInvite(data))
      .catch((e) =>
        alive && setError(e instanceof Error ? e.message : "Invite not found"),
      )
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token]);

  const accept = async () => {
    if (state.status !== "authed") {
      onSignInRequired();
      return;
    }
    setJoining(true);
    try {
      const { tripId } = await api.acceptInvite(token);
      onJoined(tripId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join the trip");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--c-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              fontFamily: "var(--sf-display)",
              fontSize: 26,
              letterSpacing: "-0.02em",
            }}
          >
            Trip invite
          </div>
          <button
            onClick={onCancel}
            className="btn-ghost"
            style={{ padding: "8px 10px", borderRadius: 999 }}
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {loading ? (
          <div className="card" style={{ padding: 20, borderRadius: 18, color: "var(--c-ink-3)" }}>
            Loading…
          </div>
        ) : error || !invite ? (
          <div
            className="card"
            style={{ padding: 20, borderRadius: 18, color: "var(--c-accent)" }}
          >
            {error ?? "Invite not found or expired."}
          </div>
        ) : (
          <div className="card" style={{ borderRadius: 20, overflow: "hidden" }}>
            <Cover
              variant={invite.trip.cover}
              style={{ height: 160, position: "relative" }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,.5) 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  bottom: 14,
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--sf-display)",
                    fontSize: 24,
                    letterSpacing: "-0.02em",
                    textShadow: "0 1px 12px rgba(0,0,0,.25)",
                  }}
                >
                  {invite.trip.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.95, marginTop: 4 }}>
                  {invite.trip.location} · {invite.trip.memberCount}{" "}
                  {invite.trip.memberCount === 1 ? "traveler" : "travelers"}
                </div>
              </div>
            </Cover>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 13, color: "var(--c-ink-2)" }}>
                <b>{invite.inviter.name}</b> invited you to join this trip
                {invite.role === "viewer" ? " (view-only)" : ""}.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={onCancel}>
                  Maybe later
                </button>
                <button
                  className="btn-pri"
                  style={{ flex: 2 }}
                  onClick={accept}
                  disabled={joining}
                >
                  {state.status !== "authed"
                    ? "Sign in to join"
                    : joining
                    ? "Joining…"
                    : "Join trip"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
