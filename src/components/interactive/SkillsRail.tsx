"use client";

import { Crown } from "lucide-react";
import { InfiniteSlider } from "@/components/core/infinite-slider";
import { ProgressiveBlur } from "@/components/core/progressive-blur";
import { BrandIcon } from "@/components/interactive/BrandIcon";
import { cn } from "@/lib/utils";
import type { MatrixSkill } from "@/components/interactive/SkillsMatrix";

export interface SkillsRailProps {
  languages: MatrixSkill[];
  frameworks: MatrixSkill[];
}

function tooltipText(skill: MatrixSkill) {
  const proof = (skill.proof || "").trim();
  const detail = (skill.detail || "").trim();
  if (proof && detail) return `${detail} — ${proof}`;
  return proof || detail || skill.name;
}

function RailChip({ skill }: { skill: MatrixSkill }) {
  const tip = tooltipText(skill);

  return (
    <div className="group/chip relative inline-flex">
      <div
        title={tip}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-2xl border bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-xs shrink-0",
          "transition-[border-color,box-shadow,transform] duration-200",
          "group-hover/chip:shadow-md group-hover/chip:-translate-y-0.5",
          skill.master
            ? "border-amber-300 dark:border-amber-700"
            : "border-slate-200 dark:border-slate-800 group-hover/chip:border-slate-300 dark:group-hover/chip:border-slate-600"
        )}
      >
        <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
          <BrandIcon
            slug={skill.iconSlug}
            name={skill.name}
            className="w-5 h-5"
            initialClassName="font-mono text-[10px] font-bold text-slate-400"
          />
        </span>
        <span className="font-['Space_Grotesk'] text-[13px] font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {skill.name}
        </span>
        {skill.master && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
      </div>
      <span className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-max max-w-[260px] -translate-x-1/2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-950 text-white px-2.5 py-1.5 font-mono text-[10px] leading-snug opacity-0 translate-y-1 group-hover/chip:opacity-100 group-hover/chip:translate-y-0 transition-all duration-150">
        {tip}
      </span>
    </div>
  );
}

function RailRow({
  skills,
  reverse,
  speed,
  kicker,
}: {
  skills: MatrixSkill[];
  reverse?: boolean;
  speed: number;
  kicker: string;
}) {
  return (
    <div>
      <p className="px-1 mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {kicker}
      </p>
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 py-3">
        <InfiniteSlider speed={speed} speedOnHover={0} gap={16} reverse={reverse} className="py-1">
          {skills.map((skill, i) => (
            <RailChip key={`${skill.name}-${i}`} skill={skill} />
          ))}
        </InfiniteSlider>
        <ProgressiveBlur className="top-0 left-0 h-full w-[96px] sm:w-[140px]" direction="left" blurIntensity={8} />
        <ProgressiveBlur className="top-0 right-0 h-full w-[96px] sm:w-[140px]" direction="right" blurIntensity={8} />
      </div>
    </div>
  );
}

/** Option 2 — skills as hover-pause rails. Option 1 lives in SkillsProof.tsx (not mounted). */
export function SkillsRail({ languages, frameworks }: SkillsRailProps) {
  return (
    <div className="space-y-6">
      <RailRow skills={languages} reverse speed={42} kicker="CORE SYNTAX" />
      <RailRow skills={frameworks} speed={36} kicker="PLATFORMS & RUNTIMES" />
      <p className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
        Hover a chip — rail pauses, detail pops. Master = amber ring + crown.
      </p>
    </div>
  );
}
