import { useState } from "react";
import { Icon } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { Checkbox, ScreenHeader } from "../components/ui";
import { CHECKLIST, memberById, type ChecklistSection } from "../lib/data";

interface ChecklistProps {
  embed?: boolean;
  onBack?: () => void;
}

export function Checklist({ embed, onBack }: ChecklistProps) {
  const [sections, setSections] = useState<ChecklistSection[]>(CHECKLIST);
  const total = sections.reduce((n, s) => n + s.items.length, 0);
  const done = sections.reduce((n, s) => n + s.items.filter((i) => i.done).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggle = (sid: string, iid: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id !== sid
          ? s
          : {
              ...s,
              items: s.items.map((it) => (it.id !== iid ? it : { ...it, done: !it.done })),
            },
      ),
    );
  };

  return (
    <div className="screen-enter">
      {!embed && (
        <ScreenHeader
          title="Checklist"
          onBack={onBack}
          subtitle="Packing & pre-trip — shared with everyone"
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
                const u = memberById(it.assigned);
                return (
                  <button
                    key={it.id}
                    onClick={() => toggle(sec.id, it.id)}
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
                  </button>
                );
              })}
              <button
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
