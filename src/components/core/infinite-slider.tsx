import React, { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface InfiniteSliderProps {
  children: React.ReactNode;
  /** Base scroll speed in px/second. */
  speed?: number;
  /** Scroll speed in px/second while hovering. Slows/accelerates the loop. */
  speedOnHover?: number;
  /** Gap between items in px. */
  gap?: number;
  /** Scroll right-to-left instead of left-to-right. */
  reverse?: boolean;
  className?: string;
}

/**
 * Seamless infinite marquee.
 *
 * The children are rendered `copies` times inside a single flex track and the
 * identical halves are translated with a requestAnimationFrame loop. Each item
 * carries its own trailing margin (gap) so `track.scrollWidth / copies` is
 * exactly one full loop unit — no seam gap, no off-by-one at the wrap point.
 *
 * The copy count grows until the track minus one unit is at least as wide as
 * the viewport, so the marquee always fills the screen edge-to-edge.
 */
export function InfiniteSlider({
  children,
  speed = 60,
  speedOnHover,
  gap = 24,
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const copiesRef = useRef(2);
  const [copies, setCopies] = useState(2);
  const [offset, setOffset] = useState(0);
  const [unitWidth, setUnitWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  const velocityMultiplierRef = useRef(1);

  const direction = reverse ? -1 : 1;

  // Track page scroll velocity via GSAP ScrollTrigger to accelerate marquee on fast scrolls
  useEffect(() => {
    if (typeof window === "undefined" || !ScrollTrigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const proxy = { multiplier: 1 };
    let decayTween: gsap.core.Tween | null = null;

    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        const vel = Math.abs(self.getVelocity());
        if (vel < 60) return;

        // Dynamic acceleration: scales smoothly up to 3x normal speed
        const boost = 1 + Math.min(vel / 500, 2.2);

        if (decayTween) decayTween.kill();
        proxy.multiplier = boost;
        velocityMultiplierRef.current = boost;

        // Smooth inertial decay back to base speed
        decayTween = gsap.to(proxy, {
          multiplier: 1,
          duration: 0.85,
          ease: "power2.out",
          onUpdate: () => {
            velocityMultiplierRef.current = proxy.multiplier;
          },
        });
      },
    });

    return () => {
      st.kill();
      if (decayTween) decayTween.kill();
    };
  }, []);

  // Measure one loop unit (track holds `copies` identical sets) and grow the
  // copy count until the tail always covers the viewport width.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      const unit = track.scrollWidth / copiesRef.current;
      if (unit <= 0) return;
      setUnitWidth(unit);
      const viewport = track.parentElement?.clientWidth ?? 0;
      const needed = Math.max(2, Math.ceil(viewport / unit) + 1);
      if (needed !== copiesRef.current) {
        copiesRef.current = needed;
        setCopies(needed);
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  // Drive the marquee. Speed is px/s; wrap offset back to zero every unit so
  // the loop never visibly resets.
  useEffect(() => {
    if (unitWidth <= 0) return;

    const activeSpeed =
      hovered && speedOnHover != null ? speedOnHover : speed;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const speedMultiplier = velocityMultiplierRef.current;
      setOffset((prev) => {
        let next = prev + direction * activeSpeed * speedMultiplier * dt;
        if (next >= unitWidth) next -= unitWidth;
        else if (next < 0) next += unitWidth;
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [unitWidth, hovered, speedOnHover, speed, direction]);

  const items = React.Children.map(children, (child, i) => (
    <div
      key={i}
      className="shrink-0"
      style={{ marginRight: gap }}
      aria-hidden={false}
    >
      {child}
    </div>
  ));

  return (
    <div
      className={`overflow-hidden ${className ?? ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        ref={trackRef}
        className="flex w-max"
        style={{ transform: `translateX(${-offset}px)` }}
      >
        {Array.from({ length: copies }, (_, copy) => (
          <React.Fragment key={copy}>{items}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
