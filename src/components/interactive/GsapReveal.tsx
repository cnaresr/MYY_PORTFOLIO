"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

type GsapRevealProps = {
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  duration?: number;
  stagger?: number;
  /** Kalau diisi, animasi target anak (stagger). Kalau kosong, animasi wrapper. */
  selector?: string;
  start?: string;
};

export function GsapReveal({
  children,
  className,
  y = 24,
  delay = 0,
  duration = 0.6,
  stagger = 0.08,
  selector,
  start = "top 90%",
}: GsapRevealProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const targets = selector
        ? root.current?.querySelectorAll(selector)
        : root.current;

      if (!targets || ("length" in targets && targets.length === 0)) return;

      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        delay,
        stagger: selector ? stagger : 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.current,
          start,
          toggleActions: "play none none none",
        },
      });
    },
    { scope: root, dependencies: [y, delay, duration, stagger, selector, start] }
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

void ScrollTrigger;
