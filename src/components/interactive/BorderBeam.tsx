"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Seconds for one full loop around the perimeter. */
  duration?: number;
  /** Seconds to wait before the first loop starts. */
  delay?: number;
  /** Length of the visible beam segment in px. */
  size?: number;
  /** Beam thickness in px. */
  borderWidth?: number;
  /** Offset anchor (percentage) */
  anchor?: number;
  /** Via color */
  colorVia?: string;
  className?: string;
}

/**
 * A light beam that travels around the border of its parent
 * (parent must be `relative overflow-hidden`), using Magic UI's mask-based offset-path technique.
 */
export function BorderBeam({
  duration = 6,
  delay = 0,
  size = 200,
  borderWidth = 1.5,
  anchor = 90,
  colorVia,
  className,
  style,
  ...props
}: BorderBeamProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        // Default monochromatic beam colors (slate-300 light, white/slate dark)
        "[--color-via:#cbd5e1] dark:[--color-via:rgba(255,255,255,0.4)]",
        // Mask styles: cutout the inner content-box so the beam only shows on the border
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        "[-webkit-mask-clip:padding-box,border-box] [-webkit-mask-composite:xor] [-webkit-mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)_border-box]",
        // Pseudo-element beam that travels along the offset-path
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)]",
        "after:[background:linear-gradient(to_left,transparent,var(--color-via),transparent)]",
        "after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
      style={
        {
          border: `${borderWidth}px solid transparent`,
          "--size": size,
          "--duration": `${duration}s`,
          "--delay": `${delay}s`,
          "--anchor": anchor,
          ...(colorVia ? { "--color-via": colorVia } : {}),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
