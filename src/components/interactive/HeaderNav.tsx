"use client";

import { useEffect, useRef, useState } from "react";
import { GooeyNav, type GooeyNavItem } from "./GooeyNav";

type NavLink = { name: string; href: string };

type HeaderNavProps = {
  links: NavLink[];
  activeColor?: string;
  activeLabelColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** Extra gap (px) between nav tiles; overrides the size preset. */
  separation?: number;
};

/**
 * Mounts the gooey nav as the desktop navigation and drives its active index
 * from a scroll-spy (IntersectionObserver) over the in-page sections.
 * The reference component was built for Next.js route changes; here the site
 * is single-page with anchor links, so "active" follows the section in view.
 */
export function HeaderNav({
  links,
  activeColor = "#0f172a",
  activeLabelColor = "#ffffff",
  size = "md",
  separation = 36,
}: HeaderNavProps) {
  const [active, setActive] = useState(0);
  const navRef = useRef<HTMLDivElement | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Track html.dark class toggled by next-themes so the gooey bar
    // inverts its palette between light and dark modes.
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // each link points at a section id; "Overview" uses "#" -> hero/top.
    const targets = links.map((link) => {
      const id = link.href === "#" ? null : link.href.replace(/^#/, "");
      return id ? document.getElementById(id) : null;
    });

    const isEligible = (el: HTMLElement | null): el is HTMLElement =>
      el !== null && typeof el.getBoundingClientRect === "function";

    const update = () => {
      // Scrolled to the very bottom: highlight the last link.
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2
      ) {
        setActive(links.length - 1);
        return;
      }

      // Classic scroll-spy: the active link is the last section whose top
      // has crossed a threshold near the top of the viewport.
      // Using 45% of viewport height as threshold — more generous to avoid
      // the next section stealing focus prematurely.
      const threshold = window.innerHeight * 0.45;
      let best = 0;
      targets.forEach((el, i) => {
        if (!isEligible(el)) return;
        if (el.getBoundingClientRect().top <= threshold) {
          best = i;
        }
      });
      setActive(best);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [links]);

  const items: GooeyNavItem[] = links.map((link) => ({
    label: link.name,
    href: link.href,
  }));

  return (
    <div ref={navRef}>
      <GooeyNav
        items={items}
        value={active}
        size={size}
        separation={separation}
        activeColor={isDark ? "#F4F4F9" : activeColor}
        activeLabelColor={isDark ? "#0f172a" : activeLabelColor}
        onChange={() => {
          // scroll-spy already resyncs on scroll; nothing extra needed
        }}
      />
    </div>
  );
}