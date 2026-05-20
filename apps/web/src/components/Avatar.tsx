import type { CSSProperties } from "react";
import { memberById, type Member } from "../lib/data";

interface AvatarProps {
  user: Member | undefined;
  size?: number;
  showOnline?: boolean;
  style?: CSSProperties;
}

export function Avatar({ user, size = 28, showOnline = false, style = {} }: AvatarProps) {
  if (!user) return null;
  const bg = `oklch(82% 0.11 ${user.hue})`;
  const fg = `oklch(28% 0.06 ${user.hue})`;
  return (
    <span
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: bg,
        color: fg,
        ...style,
      }}
    >
      {user.initials}
      {showOnline && user.online && <span className="ring-online" />}
    </span>
  );
}

interface AvatarStackProps {
  ids: string[];
  max?: number;
  size?: number;
}

export function AvatarStack({ ids, max = 4, size = 28 }: AvatarStackProps) {
  const list = ids.map(memberById);
  const shown = list.slice(0, max);
  const extra = list.length - shown.length;
  return (
    <span className="avatar-stack">
      {shown.map((u) => (
        <Avatar key={u.id} user={u} size={size} />
      ))}
      {extra > 0 && (
        <span
          className="avatar"
          style={{
            width: size,
            height: size,
            fontSize: Math.round(size * 0.36),
            background: "var(--c-tint)",
            color: "var(--c-ink-2)",
          }}
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
