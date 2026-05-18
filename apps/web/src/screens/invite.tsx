import { useEffect, useState } from "react";
import type { InviteRole, TripDetail } from "@visitrip/shared";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Badge, Button, IconButton, Sheet } from "../components/ui";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";

interface InviteSheetProps {
  trip: TripDetail;
  onClose: () => void;
}

export function InviteSheet({ trip, onClose }: InviteSheetProps) {
  const { state } = useAuth();
  const meId = state.user?.id;
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<InviteRole>("editor");
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .createInvite(trip.id, { role })
      .then((res) => {
        if (cancelled) return;
        setToken(res.token);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to create invite");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [trip.id, role]);

  const url = token ? `${window.location.origin}/invite/${token}` : "";

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore — older browsers
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0 6px",
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.013em" }}>
              Invite to {trip.title}
            </div>
            <div style={{ fontSize: 13, color: "var(--vt-label-tertiary)" }}>
              Anyone with the link can join
            </div>
          </div>
          <IconButton name="close" onClick={onClose} size={32} />
        </div>

        <div
          className="vt-card"
          style={{
            marginTop: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: 13,
              fontFamily: "var(--vt-font-mono)",
              color: "var(--vt-label-secondary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {loading ? "Creating link…" : error ? "Failed to create link" : url}
          </span>
          <Button
            size="sm"
            variant={copied ? "secondary" : "primary"}
            icon={copied ? "check" : "copy"}
            disabled={!url}
            onClick={() => void copy()}
          >
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="vt-list-header">Link permissions</div>
          <div className="vt-list">
            {(
              [
                { v: "editor", t: "Can edit", s: "Add plans, expenses, packing." },
                { v: "viewer", t: "Can view", s: "See everything, read-only." },
              ] as Array<{ v: InviteRole; t: string; s: string }>
            ).map((o) => (
              <div
                key={o.v}
                className="vt-list-row"
                onClick={() => setRole(o.v)}
                style={{ cursor: "pointer" }}
              >
                <div className="vt-list-row__content">
                  <div className="vt-list-row__title">{o.t}</div>
                  <div className="vt-list-row__subtitle">{o.s}</div>
                </div>
                {role === o.v ? (
                  <Icon name="check" size={18} style={{ color: "var(--vt-accent)" }} />
                ) : (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      boxShadow: "inset 0 0 0 1.5px var(--vt-separator-opaque)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="vt-list-header">People · {trip.members.length}</div>
          <div className="vt-list">
            {trip.members.map((m) => (
              <div key={m.id} className="vt-list-row">
                <Avatar name={m.name} size={36} />
                <div className="vt-list-row__content">
                  <div className="vt-list-row__title">
                    {m.name}
                    {m.id === meId ? " (you)" : ""}
                  </div>
                  <div className="vt-list-row__subtitle">{m.role}</div>
                </div>
                <Badge variant={m.role === "owner" ? "accent" : ""}>{m.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
}
