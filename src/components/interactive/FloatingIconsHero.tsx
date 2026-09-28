"use client";

import React, { useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DownloadButton } from "@/components/ui/download-button";
import { PulsatingButton } from "./PulsatingButton";
import { HyperText } from "./HyperText";
import { BorderBeam } from "./BorderBeam";
import { BrandIcon } from "./BrandIcon";

export interface FloatingIconItem {
  id: number | string;
  name?: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  iconSlug?: string;
  iconSvg?: string;
  className: string;
}

interface FloatingIconProps {
  mouseX: React.MutableRefObject<number>;
  mouseY: React.MutableRefObject<number>;
  iconData: FloatingIconItem;
  index: number;
}

const FloatingIcon = ({ mouseX, mouseY, iconData, index }: FloatingIconProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 22 });
  const springY = useSpring(y, { stiffness: 300, damping: 22 });

  useEffect(() => {
    const handleMouseMove = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(mouseX.current - centerX, mouseY.current - centerY);

        // Repel threshold
        if (distance < 160) {
          const angle = Math.atan2(mouseY.current - centerY, mouseX.current - centerX);
          const force = (1 - distance / 160) * 55;
          x.set(-Math.cos(angle) * force);
          y.set(-Math.sin(angle) * force);
        } else {
          x.set(0);
          y.set(0);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y, mouseX, mouseY]);

  // Pseudo-random gentle floating per icon index
  const floatDuration = 5 + (index % 5) * 1.2;
  const floatDelay = (index % 4) * 0.4;

  const IconComp = iconData.icon;

  return (
    <motion.div
      ref={ref}
      style={{
        x: springX,
        y: springY,
      }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 0.1 + index * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn("absolute pointer-events-auto select-none z-0", iconData.className)}
    >
      {/* Floating Card */}
      <motion.div
        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 p-3 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 transition-shadow duration-300 group"
        animate={{
          y: [0, -7, 0, 7, 0],
          x: [0, 5, 0, -5, 0],
          rotate: [0, 4, 0, -4, 0],
        }}
        transition={{
          duration: floatDuration,
          delay: floatDelay,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {IconComp ? (
          <IconComp className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform duration-200" />
        ) : (
          <BrandIcon
            slug={iconData.iconSlug}
            name={iconData.name}
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-slate-800 dark:text-slate-100 group-hover:scale-110 transition-transform duration-200"
            initialClassName="font-mono text-xs md:text-sm font-bold text-slate-500"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export interface FloatingIconsHeroProps {
  title: string;
  subtitle: string;
  summary?: string;
  avatar?: string;
  name?: string;
  initials?: string;
  ctaText?: string;
  ctaHref?: string;
  cvPdf?: string;
  icons?: FloatingIconItem[];
  className?: string;
}

export function FloatingIconsHero({
  title,
  subtitle,
  summary,
  avatar,
  name,
  initials,
  ctaText = "Explore Works",
  ctaHref = "#projects",
  cvPdf,
  icons = defaultHeroIcons,
  className,
}: FloatingIconsHeroProps) {
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseX.current = event.clientX;
    mouseY.current = event.clientY;
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className={cn(
        "relative w-full min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24",
        className
      )}
    >
      {/* Ambient Specular Backdrop */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-gradient-to-b from-slate-300/35 dark:from-slate-700/20 via-slate-200/20 dark:via-slate-800/20 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-8 w-96 h-96 bg-slate-200/30 dark:bg-slate-800/30 blur-2xl pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-slate-200/25 dark:bg-slate-800/20 blur-3xl pointer-events-none rounded-full" />

      {/* Background Floating Tech Icons */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {icons.map((iconData, index) => (
          <FloatingIcon
            key={iconData.id}
            mouseX={mouseX}
            mouseY={mouseY}
            iconData={iconData}
            index={index}
          />
        ))}
      </div>

      {/* Foreground Hero Content Container */}
      <div className="max-w-[1200px] w-full mx-auto px-6 relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Headline & Summary */}
          <div className="lg:col-span-8 flex flex-col items-start text-left">
            <HyperText
              as="h1"
              className="font-['Space_Grotesk'] text-5xl sm:text-6xl lg:text-[74px] font-bold text-slate-950 dark:text-white tracking-tight leading-[1.05] mb-3"
              duration={900}
              delay={150}
              animateOnHover
            >
              {title}
            </HyperText>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <PulsatingButton
                variant="pulse"
                pulseColor="#f8f9ff"
                duration="2.4s"
                distance="10px"
                className="h-10 px-5 rounded-lg overflow-hidden font-['Space_Grotesk'] text-sm font-semibold bg-slate-950 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200"
                onClick={() => {
                  document
                    .querySelector(ctaHref)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {/* Grid stack: tombol selebar layer terlebar, slide bebas tanpa kepotong */}
                <span className="group grid">
                  <span className="col-start-1 row-start-1 inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300 ease-out group-hover:-translate-x-14 group-hover:opacity-0">
                    <span className="size-2 shrink-0 rounded-full bg-white dark:bg-slate-950"></span>
                    {ctaText}
                  </span>
                  <span className="col-start-1 row-start-1 inline-flex translate-x-14 items-center justify-center gap-2 whitespace-nowrap opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                    {ctaText}
                    <span className="material-symbols-outlined shrink-0 text-[18px]">arrow_forward</span>
                  </span>
                </span>
              </PulsatingButton>

              {cvPdf && (
                <DownloadButton
                  href={cvPdf}
                  filename={`${(name || "Resume").replace(/\s+/g, "_")}_CV.pdf`}
                  label="Download CV"
                  downloadingLabel="Downloading..."
                  doneLabel="Downloaded"
                />
              )}
            </motion.div>
          </div>

          {/* Architectural Portrait Contour */}
          {avatar && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-4 relative flex justify-center mt-6 lg:mt-0"
            >
              <ProfileFlipCard
                avatar={avatar}
                name={name}
                initials={initials}
                subtitle={subtitle}
                summary={summary}
              />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * 3D flip portrait card (CardFlip / kokonutui technique):
 * front = portrait with BorderBeam, back = name + subtitle + summary.
 * Flips on hover (desktop) and tap (touch devices).
 */
function ProfileFlipCard({
  avatar,
  name,
  initials,
  subtitle,
  summary,
}: {
  avatar: string;
  name?: string;
  initials?: string;
  subtitle?: string;
  summary?: string;
}) {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div
      className="group relative h-[340px] w-64 sm:w-72 [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped((f) => !f)}
    >
      <div
        className={cn(
          "relative h-full w-full",
          "[transform-style:preserve-3d]",
          "transition-[transform] duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "motion-reduce:transition-none",
          isFlipped ? "[transform:rotateY(180deg)]" : "[transform:rotateY(0deg)]"
        )}
      >
        {/* FRONT — portrait + border beams */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]",
            "overflow-hidden rounded-[2.5rem]",
            "bg-slate-100 dark:bg-slate-900",
            "shadow-2xl"
          )}
        >
          <img
            src={avatar}
            alt={`Stylized monochromatic high-contrast portrait of ${name || "Architect"}`}
            className="absolute inset-0 w-full h-full object-cover object-center grayscale contrast-125 opacity-95"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Traveling monochromatic light beams (slate-300 in light, translucent white & slate-700 in dark) */}
          <BorderBeam
            duration={6}
            size={400}
            borderWidth={3}
            className="[--color-via:#cbd5e1] dark:[--color-via:rgba(255,255,255,0.45)]"
          />
          <BorderBeam
            duration={6}
            delay={3}
            size={400}
            borderWidth={3}
            className="[--color-via:#94a3b8] dark:[--color-via:#334155]"
          />
        </div>

        {/* BACK — identity text (Slogan & Kata Penyemangat) */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]",
            "rounded-[2.5rem] p-6",
            "bg-gradient-to-b from-slate-100 to-white dark:from-slate-900 dark:to-slate-950",
            "border border-slate-200 dark:border-slate-800",
            "shadow-2xl",
            "flex flex-col text-center"
          )}
        >
          <div className="flex-1 flex flex-col justify-center items-center space-y-4 min-h-0">
            {initials && (
              <div className="flex items-center justify-center">
                <div className="size-14 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg">
                  <span className="font-['Space_Grotesk'] text-lg font-bold text-white dark:text-slate-950 tracking-widest">
                    {initials}
                  </span>
                </div>
              </div>
            )}
            {subtitle && (
              <p className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-850 dark:text-slate-100 leading-snug tracking-tight">
                {subtitle}
              </p>
            )}
            {summary && (
              <p className="font-['Hanken_Grotesk'] text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic px-1">
                "{summary.replace(/^["“”']+|["“”']+$/g, '')}"
              </p>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Hover / tap to flip
            </span>
            <Repeat2 aria-hidden="true" className="size-3.5 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export const defaultHeroIcons: FloatingIconItem[] = [
  // Top-left sector
  { id: 1, name: "TypeScript", iconSlug: "typescript", className: "top-[6%] left-[3%]" },
  { id: 2, name: "Rust", iconSlug: "rust", className: "top-[22%] left-[12%]" },
  { id: 3, name: "Go", iconSlug: "go", className: "top-[4%] left-[26%]" },
  { id: 4, name: "Astro", iconSlug: "astro", className: "top-[42%] left-[4%]" },
  
  // Bottom-left sector
  { id: 5, name: "React", iconSlug: "react", className: "top-[64%] left-[10%]" },
  { id: 6, name: "Tailwind CSS", iconSlug: "tailwindcss", className: "top-[82%] left-[3%]" },
  { id: 7, name: "PostgreSQL", iconSlug: "postgresql", className: "top-[86%] left-[22%]" },
  { id: 8, name: "Docker", iconSlug: "docker", className: "top-[70%] left-[32%]" },

  // Top-right sector
  { id: 9, name: "Next.js", iconSlug: "nextdotjs", className: "top-[4%] right-[28%]" },
  { id: 10, name: "Node.js", iconSlug: "nodedotjs", className: "top-[8%] right-[8%]" },
  { id: 11, name: "Cloudflare", iconSlug: "cloudflare", className: "top-[26%] right-[3%]" },
  { id: 12, name: "Vite", iconSlug: "vitedotjs", className: "top-[45%] right-[8%]" },

  // Bottom-right sector
  { id: 13, name: "Kubernetes", iconSlug: "kubernetes", className: "top-[68%] right-[4%]" },
  { id: 14, name: "Redis", iconSlug: "redis", className: "top-[84%] right-[12%]" },
  { id: 15, name: "GitHub", iconSlug: "github", className: "top-[85%] right-[28%]" },
  { id: 16, name: "GraphQL", iconSlug: "graphql", className: "top-[60%] right-[22%]" },
];
