import { useState } from "react";
import type { TripDetail } from "@visitrip/shared";
import { Icon } from "../components/Icon";
import { Button, IconButton } from "../components/ui";

interface PanelProps {
  trip: TripDetail;
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "24px 16px",
        textAlign: "center",
        fontSize: 14,
        color: "var(--vt-label-tertiary)",
      }}
    >
      {message}
    </div>
  );
}

export function MapPanel({ trip }: PanelProps) {
  const allItems = trip.days.flatMap((d) => d.items);
  if (allItems.length === 0) {
    return <EmptyPanel message="No places saved yet. Add stops to a day and they'll appear here." />;
  }
  return (
    <div className="vt-card" style={{ overflow: "hidden" }}>
      <div className="vt-map" style={{ height: 280, position: "relative" }}>
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
        {allItems.slice(0, 8).map((it, i) => (
          <div key={it.id} className="vt-list-row">
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
              {i + 1}
            </span>
            <div className="vt-list-row__content">
              <div className="vt-list-row__title">{it.title}</div>
              <div className="vt-list-row__subtitle">{it.sub || it.type}</div>
            </div>
            <Icon name="chevron" size={16} style={{ color: "var(--vt-label-quaternary)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExpensesPanel({ trip }: PanelProps) {
  const total = trip.expenses.reduce((a, e) => a + e.amountCents, 0);
  const budgetTotal = trip.budgetTotalCents;
  const perPerson = trip.members.length > 0 ? Math.round(total / trip.members.length) : 0;
  const pct = budgetTotal > 0 ? Math.min(100, (total / budgetTotal) * 100) : 0;
  const fmt = (cents: number) =>
    new Intl.NumberFormat("en", { style: "currency", currency: trip.currency }).format(cents / 100);
  const memberById = new Map(trip.members.map((m) => [m.id, m]));

  if (trip.expenses.length === 0 && budgetTotal === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <EmptyPanel message="No expenses yet. Track who paid for what." />
        <Button variant="secondary" block icon="plus">
          Add expense
        </Button>
      </div>
    );
  }

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
          {fmt(total)}
          {budgetTotal > 0 && (
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--vt-label-tertiary)" }}>
              {" "}
              of {fmt(budgetTotal)}
            </span>
          )}
        </div>
        {budgetTotal > 0 && (
          <>
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
              <span>{fmt(perPerson)} per person</span>
              <span>{Math.round(pct)}% of budget</span>
            </div>
          </>
        )}
      </div>

      {trip.expenses.length > 0 && (
        <div>
          <div className="vt-list-header">All expenses</div>
          <div className="vt-list">
            {trip.expenses.map((e) => {
              const payer = memberById.get(e.paidById);
              return (
                <div className="vt-list-row" key={e.id}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "var(--vt-accent-tint)",
                      color: "var(--vt-accent)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon name="dollar" size={18} />
                  </span>
                  <div className="vt-list-row__content">
                    <div className="vt-list-row__title">{e.label}</div>
                    <div className="vt-list-row__subtitle">
                      Paid by {payer?.name.split(" ")[0] ?? "—"} ·{" "}
                      {new Date(e.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{fmt(e.amountCents)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Button variant="secondary" block icon="plus">
        Add expense
      </Button>
    </div>
  );
}

export function PackingPanel({ trip }: PanelProps) {
  const [items, setItems] = useState(() => trip.packing.map((p) => ({ ...p })));
  const groups = Array.from(new Set(items.map((it) => it.category)));
  const toggle = (id: string) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const done = items.filter((it) => it.done).length;

  if (items.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <EmptyPanel message="Nothing on the packing list yet." />
        <Button variant="secondary" block icon="plus">
          Add item
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="vt-card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>
            {done} of {items.length} packed
          </div>
        </div>
        <CircleProgress value={items.length ? done / items.length : 0} size={42} />
      </div>
      {groups.map((g) => {
        const its = items.filter((it) => it.category === g);
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
  const memberById = new Map(trip.members.map((m) => [m.id, m]));
  if (trip.docs.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <EmptyPanel message="No documents attached yet." />
        <Button variant="secondary" block icon="plus">
          Attach a file
        </Button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="vt-list">
        {trip.docs.map((d) => {
          const o = memberById.get(d.ownerId);
          return (
            <div className="vt-list-row" key={d.id}>
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--vt-fill-tertiary)",
                  color: "var(--vt-label-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="doc" size={18} />
              </span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title">{d.label}</div>
                <div className="vt-list-row__subtitle">
                  {d.kind} · {d.size} · added by {o?.name.split(" ")[0] ?? "—"}
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
