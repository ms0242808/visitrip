"use client";

interface Props {
  spent: number;
  budget: number;
  currency: string;
  size?: number;
}

/** A glanceable donut showing spend against budget. */
export default function BudgetRing({ spent, budget, currency, size = 132 }: Props) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const hasBudget = budget > 0;
  const ratio = hasBudget ? spent / budget : 0;
  const pct = Math.min(1, ratio);
  const over = hasBudget && spent > budget;
  const offset = c * (1 - pct);

  const fmt = (n: number) =>
    n >= 10000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n.toLocaleString();

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id="budgetGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth={stroke}
        />
        {/* progress */}
        {hasBudget && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={over ? "var(--c-lodging)" : "url(#budgetGrad)"}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-faint">
          Spent
        </span>
        <span className="font-display text-2xl font-extrabold leading-tight tabular-nums">
          {currency}
          {fmt(spent)}
        </span>
        <span className={`text-xs font-medium ${over ? "text-lodging" : "text-text-soft"}`}>
          {hasBudget ? (over ? `${currency}${fmt(spent - budget)} over` : `of ${currency}${fmt(budget)}`) : "no budget"}
        </span>
      </div>
    </div>
  );
}
