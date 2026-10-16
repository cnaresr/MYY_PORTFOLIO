"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Project } from "@/data/projects";
import { BrandIcon } from "./BrandIcon";
import { formatRange } from "@/lib/formatDate";
import { resolveBrandSlug } from "@/lib/techBrands";
import { ExternalLink } from "lucide-react";

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
  onOpenVideo?: (project: Project) => void;
}

function ProjectCard({ project, index, onViewSpec, onOpenVideo }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // 3D Parallax Mouse Tilt Handlers with rAF coalescing and touch device guard
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0;
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // 5-degree subtle, tactile depth
      const rotX = -((y - centerY) / centerY) * 5;
      const rotY = ((x - centerX) / centerX) * 5;

      gsap.to(cardRef.current, {
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
    });
  };

  const handleMouseLeave = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    }
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

  const handleInspectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.video) {
      if (onOpenVideo) {
        onOpenVideo(project);
      } else if (typeof (window as any).openVideoModal === "function") {
        (window as any).openVideoModal(project.id);
      } else {
        window.dispatchEvent(
          new CustomEvent("open-video-modal", {
            detail: { projectId: project.id },
          })
        );
      }
    } else {
      handleSpecClick(e);
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

        {/* Whole-card click target.
            Rendered as a sibling overlay rather than a wrapper element so the
            "Source" link and "View Spec" button below stay valid — no button
            inside a button, and keyboard users still reach one clear control. */}
        <button
          type="button"
          onClick={handleInspectClick}
          aria-label={`Inspect ${project.title}`}
          className="absolute inset-0 z-[15] rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950"
        />

        {/* TOP: Hardware/Application Mockup Viewport */}
        <div className="p-4 sm:p-5 pb-0 relative z-10">
          <div className="relative w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800/80 shadow-md">
            {/* High-Resolution Screenshot Visual */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
              {!imgError && project.image ? (
                <img
                  src={project.image}
                  alt={project.title}
                  width={800}
                  height={450}
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

              {/* Hover Quick Action Overlay — decorative only.
                  The click is handled by the whole-card trigger above, so this
                  pill must never take pointer events itself.
                  No backdrop-blur: a backdrop-filter layer that animates opacity
                  forces an offscreen re-blur every frame for no readable gain at
                  2px, so the scrim just darkens a touch more instead. */}
              <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-['Space_Grotesk'] text-xs font-bold shadow-xl transition-all border border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[16px]" aria-hidden="true">visibility</span>
                  <span>Inspect</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Project Narrative & Stack
            No z-index here: without one this container does not form a stacking
            context, so the narrative stays under the whole-card trigger while
            the action deck can rise above it. */}
        <div className="p-5 sm:p-6 flex flex-col flex-1 relative">
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px] text-slate-700 dark:text-slate-300 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-colors"
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

          {/* Action Deck Bar — sits above the whole-card trigger so these two
              controls keep their own targets and the card cannot swallow them. */}
          <div className="relative z-20 flex items-center justify-between gap-3 pt-5 mt-auto border-t border-slate-100 dark:border-slate-800/80">
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
/*  Cinema Video Modal Player                                         */
/* ------------------------------------------------------------------ */

interface ProjectVideoModalProps {
  project: Project;
  onClose: () => void;
  onOpenSpec?: (id: string) => void;
}

function ProjectVideoModal({ project, onClose, onOpenSpec }: ProjectVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#070b14] rounded-2xl sm:rounded-3xl border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle CAD Blueprint Grid Watermark & Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-0" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-900 border-b border-slate-800 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200 font-['Space_Grotesk']">
              {project.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              ESC
            </span>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              ✕ CLOSE
            </button>
          </div>
        </div>

        {/* Video Player Canvas */}
        <div className="relative z-10 w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={project.video}
            controls
            autoPlay
            playsInline
            poster={project.image}
            className="w-full h-full object-contain"
          >
            Your browser does not support HTML5 video playback.
          </video>
        </div>

        {/* Bottom Information & Action Deck */}
        <div className="relative z-10 p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                {project.id.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Motion Reel Demonstration
              </span>
            </div>
            <h3
              id="video-modal-title"
              className="font-['Space_Grotesk'] text-base sm:text-lg font-bold text-white tracking-tight"
            >
              {project.title}
            </h3>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => onOpenSpec?.(project.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-['Space_Grotesk'] text-xs font-bold transition-all shadow-xs cursor-pointer select-none border border-slate-200 dark:border-slate-700"
            >
              <span>Inspect Architecture Spec</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-semibold transition-colors cursor-pointer"
            >
              Dismiss
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
  const [activeVideoProject, setActiveVideoProject] = useState<Project | null>(null);

  useEffect(() => {
    (window as any).openVideoModal = (targetId?: string) => {
      const found =
        projects?.find(
          (p) => p.id === targetId || p.id?.toLowerCase() === String(targetId).toLowerCase()
        ) || projects?.find((p) => p.video) || null;
      if (found && found.video) {
        setActiveVideoProject(found);
      }
    };

    const handleOpen = (e: any) => {
      const targetId = e.detail?.projectId;
      (window as any).openVideoModal(targetId);
    };

    window.addEventListener("open-video-modal" as any, handleOpen);
    return () => {
      window.removeEventListener("open-video-modal" as any, handleOpen);
      delete (window as any).openVideoModal;
    };
  }, [projects]);

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
              onOpenVideo={(p) => setActiveVideoProject(p)}
            />
          ))}
        </div>
      </StaggerReveal>

      {/* Cinema Video Modal */}
      {activeVideoProject && (
        <ProjectVideoModal
          project={activeVideoProject}
          onClose={() => setActiveVideoProject(null)}
          onOpenSpec={(id) => {
            setActiveVideoProject(null);
            if (typeof (window as any).openSpecModal === "function") {
              (window as any).openSpecModal(id);
            } else {
              window.dispatchEvent(
                new CustomEvent("open-spec-modal", { detail: { projectId: id } })
              );
            }
          }}
        />
      )}
    </div>
  );
}
