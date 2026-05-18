import { useMemo, useState } from "react";
import type { TripDetail } from "@visitrip/shared";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Badge, Button, IconButton, Sheet } from "../components/ui";
import { useAuth } from "../lib/auth";

type Permission = "edit" | "view" | "closed";

interface InviteSheetProps {
  trip: TripDetail;
  onClose: () => void;
}

export function InviteSheet({ trip, onClose }: InviteSheetProps) {
  const { state } = useAuth();
  const meId = state.user?.id;
  const [copied, setCopied] = useState(false);
  const [perm, setPerm] = useState<Permission>("edit");
  const url = useMemo(
    () => `visitrip.app/t/${trip.id}/join#${Math.random().toString(36).slice(2, 8)}`,
    [trip.id],
  );

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
            {url}
          </span>
          <Button
            size="sm"
            variant={copied ? "secondary" : "primary"}
            icon={copied ? "check" : "copy"}
            onClick={() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
          <Button variant="secondary" icon="mail" style={{ flex: 1 }}>
            Email invite
          </Button>
          <Button variant="secondary" icon="qr" style={{ flex: 1 }}>
            QR code
          </Button>
        </div>

        <div style={{ marginTop: 20 }}>
          <div className="vt-list-header">Link permissions</div>
          <div className="vt-list">
            {(
              [
                { v: "edit", t: "Can edit", s: "Add plans, expenses, packing." },
                { v: "view", t: "Can view", s: "See everything, read-only." },
                { v: "closed", t: "Link off", s: "Only existing members can access." },
              ] as Array<{ v: Permission; t: string; s: string }>
            ).map((o) => (
              <div
                key={o.v}
                className="vt-list-row"
                onClick={() => setPerm(o.v)}
                style={{ cursor: "pointer" }}
              >
                <div className="vt-list-row__content">
                  <div className="vt-list-row__title">{o.t}</div>
                  <div className="vt-list-row__subtitle">{o.s}</div>
                </div>
                {perm === o.v ? (
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
