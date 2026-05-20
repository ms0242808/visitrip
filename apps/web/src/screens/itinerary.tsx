import { useEffect, useMemo, useState } from "react";
import type { CreateDayItemInput, DayItem, TripDetail } from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { kindBg, kindFg } from "../components/ui";
import { AddItineraryModal } from "./modals";
import { adaptDay, defaultIconFor, type MemberDirectory } from "../lib/adapters";
import { api } from "../lib/api";

interface ItineraryProps {
  embed?: boolean;
  detail: TripDetail;
  directory: MemberDirectory;
  meId: string;
  refresh: () => Promise<void>;
}

export function Itinerary({ embed, detail, directory, meId, refresh }: ItineraryProps) {
  const days = useMemo(() => [...detail.days].sort((a, b) => a.position - b.position), [detail.days]);
  const [activeDayId, setActiveDayId] = useState<string | null>(days[0]?.id ?? null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [pendingDayCreate, setPendingDayCreate] = useState(false);

  useEffect(() => {
    if (!activeDayId && days.length > 0) setActiveDayId(days[0]!.id);
    if (activeDayId && !days.find((d) => d.id === activeDayId)) {
      setActiveDayId(days[0]?.id ?? null);
    }
  }, [days, activeDayId]);

  const activeDay = days.find((d) => d.id === activeDayId) ?? null;

  if (days.length === 0) {
    return (
      <div className="screen-enter" style={{ padding: "8px 20px 24px" }}>
        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 18,
            background: "var(--c-tint)",
            border: 0,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontFamily: "var(--sf-display)",
              fontSize: 22,
              letterSpacing: "-0.02em",
              marginBottom: 6,
            }}
          >
            No days yet
          </div>
          <div style={{ fontSize: 13, color: "var(--c-ink-2)", marginBottom: 14 }}>
            Add the first day to start dropping in places.
          </div>
          <button
            className="btn-pri"
            disabled={pendingDayCreate}
            onClick={async () => {
              setPendingDayCreate(true);
              try {
                await api.createDay(detail.id, {
                  date: detail.startDate,
                  label: "Day 1",
                });
                await refresh();
              } finally {
                setPendingDayCreate(false);
              }
            }}
          >
            <Icon name="plus" size={16} /> {pendingDayCreate ? "Adding…" : "Add day 1"}
          </button>
        </div>
      </div>
    );
  }

  if (!activeDay) return null;

  const handleDragStart = (idx: number) => () => setDragging(idx);
  const handleDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIdx(idx);
  };
  const handleDrop = (idx: number) => async () => {
    if (dragging === null || dragging === idx) {
      setDragging(null);
      setDragOverIdx(null);
      return;
    }
    const items = [...activeDay.items];
    const [moved] = items.splice(dragging, 1);
    items.splice(idx, 0, moved!);
    setDragging(null);
    setDragOverIdx(null);
    try {
      await api.reorderDayItems(
        detail.id,
        activeDay.id,
        items.map((it) => it.id),
      );
      await refresh();
    } catch {
      await refresh();
    }
  };

  const onAdd = async (input: CreateDayItemInput) => {
    try {
      await api.createDayItem(detail.id, activeDay.id, input);
      await refresh();
      setShowAdd(false);
    } catch (e) {
      throw e;
    }
  };

  const adapted = adaptDay(activeDay, meId);

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
        {days.map((d, i) => {
          const on = d.id === activeDayId;
          const dateLabel = adaptDay(d, meId);
          return (
            <button
              key={d.id}
              onClick={() => setActiveDayId(d.id)}
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
                Day {i + 1}
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
                {dateLabel.date.split(",")[0]}
              </div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{d.label}</div>
            </button>
          );
        })}
        <AddDayButton detail={detail} refresh={refresh} />
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
          {adapted.items.length === 0 && (
            <div
              style={{
                marginLeft: 60,
                marginRight: 0,
                padding: "10px 0",
                fontSize: 13,
                color: "var(--c-ink-3)",
              }}
            >
              Nothing planned yet. Tap below to add the first stop.
            </div>
          )}
          {adapted.items.map((it, i) => {
            const u = directory.resolve(it.who);
            const isDraggingThis = dragging === i;
            const isDropTarget = dragOverIdx === i && dragging !== null && dragging !== i;
            const rawItem = activeDay.items[i];
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
                <ItemCard
                  item={it}
                  rawItem={rawItem ?? null}
                  user={u}
                  tripId={detail.id}
                  dayId={activeDay.id}
                  refresh={refresh}
                />
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
          <Icon name="plus" size={16} /> Add to {activeDay.label}
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
          <Icon name="drag" size={16} /> Drop to reorder · changes sync to everyone
        </div>
      )}

      <AddItineraryModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={onAdd}
        dayLabel={activeDay.label}
      />
    </div>
  );
}

function ItemCard({
  item,
  rawItem,
  user,
  tripId,
  dayId,
  refresh,
}: {
  item: ReturnType<typeof adaptDay>["items"][number];
  rawItem: DayItem | null;
  user: ReturnType<MemberDirectory["resolve"]>;
  tripId: string;
  dayId: string;
  refresh: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);
  const remove = async () => {
    if (!rawItem || deleting) return;
    setDeleting(true);
    try {
      await api.deleteDayItem(tripId, dayId, rawItem.id);
      await refresh();
    } catch {
      setDeleting(false);
    }
  };
  const iconName = (item.icon || defaultIconFor(item.kind)) as IconName;
  return (
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
        opacity: deleting ? 0.5 : 1,
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: kindBg(item.kind),
          color: kindFg(item.kind),
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name={iconName} size={18} />
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
          {item.title}
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
          {item.loc && (
            <>
              <span>{item.loc}</span>
              <span>·</span>
            </>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Avatar user={user} size={14} /> {user.name.split(" ")[0]}
          </span>
        </div>
      </div>
      <button
        onClick={remove}
        title="Remove"
        style={{ padding: 6, color: "var(--c-ink-3)" }}
        disabled={deleting}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

function AddDayButton({
  detail,
  refresh,
}: {
  detail: TripDetail;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try {
          const last = [...detail.days].sort((a, b) => a.position - b.position).slice(-1)[0];
          const nextDate = nextIso(last?.date ?? detail.startDate);
          await api.createDay(detail.id, {
            date: nextDate,
            label: `Day ${detail.days.length + 1}`,
          });
          await refresh();
        } finally {
          setBusy(false);
        }
      }}
      style={{
        flexShrink: 0,
        padding: "10px 14px",
        borderRadius: 14,
        background: "transparent",
        color: "var(--c-ink-3)",
        border: "1px dashed var(--c-ink-4)",
        textAlign: "left",
        minWidth: 96,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Icon name="plus" size={16} /> {busy ? "…" : "New day"}
    </button>
  );
}

function nextIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  dt.setDate(dt.getDate() + 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}
