"use client";

import ThemeToggle from "./ThemeToggle";
import { PlaneIcon } from "./Icons";

interface Props {
  left?: React.ReactNode;
  right?: React.ReactNode;
  onLogoClick?: () => void;
}

export default function TopBar({ left, right, onLogoClick }: Props) {
  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {left}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2"
            aria-label="Visitrip home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-white">
              <PlaneIcon width={18} height={18} />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              Visi<span className="text-brand">trip</span>
            </span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {right}
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
