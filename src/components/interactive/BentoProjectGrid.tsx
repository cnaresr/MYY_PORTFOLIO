"use client";

import { useRef, useState, useMemo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";

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
        y: 28,
        opacity: 0,
      });

      gsap.to(cards, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.08,
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
/*  Single Bento Card with True 3D Parallax Tilt                      */
/* ------------------------------------------------------------------ */

interface BentoProjectCardProps {
  project: Project;
  index: number;
  className?: string;
  onViewSpec?: (id: string) => void;
}

function BentoProjectCard({
  project,
  index,
  className,
  onViewSpec,
}: BentoProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  // 3D Parallax Mouse Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 8-degree maximum tilt (clearly noticeable, tactile depth)
    const rotX = -((y - centerY) / centerY) * 8;
    const rotY = ((x - centerX) / centerX) * 8;

    gsap.to(card, {
      rotateX: rotX,
      rotateY: rotY,
      scale: 1.015,
      duration: 0.25,
      ease: "power1.out",
      overwrite: "auto",
    });

    // Move interactive spotlight glare
    if (glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 1,
        background: `radial-gradient(circle 320px at ${x}px ${y}px, rgba(255,255,255,0.15), transparent 70%)`,
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
      scale: 1,
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
    // Outer Perspective Wrapper (handles ScrollTrigger and 3D coordinate space)
    <div
      data-bento-card
      className={cn("relative [perspective:1000px] h-full", className)}
    >
      {/* Inner 3D Tilt Card Surface */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ transformStyle: "preserve-3d" }}
        className="group relative w-full h-full min-h-[30rem] flex flex-col justify-between overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-shadow duration-300"
      >
        {/* Background Image with High-Contrast Gradient Mask */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={project.image}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-top opacity-[0.06] dark:opacity-[0.12] contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-900/80" />
        </div>

        {/* Dynamic Spotlight Glare Layer */}
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 z-10"
        />

        {/* Telemetry Scanline Sweep */}
        <div className="pointer-events-none absolute -inset-full bg-gradient-to-b from-transparent via-white/10 dark:via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out z-10" />

        {/* Content Top: Status + Headers + Description + Stacks */}
        <div className="relative z-20 flex flex-col p-6 sm:p-7 pb-4">
          {/* Status Badge + SYS Number + Category Icon */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-['Space_Grotesk'] text-[10px] uppercase tracking-wider font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {project.status}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                SYS {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            <span className="material-symbols-outlined text-[28px] text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              {index % 3 === 0 ? "database" : index % 3 === 1 ? "monitoring" : "memory"}
            </span>
          </div>

          {/* Project Title */}
          <h3 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight leading-tight">
            {project.title}
          </h3>

          {/* Description */}
          <p className="font-['Hanken_Grotesk'] text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2.5 line-clamp-3">
            {project.description}
          </p>

          {/* Technologies Chips */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[10px] text-slate-700 dark:text-slate-300 font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Content Bottom: Metrics Grid + Action Deck (Clean & Always Clickable) */}
        <div className="relative z-20 p-6 sm:p-7 pt-0 mt-auto flex flex-col gap-4">
          {/* Metrics Row (if available) */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {project.metrics.map((m) => (
                <div
                  key={m.label}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-center"
                >
                  <span className="block font-mono text-sm text-slate-950 dark:text-white font-bold leading-tight">
                    {m.value}
                  </span>
                  <span className="block font-mono text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Deck Bar */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-semibold transition-colors cursor-pointer select-none"
            >
              <span className="material-symbols-outlined text-[14px]">code</span>
              Source
            </a>

            <button
              type="button"
              onClick={handleSpecClick}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer select-none group/btn"
            >
              <span>View Spec</span>
              <span className="material-symbols-outlined text-[14px] transition-transform group-hover/btn:translate-x-0.5">
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
/*  Dynamic Bento Span Calculation for 3-Column Desktop Grid          */
/* ------------------------------------------------------------------ */

function getBentoSpanClass(index: number, total: number) {
  if (total <= 1) return "col-span-1 lg:col-span-3";
  if (total === 2) return index === 0 ? "col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-1";

  // Alternating pair pattern: Row 1 = [2, 1], Row 2 = [1, 2] summing to 3 cols
  const pairIndex = Math.floor(index / 2);
  const isEvenPair = pairIndex % 2 === 0;
  const isFirstInPair = index % 2 === 0;

  if (isEvenPair) {
    return isFirstInPair ? "col-span-1 lg:col-span-2" : "col-span-1 lg:col-span-1";
  } else {
    return isFirstInPair ? "col-span-1 lg:col-span-1" : "col-span-1 lg:col-span-2";
  }
}

/* ------------------------------------------------------------------ */
/*  Exported Grid with Scalability & Filtering                        */
/* ------------------------------------------------------------------ */

interface BentoProjectGridProps {
  projects: Project[];
}

export function BentoProjectGrid({ projects }: BentoProjectGridProps) {
  const [selectedTech, setSelectedTech] = useState<string>("All");
  const [showAll, setShowAll] = useState<boolean>(false);

  // Auto-extract unique top technologies for filter pills
  const techFilters = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach((p) => {
      (p.technologies || []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    const sorted = Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, 5);

    return ["All", ...sorted];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (selectedTech === "All") return projects;
    return projects.filter((p) =>
      p.technologies?.some((t) => t.toLowerCase() === selectedTech.toLowerCase())
    );
  }, [projects, selectedTech]);

  // Scalability threshold: display 4 by default, expand on demand
  const INITIAL_LIMIT = 4;
  const isExpandable = filteredProjects.length > INITIAL_LIMIT;
  const visibleProjects = showAll ? filteredProjects : filteredProjects.slice(0, INITIAL_LIMIT);

  return (
    <div className="flex flex-col gap-6">
      {/* Category Technology Filter Bar */}
      {techFilters.length > 2 && (
        <div className="flex items-center justify-start sm:justify-end overflow-x-auto pb-1">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {techFilters.map((tech) => {
              const isActive = selectedTech === tech;
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => {
                    setSelectedTech(tech);
                    setShowAll(false);
                  }}
                  className={`relative px-3.5 py-1.5 rounded-lg font-['Space_Grotesk'] text-xs font-semibold tracking-wide transition-colors cursor-pointer select-none whitespace-nowrap ${
                    isActive
                      ? "text-slate-950 dark:text-white"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTechFilter"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-xs"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tech}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bento Grid */}
      <StaggerReveal triggerKey={`${selectedTech}-${showAll}`}>
        <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-6">
          {visibleProjects.map((project, index) => (
            <BentoProjectCard
              key={project.id}
              project={project}
              index={index}
              className={getBentoSpanClass(index, visibleProjects.length)}
            />
          ))}
        </div>
      </StaggerReveal>

      {/* Anticipation for many projects: Expand / Load More Button */}
      {isExpandable && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md text-slate-800 dark:text-slate-200 font-['Space_Grotesk'] text-xs sm:text-sm font-semibold transition-all cursor-pointer group"
          >
            <span>
              {showAll
                ? "Show Less Featured Projects"
                : `View All Projects (${filteredProjects.length})`}
            </span>
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-y-0.5">
              {showAll ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
