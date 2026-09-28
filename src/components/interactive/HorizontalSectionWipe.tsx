"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Horizontal section wipe — classic GSAP horizontal scroll.
 *
 * Structure (set in Astro HTML):
 *   #section-wipe-container   → overflow:hidden, pinned
 *     #wipe-track             → flex row, 200vw wide, 2 panels
 *       panel-1 (Projects)    → w-screen
 *       panel-2 (Certificates)→ w-screen
 *
 * On vertical scroll the track translates left by 100vw,
 * so Projects exits left and Certificates slides in from right.
 *
 * Desktop only (≥1024px). Mobile: sections stack normally.
 */
interface Props {
  containerId: string;
  trackId: string;
}

export function HorizontalSectionWipe({ containerId, trackId }: Props) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Mobile: undo the 200vw track and let sections stack normally
    if (window.innerWidth < 1024) {
      const track = document.getElementById(trackId);
      if (track) {
        track.style.width = "100%";
        track.style.flexWrap = "wrap";
        const panels = track.children;
        for (let i = 0; i < panels.length; i++) {
          (panels[i] as HTMLElement).style.width = "100%";
        }
      }
      return;
    }

    done.current = true;

    const container = document.getElementById(containerId);
    const track = document.getElementById(trackId);
    if (!container || !track) return;

    // The track is 200vw, we translate it -50% (= -100vw = one panel width)
    gsap.to(track, {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        // Scroll distance = one viewport height for the full transition
        end: () => "+=" + window.innerHeight,
        scrub: 0.5,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  }, [containerId, trackId]);

  return null;
}
