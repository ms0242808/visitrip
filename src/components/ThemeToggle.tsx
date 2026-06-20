"use client";

import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("visitrip.theme") as Theme | null;
    const initial: Theme =
      stored ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (!theme) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("visitrip.theme", theme);
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="btn btn-outline h-10 w-10 !p-0 overflow-hidden"
    >
      <span
        key={isDark ? "moon" : "sun"}
        style={{ animation: "var(--animate-pop)" }}
        className="flex items-center justify-center"
      >
        {isDark ? <MoonIcon width={18} height={18} /> : <SunIcon width={18} height={18} />}
      </span>
    </button>
  );
}
