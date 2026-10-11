"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Project } from "@/data/projects";
import { BrandIcon } from "./BrandIcon";
import { formatRange } from "@/lib/formatDate";
import { resolveBrandSlug } from "@/lib/techBrands";

/* ------------------------------------------------------------------ */
/*  Staggered reveal wrapper — cards fade up on scroll                */
/* ------------------------------------------------------------------ */

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  triggerKey?: any;
}

function StaggerReveal({ children, className, triggerKey }: StaggerRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (
        !wrapRef.current ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        return;

      const cards = wrapRef.current.querySelectorAll("[data-bento-card]");
      if (!cards.length) return;

      gsap.set(cards, {
        y: 30,
        opacity: 0,
      });

      gsap.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: wrapRef.current,
          start: "top 88%",
          end: "bottom 15%",
          toggleActions: "play reverse play reverse",
        },
      });
    },
    { scope: wrapRef, dependencies: [triggerKey] }
  );

  return (
    <div ref={wrapRef} className={cn("w-full", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Project Showcase Card with 3D Depth & Hardware Chrome      */
/* ------------------------------------------------------------------ */

interface ProjectCardProps {
  project: Project;
  index: number;
  onViewSpec?: (id: string) => void;
}

function ProjectCard({ project, index, onViewSpec }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  // 3D Parallax Mouse Tilt Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 5-degree subtle, tactile depth
    const rotX = -((y - centerY) / centerY) * 5;
    const rotY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      duration: 0.25,
      ease: "power1.out",
      overwrite: "auto",
    });

    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 1,
        background: `radial-gradient(circle 380px at ${x}px ${y}px, rgba(255,255,255,0.12), transparent 70%)`,
        duration: 0.2,
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: "power2.out",
      overwrite: "auto",
    });

    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.35,
        overwrite: "auto",
      });
    }
  };

  const handleSpecClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewSpec) {
      onViewSpec(project.id);
    } else if (typeof (window as any).openSpecModal === "function") {
      (window as any).openSpecModal(project.id);
    } else {
      window.dispatchEvent(
        new CustomEvent("open-spec-modal", {
          detail: { projectId: project.id },
        })
      );
    }
  };

  return (
    <div
      data-bento-card
      className="relative [perspective:1200px] h-full"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d" }}
        className="group relative w-full h-full flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl dark:shadow-slate-950/60 transition-all duration-300"
      >
        {/* Dynamic Spotlight Glare Layer */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 z-30"
        />

        {/* Ambient colored perimeter glow */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl border border-transparent group-hover:border-slate-300 dark:group-hover:border-slate-700/80 transition-colors duration-300 z-20" />

        {/* TOP: Hardware/Application Mockup Viewport */}
        <div className="p-4 sm:p-5 pb-0 relative z-10">
          <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 shadow-md">
            {/* macOS Chrome Header */}
            <div className="flex items-center px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 border border-[#e0443e]/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 border border-[#dea123]/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 border border-[#1aab29]/50" />
              </div>
            </div>

            {/* High-Resolution Screenshot Visual */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              {!imgError && project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top opacity-90 dark:opacity-85 group-hover:opacity-100 group-hover:scale-[1.03] transition-all duration-500 ease-out"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-center select-none relative">
                  <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                  <span className="material-symbols-outlined text-[36px] text-emerald-400/80 mb-2">
                    terminal
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300 tracking-wider uppercase">
                    {project.id.toUpperCase()} // ARCHITECTURE
                  </span>
                  <span className="font-['Space_Grotesk'] text-xs text-slate-500 mt-1 max-w-[280px] truncate">
                    {project.title}
                  </span>
                </div>
              )}
              {/* Subtle Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Hover Quick Action Overlay */}
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                <button
                  type="button"
                  onClick={handleSpecClick}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-['Space_Grotesk'] text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined text-[16px]">visibility</span>
                  <span>Inspect Architecture</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Project Narrative & Stack */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 relative z-10">
          {/* Metadata Row: ID & Timeline */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
              SYS {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              {formatRange(project.startDate, project.endDate)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
            {project.title}
          </h3>

          {/* Description */}
          <p className="font-['Hanken_Grotesk'] text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5 line-clamp-3">
            {project.description}
          </p>

          {/* Technologies Chips with Authentic Brand Icons */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <BrandIcon
                  slug={resolveBrandSlug(tech)}
                  name={tech}
                  className="w-3.5 h-3.5"
                  initialClassName="text-[10px]"
                />
                <span>{tech}</span>
              </span>
            ))}
          </div>

          {/* Action Deck Bar */}
          <div className="flex items-center justify-between gap-3 pt-5 mt-auto border-t border-slate-100 dark:border-slate-800/80">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold transition-colors cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[15px]">code</span>
              <span>Source</span>
            </a>

            <button
              type="button"
              onClick={handleSpecClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-950 font-['Space_Grotesk'] text-xs font-semibold shadow-xs transition-colors cursor-pointer select-none group/btn"
            >
              <span>View Spec</span>
              <span className="material-symbols-outlined text-[15px] transition-transform group-hover/btn:translate-x-1">
                arrow_forward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Exported Grid with Technology Filter & Symmetrical 2-Column Grid  */
/* ------------------------------------------------------------------ */

interface BentoProjectGridProps {
  projects: Project[];
}

export function BentoProjectGrid({ projects }: BentoProjectGridProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Symmetrical High-Impact 2-Column Grid */}
      <StaggerReveal triggerKey="all">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
            />
          ))}
        </div>
      </StaggerReveal>
    </div>
  );
}
