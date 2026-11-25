"use client";

import { useEffect, useRef, useState } from "react";
import { GooeyNav, type GooeyNavItem } from "./GooeyNav";

type NavLink = { name: string; href: string };

type HeaderNavProps = {
  links: NavLink[];
  currentPath?: string;
  activeColor?: string;
  activeLabelColor?: string;
  size?: "xs" | "sm" | "md" | "lg";
  /** Extra gap (px) between nav tiles; overrides the size preset. */
  separation?: number;
};

function getInitialActiveIndex(links: NavLink[], path: string): number {
  if (path.startsWith("/blog")) {
    const blogIdx = links.findIndex(
      (link) => link.href === "/blog" || link.href.startsWith("/blog")
    );
    if (blogIdx !== -1) return blogIdx;
  }

  if (path !== "/" && path !== "") {
    const routeIdx = links.findIndex(
      (link) => !link.href.startsWith("#") && path.startsWith(link.href)
    );
    if (routeIdx !== -1) return routeIdx;
  }

  return 0;
}

/**
 * Mounts the gooey nav as the desktop navigation and drives its active index
 * from a scroll-spy (IntersectionObserver) over the in-page sections.
 * The reference component was built for Next.js route changes; here the site
 * is single-page with anchor links, so "active" follows the section in view.
 */
export function HeaderNav({
  links,
  currentPath = "/",
  activeColor = "#0f172a",
  activeLabelColor = "#ffffff",
  size = "md",
  separation = 36,
}: HeaderNavProps) {
  const [pathname, setPathname] = useState(currentPath);
  const [active, setActive] = useState(() =>
    getInitialActiveIndex(links, currentPath)
  );
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
    const path = window.location.pathname;
    setPathname(path);

    if (path.startsWith("/blog") || (path !== "/" && path !== "")) {
      setActive(getInitialActiveIndex(links, path));
      return;
    }

    // each anchor link points at a section id; "Overview" uses "#" -> hero/top.
    const targets = links.map((link) => {
      if (link.href === "#" || !link.href.startsWith("#")) return null;
      const id = link.href.replace(/^#/, "");
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
    let scrollRaf = 0;
    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        update();
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [links]);

  const isHome = pathname === "/" || pathname === "";
  const items: GooeyNavItem[] = links.map((link) => {
    const resolvedHref =
      !isHome && link.href.startsWith("#")
        ? link.href === "#"
          ? "/"
          : `/${link.href}`
        : link.href;
    return {
      label: link.name,
      href: resolvedHref,
    };
  });

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