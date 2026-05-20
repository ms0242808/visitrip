import type { TripDetail } from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { ScreenHeader } from "../components/ui";
import { adaptDoc, type MemberDirectory } from "../lib/adapters";
import type { DocumentItem } from "../lib/data";

const DOC_KIND: Record<string, { bg: string; fg: string; icon: IconName }> = {
  flight: { bg: "#FFE8D6", fg: "#C2542E", icon: "plane" },
  hotel: { bg: "#E7E1FF", fg: "#5345BC", icon: "bed" },
  transit: { bg: "#E6F0DF", fg: "#3F6B2D", icon: "tram" },
  policy: { bg: "#E0EBFF", fg: "#3046A8", icon: "doc" },
  id: { bg: "#FBE0E7", fg: "#A8345C", icon: "doc" },
};

const ORDER: DocumentItem["type"][] = ["Flight", "Hotel", "Transit", "Policy", "IDs"];

interface DocumentsProps {
  detail: TripDetail;
  directory: MemberDirectory;
  onBack?: () => void;
}

export function Documents({ detail, directory, onBack }: DocumentsProps) {
  const items = detail.docs.map((d) => adaptDoc(d));
  const grouped = items.reduce<Record<string, DocumentItem[]>>((acc, d) => {
    (acc[d.type] = acc[d.type] ?? []).push(d);
    return acc;
  }, {});
  const total = items.length;

  return (
    <div className="screen-enter">
      <ScreenHeader
        title="Documents"
        onBack={onBack}
        subtitle={`Everything for ${detail.title}, in one place`}
        right={
          <button
            className="btn-ghost"
            style={{
              padding: "6px 10px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              opacity: 0.6,
            }}
            title="Document upload isn't wired up yet"
          >
            <Icon name="plus" size={16} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Upload</span>
          </button>
        }
      />

      <div style={{ padding: "0 20px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 14px",
            borderRadius: 14,
            background: "var(--c-surface)",
            border: "0.5px solid var(--c-hair)",
            color: "var(--c-ink-3)",
          }}
        >
          <Icon name="search" size={18} />
          <span style={{ fontSize: 14 }}>Search {total} document{total === 1 ? "" : "s"}</span>
        </div>
      </div>

      {total === 0 ? (
        <div style={{ padding: "0 20px 20px" }}>
          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 18,
              color: "var(--c-ink-3)",
              fontSize: 13,
            }}
          >
            No documents yet. File uploads aren't wired up — coming after object storage lands.
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 20px 20px", display: "grid", gap: 14 }}>
          {ORDER.filter((o) => grouped[o]).map((type) => (
            <div key={type}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "0 4px 6px",
                }}
              >
                <div className="sec-title">{type}</div>
                <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
                  {grouped[type]!.length}
                </span>
              </div>
              <div className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
                {grouped[type]!.map((d, i) => {
                  const k = DOC_KIND[d.kind] ?? DOC_KIND.policy!;
                  const u = directory.resolve(d.who);
                  return (
                    <div
                      key={d.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "40px 1fr auto",
                        gap: 12,
                        padding: "12px 14px",
                        alignItems: "center",
                        borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: k.bg,
                          color: k.fg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name={k.icon} size={18} />
                      </div>
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
                          {d.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: "var(--c-ink-3)",
                            marginTop: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span>{d.meta}</span>
                          {u.name && (
                            <>
                              <span>·</span>
                              <Avatar user={u} size={14} /> <span>{u.name.split(" ")[0]}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <span style={{ color: "var(--c-ink-3)" }}>
                        <Icon name="download" size={18} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
