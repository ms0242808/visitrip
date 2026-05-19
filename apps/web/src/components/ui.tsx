import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { Icon } from "./Icon";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "lg";
  block?: boolean;
  icon?: string;
  iconAfter?: string;
  loading?: boolean;
}

export function Button({
  children,
  variant = "secondary",
  size,
  block,
  icon,
  iconAfter,
  type = "button",
  disabled,
  loading,
  className = "",
  ...rest
}: ButtonProps) {
  const cls = [
    "vt-btn",
    `vt-btn--${variant}`,
    size ? `vt-btn--${size}` : "",
    block ? "vt-btn--block" : "",
    className,
  ].filter(Boolean).join(" ");
  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading ? (
        <span className="vt-spin" />
      ) : icon ? (
        <Icon name={icon} size={size === "sm" ? 16 : 18} />
      ) : null}
      {children}
      {iconAfter && <Icon name={iconAfter} size={size === "sm" ? 16 : 18} />}
    </button>
  );
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "name"> {
  name: string;
  size?: number;
  color?: string;
}

export function IconButton({ name, size = 36, color, style, className = "", ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      className={`vt-btn vt-btn--icon ${className}`}
      style={{ width: size, height: size, minHeight: size, color, ...style }}
      {...rest}
    >
      <Icon name={name} size={size === 32 ? 16 : 20} />
    </button>
  );
}

interface FieldProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}

export function Field({ label, hint, error, children }: FieldProps) {
  return (
    <div className="vt-field">
      {label && <label>{label}</label>}
      {children}
      {error ? (
        <div className="vt-help vt-help--error">{error}</div>
      ) : hint ? (
        <div className="vt-help">{hint}</div>
      ) : null}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="vt-input" {...props} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="vt-textarea" {...props} />;
}

interface SwitchProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  id?: string;
}

export function Switch({ checked, onChange, id }: SwitchProps) {
  return (
    <input
      type="checkbox"
      id={id}
      className="vt-switch"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange?: (next: T) => void;
  options: Array<T | { value: T; label: ReactNode }>;
}

export function Segmented<T extends string>({ value, onChange, options }: SegmentedProps<T>) {
  return (
    <div className="vt-seg" role="tablist">
      {options.map((o) => {
        const v = typeof o === "string" ? (o as T) : o.value;
        const l = typeof o === "string" ? o : o.label;
        return (
          <button key={v} role="tab" aria-selected={value === v} onClick={() => onChange?.(v)}>
            {l}
          </button>
        );
      })}
    </div>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "accent" | "success" | "warn" | "dest" | "";
  icon?: string;
  style?: CSSProperties;
}

export function Badge({ children, variant, icon, style }: BadgeProps) {
  return (
    <span className={`vt-badge ${variant ? "vt-badge--" + variant : ""}`} style={style}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

interface NavBarProps {
  title?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  scrolled?: boolean;
}

export function NavBar({ title, leading, trailing, scrolled }: NavBarProps) {
  return (
    <div className={`vt-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="vt-row" style={{ gap: 6 }}>
        {leading}
      </div>
      <div
        className="vt-navbar-title vt-truncate"
        style={{ flex: 1, textAlign: "center", padding: "0 8px" }}
      >
        {title}
      </div>
      <div className="vt-row" style={{ gap: 6, justifyContent: "flex-end" }}>
        {trailing}
      </div>
    </div>
  );
}

interface TabBarItem {
  id: string;
  icon: string;
  label: string;
  featured?: boolean;
}
interface TabBarProps {
  value: string;
  onChange?: (next: string) => void;
  items: TabBarItem[];
}

export function TabBar({ value, onChange, items }: TabBarProps) {
  return (
    <div className="vt-tabbar" role="tablist">
      {items.map((it) => {
        const selected = value === it.id;
        if (it.featured) {
          return (
            <button
              key={it.id}
              className="vt-tabbar__featured"
              aria-current={selected}
              aria-label={it.label}
              onClick={() => onChange?.(it.id)}
            >
              <span className="vt-tabbar__featured-chip">
                <Icon name={it.icon} size={20} strokeWidth={2.2} />
              </span>
              <span>{it.label}</span>
            </button>
          );
        }
        return (
          <button key={it.id} aria-current={selected} onClick={() => onChange?.(it.id)}>
            <Icon name={it.icon} size={24} filled={selected} strokeWidth={1.6} />
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

interface SheetProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  height?: string;
}

export function Sheet({ open, onClose, children, height = "auto" }: SheetProps) {
  if (!open) return null;
  return (
    <>
      <div className="vt-scrim" onClick={onClose} />
      <div className="vt-sheet" style={{ height }} onClick={(e) => e.stopPropagation()}>
        <div className="vt-sheet__grabber" />
        {children}
      </div>
    </>
  );
}

interface BannerProps {
  icon?: string;
  children: ReactNode;
  variant?: "warn" | "offline";
}

export function Banner({ icon, children, variant }: BannerProps) {
  return (
    <div className={`vt-banner ${variant ? "vt-banner--" + variant : ""}`}>
      {icon && <Icon name={icon} size={16} />}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}
