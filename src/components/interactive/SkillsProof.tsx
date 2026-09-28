"use client";

import { useRef } from "react";
import { Crown } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { BrandIcon } from "@/components/interactive/BrandIcon";
import { cn } from "@/lib/utils";
import type { MatrixSkill } from "@/components/interactive/SkillsMatrix";

export interface SkillsProofProps {
  languages: MatrixSkill[];
  frameworks: MatrixSkill[];
}

function SkillProofCard({ skill }: { skill: MatrixSkill }) {
  const body = (skill.proof || skill.detail || "").trim();

  return (
    <article
      data-proof-card
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-white dark:bg-slate-900 p-4 shadow-xs min-h-[148px]",
        "transition-[border-color,box-shadow] duration-200 hover:shadow-md",
        skill.master
          ? "border-amber-300 dark:border-amber-700"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0">
          <BrandIcon
            slug={skill.iconSlug}
            name={skill.name}
            className="w-5 h-5"
            initialClassName="font-mono text-[10px] font-bold text-slate-400"
          />
        </span>
        {skill.master && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-mono text-[9px] font-bold uppercase tracking-wide">
            <Crown className="w-3 h-3" /> Master
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h4 className="font-['Space_Grotesk'] text-[15px] font-bold text-slate-950 dark:text-white leading-tight">
          {skill.name}
        </h4>
        {skill.detail ? (
          <p className="mt-0.5 font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {skill.detail}
          </p>
        ) : null}
      </div>
      {body ? (
        <p className="font-['Space_Grotesk'] text-[13px] leading-snug text-slate-700 dark:text-slate-300">
          {body}
        </p>
      ) : null}
    </article>
  );
}

function ProofGroup({
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
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cards = root.current?.querySelectorAll("[data-proof-card]");
      if (!cards?.length) return;
      gsap.from(cards, {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: root, dependencies: [skills.length] }
  );

  return (
    <div ref={root}>
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-[18px]">{icon}</span>
          <h3 className="font-['Space_Grotesk'] text-[17px] text-slate-950 dark:text-white font-bold">{title}</h3>
        </div>
        <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
          {kicker}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {skills.map((skill, i) => (
          <SkillProofCard key={`${skill.name}-${i}`} skill={skill} />
        ))}
      </div>
    </div>
  );
}

/** Option 1 — skill + proof. List+percent lives in SkillsMatrix.tsx (not mounted). */
export function SkillsProof({ languages, frameworks }: SkillsProofProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <ProofGroup title="Language Expertise" kicker="CORE SYNTAX" icon="code" skills={languages} />
      <ProofGroup
        title="Framework & Engine Expertise"
        kicker="PLATFORMS & RUNTIMES"
        icon="layers"
        skills={frameworks}
      />
    </div>
  );
}

void ScrollTrigger;
