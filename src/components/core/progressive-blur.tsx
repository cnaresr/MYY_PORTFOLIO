import React from "react";

interface ProgressiveBlurProps {
  className?: string;
  direction?: "top" | "bottom" | "left" | "right";
  /** Max blur radius in px, strongest at the masked edge. */
  blurIntensity?: number;
}

const GRADIENT: Record<string, string> = {
  left: "linear-gradient(to right, black 0%, transparent 100%)",
  right: "linear-gradient(to left, black 0%, transparent 100%)",
  top: "linear-gradient(to bottom, black 0%, transparent 100%)",
  bottom: "linear-gradient(to top, black 0%, transparent 100%)",
};

/**
 * Edge blur overlay. A single backdrop-filtered layer whose opacity ramps from
 * the masked edge inward, so content fades to a soft blur at the boundary
 * instead of a hard clip.
 */
export function ProgressiveBlur({
  className,
  direction = "left",
  blurIntensity = 8,
}: ProgressiveBlurProps) {
  const mask = GRADIENT[direction] ?? GRADIENT.left;

  return (
    <div
      className={`pointer-events-none absolute ${className ?? ""}`}
      style={{
        backdropFilter: `blur(${blurIntensity}px)`,
        WebkitBackdropFilter: `blur(${blurIntensity}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
      aria-hidden
    />
  );
}