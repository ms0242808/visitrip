import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import {
  PresenceCursor,
  ScreenHeader,
  kindBg,
  kindFg,
  useDriftingCursors,
} from "../components/ui";
import { MEMBERS } from "../lib/data";

type PinKind = "stay" | "food" | "sight" | "show" | "transit";

interface MapPin {
  id: string;
  x: number;
  y: number;
  label: string;
  day: number;
  kind: PinKind;
  title: string;
}

const PINS: MapPin[] = [
  { id: "p_alfama", x: 0.52, y: 0.36, label: "Alfama", day: 1, kind: "stay", title: "Memmo Alfama" },
  { id: "p_chiado", x: 0.32, y: 0.46, label: "Chiado", day: 1, kind: "food", title: "Taberna" },
  { id: "p_belem", x: 0.16, y: 0.62, label: "Belém", day: 2, kind: "sight", title: "Jerónimos" },
  { id: "p_pasteis", x: 0.2, y: 0.7, label: "Pastéis", day: 2, kind: "food", title: "Pastéis de Belém" },
  { id: "p_maat", x: 0.12, y: 0.74, label: "MAAT", day: 2, kind: "sight", title: "MAAT museum" },
  { id: "p_fado", x: 0.56, y: 0.4, label: "Mesa de Frades", day: 2, kind: "show", title: "Fado venue" },
  { id: "p_sintra", x: 0.78, y: 0.16, label: "Sintra", day: 3, kind: "sight", title: "Quinta da Regaleira" },
  { id: "p_cascais", x: 0.84, y: 0.66, label: "Cascais", day: 4, kind: "transit", title: "Beach" },
];

const PIN_ICON: Record<PinKind, IconName> = {
  stay: "bed",
  food: "fork",
  sight: "star",
  show: "music",
  transit: "tram",
};

export function MapView({ onBack }: { onBack?: () => void }) {
  const [selected, setSelected] = useState("p_alfama");
  const cursors = useDriftingCursors(
    MEMBERS.filter((m) => m.online && m.id !== "u1"),
    ["map"],
  );
  const sel = PINS.find((p) => p.id === selected);

  return (
    <div className="screen-enter" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <ScreenHeader
        title="Map"
        onBack={onBack}
        right={
          <button className="btn-ghost" style={{ padding: "6px 10px" }}>
            <Icon name="settings" size={18} />
          </button>
        }
      />

      <div
        style={{
          flex: 1,
          position: "relative",
          margin: "4px 16px 90px",
          borderRadius: 22,
          overflow: "hidden",
          border: "0.5px solid var(--c-hair)",
          background: "linear-gradient(180deg, #EEE8DD 0%, #E4DDD0 100%)",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <linearGradient id="water" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#D8E3FF" />
              <stop offset="1" stopColor="#B6C5EF" />
            </linearGradient>
            <linearGradient id="land" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#F4ECDD" />
              <stop offset="1" stopColor="#E6DBC4" />
            </linearGradient>
            <linearGradient id="park" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#D7E4C9" />
              <stop offset="1" stopColor="#B7C9A7" />
            </linearGradient>
          </defs>
          <rect width="400" height="600" fill="url(#land)" />
          <path
            d="M0 480 Q 100 460 200 470 T 400 460 L 400 600 L 0 600 Z"
            fill="url(#water)"
          />
          <path
            d="M0 480 Q 100 460 200 470 T 400 460"
            stroke="#A0B6E2"
            strokeWidth="1"
            fill="none"
            opacity=".7"
          />
          <path
            d="M0 360 Q 60 350 80 380 Q 100 410 60 440 Q 30 470 0 460 Z"
            fill="url(#water)"
            opacity=".55"
          />
          <ellipse cx="320" cy="100" rx="60" ry="40" fill="url(#park)" opacity=".8" />
          <ellipse cx="80" cy="180" rx="40" ry="30" fill="url(#park)" opacity=".7" />
          <ellipse cx="220" cy="320" rx="46" ry="34" fill="url(#park)" opacity=".7" />

          <g stroke="#FFFFFF" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".9">
            <path d="M30 200 Q 200 250 380 220" />
            <path d="M40 300 L 380 320" />
            <path d="M180 30 L 220 580" />
            <path d="M50 100 Q 200 130 380 80" />
          </g>
          <g stroke="#E8D9B6" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M30 200 Q 200 250 380 220" />
            <path d="M40 300 L 380 320" />
            <path d="M180 30 L 220 580" />
            <path d="M50 100 Q 200 130 380 80" />
          </g>
          <g stroke="#D9CBA9" strokeWidth="0.8" opacity=".7">
            {Array.from({ length: 22 }).map((_, i) => (
              <line key={"h" + i} x1="0" x2="400" y1={i * 28} y2={i * 28 + 8} />
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={"v" + i} y1="0" y2="600" x1={i * 30 + 10} x2={i * 30 + 22} />
            ))}
          </g>

          <path
            d="M210 220 L 130 280 L 80 370 L 75 420 L 225 220 L 310 100"
            stroke="#1B1B1B"
            strokeOpacity=".35"
            strokeWidth="1.5"
            strokeDasharray="3 4"
            fill="none"
          />
        </svg>

        {PINS.map((p) => {
          const on = p.id === selected;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{
                position: "absolute",
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: "translate(-50%,-100%)",
                padding: 0,
                filter: on ? "drop-shadow(0 6px 12px rgba(0,0,0,.3))" : "none",
                transition: "transform .2s ease",
              }}
            >
              <Pin kind={p.kind} on={on} />
            </button>
          );
        })}

        {MEMBERS.filter((m) => m.online && m.id !== "u1")
          .slice(0, 2)
          .map((u) => {
            const p = cursors[u.id] ?? { x: 0.5, y: 0.5 };
            return <PresenceCursor key={u.id} user={u} x={p.x} y={p.y} />;
          })}

        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            display: "flex",
            gap: 6,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {["All days", "Day 1", "Day 2", "Day 3", "Day 4"].map((c, i) => (
            <span
              key={c}
              className="chip"
              style={{
                background: i === 0 ? "var(--c-ink)" : "rgba(255,255,255,.92)",
                color: i === 0 ? "var(--c-bg)" : "var(--c-ink)",
                backdropFilter: "blur(10px)",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              }}
            >
              {c}
            </span>
          ))}
        </div>

        {sel && (
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 12,
              background: "var(--c-surface)",
              borderRadius: 18,
              padding: "12px 14px",
              display: "flex",
              gap: 12,
              alignItems: "center",
              boxShadow: "0 12px 30px -8px rgba(0,0,0,.25)",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: kindBg(sel.kind),
                color: kindFg(sel.kind),
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={PIN_ICON[sel.kind]} size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.1 }}>{sel.title}</div>
              <div style={{ fontSize: 11.5, color: "var(--c-ink-3)", marginTop: 2 }}>
                {sel.label} · Day {sel.day}
              </div>
            </div>
            <button className="btn-ghost" style={{ padding: "8px 12px", fontSize: 13 }}>
              Directions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Pin({ kind, on }: { kind: PinKind; on: boolean }) {
  const c = kindFg(kind);
  const size = on ? 36 : 28;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "#fff",
          color: c,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: on ? `0 0 0 3px ${c}, 0 4px 10px rgba(0,0,0,.2)` : "0 2px 6px rgba(0,0,0,.18)",
          transition: "all .2s ease",
          border: "1.5px solid " + (on ? c : "rgba(0,0,0,.05)"),
        }}
      >
        <Icon name={PIN_ICON[kind]} size={on ? 18 : 14} />
      </div>
      <div style={{ width: 2, height: on ? 10 : 6, background: c, marginTop: -1, transition: "all .2s ease" }} />
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: c, marginTop: -1 }} />
    </div>
  );
}
