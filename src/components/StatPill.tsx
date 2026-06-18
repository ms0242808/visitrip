"use client";

import { useCountUp } from "@/lib/useCountUp";

interface Props {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  decimals?: number;
}

export default function StatPill({ icon, label, value, prefix = "", decimals = 0 }: Props) {
  const animated = useCountUp(value);
  const shown = animated.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface/70 px-4 py-3 backdrop-blur-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-lg font-bold tabular-nums">
          {prefix}
          {shown}
        </div>
        <div className="text-xs font-medium text-text-faint">{label}</div>
      </div>
    </div>
  );
}
