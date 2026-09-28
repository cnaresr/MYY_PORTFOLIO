"use client";

import { useRef } from "react";
import { Crown } from "lucide-react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { BrandIcon } from "@/components/interactive/BrandIcon";
import { cn } from "@/lib/utils";
import type { MatrixSkill } from "@/components/interactive/SkillsMatrix";

export interface SkillsLayersProps {
  languages: MatrixSkill[];
  frameworks: MatrixSkill[];
}

type LayerId = "frontend" | "backend" | "infra";

const FRONTEND_SLUGS = new Set(["astro", "react", "nextdotjs", "tailwindcss"]);
const INFRA_SLUGS = new Set(["nodedotjs", "cloudflare", "postgresql"]);

function slugOf(skill: MatrixSkill) {
  return (skill.iconSlug || skill.name).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function layerFor(skill: MatrixSkill): LayerId {
  const slug = slugOf(skill);
  if (FRONTEND_SLUGS.has(slug) || /^(astro|react|next|tailwind)/.test(skill.name.toLowerCase())) {
    return "frontend";
  }
  if (INFRA_SLUGS.has(slug) || /^(cloudflare|node|sql|postgres)/.test(skill.name.toLowerCase())) {
    return "infra";
  }
  return "backend";
}

function chipTip(skill: MatrixSkill) {
  const proof = (skill.proof || "").trim();
  const detail = (skill.detail || "").trim();
  if (proof && detail) return `${detail} — ${proof}`;
  return proof || detail || skill.name;
}

function StackChip({ skill }: { skill: MatrixSkill }) {
  const tip = chipTip(skill);
  return (
    <div className="group/chip relative inline-flex">
      <div
        title={tip}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-900 px-2.5 py-1.5 shadow-xs shrink-0",
          "transition-[border-color,box-shadow,transform] duration-200",
          "group-hover/chip:shadow-md group-hover/chip:-translate-y-0.5",
          skill.master
            ? "border-amber-300 dark:border-amber-700"
            : "border-slate-200 dark:border-slate-800 group-hover/chip:border-slate-300 dark:group-hover/chip:border-slate-600"
        )}
      >
        <BrandIcon
          slug={skill.iconSlug}
          name={skill.name}
          className="w-4 h-4"
          initialClassName="font-mono text-[9px] font-bold text-slate-400"
        />
        <span className="font-['Space_Grotesk'] text-[12px] font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
          {skill.name}
        </span>
        {skill.master && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
      </div>
      <span className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-2 w-max max-w-[240px] -translate-x-1/2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-950 text-white px-2.5 py-1.5 font-mono text-[10px] leading-snug opacity-0 translate-y-1 group-hover/chip:opacity-100 group-hover/chip:translate-y-0 transition-all duration-150">
        {tip}
      </span>
    </div>
  );
}

const LAYERS: Array<{ id: LayerId; title: string; kicker: string; icon: string }> = [
  { id: "frontend", title: "Frontend", kicker: "UI / RENDER", icon: "palette" },
  { id: "backend", title: "Backend", kicker: "LOGIC / DATA", icon: "database" },
  { id: "infra", title: "Infra", kicker: "RUNTIME / EDGE", icon: "cloud" },
];

function LayerColumn({
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
    <div
      data-layer-col
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-800 dark:text-slate-200 text-[18px]">{icon}</span>
          <h3 className="font-['Space_Grotesk'] text-[15px] text-slate-950 dark:text-white font-bold">{title}</h3>
        </div>
        <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
          {kicker}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill, i) => <StackChip key={`${skill.name}-${i}`} skill={skill} />)
        ) : (
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">—</span>
        )}
      </div>
    </div>
  );
}

/** Option 3 — stack per-layer. Option 1: SkillsProof.tsx · Option 2: SkillsRail.tsx (not mounted). */
export function SkillsLayers({ languages, frameworks }: SkillsLayersProps) {
  const root = useRef<HTMLDivElement>(null);
  const all = [...languages, ...frameworks];
  const byLayer: Record<LayerId, MatrixSkill[]> = {
    frontend: all.filter((s) => layerFor(s) === "frontend"),
    backend: all.filter((s) => layerFor(s) === "backend"),
    infra: all.filter((s) => layerFor(s) === "infra"),
  };

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const cols = root.current?.querySelectorAll("[data-layer-col]");
      if (!cols?.length) return;
      gsap.from(cols, {
        y: 26,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: root, dependencies: [all.length] }
  );

  return (
    <div ref={root} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {LAYERS.map((layer) => (
        <LayerColumn
          key={layer.id}
          title={layer.title}
          kicker={layer.kicker}
          icon={layer.icon}
          skills={byLayer[layer.id]}
        />
      ))}
      <p className="md:col-span-3 font-mono text-[10px] text-slate-400 dark:text-slate-500">
        Hover a chip for detail. Master = amber ring + crown.
      </p>
    </div>
  );
}

void ScrollTrigger;
