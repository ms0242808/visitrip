import type { CSSProperties, ReactNode } from "react";

const ICON_PATHS: Record<string, ReactNode> = {
  trips: <g><path d="M3 7h18M3 7l2 12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l2-12"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></g>,
  map: <g><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/></g>,
  inbox: <g><path d="M3 12h5l1.5 3h5l1.5-3h5"/><path d="M5 6v14h14V6l-2-3H7L5 6Z"/></g>,
  user: <g><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></g>,
  plus: <path d="M12 5v14M5 12h14"/>,
  search: <g><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></g>,
  filter: <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/>,
  share: <g><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 11 7.6-4M8.2 13l7.6 4"/></g>,
  more: <g fill="currentColor" stroke="none"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></g>,
  chevron: <path d="m9 6 6 6-6 6"/>,
  chevronL: <path d="m15 6-6 6 6 6"/>,
  chevronD: <path d="m6 9 6 6 6-6"/>,
  close: <path d="M6 6 18 18M18 6 6 18"/>,
  check: <path d="m5 13 4 4L19 7"/>,
  edit: <g><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="m13 7 4 4"/></g>,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>,
  copy: <g><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></g>,
  link: <g><path d="M9 15a4 4 0 0 1 0-6l3-3a4 4 0 0 1 6 6l-1.5 1.5"/><path d="M15 9a4 4 0 0 1 0 6l-3 3a4 4 0 0 1-6-6l1.5-1.5"/></g>,
  drag: <g fill="currentColor" stroke="none"><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></g>,
  calendar: <g><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></g>,
  clock: <g><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>,
  pin: <g><path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></g>,
  bed: <g><path d="M3 18V8M21 18v-5a3 3 0 0 0-3-3H3"/><circle cx="7" cy="13" r="2"/></g>,
  fork: <path d="M7 3v8a3 3 0 0 0 3 3v7M17 3v18M17 11a4 4 0 0 0 0-8"/>,
  cup: <g><path d="M4 8h14v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M18 10h2a2 2 0 0 1 0 4h-2"/><path d="M9 3v2M13 3v2"/></g>,
  car: <g><path d="M5 16V11l2-5h10l2 5v5"/><rect x="3" y="15" width="18" height="5" rx="1.5"/><circle cx="7.5" cy="20" r="1.5"/><circle cx="16.5" cy="20" r="1.5"/></g>,
  plane: <path d="M3 13 21 5l-4 16-5-5-2 5-2-7-5-1Z"/>,
  dollar: <path d="M12 3v18M16 7a4 4 0 0 0-4-2c-2 0-4 1-4 3s2 3 4 3 4 1 4 3-2 3-4 3a4 4 0 0 1-4-2"/>,
  bag: <g><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></g>,
  doc: <g><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></g>,
  users: <g><circle cx="9" cy="9" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0"/><circle cx="17" cy="7" r="2.5"/><path d="M17 12c2.5 0 5 1.5 5 5"/></g>,
  wifi: <g><path d="M2 9a14 14 0 0 1 20 0"/><path d="M5 12.5a10 10 0 0 1 14 0"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/></g>,
  wifiOff: <g><path d="M2 9a14 14 0 0 1 7-3.7M16 6.3A14 14 0 0 1 22 9"/><path d="M5 12.5a10 10 0 0 1 4.6-2.5M14.4 10a10 10 0 0 1 4.6 2.5"/><path d="M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/><path d="m3 3 18 18"/></g>,
  cloud: <path d="M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11.7-1A4 4 0 0 0 7 18Z"/>,
  sync: <g><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 20v-4h4"/></g>,
  warn: <g><path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5M12 18.5v.1"/></g>,
  info: <g><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/></g>,
  bell: <g><path d="M5 17V10a7 7 0 0 1 14 0v7l2 2H3l2-2Z"/><path d="M10 21a2 2 0 0 0 4 0"/></g>,
  sun: <g><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></g>,
  moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z"/>,
  globe: <g><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></g>,
  logo: <g><path d="M4 16C7 9 12 5 20 4c-1 8-5 13-12 16-1.6.6-2.8.8-3.6 0-.7-.7-.7-1.9 0-4Z"/><circle cx="13" cy="11" r="1.5" fill="currentColor"/></g>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
  download: <path d="M12 3v13M6 11l6 6 6-6M4 21h16"/>,
  star: <path d="m12 3 2.8 6.2 6.7.6-5.1 4.5 1.6 6.7L12 17.6 5.9 21l1.6-6.7L2.4 9.8l6.7-.6L12 3Z"/>,
  lock: <g><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></g>,
  mail: <g><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></g>,
  eye: <g><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></g>,
  flag: <path d="M5 21V4l8 3 6-2v10l-6 2-8-3Z"/>,
  heart: <path d="M12 20s-8-5-8-11a4.5 4.5 0 0 1 8-3 4.5 4.5 0 0 1 8 3c0 6-8 11-8 11Z"/>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  qr: <g><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/></g>,
};

const ICON_FILLED: Record<string, ReactNode> = {
  trips: <g fill="currentColor" stroke="none"><path d="M3 6.5a1 1 0 0 1 1-1h4V5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v.5h4a1 1 0 0 1 .997 1.084l-1 12A2 2 0 0 1 18 20.5H6a2 2 0 0 1-2-1.916l-1-12A1 1 0 0 1 3 6.5Zm7-1.5v.5h4V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1Z"/></g>,
  map: <g fill="currentColor" stroke="none"><path d="M9.2 3.06 3.3 5.03A1 1 0 0 0 2.6 6v14a1 1 0 0 0 1.3.95l5.3-1.77 5.5 1.83a1 1 0 0 0 .6 0l5.9-1.96A1 1 0 0 0 22 18V4a1 1 0 0 0-1.3-.95L15.4 4.82 9.9 3a1 1 0 0 0-.7.06ZM10 5.4l4 1.34v12.06l-4-1.34V5.4Z"/></g>,
  inbox: <g fill="currentColor" stroke="none"><path d="M6 3a2 2 0 0 0-1.79 1.11l-2 4A2 2 0 0 0 2 9v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-.21-.89l-2-4A2 2 0 0 0 18 3H6Zm0 2h12l1.5 3H15l-.4 1.45A2 2 0 0 1 12.66 11h-1.32a2 2 0 0 1-1.94-1.55L9 8H4.5L6 5Z"/></g>,
  user: <g fill="currentColor" stroke="none"><circle cx="12" cy="7.5" r="4"/><path d="M4 21a8 8 0 0 1 16 0Z"/></g>,
};

export type IconName = keyof typeof ICON_PATHS;

interface IconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 20, strokeWidth = 1.6, filled, style, className }: IconProps) {
  const filledPath = filled ? ICON_FILLED[name] : null;
  const p = filledPath ?? ICON_PATHS[name];
  if (!p) return null;
  const isFilled = !!filledPath;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={isFilled ? 0 : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}
      className={className}
      aria-hidden="true"
    >
      {p}
    </svg>
  );
}
