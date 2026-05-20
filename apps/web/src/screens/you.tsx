import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { MEMBERS, TRIPS, memberById } from "../lib/data";

export function YouScreen() {
  const me = memberById("u1");
  const planningCount = TRIPS.filter((t) => t.status !== "past").length;
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
              You
            </div>
            <div style={{ fontSize: 13, color: "var(--c-ink-3)", marginTop: 6 }}>you@trip.app</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 20px 16px" }}>
        <div
          className="card"
          style={{ padding: 14, borderRadius: 16, display: "flex", justifyContent: "space-around" }}
        >
          <YouStat label="Trips" value={planningCount} />
          <YouSep />
          <YouStat label="Countries" value="7" />
          <YouSep />
          <YouStat label="Friends" value={MEMBERS.length - 1} />
        </div>
      </div>

      <div style={{ padding: "0 20px 20px", display: "grid", gap: 16 }}>
        <YouGroup
          title="Account"
          rows={[
            { icon: "user_plus", label: "Invite friends", sub: "3 pending", acc: "var(--c-link)" },
            { icon: "bell", label: "Notifications", sub: "On", acc: "var(--c-ink)" },
            { icon: "wifi", label: "Offline downloads", sub: "2 trips · 84 MB", acc: "var(--c-ink)" },
          ]}
        />
        <YouGroup
          title="Preferences"
          rows={[
            { icon: "settings", label: "Appearance", sub: "Light · Coral accent", acc: "var(--c-ink)" },
            { icon: "cash", label: "Default currency", sub: "EUR · €", acc: "var(--c-ink)" },
            { icon: "calendar", label: "Week starts on", sub: "Monday", acc: "var(--c-ink)" },
          ]}
        />
        <YouGroup
          title="Help"
          rows={[
            { icon: "sparkle", label: "What's new", sub: "v2.4 · Live cursors", acc: "var(--c-accent)" },
            { icon: "doc", label: "Help & support", sub: null, acc: "var(--c-ink)" },
            { icon: "heart", label: "Rate Trip", sub: null, acc: "var(--c-accent)" },
          ]}
        />
      </div>
    </div>
  );
}

function YouStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--c-ink-3)",
          marginTop: 2,
          fontWeight: 600,
          letterSpacing: 0.06,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function YouSep() {
  return <div style={{ width: 0.5, background: "var(--c-hair)", alignSelf: "stretch" }} />;
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
