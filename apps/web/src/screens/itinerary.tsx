import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { kindBg, kindFg } from "../components/ui";
import { AddItineraryModal } from "./modals";
import { ITINERARY, memberById, type ItineraryDay, type ItineraryItem } from "../lib/data";

interface ItineraryProps {
  embed?: boolean;
}

export function Itinerary({ embed }: ItineraryProps) {
  const [days, setDays] = useState<ItineraryDay[]>(ITINERARY);
  const [activeDay, setActiveDay] = useState(1);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const day = days[activeDay - 1]!;

  const handleDragStart = (itemIdx: number) => () => setDragging(itemIdx);
  const handleDragOver = (itemIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIdx(itemIdx);
  };
  const handleDrop = (itemIdx: number) => () => {
    if (dragging === null || dragging === itemIdx) {
      setDragging(null);
      setDragOverIdx(null);
      return;
    }
    setDays((prev) => {
      const next = [...prev];
      const d = { ...next[activeDay - 1]! };
      const items = [...d.items];
      const [moved] = items.splice(dragging, 1);
      items.splice(itemIdx, 0, moved!);
      d.items = items;
      next[activeDay - 1] = d;
      return next;
    });
    setDragging(null);
    setDragOverIdx(null);
  };

  const onAdd = (item: Omit<ItineraryItem, "id">) => {
    setDays((prev) => {
      const next = [...prev];
      const d = { ...next[activeDay - 1]! };
      d.items = [...d.items, { ...item, id: "i" + Math.random().toString(36).slice(2, 6) }];
      next[activeDay - 1] = d;
      return next;
    });
    setShowAdd(false);
  };

  return (
    <div className="screen-enter">
      <div
        style={{
          padding: embed ? "0 16px 14px" : "6px 16px 14px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {days.map((d) => {
          const on = d.day === activeDay;
          return (
            <button
              key={d.day}
              onClick={() => setActiveDay(d.day)}
              style={{
                flexShrink: 0,
                padding: "10px 14px",
                borderRadius: 14,
                background: on ? "var(--c-ink)" : "var(--c-surface)",
                color: on ? "var(--c-bg)" : "var(--c-ink)",
                border: on ? 0 : "0.5px solid var(--c-hair)",
                textAlign: "left",
                minWidth: 96,
              }}
            >
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: 0.06,
                  opacity: 0.7,
                  textTransform: "uppercase",
                }}
              >
                Day {d.day}
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  marginTop: 2,
                  letterSpacing: -0.1,
                  lineHeight: 1.1,
                }}
              >
                {d.date.split(",")[0]}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{d.label}</div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: "4px 20px 16px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 38,
            top: 14,
            bottom: 30,
            width: 0.5,
            background: "var(--c-hair)",
          }}
        />
        <div style={{ display: "grid", gap: 4 }}>
          {day.items.map((it, i) => {
            const u = memberById(it.who);
            const isDraggingThis = dragging === i;
            const isDropTarget = dragOverIdx === i && dragging !== null && dragging !== i;
            return (
              <div
                key={it.id}
                draggable
                onDragStart={handleDragStart(i)}
                onDragOver={handleDragOver(i)}
                onDrop={handleDrop(i)}
                onDragEnd={() => {
                  setDragging(null);
                  setDragOverIdx(null);
                }}
                className={isDraggingThis ? "dragging" : ""}
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr",
                  gap: 8,
                  padding: "8px 0",
                  position: "relative",
                  borderRadius: 12,
                  background: isDropTarget
                    ? "color-mix(in oklab, var(--c-accent), transparent 92%)"
                    : "transparent",
                  transition: "background .15s ease",
                }}
              >
                <div
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--c-ink-2)",
                    padding: "6px 0",
                    textAlign: "right",
                    paddingRight: 4,
                  }}
                >
                  {it.time}
                </div>

                <div
                  className="card"
                  style={{
                    padding: "10px 12px 12px",
                    borderRadius: 14,
                    display: "grid",
                    gridTemplateColumns: "36px 1fr auto",
                    gap: 10,
                    alignItems: "center",
                    marginLeft: -4,
                    background: "var(--c-surface)",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: kindBg(it.kind),
                      color: kindFg(it.kind),
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon name={it.icon as IconName} size={18} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        letterSpacing: -0.1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {it.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--c-ink-3)",
                        marginTop: 2,
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <span>{it.loc}</span>
                      <span>·</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        added by <Avatar user={u} size={14} /> {u.name.split(" ")[0]}
                      </span>
                      {it.votes && (
                        <>
                          <span>·</span>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 3,
                              color: "var(--c-accent)",
                              fontWeight: 600,
                            }}
                          >
                            <Icon name="heart" size={11} /> {it.votes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="drag-handle">
                    <Icon name="drag" size={18} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={() => setShowAdd(true)}
          style={{
            marginLeft: 60,
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px dashed var(--c-ink-4)",
            color: "var(--c-ink-2)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          <Icon name="plus" size={16} /> Add to day {activeDay}
        </button>
      </div>

      {dragging !== null && (
        <div
          style={{
            position: "absolute",
            left: 20,
            right: 20,
            bottom: 90,
            background: "var(--c-ink)",
            color: "var(--c-bg)",
            padding: "10px 14px",
            borderRadius: 14,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            boxShadow: "0 12px 30px -8px rgba(0,0,0,.35)",
          }}
        >
          <Icon name="drag" size={16} /> Drop to reorder · everyone sees the change
        </div>
      )}

      <AddItineraryModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={onAdd} day={activeDay} />
    </div>
  );
}
