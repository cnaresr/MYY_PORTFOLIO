"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { Crown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BrandIcon } from "@/components/interactive/BrandIcon";

export interface MatrixSkill {
  name: string;
  detail: string;
  proof?: string;
  percentage: number;
  master?: boolean;
  iconSlug?: string;
}

export interface SkillsMatrixProps {
  languages: MatrixSkill[];
  frameworks: MatrixSkill[];
}

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

const SkillRow = ({ skill }: { skill: MatrixSkill }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const target = clampPercent(skill.percentage);

  useGSAP(
    () => {
      if (!pctRef.current || !barRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        pctRef.current.textContent = `${target}%`;
        barRef.current.style.transform = `scaleX(${target / 100})`;
        return;
      }

      const counter = { val: 0 };
      pctRef.current.textContent = "0%";

      // Animate percentage number counting up
      gsap.to(counter, {
        val: target,
        duration: 1.15,
        ease: "power2.out",
        snap: { val: 1 },
        scrollTrigger: {
          trigger: rowRef.current,
          start: "top 88%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
        onUpdate: () => {
          if (pctRef.current) {
            pctRef.current.textContent = `${Math.round(counter.val)}%`;
          }
        },
      });

      // Animate architectural precision gauge bar filling from left
      gsap.fromTo(
        barRef.current,
        { scaleX: 0 },
        {
          scaleX: target / 100,
          duration: 1.15,
          ease: "power2.out",
          transformOrigin: "left center",
          scrollTrigger: {
            trigger: rowRef.current,
            start: "top 88%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    },
    { scope: rowRef, dependencies: [target] }
  );

  return (
    <div
      ref={rowRef}
      className="group/skill flex flex-col gap-1.5 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 rounded-lg px-2 -mx-2 transition-colors"
      aria-label={`${skill.name} ${target}%${skill.detail ? `. ${skill.detail}` : ""}`}
      title={skill.detail || undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 group-hover/skill:scale-105 transition-transform">
            <BrandIcon
              slug={skill.iconSlug}
              name={skill.name}
              className="w-4 h-4"
              initialClassName="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500"
            />
          </span>
          <div className="min-w-0 flex flex-col">
            <span className="font-['Space_Grotesk'] text-[14px] text-slate-900 dark:text-slate-100 font-semibold truncate leading-tight">
              {skill.name}
            </span>
            {skill.detail && (
              <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {skill.detail}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {skill.master && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-mono text-[10px] font-bold uppercase tracking-wide shadow-2xs">
              <Crown className="w-3 h-3" /> Master
            </span>
          )}
          <span
            ref={pctRef}
            className="font-mono text-[13px] font-bold text-slate-900 dark:text-slate-100 tabular-nums w-10 text-right"
          >
            {target}%
          </span>
        </div>
      </div>

      {/* Horizontal Precision CAD Gauge Line */}
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-0.5">
        <div
          ref={barRef}
          className="h-full bg-slate-800 dark:bg-slate-200 rounded-full origin-left group-hover/skill:bg-slate-950 dark:group-hover/skill:bg-white transition-colors"
          style={{ transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
};

export function SkillsMatrix({ languages, frameworks }: SkillsMatrixProps) {
  const [activeTab, setActiveTab] = useState<"all" | "languages" | "frameworks">("all");

  const tabs = [
    { id: "all", label: "All Stacks", count: languages.length + frameworks.length },
    { id: "languages", label: "Languages", count: languages.length },
    { id: "frameworks", label: "Frameworks", count: frameworks.length },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      {/* Category Tab Switcher with Motion Spring Indicator */}
      <div className="flex items-center justify-start sm:justify-end">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-lg font-['Space_Grotesk'] text-xs font-semibold tracking-wide transition-colors cursor-pointer select-none ${
                  isActive
                    ? "text-slate-950 dark:text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSkillTab"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-xs"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.label}
                  <span className="text-[10px] font-mono opacity-60">({tab.count})</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(activeTab === "all" || activeTab === "languages") && (
          <motion.div
            key="col-languages"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
              activeTab === "languages" ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-[18px]">code</span>
                <h3 className="font-['Space_Grotesk'] text-[17px] text-slate-950 dark:text-white font-bold">
                  Language Expertise
                </h3>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                CORE SYNTAX
              </span>
            </div>
            <div>
              {languages.map((skill, i) => (
                <SkillRow key={`${skill.name}-${i}`} skill={skill} />
              ))}
            </div>
          </motion.div>
        )}

        {(activeTab === "all" || activeTab === "frameworks") && (
          <motion.div
            key="col-frameworks"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all ${
              activeTab === "frameworks" ? "md:col-span-2" : ""
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-[18px]">layers</span>
                <h3 className="font-['Space_Grotesk'] text-[17px] text-slate-950 dark:text-white font-bold">
                  Framework &amp; Engine Expertise
                </h3>
              </div>
              <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                PLATFORMS &amp; RUNTIMES
              </span>
            </div>
            <div>
              {frameworks.map((skill, i) => (
                <SkillRow key={`${skill.name}-${i}`} skill={skill} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

void ScrollTrigger;
