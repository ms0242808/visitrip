import { useState } from "react";
import type { User } from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { hueFor, initialsFor } from "../lib/adapters";
import { useAuth } from "../lib/auth";

interface YouScreenProps {
  user: User;
}

export function YouScreen({ user }: YouScreenProps) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const me = {
    id: user.id,
    name: user.name || user.email,
    initials: initialsFor(user.name || user.email),
    hue: hueFor(user.id),
    online: true,
  };
  const doSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="screen-enter" style={{ paddingBottom: 110 }}>
      <div
        style={{
          padding: "8px 20px 4px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span />
        <button className="btn-ghost" style={{ padding: "8px 10px", borderRadius: 999 }}>
          <Icon name="settings" size={20} />
        </button>
      </div>

      <div style={{ padding: "4px 20px 18px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Avatar user={me} size={84} showOnline />
          <div>
            <div
              style={{
                fontFamily: "var(--sf-display)",
                fontSize: 32,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {me.name}
            </div>
            <div style={{ fontSize: 13, color: "var(--c-ink-3)", marginTop: 6 }}>{user.email}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", display: "grid", gap: 16 }}>
        <YouGroup
          title="Account"
          rows={[
            { icon: "user_plus", label: "Invite friends", sub: "Share any trip's link", acc: "var(--c-link)" },
            { icon: "bell", label: "Notifications", sub: "On", acc: "var(--c-ink)" },
            { icon: "wifi", label: "Offline downloads", sub: "Sync on open", acc: "var(--c-ink)" },
          ]}
        />
        <YouGroup
          title="Preferences"
          rows={[
            { icon: "settings", label: "Appearance", sub: "Light", acc: "var(--c-ink)" },
            { icon: "cash", label: "Default currency", sub: "EUR · €", acc: "var(--c-ink)" },
            { icon: "calendar", label: "Week starts on", sub: "Monday", acc: "var(--c-ink)" },
          ]}
        />
        <YouGroup
          title="Help"
          rows={[
            { icon: "sparkle", label: "What's new", sub: "Live cursors · sub-tabs · new design", acc: "var(--c-accent)" },
            { icon: "doc", label: "Help & support", sub: null, acc: "var(--c-ink)" },
            { icon: "heart", label: "Rate Trip", sub: null, acc: "var(--c-accent)" },
          ]}
        />

        <button
          onClick={doSignOut}
          disabled={busy}
          className="btn-ghost"
          style={{ width: "100%", padding: "12px", color: "var(--c-accent)", opacity: busy ? 0.6 : 1 }}
        >
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}

interface YouRow {
  icon: IconName;
  label: string;
  sub: string | null;
  acc: string;
}

function YouGroup({ title, rows }: { title: string; rows: YouRow[] }) {
  return (
    <div>
      <div className="sec-title" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <div className="card" style={{ borderRadius: 16, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <button
            key={i}
            style={{
              width: "100%",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
            }}
          >
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "var(--c-pressed)",
                color: r.acc,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={r.icon} size={17} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</div>
              {r.sub && (
                <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 1 }}>{r.sub}</div>
              )}
            </div>
            <Icon name="chev_r" size={14} style={{ color: "var(--c-ink-4)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
