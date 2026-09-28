import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * shadcn/ui "empty" primitives (EmptyHeader / EmptyMedia / EmptyTitle /
 * EmptyDescription / EmptyContent) with the same API as the reference
 * component, re-themed for the portfolio design language.
 */

export function Empty({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-xl p-8 text-center",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-header"
      className={cn("flex max-w-sm flex-col items-center gap-2", className)}
      {...props}
    />
  );
}

export function EmptyMedia({
  variant = "icon",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "icon" | "default";
}) {
  return (
    <div
      data-slot="empty-media"
      data-variant={variant}
      className={cn(
        "flex shrink-0 items-center justify-center",
        variant === "icon" &&
          "size-10 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-title"
      className={cn(
        "font-['Space_Grotesk'] text-lg font-bold leading-none tracking-tight text-slate-950 dark:text-slate-100",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "font-['Hanken_Grotesk'] text-sm leading-relaxed text-slate-600 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function EmptyContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm flex-col items-center gap-2.5 text-sm",
        className,
      )}
      {...props}
    />
  );
}
