"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { gsap, useGSAP } from "@/lib/gsap";
import { motion } from "motion/react";
import type { Certificate } from "@/data/certificates";

/* ------------------------------------------------------------------ */
/*  Cryptographic Hash Scrambler Component                             */
/* ------------------------------------------------------------------ */

const HEX_CHARS = "0123456789abcdef";

function HashScramble({ hash, isHovered }: { hash: string; isHovered: boolean }) {
  const [display, setDisplay] = useState(hash);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isHovered) {
      setDisplay(hash);
      return;
    }

    const duration = 400; // ms
    const startTime = performance.now();
    const len = hash.length;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const lockedChars = Math.floor(progress * len);

      let scrambled = "";
      for (let i = 0; i < len; i++) {
        if (hash[i] === "." || hash[i] === " " || hash[i] === "-") {
          scrambled += hash[i];
        } else if (i < lockedChars) {
          scrambled += hash[i];
        } else {
          scrambled += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];
        }
      }

      setDisplay(scrambled);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(hash);
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isHovered, hash]);

  return (
    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
      HASH: {display}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Certificate Card with Staggered Entrance & Hash Scramble   */
/* ------------------------------------------------------------------ */

interface CertCardProps {
  cert: Certificate;
}

function CertCard({ cert }: CertCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      data-cert-card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Icon & Status Row */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-slate-100 group-hover:bg-slate-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-950 transition-colors shadow-2xs">
            <span className="material-symbols-outlined text-[24px]">{cert.icon}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-['Space_Grotesk'] text-[10px] uppercase font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{cert.status}</span>
          </div>
        </div>

        {/* Title & Issuer */}
        <div>
          <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-medium truncate">
            {cert.issuer}
          </div>
          <h3 className="font-['Space_Grotesk'] text-[17px] leading-snug text-slate-950 dark:text-white font-bold mb-1 group-hover:text-black dark:group-hover:text-slate-100 transition-colors">
            {cert.title}
          </h3>
          <p className="font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-slate-400 leading-normal line-clamp-2">
            {cert.level}
          </p>
        </div>

        {/* Validity Matrix */}
        <div className="grid grid-cols-2 gap-1 py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px]">ISSUED</span>
            <span className="font-semibold">{cert.issued}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] truncate">{cert.validityLabel}</span>
            <span className="font-semibold truncate block">{cert.validityValue}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Deck */}
      <div className="pt-4 bg-slate-50/80 dark:bg-slate-800/40 -mx-6 -mb-6 px-6 pb-6 rounded-b-2xl border-t border-slate-100 dark:border-slate-800 mt-5">
        <div className="truncate mb-2.5">
          <HashScramble hash={cert.hash} isHovered={hovered} />
        </div>
        <a
          href={cert.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-mono text-xs font-semibold shadow-2xs transition-colors cursor-pointer select-none group/btn"
        >
          <span>{cert.verifyButtonText}</span>
          <span className="material-symbols-outlined text-[14px] transition-transform group-hover/btn:translate-x-0.5">
            launch
          </span>
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Certificates Grid with Filter & Scalability                       */
/* ------------------------------------------------------------------ */

interface CertificatesGridProps {
  certificates: Certificate[];
}

export function CertificatesGrid({ certificates }: CertificatesGridProps) {
  const [selectedIssuer, setSelectedIssuer] = useState<string>("All");
  const [showAll, setShowAll] = useState<boolean>(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Auto-extract unique issuers for filter pills
  const issuerFilters = useMemo(() => {
    const set = new Set<string>();
    certificates.forEach((c) => {
      if (c.issuer) set.add(c.issuer);
    });
    return ["All", ...Array.from(set)];
  }, [certificates]);

  const filteredCerts = useMemo(() => {
    if (selectedIssuer === "All") return certificates;
    return certificates.filter((c) => c.issuer === selectedIssuer);
  }, [certificates, selectedIssuer]);

  // Scalability threshold: display 4 by default, expand on demand
  const INITIAL_LIMIT = 4;
  const isExpandable = filteredCerts.length > INITIAL_LIMIT;
  const visibleCerts = showAll ? filteredCerts : filteredCerts.slice(0, INITIAL_LIMIT);

  // Staggered Perspective Reveal Animation
  useGSAP(
    () => {
      if (!gridRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const cards = gridRef.current.querySelectorAll("[data-cert-card]");
      if (!cards.length) return;

      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 28,
          rotateX: 12,
          transformPerspective: 1000,
          transformOrigin: "top center",
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: gridRef, dependencies: [selectedIssuer, showAll] }
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Category / Issuer Filter Bar (active when multiple issuers exist) */}
      {issuerFilters.length > 2 && (
        <div className="flex items-center justify-start sm:justify-end overflow-x-auto pb-1">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-2xs">
            {issuerFilters.map((issuer) => {
              const isActive = selectedIssuer === issuer;
              return (
                <button
                  key={issuer}
                  type="button"
                  onClick={() => {
                    setSelectedIssuer(issuer);
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
                      layoutId="activeCertFilter"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-xs"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{issuer}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsive Grid with Staggered Perspective Reveal */}
      <div
        ref={gridRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 [perspective:1000px]"
      >
        {visibleCerts.map((cert) => (
          <CertCard key={cert.id} cert={cert} />
        ))}
      </div>

      {/* Anticipation for many certificates: Expand / Load More Button */}
      {isExpandable && (
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-md text-slate-800 dark:text-slate-200 font-['Space_Grotesk'] text-xs sm:text-sm font-semibold transition-all cursor-pointer group"
          >
            <span>
              {showAll
                ? "Show Less Credentials"
                : `View All Credentials (${filteredCerts.length})`}
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
