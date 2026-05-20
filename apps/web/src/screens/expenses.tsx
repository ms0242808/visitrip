import { useState } from "react";
import type { CreateExpenseInput, Expense, TripDetail } from "@visitrip/shared";
import { Icon, type IconName } from "../components/Icon";
import { Avatar } from "../components/Avatar";
import { ScreenHeader, kindBg, kindFg } from "../components/ui";
import { AddExpenseModal } from "./modals";
import { adaptExpense, currencySymbolFor, type MemberDirectory } from "../lib/adapters";
import { api } from "../lib/api";

const CAT_ICON: Record<string, IconName> = {
  stay: "bed",
  food: "fork",
  sight: "star",
  transit: "tram",
  show: "music",
  flight: "plane",
};
export const catIcon = (c: string): IconName => CAT_ICON[c] ?? "cash";

interface ExpensesProps {
  detail: TripDetail;
  directory: MemberDirectory;
  refresh: () => Promise<void>;
  onBack?: () => void;
}

export function Expenses({ detail, directory, refresh, onBack }: ExpensesProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const currency = currencySymbolFor(detail.currency);
  const meId = directory.me.id;
  const memberIds = detail.members.map((m) => m.id);

  const items = detail.expenses.map((e) => adaptExpense(e, memberIds, currency));
  const total = items.reduce((s, e) => s + e.amount, 0);
  const youPaid = items.filter((e) => e.paidBy === meId).reduce((s, e) => s + e.amount, 0);

  const balances: Record<string, number> = {};
  memberIds.forEach((id) => (balances[id] = 0));
  items.forEach((e) => {
    const share = e.amount / Math.max(1, e.split.length);
    e.split.forEach((id) => {
      balances[id] = (balances[id] ?? 0) - share;
    });
    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amount;
  });
  const yourBalance = balances[meId] ?? 0;

  const settlements: { from: string; to: string; amount: number }[] = [];
  Object.entries(balances).forEach(([id, bal]) => {
    if (id === meId || Math.abs(bal) < 0.5) return;
    if (bal > 0 && yourBalance < 0) {
      settlements.push({ from: meId, to: id, amount: Math.min(-yourBalance, bal) });
    } else if (bal < 0 && yourBalance > 0) {
      settlements.push({ from: id, to: meId, amount: Math.min(-bal, yourBalance) });
    }
  });

  const onAdd = async (exp: CreateExpenseInput) => {
    await api.createExpense(detail.id, exp);
    await refresh();
    setShowAdd(false);
  };

  const remove = async (e: Expense) => {
    setDeleting(e.id);
    try {
      await api.deleteExpense(detail.id, e.id);
      await refresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="screen-enter">
      <ScreenHeader
        title="Expenses"
        onBack={onBack}
        subtitle={`${detail.title} · ${detail.members.length} ${
          detail.members.length === 1 ? "traveler" : "travelers"
        }`}
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
              {yourBalance >= 0 ? "+" : "−"}
              {currency}
              {Math.abs(yourBalance).toFixed(2)}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--c-ink-2)", marginTop: 6 }}>
            {items.length === 0
              ? `No expenses yet. Add the first one to start tracking who owes who.`
              : yourBalance >= 0
              ? `Others owe you ${currency}${yourBalance.toFixed(2)} across the group.`
              : `You owe ${currency}${(-yourBalance).toFixed(2)} across the group.`}
          </div>

          {settlements.length > 0 && (
            <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
              {settlements.map((s, i) => {
                const me = s.from === meId;
                const other = directory.resolve(me ? s.to : s.from);
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
                      {currency}
                      {s.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <MiniStat
            label="Trip total"
            value={`${currency}${total.toFixed(2)}`}
            sub={`${items.length} expense${items.length === 1 ? "" : "s"}`}
          />
          <MiniStat
            label="You paid"
            value={`${currency}${youPaid.toFixed(2)}`}
            sub={`${items.filter((e) => e.paidBy === meId).length} entries`}
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
        {items.length === 0 ? (
          <div
            className="card"
            style={{ padding: 16, borderRadius: 18, color: "var(--c-ink-3)", fontSize: 13 }}
          >
            Nothing logged yet.
          </div>
        ) : (
          <div className="card" style={{ borderRadius: 18, overflow: "hidden" }}>
            {detail.expenses.map((raw, i) => {
              const e = adaptExpense(raw, memberIds, currency);
              const payer = directory.resolve(raw.paidById);
              const share = e.amount / Math.max(1, e.split.length);
              const yourShare = e.split.includes(meId) ? share : 0;
              return (
                <div
                  key={raw.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr auto auto",
                    gap: 12,
                    padding: "12px 14px",
                    alignItems: "center",
                    borderTop: i === 0 ? "0" : "0.5px solid var(--c-hair)",
                    opacity: deleting === raw.id ? 0.5 : 1,
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
                      <span>{payer.id === meId ? "You" : payer.name} paid</span>
                      <span>·</span>
                      <span>{e.date}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {currency}
                      {e.amount.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--c-ink-3)", marginTop: 2 }}>
                      your {currency}
                      {yourShare.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(raw)}
                    style={{ padding: 6, color: "var(--c-ink-3)" }}
                    disabled={deleting === raw.id}
                  >
                    <Icon name="close" size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddExpenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={onAdd}
        members={memberIds}
        currency={currency}
        meId={meId}
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
