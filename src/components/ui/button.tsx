import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn-style Button rebuilt for the portfolio design language
 * (slate palette, rounded-lg, no cva dependency — plain variant maps).
 */

export type ButtonVariant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

const BASE_CLASSES =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium outline-none transition-all duration-200 ease-out " +
  "focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f9ff] dark:focus-visible:ring-white dark:focus-visible:ring-offset-[#050811] " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  default:
    "cursor-pointer bg-slate-950 text-white shadow-sm hover:bg-slate-800 active:bg-slate-900 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200",
  secondary:
    "cursor-pointer bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300/70 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "cursor-pointer border border-slate-200 bg-white text-slate-900 shadow-2xs hover:bg-slate-50 active:bg-slate-100 dark:border-slate-800 dark:bg-transparent dark:text-slate-100 dark:hover:bg-slate-900",
  ghost:
    "cursor-pointer text-slate-900 hover:bg-slate-100 active:bg-slate-200/70 dark:text-slate-100 dark:hover:bg-slate-900",
  destructive:
    "cursor-pointer bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:bg-rose-800",
  link:
    "cursor-pointer text-slate-900 underline-offset-4 hover:underline dark:text-slate-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-lg px-6",
  icon: "size-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      data-slot="button"
      data-variant={variant}
      className={cn(
        BASE_CLASSES,
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
