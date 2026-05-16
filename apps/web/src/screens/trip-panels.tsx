import { useState } from "react";
import type { Trip } from "../data/types";
import { personById } from "../data/seed";
import { Avatar } from "../components/Avatar";
import { Icon } from "../components/Icon";
import { Button, IconButton } from "../components/ui";

interface PanelProps {
  trip: Trip;
}

export function MapPanel({ trip: _trip }: PanelProps) {
  const pins = [
    { id: "m1", x: 32, y: 28, n: 1, name: "Memmo Alfama" },
    { id: "m2", x: 60, y: 38, n: 2, name: "Mosteiro dos Jerónimos" },
    { id: "m3", x: 48, y: 60, n: 3, name: "A Travessa do Fado" },
    { id: "m4", x: 70, y: 70, n: 4, name: "Pena Palace · Sintra" },
    { id: "m5", x: 28, y: 78, n: 5, name: "Convento do Espinheiro" },
  ];
  return (
    <div className="vt-card" style={{ overflow: "hidden" }}>
      <div className="vt-map" style={{ height: 280, position: "relative" }}>
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <polyline
            points={pins.map((p) => `${p.x},${p.y}`).join(" ")}
            stroke="var(--vt-accent)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="1.4 1"
            opacity="0.7"
          />
        </svg>
        {pins.map((p) => (
          <div key={p.id} className="vt-pin" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <span>{p.n}</span>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            right: 8,
            bottom: 6,
            fontSize: 9,
            color: "var(--vt-label-quaternary)",
            background: "rgba(255,255,255,0.6)",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          © Mapbox © OpenStreetMap
        </div>
      </div>
      <div className="vt-list" style={{ borderRadius: 0, border: "none" }}>
        {pins.map((p, i) => (
          <div key={p.id} className="vt-list-row">
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                background: "var(--vt-accent)",
                color: "var(--vt-on-accent)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {p.n}
            </span>
            <div className="vt-list-row__content">
              <div className="vt-list-row__title">{p.name}</div>
              <div className="vt-list-row__subtitle">
                {["Stay", "Sight", "Food", "Sight", "Stay"][i]} · saved on Day {i + 1}
              </div>
            </div>
            <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpensesPanel({ trip }: PanelProps) {
  const total = trip.expenses.reduce((a, e) => a + e.amount, 0);
  const perPerson = (total / Math.max(trip.members.length, 1)).toFixed(0);
  const pct = trip.budget.total > 0 ? Math.min(100, (total / trip.budget.total) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="vt-card" style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--vt-label-tertiary)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Spent so far
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.018em", marginTop: 4 }}>
          €{total.toLocaleString()}{" "}
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--vt-label-tertiary)" }}>
            of €{trip.budget.total.toLocaleString()}
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: "var(--vt-fill-tertiary)",
            borderRadius: 4,
            marginTop: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--vt-accent)" }} />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontSize: 12,
            color: "var(--vt-label-tertiary)",
          }}
        >
          <span>€{perPerson} per person</span>
          <span>{Math.round(pct)}% of budget</span>
        </div>
      </div>

      <div>
        <div className="vt-list-header">Settling up</div>
        <div className="vt-list">
          <div className="vt-list-row">
            <Avatar name="Theo Vance" size={32} />
            <div className="vt-list-row__content">
              <div className="vt-list-row__title">Theo owes you</div>
              <div className="vt-list-row__subtitle">3 expenses</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--vt-success)" }}>+€124</div>
          </div>
          <div className="vt-list-row">
            <Avatar name="Anya Reyes" size={32} />
            <div className="vt-list-row__content">
              <div className="vt-list-row__title">You owe Anya</div>
              <div className="vt-list-row__subtitle">1 expense</div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--vt-destructive)" }}>−€48</div>
          </div>
        </div>
      </div>

      <div>
        <div className="vt-list-header">All expenses</div>
        <div className="vt-list">
          {trip.expenses.map((e) => {
            const payer = personById(e.paidBy);
            return (
              <div className="vt-list-row" key={e.id}>
                <span
                  className="vt-row-icon"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--vt-accent-tint)",
                    color: "var(--vt-accent)",
                  }}
                >
                  <Icon name="dollar" size={18} />
                </span>
                <div className="vt-list-row__content">
                  <div className="vt-list-row__title">{e.label}</div>
                  <div className="vt-list-row__subtitle">
                    Paid by {payer.name.split(" ")[0]} ·{" "}
                    {new Date(e.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>€{e.amount}</div>
              </div>
            );
          })}
        </div>
      </div>
      <Button variant="secondary" block icon="plus">
        Add expense
      </Button>
    </div>
  );
}

interface PackingItemFlat {
  id: string;
  label: string;
  done: boolean;
  cat: "Clothes" | "Docs" | "Other";
}

export function PackingPanel({ trip }: PanelProps) {
  const [items, setItems] = useState<PackingItemFlat[]>(() =>
    trip.packing.flatMap((g) => g.items.map((it) => ({ ...it, cat: g.cat }))),
  );
  const groups: PackingItemFlat["cat"][] = ["Clothes", "Docs", "Other"];
  const toggle = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const done = items.filter((it) => it.done).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="vt-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {done} of {items.length} packed
          </div>
          <div style={{ fontSize: 12, color: "var(--vt-label-tertiary)", marginTop: 2 }}>
            You've got 12 days to go.
          </div>
        </div>
        <CircleProgress value={items.length ? done / items.length : 0} size={42} />
      </div>
      {groups.map((g) => {
        const its = items.filter((it) => it.cat === g);
        if (!its.length) return null;
        return (
          <div key={g}>
            <div className="vt-list-header">{g}</div>
            <div className="vt-list">
              {its.map((it) => (
                <label key={it.id} className="vt-list-row" style={{ cursor: "pointer" }}>
                  <Checkbox checked={it.done} onChange={() => toggle(it.id)} />
                  <div className="vt-list-row__content">
                    <div
                      className="vt-list-row__title"
                      style={{
                        textDecoration: it.done ? "line-through" : "none",
                        color: it.done ? "var(--vt-label-tertiary)" : "inherit",
                      }}
                    >
                      {it.label}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      })}
      <Button variant="secondary" block icon="plus">
        Add item
      </Button>
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
}

function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 22,
        height: 22,
        borderRadius: 7,
        border: 0,
        padding: 0,
        cursor: "pointer",
        background: checked ? "var(--vt-accent)" : "transparent",
        boxShadow: checked ? "none" : "inset 0 0 0 1.5px var(--vt-separator-opaque)",
        color: "var(--vt-on-accent)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 140ms, box-shadow 140ms",
      }}
    >
      {checked && <Icon name="check" size={14} strokeWidth={2.4} />}
    </button>
  );
}

interface CircleProgressProps {
  value: number;
  size?: number;
  stroke?: number;
}

function CircleProgress({ value, size = 36, stroke = 4 }: CircleProgressProps) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--vt-fill-tertiary)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--vt-accent)"
        strokeWidth={stroke}
        strokeDasharray={C}
        strokeDashoffset={C * (1 - value)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 240ms ease-out" }}
      />
    </svg>
  );
}

export function DocsPanel({ trip }: PanelProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="vt-list">
        {trip.docs.map((d) => {
          const o = personById(d.owner);
          return (
            <div className="vt-list-row" key={d.id}>
              <span
                className="vt-row-icon"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--vt-fill-tertiary)",
                  color: "var(--vt-label-secondary)",
                }}
              >
                <Icon name="doc" size={18} />
              </span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title">{d.label}</div>
                <div className="vt-list-row__subtitle">
                  {d.kind} · {d.size} · added by {o.name.split(" ")[0]}
                </div>
              </div>
              <IconButton name="download" />
            </div>
          );
        })}
      </div>
      <Button variant="secondary" block icon="plus">
        Attach a file
      </Button>
    </div>
  );
}
