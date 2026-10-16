"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Crown,
  Sparkles,
  Search,
  Cpu,
  Layers,
  Code2,
} from "lucide-react";
import { BrandIcon } from "@/components/interactive/BrandIcon";
import { cn } from "@/lib/utils";

export interface ShowreelSkill {
  name: string;
  detail: string;
  proof?: string;
  percentage: number;
  master?: boolean;
  iconSlug?: string;
  category?: "language" | "framework";
}

interface SkillsShowreelProps {
  languages: ShowreelSkill[];
  frameworks: ShowreelSkill[];
}

/**
 * High-craft technical credential bento card.
 * Pure, authoritative, and resume-ready:
 * Features brand logo, technical stack name, category metadata,
 * and verified level badge (Master / Advanced) with dynamic spotlight cursor glow.
 */
function ShowreelCard({ skill, index }: { skill: ShowreelSkill; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--spot-x", `${clientX - rect.left}px`);
      card.style.setProperty("--spot-y", `${clientY - rect.top}px`);
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative rounded-2xl p-4 sm:p-4.5 transition-all duration-300 overflow-hidden",
        "bg-white/85 dark:bg-slate-900/80 backdrop-blur-md select-none",
        "border shadow-2xs hover:shadow-lg hover:-translate-y-0.5 cursor-default",
        skill.master
          ? "border-amber-400/35 dark:border-amber-500/25 hover:border-amber-400/70 dark:hover:border-amber-400/50"
          : "border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700"
      )}
    >
      {/* Dynamic Cursor Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-0"
        style={{
          background: `radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${
            skill.master
              ? "rgba(245, 158, 11, 0.12)"
              : "rgba(59, 130, 246, 0.08)"
          }, transparent 65%)`,
        }}
      />

      {/* Decorative subtle corner registration tick */}
      <div className="pointer-events-none absolute top-2 right-2 font-mono text-[9px] text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity select-none">
        +
      </div>

      {/* Main Content: Logo + Name & Category + Master/Advanced Pill */}
      <div className="relative z-10 flex items-center justify-between gap-3 w-full">
        {/* Left: Brand Icon + Title */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              "w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-300 group-hover:scale-105 shadow-2xs",
              skill.master
                ? "bg-amber-500/10 dark:bg-amber-400/10 border-amber-300/60 dark:border-amber-500/30 text-amber-600 dark:text-amber-400"
                : "bg-slate-100/90 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            )}
          >
            <BrandIcon
              slug={skill.iconSlug}
              name={skill.name}
              className="w-5.5 h-5.5 sm:w-6 sm:h-6"
            />
          </div>

          <div className="min-w-0">
            <h3 className="font-['Space_Grotesk'] text-base sm:text-[17px] font-bold text-slate-950 dark:text-white tracking-tight leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {skill.name}
            </h3>
            <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5 truncate">
              {skill.category === "language" ? "Language // System" : "Framework // Engine"}
            </span>
          </div>
        </div>

        {/* Right: Master / Advanced Level Badge */}
        <div className="shrink-0">
          {skill.master ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 to-amber-600/15 dark:from-amber-400/20 dark:to-amber-500/20 border border-amber-400/50 dark:border-amber-400/40 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Master</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-semibold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3 h-3 text-sky-500 dark:text-sky-400 shrink-0" />
              <span>Advanced</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function SkillsShowreel({ languages, frameworks }: SkillsShowreelProps) {
  const [activeTab, setActiveTab] = useState<"all" | "languages" | "frameworks" | "master">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const allSkills = useMemo(() => {
    const langs: ShowreelSkill[] = languages.map((l) => ({ ...l, category: "language" }));
    const fws: ShowreelSkill[] = frameworks.map((f) => ({ ...f, category: "framework" }));
    return [...langs, ...fws];
  }, [languages, frameworks]);

  const filteredSkills = useMemo(() => {
    let list = allSkills;

    if (activeTab === "languages") {
      list = list.filter((s) => s.category === "language");
    } else if (activeTab === "frameworks") {
      list = list.filter((s) => s.category === "framework");
    } else if (activeTab === "master") {
      list = list.filter((s) => s.master);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.detail && s.detail.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allSkills, activeTab, searchQuery]);

  const masterCount = useMemo(() => allSkills.filter((s) => s.master).length, [allSkills]);

  const tabs = useMemo(() => [
    { id: "all" as const, label: "All Stacks", count: allSkills.length, icon: Layers },
    { id: "languages" as const, label: "Languages & Systems", count: languages.length, icon: Code2 },
    { id: "frameworks" as const, label: "Frameworks & Engines", count: frameworks.length, icon: Cpu },
    ...(masterCount > 0 ? [{ id: "master" as const, label: "Master Tier", count: masterCount, icon: Crown }] : []),
  ], [allSkills.length, languages.length, frameworks.length, masterCount]);

  return (
    <div className="w-full space-y-6">
      {/* Control Bar: Filter Tabs + Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Interactive Spring Pill Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-lg font-['Space_Grotesk'] text-xs font-semibold tracking-wide transition-colors cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5",
                  isActive
                    ? "text-slate-950 dark:text-white"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeShowreelTab"
                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <TabIcon className="w-3.5 h-3.5 opacity-70" />
                  <span>{tab.label}</span>
                  <span className="text-[10px] font-mono opacity-60">({tab.count})</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Filter Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stack or runtime..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-slate-400 dark:focus:border-slate-500 shadow-2xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Content */}
      <AnimatePresence mode="popLayout">
        {filteredSkills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
          >
            <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
              No matching stacks found for "{searchQuery}".
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredSkills.map((skill, index) => (
              <ShowreelCard key={`${skill.name}-${skill.category}`} skill={skill} index={index} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
