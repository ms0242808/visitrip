import type { DayItem } from "@visitrip/shared";
import { Icon } from "../components/Icon";
import { Button, IconButton, Sheet } from "../components/ui";

interface PlaceSheetProps {
  item: DayItem;
  onClose: () => void;
}

export function PlaceSheet({ item, onClose }: PlaceSheetProps) {
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
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.018em", lineHeight: 1.2 }}>{item.title}</div>
        <div style={{ fontSize: 14, color: "var(--vt-label-tertiary)", marginTop: 4 }}>{item.sub}</div>

        <div style={{ marginTop: 14, height: 160, borderRadius: 14, overflow: "hidden" }}>
          <div className="vt-map" style={{ width: "100%", height: "100%", position: "relative" }}>
            <div className="vt-pin" style={{ left: "50%", top: "55%" }}>
              <span>•</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Button variant="primary" icon="map" style={{ flex: 1 }}>
            Directions
          </Button>
          <Button variant="secondary" icon="link">
            Open link
          </Button>
          <Button variant="secondary" icon="share" />
        </div>

        <div style={{ marginTop: 22 }}>
          <div className="vt-list-header">Details</div>
          <div className="vt-list">
            <div className="vt-list-row">
              <span className="vt-row-icon">
                <Icon name="clock" size={18} />
              </span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title">Hours today</div>
                <div className="vt-list-row__subtitle">9:30 – 18:00 · Last entry 17:00</div>
              </div>
            </div>
            <div className="vt-list-row">
              <span className="vt-row-icon">
                <Icon name="dollar" size={18} />
              </span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title">€12 per person</div>
                <div className="vt-list-row__subtitle">Free for under 12s</div>
              </div>
            </div>
            <div className="vt-list-row">
              <span className="vt-row-icon">
                <Icon name="globe" size={18} />
              </span>
              <div className="vt-list-row__content">
                <div className="vt-list-row__title">jeronimosmonastery.gov.pt</div>
                <div className="vt-list-row__subtitle">Official site</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Sheet>
  );
}
