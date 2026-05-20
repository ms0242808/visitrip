import { useState } from "react";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { ScreenHeader, kindBg, kindFg } from "../components/ui";
import { AddExpenseModal } from "./modals";
import { EXPENSES, memberById, type Expense } from "../lib/data";

const CAT_ICON: Record<string, IconName> = {
  stay: "bed",
  food: "fork",
  sight: "star",
  transit: "tram",
  show: "music",
  flight: "plane",
};
export const catIcon = (c: string): IconName => CAT_ICON[c] ?? "cash";

export function Expenses({ onBack }: { onBack?: () => void }) {
  const [items, setItems] = useState<Expense[]>(EXPENSES);
  const [showAdd, setShowAdd] = useState(false);

  const tripMembers = ["u1", "u2", "u3", "u5"];
  const total = items.reduce((s, e) => s + e.amount, 0);
  const youPaid = items.filter((e) => e.paidBy === "u1").reduce((s, e) => s + e.amount, 0);

  const balances: Record<string, number> = {};
  tripMembers.forEach((id) => (balances[id] = 0));
  items.forEach((e) => {
    const share = e.amount / e.split.length;
    e.split.forEach((id) => {
      balances[id] = (balances[id] ?? 0) - share;
    });
    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amount;
  });
  const yourBalance = balances["u1"] ?? 0;

  const settlements: { from: string; to: string; amount: number }[] = [];
  Object.entries(balances).forEach(([id, bal]) => {
    if (id === "u1" || Math.abs(bal) < 0.5) return;
    if (bal > 0 && yourBalance < 0) {
      settlements.push({ from: "u1", to: id, amount: Math.min(-yourBalance, bal) });
    } else if (bal < 0 && yourBalance > 0) {
      settlements.push({ from: id, to: "u1", amount: Math.min(-bal, yourBalance) });
    }
  });

  const onAdd = (exp: Omit<Expense, "id">) => {
    setItems((prev) => [{ ...exp, id: "e" + Math.random().toString(36).slice(2, 6) }, ...prev]);
    setShowAdd(false);
  };

  return (
    <div className="screen-enter">
      <ScreenHeader
        title="Expenses"
        onBack={onBack}
        subtitle="Lisbon long weekend · 4 travelers"
        right={
          <button className="btn-ghost" style={{ padding: "6px 10px" }}>
            <Icon name="settings" size={18} />
          </button>
        }
      />

      <div style={{ padding: "0 20px 14px" }}>
        <div
          className="card"
          style={{ padding: 16, borderRadius: 20, background: "var(--c-tint)", border: 0 }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 0.08,
              textTransform: "uppercase",
              color: "var(--c-ink-2)",
            }}
          >
            Your balance
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
            <span
              style={{
                fontFamily: "var(--sf-display)",
                fontSize: 44,
                lineHeight: 1,
                fontWeight: 400,
                letterSpacing: "-0.03em",
                color: yourBalance >= 0 ? "var(--c-ink)" : "var(--c-accent)",
              }}
            >
              {yourBalance >= 0 ? "+" : "−"}€{Math.abs(yourBalance).toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--c-ink-2)", marginTop: 6 }}>
            {yourBalance >= 0
              ? `Others owe you €${yourBalance.toFixed(2)} across the group.`
              : `You owe €${(-yourBalance).toFixed(2)} across the group.`}
          </div>

          {settlements.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
              {settlements.map((s, i) => {
                const me = s.from === "u1";
                const other = memberById(me ? s.to : s.from);
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: "var(--c-surface)",
                      borderRadius: 12,
                    }}
                  >
                    <Avatar user={other} size={24} />
                    <div style={{ flex: 1, fontSize: 13 }}>
                      {me ? (
                        <>
                          You pay <b>{other.name}</b>
                        </>
                      ) : (
                        <>
                          <b>{other.name}</b> pays you
                        </>
                      )}
                    </div>
                    <span
                      style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums", fontSize: 14 }}
                    >
                      €{s.amount.toFixed(2)}
                    </span>
                    <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 12 }}>
                      Settle
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <MiniStat label="Trip total" value={`€${total.toFixed(2)}`} sub={`${items.length} expenses`} />
          <MiniStat
            label="You paid"
            value={`€${youPaid.toFixed(2)}`}
            sub={`${items.filter((e) => e.paidBy === "u1").length} entries`}
          />
        </div>
      </div>

      <div style={{ padding: "0 20px 20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <div className="sec-title">Recent</div>
          <button
            onClick={() => setShowAdd(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              color: "var(--c-accent)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Icon name="plus" size={14} /> Add expense
          </button>
        </div>
        <div className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
          {items.map((e, i) => {
            const payer = memberById(e.paidBy);
            const share = e.amount / e.split.length;
            const yourShare = e.split.includes("u1") ? share : 0;
            return (
              <div
                key={e.id}
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
                    background: kindBg(e.category),
                    color: kindFg(e.category),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name={catIcon(e.category)} size={18} />
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
                    {e.label}
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
                    <Avatar user={payer} size={14} />{" "}
                    <span>{payer.id === "u1" ? "You" : payer.name} paid</span>
                    <span>·</span>
                    <span>{e.date}</span>
                    <span>·</span>
                    <span>split {e.split.length}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    €{e.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 2 }}>
                    your €{yourShare.toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddExpenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={onAdd}
        members={tripMembers}
      />
    </div>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card" style={{ padding: 12, borderRadius: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.06,
          textTransform: "uppercase",
          color: "var(--c-ink-3)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 19,
          fontWeight: 600,
          fontVariantNumeric: "tabular-nums",
          marginTop: 2,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}
