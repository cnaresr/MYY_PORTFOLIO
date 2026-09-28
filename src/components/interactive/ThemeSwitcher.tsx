"use client";

import { useCallback, useEffect, useState } from "react";
import { MonitorIcon, MoonStarIcon, SunIcon, Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { ThemeProvider, useTheme } from "next-themes";
import type { JSX } from "react";
import React from "react";

import { cn } from "@/lib/utils";
import {
  AnimatedThemeToggler,
  type TransitionVariant,
} from "./AnimatedThemeToggler";

function ThemeOption({
  icon,
  value,
  isActive,
  onClick,
}: {
  icon: JSX.Element;
  value: string;
  isActive?: boolean;
  onClick: (value: string) => void;
}) {
  return (
    <button
      className={cn(
        "relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-all [&_svg]:size-4",
        isActive
          ? "text-zinc-950 dark:text-zinc-50"
          : "text-zinc-400 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-50"
      )}
      role="radio"
      aria-checked={isActive}
      aria-label={`Switch to ${value} theme`}
      onClick={() => onClick(value)}
    >
      {icon}

      {isActive && (
        <motion.div
          layoutId="theme-option"
          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
          className="absolute inset-0 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-2xs"
        />
      )}
    </button>
  );
}

const THEME_OPTIONS = [
  {
    icon: <MonitorIcon />,
    value: "system",
  },
  {
    icon: <SunIcon />,
    value: "light",
  },
  {
    icon: <MoonStarIcon />,
    value: "dark",
  },
];

function ThemeSwitcherContent() {
  const { theme, setTheme } = useTheme();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="flex h-8 w-24" />;
  }

  return (
    <motion.div
      key={String(isMounted)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center overflow-hidden rounded-full bg-white ring-1 ring-zinc-200 ring-inset dark:bg-zinc-950 dark:ring-zinc-700 p-0.5"
      role="radiogroup"
    >
      {THEME_OPTIONS.map((option) => (
        <ThemeOption
          key={option.value}
          icon={option.icon}
          value={option.value}
          isActive={theme === option.value}
          onClick={setTheme}
        />
      ))}
    </motion.div>
  );
}

export function ThemeSwitcher() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeSwitcherContent />
    </ThemeProvider>
  );
}

/**
 * Single-button theme toggle with an animated circular reveal
 * (View Transitions API). Falls back to a plain class toggle on
 * browsers without `document.startViewTransition`.
 * Renders as a compact icon pill matching the header controls.
 */
export function AnimatedThemeSwitcher({
  variant = "circle",
  duration = 700,
  className,
}: {
  variant?: TransitionVariant;
  duration?: number;
  className?: string;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AnimatedThemeTogglerBridge variant={variant} duration={duration} className={className} />
    </ThemeProvider>
  );
}

function AnimatedThemeTogglerBridge({
  variant,
  duration,
  className,
}: {
  variant: TransitionVariant;
  duration: number;
  className?: string;
}) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const current = resolvedTheme === "dark" ? "dark" : "light";

  const handleChange = useCallback(
    (next: "light" | "dark") => {
      setTheme(next);
    },
    [setTheme]
  );

  if (!isMounted) {
    return (
      <div
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800",
          className
        )}
      />
    );
  }

  return (
    <AnimatedThemeToggler
      theme={current}
      onThemeChange={handleChange}
      variant={variant}
      duration={duration}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer [&_svg]:size-[18px]",
        className
      )}
    >
      {/* Icon rendered inside AnimatedThemeToggler (Sun/Moon); slot kept for extra content */}
      <span className="hidden">{theme}</span>
    </AnimatedThemeToggler>
  );
}
