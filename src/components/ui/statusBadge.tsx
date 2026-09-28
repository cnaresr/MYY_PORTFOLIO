import { CircleCheck, CircleDashed, Clock5, TriangleAlert } from "lucide-react";
import React from "react";

export type StatusKind = "published" | "inprogress" | "draft" | "archived";

interface StatusConfig {
  label: string;
  icon: React.ComponentType<any>;
  className: string;
  spin?: boolean;
}

const STATUS_CONFIG: Record<StatusKind, StatusConfig> = {
  published: {
    label: "Live in production",
    icon: CircleCheck,
    className:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/25",
  },
  inprogress: {
    label: "In progress",
    icon: CircleDashed,
    className:
      "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-300/25",
    spin: true,
  },
  draft: {
    label: "Draft / staging",
    icon: TriangleAlert,
    className:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-300/25",
  },
  archived: {
    label: "Archived",
    icon: Clock5,
    className:
      "bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-400/10 dark:text-neutral-300 dark:ring-neutral-300/20",
  },
};

export function StatusBadge({
  status,
  label,
  className = "",
}: {
  status: StatusKind;
  label?: string;
  className?: string;
}) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium leading-none ring-1 ring-inset ${cfg.className} ${className}`}
    >
      <Icon
        className={`size-3.5 shrink-0 ${cfg.spin ? "animate-spin [animation-duration:3s] motion-reduce:animate-none" : ""}`}
        strokeWidth={2.25}
        aria-hidden="true"
      />
      {label ?? cfg.label}
    </span>
  );
}