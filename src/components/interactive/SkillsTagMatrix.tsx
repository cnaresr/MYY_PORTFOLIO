"use client";

import { useRef } from "react";
import { Crown } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { BrandIcon } from "@/components/interactive/BrandIcon";
import { cn } from "@/lib/utils";
import type { MatrixSkill } from "@/components/interactive/SkillsMatrix";

export interface SkillsTagMatrixProps {
  languages: MatrixSkill[];
  frameworks: MatrixSkill[];
}

type LevelTag = "Core" | "Daily" | "Advanced";

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value || 0)));
}

function levelFor(skill: MatrixSkill): LevelTag {
  if (skill.master) return "Core";
  const pct = clampPercent(skill.percentage);
  if (pct >= 94) return "Core";
  if (pct >= 90) return "Daily";
  return "Advanced";
}

function tagClass(tag: LevelTag) {
  if (tag === "Core") {
    return "bg-slate-950 text-white dark:bg-white dark:text-slate-950 border-slate-950 dark:border-white";
  }
  if (tag === "Daily") {
    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
  }
  return "bg-white text-slate-500 dark:bg-slate-900 dark:text-slate-400 border-slate-200 dark:border-slate-700";
}

function chipTip(skill: MatrixSkill) {
  const proof = (skill.proof || "").trim();
  const detail = (skill.detail || "").trim();
  if (proof && detail) return `${detail} — ${proof}`;
  return proof || detail || skill.name;
}

function SkillRow({ skill }: { skill: MatrixSkill }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const tag = levelFor(skill);
  const tip = chipTip(skill);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!rowRef.current) return;
      gsap.from(rowRef.current, {
        y: 12,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: rowRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: rowRef, dependencies: [skill.name] }
  );

  return (
    <div
      ref={rowRef}
      className="group/skill flex items-center justify-between gap-2 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-md px-1.5 -mx-1.5 transition-colors"
      aria-label={`${skill.name}, ${tag}${tip ? `. ${tip}` : ""}`}
      title={tip}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group-hover/skill:scale-105 transition-transform">
          <BrandIcon
            slug={skill.iconSlug}
            name={skill.name}
            className="w-4 h-4"
            initialClassName="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500"
          />
        </span>
        <span className="font-['Space_Grotesk'] text-[14px] text-slate-900 dark:text-slate-100 font-semibold truncate">
          {skill.name}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {skill.master && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wide shadow-2xs">
            <Crown className="w-3 h-3" /> Master
          </span>
        )}
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full border font-mono text-[10px] font-bold uppercase tracking-wide",
            tagClass(tag)
          )}
        >
          {tag}
        </span>
      </div>
    </div>
  );
}

function MatrixCard({
  title,
  kicker,
  icon,
  skills,
}: {
  title: string;
  kicker: string;
  icon: string;
  skills: MatrixSkill[];
}) {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-[18px]">{icon}</span>
          <h3 className="font-['Space_Grotesk'] text-[17px] text-slate-950 dark:text-white font-bold">{title}</h3>
        </div>
        <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
          {kicker}
        </span>
      </div>
      <div>
        {skills.map((skill, i) => (
          <SkillRow key={`${skill.name}-${i}`} skill={skill} />
        ))}
      </div>
    </div>
  );
}

/** Option 4 — same matrix, percent → Core / Daily / Advanced. */
export function SkillsTagMatrix({ languages, frameworks }: SkillsTagMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MatrixCard title="Language Expertise" kicker="CORE SYNTAX" icon="code" skills={languages} />
      <MatrixCard
        title="Framework & Engine Expertise"
        kicker="PLATFORMS & RUNTIMES"
        icon="layers"
        skills={frameworks}
      />
    </div>
  );
}

void ScrollTrigger;
