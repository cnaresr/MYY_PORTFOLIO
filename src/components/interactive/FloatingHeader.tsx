"use client";

import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";
import { HeaderNav } from "./HeaderNav";
import { AnimatedThemeSwitcher } from "./ThemeSwitcher";

export interface NavLink {
  name: string;
  href: string;
}

export interface FloatingHeaderProps {
  navLinks: NavLink[];
  className?: string;
  hideOnTop?: boolean;
}

export const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  navLinks,
  className,
  hideOnTop = false,
}) => {
  const { scrollY, scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(!hideOnTop);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    if (typeof current === "number") {
      const prev = scrollY.getPrevious() ?? current;
      const direction = current - prev;

      if (hideOnTop && scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else if (current < 50) {
        setVisible(!hideOnTop);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else if (direction > 0) {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.header
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "fixed top-0 left-0 right-0 w-full z-50 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors",
          !visible && "pointer-events-none",
          className
        )}
      >
        <div className="h-24 max-w-[1400px] mx-auto px-8 flex items-center justify-between gap-6">
          {/* Desktop Navigation (gooey spring nav) */}
          <nav className="hidden md:block" aria-label="Primary">
            <HeaderNav links={navLinks} />
          </nav>

          {/* Right utility controls: Commands + Theme Switcher */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Quick Command Palette Trigger (Cmd+K) */}
            <button
              type="button"
              id="cmdPaletteTriggerBtn"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-command-palette"));
              }}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-mono text-xs shadow-2xs transition-colors cursor-pointer"
              title="Open Command Palette (Ctrl+K / Cmd+K)"
              aria-label="Open Command Palette"
            >
              <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-slate-400">
                search
              </span>
              <span className="text-slate-500 dark:text-slate-400 hidden xl:inline">
                Commands
              </span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-semibold font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Theme Switcher: animated reveal (View Transitions API) */}
            <AnimatedThemeSwitcher variant="circle" duration={700} />
          </div>

          {/* Mobile menu trigger */}
          <button
            id="mobileMenuBtn"
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isMobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobileMenu"
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 space-y-2 shadow-lg"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </motion.header>
    </AnimatePresence>
  );
};
