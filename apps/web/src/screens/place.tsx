import type { DayItem } from "@visitrip/shared";
import { Badge, IconButton, Sheet } from "../components/ui";

interface PlaceSheetProps {
  item: DayItem;
  onClose: () => void;
}

export function PlaceSheet({ item, onClose }: PlaceSheetProps) {
  const tagVariant: Record<string, "accent" | "success" | "warn"> = {
    Reservation: "accent",
    Tickets: "success",
    Booked: "success",
    "Walk-in": "warn",
  };
  return (
    <Sheet open onClose={onClose}>
      <div style={{ padding: "0 16px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "4px 0 12px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--vt-label-tertiary)",
            }}
          >
            {item.type.toUpperCase()} · {item.time}
          </div>
          <IconButton name="close" onClick={onClose} size={32} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.018em", lineHeight: 1.2 }}>
          {item.title}
        </div>
        {item.sub && (
          <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", marginTop: 6, lineHeight: 1.5 }}>
            {item.sub}
          </div>
        )}
        {item.tag && (
          <div style={{ marginTop: 12 }}>
            <Badge variant={tagVariant[item.tag] ?? "accent"} icon="check">
              {item.tag}
            </Badge>
          </div>
        )}
        {!item.sub && !item.tag && (
          <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", marginTop: 12, lineHeight: 1.5 }}>
            No notes yet. Edit this plan from the day view to add details.
          </div>
        )}
      </div>
    </Sheet>
  );
}
