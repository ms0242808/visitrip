import type { CSSProperties } from "react";

export type IconName =
  | "home"
  | "map"
  | "list"
  | "check"
  | "cash"
  | "vote"
  | "doc"
  | "bell"
  | "plus"
  | "search"
  | "chev_r"
  | "chev_l"
  | "chev_d"
  | "close"
  | "plane"
  | "bed"
  | "fork"
  | "star"
  | "tram"
  | "music"
  | "pin"
  | "drag"
  | "clock"
  | "calendar"
  | "share"
  | "settings"
  | "heart"
  | "wifi"
  | "sparkle"
  | "download"
  | "user_plus";

interface IconProps {
  name: IconName;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 22, stroke = 1.6, style, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 22 22",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style,
    className,
  };
  switch (name) {
    case "home":
      return (
        <svg {...common}>
          <path d="M3 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H4a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "map":
      return (
        <svg {...common}>
          <path d="M3 5l5-2 6 2 5-2v14l-5 2-6-2-5 2zM8 3v14M14 5v14" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M4 5h14M4 11h14M4 17h14" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M4 11.5l4.5 4.5L19 6" />
        </svg>
      );
    case "cash":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="16" height="10" rx="2" />
          <circle cx="11" cy="11" r="2.5" />
          <path d="M6 11h.01M16 11h.01" />
        </svg>
      );
    case "vote":
      return (
        <svg {...common}>
          <path d="M5 12.5L9 17l9-12" />
          <path d="M5 7l5 5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M6 3h7l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
          <path d="M13 3v4h4" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M11 3a5 5 0 0 0-5 5v3l-2 3h14l-2-3V8a5 5 0 0 0-5-5zM9 18a2 2 0 0 0 4 0" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <path d="M11 4v14M4 11h14" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="10" cy="10" r="6" />
          <path d="M14.5 14.5L19 19" />
        </svg>
      );
    case "chev_r":
      return (
        <svg {...common}>
          <path d="M8 4l7 7-7 7" />
        </svg>
      );
    case "chev_l":
      return (
        <svg {...common}>
          <path d="M14 4l-7 7 7 7" />
        </svg>
      );
    case "chev_d":
      return (
        <svg {...common}>
          <path d="M4 8l7 7 7-7" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M5 5l12 12M17 5l-12 12" />
        </svg>
      );
    case "plane":
      return (
        <svg {...common}>
          <path d="M3 13l16-7-4 14-3.5-5.5L3 13z" />
        </svg>
      );
    case "bed":
      return (
        <svg {...common}>
          <path d="M3 9V6M19 17V11a2 2 0 0 0-2-2H3M3 17v-8M19 17H3" />
          <circle cx="7" cy="11.5" r="1.5" />
        </svg>
      );
    case "fork":
      return (
        <svg {...common}>
          <path d="M7 3v8a2 2 0 0 0 4 0V3M9 11v8M15 3c-1.5 0-2 1-2 3v4h2v8" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M11 3l2.5 5.2 5.5.8-4 4 1 5.5L11 16l-5 2.5 1-5.5-4-4 5.5-.8z" />
        </svg>
      );
    case "tram":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="12" height="13" rx="2" />
          <path d="M5 11h12M9 16l-2 3M13 16l2 3" />
          <circle cx="8.5" cy="13.5" r=".8" fill="currentColor" />
          <circle cx="13.5" cy="13.5" r=".8" fill="currentColor" />
        </svg>
      );
    case "music":
      return (
        <svg {...common}>
          <circle cx="6" cy="17" r="2" />
          <circle cx="16" cy="15" r="2" />
          <path d="M8 17V5l10-2v12" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M11 21s-6-6.5-6-11a6 6 0 1 1 12 0c0 4.5-6 11-6 11z" />
          <circle cx="11" cy="10" r="2.2" />
        </svg>
      );
    case "drag":
      return (
        <svg {...common}>
          <circle cx="8" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="6" r="1" fill="currentColor" stroke="none" />
          <circle cx="8" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="11" r="1" fill="currentColor" stroke="none" />
          <circle cx="8" cy="16" r="1" fill="currentColor" stroke="none" />
          <circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M11 7v4l3 2" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="16" height="14" rx="2" />
          <path d="M3 9h16M8 3v4M14 3v4" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <path d="M11 3v11M7 7l4-4 4 4M5 13v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="2.5" />
          <path d="M11 3v2M11 17v2M19 11h-2M5 11H3M16.5 5.5l-1.4 1.4M6.9 15.1l-1.4 1.4M16.5 16.5l-1.4-1.4M6.9 6.9L5.5 5.5" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M11 18s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 18 8c0 5.5-7 10-7 10z" />
        </svg>
      );
    case "wifi":
      return (
        <svg {...common}>
          <path d="M2.5 8.5a13 13 0 0 1 17 0M5.5 11.5a9 9 0 0 1 11 0M8.5 14.5a5 5 0 0 1 5 0" />
          <circle cx="11" cy="18" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...common}>
          <path d="M11 3v6M11 13v6M3 11h6M13 11h6" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M11 3v12M6 11l5 5 5-5M4 19h14" />
        </svg>
      );
    case "user_plus":
      return (
        <svg {...common}>
          <circle cx="9" cy="7" r="3.5" />
          <path d="M3 19c1-3.5 3-5 6-5s5 1.5 6 5" />
          <path d="M17 5v6M14 8h6" />
        </svg>
      );
    default:
      return null;
  }
}
