"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatedThemeToggler } from "../interactive/AnimatedThemeToggler";
import { cn } from "@/lib/utils";

/**
 * AdminThemeToggle — same animated View-Transition theme reveal as the
 * public dashboard (AnimatedThemeToggler), wired to the admin cockpit
 * class contract:
 *   dark  -> html.admin-cockpit.dark
 *   light -> html.admin-cockpit.admin-light (+ .dark removed)
 * Preference persists to localStorage "theme" — the same key the public
 * site (next-themes bootstrap in Layout.astro) reads, so both follow one
 * user choice.
 */
export function AdminThemeToggle({ className }: { className?: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const handleChange = useCallback((next: "light" | "dark") => {
    const root = document.documentElement;
    // AnimatedThemeToggler already toggled .dark synchronously; mirror it
    // with the admin-light class so the cockpit palette follows.
    root.classList.toggle("admin-light", next === "light");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setIsDark(next === "dark");
  }, []);

  if (!isMounted) {
    return (
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-lg border border-cockpit-line",
          className
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <AnimatedThemeToggler
      theme={isDark ? "dark" : "light"}
      onThemeChange={handleChange}
      variant="circle"
      duration={700}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg border border-cockpit-line text-cockpit-muted hover:bg-cockpit-hover hover:text-cockpit-text cursor-pointer transition-colors [&_svg]:size-4",
        className
      )}
    />
  );
}
