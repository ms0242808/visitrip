import type { CSSProperties, ReactNode } from "react";
import type { CoverKind } from "@visitrip/shared";

interface CoverDef {
  bg: string;
  art: ReactNode;
}

const COVERS: Record<CoverKind, CoverDef> = {
  "cover-lisbon": {
    bg: "linear-gradient(165deg, oklch(72% 0.16 35), oklch(56% 0.18 25))",
    art: (
      <g>
        <rect width="320" height="160" fill="url(#lis-sky)" />
        <defs>
          <linearGradient id="lis-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(80% 0.13 55)" />
            <stop offset="1" stopColor="oklch(58% 0.18 25)" />
          </linearGradient>
        </defs>
        <circle cx="244" cy="60" r="22" fill="oklch(94% 0.13 90)" opacity="0.95" />
        <path d="M0 100 L60 88 L120 96 L180 86 L240 94 L320 84 L320 160 L0 160 Z" fill="oklch(46% 0.14 30)" opacity="0.55" />
        <g fill="oklch(40% 0.16 30)">
          <path d="M0 120 L40 108 L70 118 L100 106 L140 116 L170 104 L210 118 L250 108 L300 122 L320 116 L320 160 L0 160 Z" />
        </g>
        <g fill="oklch(96% 0.04 80)" opacity="0.7">
          <circle cx="44" cy="132" r="2" /><circle cx="60" cy="138" r="2" /><circle cx="76" cy="132" r="2" />
          <circle cx="120" cy="134" r="2" /><circle cx="136" cy="140" r="2" />
          <circle cx="208" cy="134" r="2" /><circle cx="224" cy="140" r="2" />
        </g>
        <path d="M0 144 L320 138" stroke="oklch(94% 0.05 80)" strokeWidth="0.6" opacity="0.6" />
      </g>
    ),
  },
  "cover-hokkaido": {
    bg: "linear-gradient(160deg, oklch(78% 0.05 230), oklch(40% 0.08 250))",
    art: (
      <g>
        <rect width="320" height="160" fill="url(#hok-sky)" />
        <defs>
          <linearGradient id="hok-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(80% 0.05 240)" />
            <stop offset="1" stopColor="oklch(48% 0.08 250)" />
          </linearGradient>
        </defs>
        <path d="M0 100 L60 60 L100 92 L160 50 L220 96 L260 70 L320 96 L320 160 L0 160 Z" fill="oklch(70% 0.04 240)" opacity="0.55" />
        <path d="M0 130 L40 110 L80 124 L130 100 L180 130 L230 108 L280 132 L320 122 L320 160 L0 160 Z" fill="oklch(55% 0.04 245)" />
        <path d="M150 56 l10 12 l-10 -4 l-10 4 z" fill="white" opacity="0.85" />
        <path d="M220 102 l8 10 l-8 -3 l-8 3 z" fill="white" opacity="0.85" />
        <ellipse cx="160" cy="160" rx="320" ry="40" fill="oklch(96% 0.01 240)" opacity="0.7" />
        <g fill="white" opacity="0.85">
          <circle cx="40" cy="40" r="1.6" /><circle cx="80" cy="22" r="1.2" /><circle cx="180" cy="32" r="1.4" />
          <circle cx="240" cy="46" r="1.2" /><circle cx="280" cy="22" r="1.4" />
          <circle cx="120" cy="60" r="1.6" /><circle cx="60" cy="80" r="1.2" />
        </g>
      </g>
    ),
  },
  "cover-cdmx": {
    bg: "linear-gradient(160deg, oklch(68% 0.12 145), oklch(40% 0.13 155))",
    art: (
      <g>
        <rect width="320" height="160" fill="url(#cd-sky)" />
        <defs>
          <linearGradient id="cd-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(72% 0.12 90)" />
            <stop offset="1" stopColor="oklch(50% 0.13 60)" />
          </linearGradient>
        </defs>
        <g stroke="oklch(28% 0.12 145)" strokeWidth="1.2" fill="none">
          <path d="M40 160 q-2 -40 -16 -60" /><path d="M40 110 q-14 -8 -22 -16" />
          <path d="M40 108 q14 -6 24 -10" /><path d="M40 124 q-18 -2 -28 4" />
          <path d="M40 122 q18 -4 28 -2" />
        </g>
        <g fill="oklch(82% 0.1 70)">
          <rect x="90" y="100" width="40" height="60" />
          <rect x="140" y="80" width="36" height="80" />
          <rect x="186" y="110" width="30" height="50" />
          <rect x="224" y="92" width="42" height="68" />
          <rect x="274" y="106" width="40" height="54" />
        </g>
        <g fill="oklch(58% 0.16 30)">
          <rect x="140" y="76" width="36" height="6" />
          <rect x="224" y="88" width="42" height="6" />
        </g>
        <circle cx="260" cy="40" r="20" fill="oklch(94% 0.13 80)" opacity="0.95" />
      </g>
    ),
  },
};

interface TripCoverProps {
  kind?: CoverKind;
  height?: number;
  rounded?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

export function TripCover({ kind = "cover-lisbon", height = 160, rounded = 14, children, style }: TripCoverProps) {
  const c = COVERS[kind] ?? COVERS["cover-lisbon"];
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: rounded,
        overflow: "hidden",
        background: c.bg,
        isolation: "isolate",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 320 160"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {c.art}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(120% 80% at 50% 100%, rgba(0,0,0,0.18), transparent 60%)",
          mixBlendMode: "multiply",
          pointerEvents: "none",
        }}
      />
      {children && (
        <div style={{ position: "absolute", inset: 0, padding: 16, color: "#fff" }}>{children}</div>
      )}
    </div>
  );
}
