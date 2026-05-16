import { useEffect, useState } from "react";
import type { Day, DayItem as DayItemT, Trip } from "../data/types";
import { Icon } from "../components/Icon";
import { Badge, Button, IconButton, NavBar } from "../components/ui";

interface DayScreenProps {
  trip: Trip;
  day: Day;
  onBack: () => void;
  onOpenPlace: (item: DayItemT) => void;
  onAdd: () => void;
}

export function DayScreen({ trip, day, onBack, onOpenPlace, onAdd }: DayScreenProps) {
  const [items, setItems] = useState<DayItemT[]>(day.items);
  const [scrolled, setScrolled] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  useEffect(() => {
    setItems(day.items);
  }, [day.id, day.items]);

  const drop = () => {
    if (dragIdx != null && overIdx != null && dragIdx !== overIdx) {
      const next = [...items];
      const [m] = next.splice(dragIdx, 1);
      if (m) next.splice(overIdx, 0, m);
      setItems(next);
    }
    setDragIdx(null);
    setOverIdx(null);
  };

  const dayIdx = trip.days.findIndex((x) => x.id === day.id);
  const d = new Date(day.date);
  const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const MON = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const heading = day.label.split(" · ")[1] ?? day.label;

  return (
    <div className="vt-screen vt-screen-grouped">
      <NavBar
        title={scrolled ? heading : ""}
        scrolled={scrolled}
        leading={<IconButton name="chevronL" onClick={onBack} />}
        trailing={<IconButton name="plus" onClick={onAdd} />}
      />
      <div className="vt-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 36)}>
        <div style={{ padding: "0 20px 4px" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--vt-accent)",
            }}
          >
            Day {dayIdx + 1} of {trip.days.length} · {trip.title}
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 4 }}>{heading}</div>
          <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", marginTop: 4 }}>
            {DOW[d.getDay()]}, {MON[d.getMonth()]} {d.getDate()}
          </div>
        </div>

        <div style={{ padding: "20px 16px 100px" }}>
          {items.length === 0 ? (
            <EmptyDay onAdd={onAdd} />
          ) : (
            <>
              {items.map((it, i) => (
                <DayItem
                  key={it.id}
                  item={it}
                  last={i === items.length - 1}
                  dragging={dragIdx === i}
                  over={overIdx === i && dragIdx !== i}
                  onClick={() => onOpenPlace(it)}
                  onDragStart={() => setDragIdx(i)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOverIdx(i);
                  }}
                  onDrop={drop}
                  onDragEnd={() => {
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                />
              ))}
              <button
                onClick={onAdd}
                style={{
                  marginLeft: 38,
                  marginTop: 4,
                  padding: "12px 14px",
                  width: "calc(100% - 38px)",
                  border: "1.5px dashed var(--vt-separator-opaque)",
                  borderRadius: "var(--vt-r-md)",
                  background: "transparent",
                  color: "var(--vt-label-tertiary)",
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon name="plus" size={16} /> Add a stop, meal, or note
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyDay({ onAdd }: { onAdd: () => void }) {
  return (
    <div
      style={{
        padding: "48px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "var(--vt-accent-tint)",
          color: "var(--vt-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="calendar" size={28} />
      </div>
      <div style={{ fontSize: 17, fontWeight: 600 }}>Wide open</div>
      <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", maxWidth: 240, lineHeight: 1.45 }}>
        Add your first plan, or leave it free. Some of the best days are unplanned.
      </div>
      <Button variant="primary" icon="plus" onClick={onAdd} style={{ marginTop: 8 }}>
        Add a plan
      </Button>
    </div>
  );
}

interface DayItemProps {
  item: DayItemT;
  last: boolean;
  dragging: boolean;
  over: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

function DayItem({ item, last, dragging, over, onClick, onDragStart, onDragOver, onDrop, onDragEnd }: DayItemProps) {
  const tagVariant: Record<string, "accent" | "success" | "warn"> = {
    Reservation: "accent",
    Tickets: "success",
    Booked: "success",
    "Walk-in": "warn",
  };
  const variant = item.tag ? tagVariant[item.tag] : undefined;
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "stretch",
        opacity: dragging ? 0.4 : 1,
        transition: "opacity 120ms",
        position: "relative",
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        style={{
          width: 38,
          position: "relative",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--vt-label-tertiary)",
            paddingTop: 9,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {item.time}
        </div>
        <div
          style={{
            marginTop: 8,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: item.anchor ? "var(--vt-accent)" : "var(--vt-bg-elev)",
            boxShadow: "inset 0 0 0 2px var(--vt-accent)",
          }}
        />
        {!last && (
          <div
            style={{
              flex: 1,
              width: 2,
              background: "var(--vt-separator-opaque)",
              marginTop: 2,
              borderRadius: 1,
            }}
          />
        )}
      </div>

      <div
        className="vt-card"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        style={{
          flex: 1,
          marginBottom: 12,
          padding: "12px 12px 12px 14px",
          cursor: "pointer",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          boxShadow: over ? "0 0 0 2px var(--vt-accent), var(--vt-shadow-2)" : undefined,
        }}
      >
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            flexShrink: 0,
            background: "var(--vt-fill-tertiary)",
            color: "var(--vt-label-secondary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={item.icon} size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "-0.003em",
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </div>
          <div style={{ fontSize: 13, color: "var(--vt-label-tertiary)", marginTop: 2 }}>{item.sub}</div>
          {item.tag && (
            <div style={{ marginTop: 8 }}>
              <Badge variant={variant} icon="check">
                {item.tag}
              </Badge>
            </div>
          )}
        </div>
        <Icon name="drag" size={16} style={{ color: "var(--vt-label-quaternary)", marginTop: 8, flexShrink: 0 }} />
      </div>
    </div>
  );
}
