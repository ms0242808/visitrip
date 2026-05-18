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
  "cover-coast": {
    bg: "linear-gradient(165deg, oklch(74% 0.10 200), oklch(48% 0.13 230))",
    art: (
      <g>
        <rect width="320" height="160" fill="url(#co-sky)" />
        <defs>
          <linearGradient id="co-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(80% 0.10 200)" />
            <stop offset="1" stopColor="oklch(48% 0.15 230)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="44" r="18" fill="oklch(96% 0.08 90)" opacity="0.85" />
        <path d="M0 96 L60 92 L120 100 L180 90 L240 98 L320 92 L320 160 L0 160 Z" fill="oklch(38% 0.13 230)" opacity="0.5" />
        <path d="M0 116 L60 110 L120 122 L180 110 L240 122 L320 116 L320 160 L0 160 Z" fill="oklch(30% 0.13 235)" opacity="0.75" />
        <g stroke="oklch(96% 0.04 80)" strokeWidth="0.5" opacity="0.5">
          <path d="M0 130 L320 126" /><path d="M0 138 L320 134" /><path d="M0 146 L320 142" />
        </g>
      </g>
    ),
  },
  "cover-alps": {
    bg: "linear-gradient(160deg, oklch(82% 0.04 220), oklch(46% 0.06 245))",
    art: (
      <g>
        <rect width="320" height="160" fill="url(#al-sky)" />
        <defs>
          <linearGradient id="al-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(86% 0.04 230)" />
            <stop offset="1" stopColor="oklch(52% 0.08 250)" />
          </linearGradient>
        </defs>
        <path d="M0 110 L60 60 L100 100 L140 50 L180 92 L220 40 L260 90 L300 70 L320 96 L320 160 L0 160 Z" fill="oklch(58% 0.04 250)" opacity="0.7" />
        <path d="M140 50 L156 70 L130 64 z" fill="white" opacity="0.95" />
        <path d="M220 40 L236 62 L208 56 z" fill="white" opacity="0.95" />
        <path d="M60 60 L74 80 L48 74 z" fill="white" opacity="0.85" />
        <path d="M0 130 L60 116 L120 130 L180 118 L240 132 L320 122 L320 160 L0 160 Z" fill="oklch(70% 0.03 240)" />
        <g fill="white" opacity="0.85">
          <circle cx="200" cy="22" r="1.4" /><circle cx="250" cy="32" r="1.2" /><circle cx="290" cy="18" r="1.4" />
        </g>
      </g>
    ),
  },
  "cover-desert": {
    bg: "linear-gradient(160deg, oklch(78% 0.13 70), oklch(50% 0.14 35))",
    art: (
      <g>
        <rect width="320" height="160" fill="url(#de-sky)" />
        <defs>
          <linearGradient id="de-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(82% 0.13 70)" />
            <stop offset="1" stopColor="oklch(52% 0.16 35)" />
          </linearGradient>
        </defs>
        <circle cx="240" cy="58" r="22" fill="oklch(95% 0.14 80)" opacity="0.9" />
        <path d="M0 110 Q80 80 160 110 T320 110 L320 160 L0 160 Z" fill="oklch(56% 0.14 50)" opacity="0.75" />
        <path d="M0 128 Q80 108 160 128 T320 128 L320 160 L0 160 Z" fill="oklch(44% 0.14 40)" />
        <g fill="oklch(34% 0.13 35)" opacity="0.65">
          <path d="M50 142 q4 -22 18 -22 q14 0 18 22 z" />
          <path d="M250 144 q3 -16 14 -16 q11 0 14 16 z" />
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
