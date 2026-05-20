import { useMemo, useState } from "react";
import * as Y from "yjs";
import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { Checkbox, ScreenHeader } from "../components/ui";
import { useTripDoc, useYArray } from "../lib/yjs";
import { yPackingToChecklist, type MemberDirectory, type YPackingShape } from "../lib/adapters";

interface ChecklistProps {
  embed?: boolean;
  onBack?: () => void;
  directory: MemberDirectory;
}

function readMap(m: Y.Map<unknown>): YPackingShape | null {
  const id = m.get("id");
  const label = m.get("label");
  const category = m.get("category");
  if (typeof id !== "string" || typeof label !== "string" || typeof category !== "string") {
    return null;
  }
  return {
    id,
    label,
    category,
    done: Boolean(m.get("done")),
    position: typeof m.get("position") === "number" ? (m.get("position") as number) : 0,
  };
}

export function Checklist({ embed, onBack, directory }: ChecklistProps) {
  const { doc, packing } = useTripDoc();
  const rows = useYArray(packing);
  const meId = directory.me.id;

  const items = useMemo(() => {
    return rows.map((m) => readMap(m)).filter((x): x is YPackingShape => !!x);
  }, [rows]);

  const sections = useMemo(() => yPackingToChecklist(items), [items]);
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const [pendingAdd, setPendingAdd] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");

  const toggle = (id: string) => {
    doc.transact(() => {
      const idx = rows.findIndex((m) => m.get("id") === id);
      if (idx === -1) return;
      const m = rows[idx]!;
      m.set("done", !m.get("done"));
    });
  };

  const addItem = (category: string) => {
    if (!newLabel.trim()) {
      setPendingAdd(null);
      return;
    }
    doc.transact(() => {
      const m = new Y.Map<unknown>();
      m.set("id", `pk_${Math.random().toString(36).slice(2, 10)}`);
      m.set("category", category);
      m.set("label", newLabel.trim());
      m.set("done", false);
      m.set("position", rows.length);
      m.set("createdBy", meId);
      packing.push([m]);
    });
    setNewLabel("");
    setPendingAdd(null);
  };

  return (
    <div className="screen-enter">
      {!embed && (
        <ScreenHeader
          title="Checklist"
          onBack={onBack}
          subtitle="Packing & pre-trip — synced live"
        />
      )}

      <div style={{ padding: embed ? "0 20px 14px" : "4px 20px 14px" }}>
        <div className="card" style={{ padding: 16, borderRadius: 18 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12.5, color: "var(--c-ink-3)", fontWeight: 500 }}>
                Group progress
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  fontVariantNumeric: "tabular-nums",
                  marginTop: 2,
                }}
              >
                {done}
                <span style={{ color: "var(--c-ink-3)" }}>/{total}</span>
              </div>
            </div>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `conic-gradient(var(--c-accent) ${pct * 3.6}deg, var(--c-pressed) 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 4,
                  borderRadius: "50%",
                  background: "var(--c-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {pct}%
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: 10,
              height: 6,
              background: "var(--c-pressed)",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: "var(--c-accent)",
                transition: "width .3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {sections.length === 0 ? (
        <div style={{ padding: "0 20px 20px" }}>
          <div
            className="card"
            style={{
              padding: 16,
              borderRadius: 18,
              fontSize: 13,
              color: "var(--c-ink-3)",
              display: "grid",
              gap: 10,
            }}
          >
            <div>Nothing on the list yet.</div>
            <input
              className="input"
              autoFocus
              placeholder="Add first item — e.g. Passports"
              value={pendingAdd === "_first" ? newLabel : ""}
              onFocus={() => setPendingAdd("_first")}
              onChange={(e) => {
                setPendingAdd("_first");
                setNewLabel(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addItem("Documents");
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div style={{ padding: "0 20px 20px", display: "grid", gap: 14 }}>
          {sections.map((sec) => (
            <div key={sec.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "0 4px 6px",
                }}
              >
                <div className="sec-title">{sec.section}</div>
                <span style={{ fontSize: 11.5, color: "var(--c-ink-3)" }}>
                  {sec.items.filter((i) => i.done).length}/{sec.items.length}
                </span>
              </div>
              <div className="card" style={{ borderRadius: 16, overflow: "hidden" }}>
                {sec.items.map((it, i) => {
                  const u = it.assigned ? directory.resolve(it.assigned) : null;
                  return (
                    <button
                      key={it.id}
                      onClick={() => toggle(it.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "13px 14px",
                        borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                      }}
                    >
                      <Checkbox checked={it.done} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 15,
                            letterSpacing: -0.1,
                            color: it.done ? "var(--c-ink-3)" : "var(--c-ink)",
                            textDecoration: it.done ? "line-through" : "none",
                            textDecorationColor: "var(--c-ink-4)",
                          }}
                        >
                          {it.text}
                        </div>
                      </div>
                      {u && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            fontSize: 11,
                            color: "var(--c-ink-3)",
                          }}
                        >
                          <Avatar user={u} size={18} />
                          <span>{u.name.split(" ")[0]}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
                {pendingAdd === sec.id ? (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderTop: "0.5px solid var(--c-hair)",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <input
                      className="input"
                      autoFocus
                      placeholder="Add item"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addItem(sec.section);
                        if (e.key === "Escape") setPendingAdd(null);
                      }}
                      onBlur={() => {
                        if (newLabel.trim()) addItem(sec.section);
                        else setPendingAdd(null);
                      }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setPendingAdd(sec.id);
                      setNewLabel("");
                    }}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderTop: "0.5px solid var(--c-hair)",
                      color: "var(--c-ink-3)",
                      fontSize: 14,
                    }}
                  >
                    <Icon name="plus" size={16} /> Add item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
