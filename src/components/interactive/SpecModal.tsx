import React, { useState, useEffect, useMemo } from 'react';
import type { Project } from '../../data/projects';
import { formatRange } from '../../lib/formatDate';
import { BrandIcon } from './BrandIcon';
import { resolveBrandSlug } from '../../lib/techBrands';
import {
  Terminal,
  Layers,
  Copy,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Cpu,
  Activity,
  X,
  Sparkles,
} from 'lucide-react';

interface SpecModalProps {
  projects: Project[];
}

interface ProjectArchProfile {
  badge: string;
  category: string;
  sla: string;
  innovations: { title: string; desc: string }[];
}

const PROJECT_ARCH_MAP: Record<string, ProjectArchProfile> = {
  'dashboard-web-map-contour': {
    badge: 'GIS // GEOSPATIAL VECTOR ENGINE',
    category: 'Geospatial Topography & Terrain Mapping',
    sla: 'Sub-16ms 60 FPS viewport re-render on 50,000+ vector coordinate points',
    innovations: [
      {
        title: 'Vector Contour Isoclines Computation',
        desc: 'Dynamic elevation isocline generation with D3.js and hardware-accelerated canvas mapping.',
      },
      {
        title: 'Asynchronous GeoJSON & Shapefile Pipeline',
        desc: 'Non-blocking spatial geometry parsing for high-density multi-polygon boundary overlays.',
      },
      {
        title: 'Hypsometric Elevation Interpolation',
        desc: 'Smooth sub-pixel color gradients mapped to topographic elevation datasets.',
      },
    ],
  },
  'weather-prediction-iot': {
    badge: 'IOT // TELEMETRY PREDICTIVE ML',
    category: 'Microclimate Sensors & Machine Learning',
    sla: 'Sub-50ms telemetry ingest latency with 99.8% sensor packet transmission reliability',
    innovations: [
      {
        title: 'Multi-Sensor Microcontroller Telemetry',
        desc: 'Continuous environmental data harvesting from Arduino/ESP32 sensor arrays with automated drift compensation.',
      },
      {
        title: 'TensorFlow Time-Series Recurrent Inference',
        desc: 'Deep learning time-series regression for localized barometric and atmospheric forecasts.',
      },
      {
        title: 'Event-Driven Asynchronous Pipeline',
        desc: 'Python Flask ingestion tier streaming verified sensor packets into PostgreSQL historical tables.',
      },
    ],
  },
  'pbl-lsp': {
    badge: 'EDTECH // DISTRIBUTED LMS PLATFORM',
    category: 'Project-Based Learning Management System',
    sla: 'Zero-conflict multi-user state synchronization across synchronous class grading sessions',
    innovations: [
      {
        title: 'Real-Time Competency Rubric Engine',
        desc: 'Multi-criteria evaluation matrices updating student assessment scores and proficiency metrics in real time.',
      },
      {
        title: 'Modular REST API & Document Modeling',
        desc: 'Node.js and Express backend with MongoDB polymorphic document schemas for flexible team milestones.',
      },
      {
        title: 'Multi-Tier Role-Based Security (RBAC)',
        desc: 'Strict authorization barriers separating student workspaces, mentor reviews, and institution audits.',
      },
    ],
  },
  'app-padi': {
    badge: 'MOBILE // REALTIME PRESENCE PLATFORM',
    category: 'Digital Presence & Geofenced Mobile System',
    sla: 'Sub-100ms GPS verification with 99.9% check-in transaction settlement guarantee',
    innovations: [
      {
        title: 'High-Integrity GPS Geofence Verification',
        desc: 'Mathematical radius boundary enforcement preventing mock locations and spoofed check-ins.',
      },
      {
        title: 'Prisma ORM ACID Transactional Operations',
        desc: 'Strict relational constraint enforcement with PostgreSQL for tamper-proof employee attendance histories.',
      },
      {
        title: 'Cross-Platform Native Experience',
        desc: 'Responsive mobile interface engineered in Flutter with optimistic UI updates and local persistence.',
      },
    ],
  },
  'univnews': {
    badge: 'AGGREGATOR // HIGH-THROUGHPUT FEED',
    category: 'Multi-Campus News Aggregator & Discovery',
    sla: 'Sub-200ms feed synchronization with zero cumulative layout shift (CLS < 0.01)',
    innovations: [
      {
        title: 'Concurrent Multi-Campus Feed Aggregation',
        desc: 'Asynchronous fetch pipelines normalizing distinct RSS/REST feeds into a unified schema.',
      },
      {
        title: 'Stale-While-Revalidate Client Caching',
        desc: 'Intelligent client caching with Axios reducing server roundtrips and accelerating instant navigation.',
      },
      {
        title: 'Sub-5ms Client-Side Fuzzy Search',
        desc: 'In-memory inverted index enabling instantaneous filtering across thousands of campus news dispatches.',
      },
    ],
  },
};

function getArchProfile(project: Project): ProjectArchProfile {
  const key = project.id?.toLowerCase();
  if (PROJECT_ARCH_MAP[key]) return PROJECT_ARCH_MAP[key];

  return {
    badge: `SYSTEM // ${project.status?.toUpperCase() || 'PROD ARCHITECTURE'}`,
    category: project.technologies?.[0] ? `${project.technologies[0]} Architecture Platform` : 'Software Engineering System',
    sla: 'Sub-100ms response time with 99.9% uptime SLA across distributed clients',
    innovations: [
      {
        title: 'Modular High-Performance Architecture',
        desc: `Engineered with ${project.technologies?.slice(0, 3).join(', ') || 'modern technology stack'} for maximum efficiency and maintainability.`,
      },
      {
        title: 'Optimized Data & Event Flow',
        desc: 'Streamlined state management and asynchronous transaction dispatch ensuring minimal latency.',
      },
      {
        title: 'Strict Quality & Reliability Guardrails',
        desc: 'Comprehensive error handling, graceful fallbacks, and resilient client-server synchronization.',
      },
    ],
  };
}

export const SpecModal: React.FC<SpecModalProps> = ({ projects }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'stack'>('specs');
  const [idCopied, setIdCopied] = useState(false);

  const currentIndex = useMemo(() => {
    if (!activeProject || !projects || projects.length === 0) return -1;
    return projects.findIndex((p) => p.id === activeProject.id);
  }, [activeProject, projects]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < (projects?.length || 0) - 1;

  const handlePrev = () => {
    if (hasPrev) {
      setActiveProject(projects[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setActiveProject(projects[currentIndex + 1]);
    }
  };

  useEffect(() => {
    (window as any).openSpecModal = (targetId?: string) => {
      const found =
        projects?.find(
          (p) => p.id === targetId || p.id?.toLowerCase() === String(targetId).toLowerCase()
        ) || (projects && projects.length > 0 ? projects[0] : null);

      if (found) {
        setActiveProject(found);
        setActiveTab('specs');
      }
    };

    const handleOpen = (e: any) => {
      const targetId = e.detail?.projectId;
      (window as any).openSpecModal(targetId);
    };

    window.addEventListener('open-spec-modal' as any, handleOpen);
    return () => {
      window.removeEventListener('open-spec-modal' as any, handleOpen);
      delete (window as any).openSpecModal;
    };
  }, [projects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeProject) return;

      if (e.key === 'Escape') {
        setActiveProject(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject, currentIndex, hasPrev, hasNext, projects]);

  if (!activeProject) return null;

  const profile = getArchProfile(activeProject);

  const handleCopyId = () => {
    navigator.clipboard.writeText(activeProject.id);
    setIdCopied(true);
    setTimeout(() => setIdCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setActiveProject(null)}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0b101b] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle CAD Blueprint Grid Watermark & Atmospheric Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 dark:opacity-15 pointer-events-none z-0" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none z-0" />

        {/* ------------------------------------------------------------------ */}
        {/* TOP BAR / TERMINAL HUD HEADER                                      */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md select-none shrink-0">
          {/* Left: macOS Dots + Spec Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveProject(null)}
                title="Close Modal"
                className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity cursor-pointer group flex items-center justify-center"
              >
                <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-slate-800">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                spec://architecture/{activeProject.id}.sys
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-[11px] font-mono text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Copy Spec ID"
              >
                {idCopied ? (
                  <span className="text-emerald-500 font-bold text-[10px]">COPIED</span>
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>

          {/* Center: System Project Switcher Carousel Controls */}
          {projects && projects.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs font-mono text-xs">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                title="Previous Project (Arrow Left)"
                aria-label="Previous project"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-[11px] font-bold text-slate-800 dark:text-slate-200">
                SYS {String(currentIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
                title="Next Project (Arrow Right)"
                aria-label="Next project"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Right: Quick Close Button with ESC Key Badge */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveProject(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close specification modal"
            >
              <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                ESC
              </span>
              <span>✕ CLOSE</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* HERO SHOWCASE HEADER: TITLE, BADGES & PREVIEW                      */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 px-5 sm:px-7 pt-6 pb-5 bg-gradient-to-b from-slate-50/50 dark:from-slate-900/30 to-transparent border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Left Column: Title, Metadata Badges & Actions */}
            <div className={activeProject.image ? "md:col-span-8 flex flex-col justify-between" : "md:col-span-12 flex flex-col justify-between"}>
              <div>
                {/* Status Badges Row */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-mono text-[10px] font-bold tracking-wider">
                    SYS {String(currentIndex + 1).padStart(2, '0')}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeProject.status?.toUpperCase() || 'PROD // SHIPPED'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono text-[10px]">
                    {formatRange(activeProject.startDate, activeProject.endDate)}
                  </span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-mono text-[10px]">
                    {profile.badge}
                  </span>
                </div>

                {/* Project Title */}
                <h2
                  id="spec-modal-title"
                  className="font-['Space_Grotesk'] text-xl sm:text-2xl md:text-3xl font-bold text-slate-950 dark:text-white tracking-tight leading-tight"
                >
                  {activeProject.title}
                </h2>

                {/* Project Description */}
                <p className="font-['Hanken_Grotesk'] text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed max-w-2xl">
                  {activeProject.description}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-['Space_Grotesk'] text-xs font-bold transition-all shadow-xs cursor-pointer select-none"
                >
                  <span>View Repository</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Technologies Mini Chips Preview */}
                <div className="flex items-center gap-1.5 overflow-hidden pl-2">
                  {activeProject.technologies?.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 font-mono text-[10px] text-slate-700 dark:text-slate-300"
                    >
                      <BrandIcon
                        slug={resolveBrandSlug(tech)}
                        name={tech}
                        className="w-3 h-3"
                      />
                      <span className="hidden sm:inline">{tech}</span>
                    </span>
                  ))}
                  {activeProject.technologies && activeProject.technologies.length > 5 && (
                    <span className="font-mono text-[10px] text-slate-400">
                      +{activeProject.technologies.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: High-Res Screenshot Mockup Frame */}
            {activeProject.image && (
              <div className="hidden md:block md:col-span-4">
                <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800/90 shadow-lg group">
                  {/* macOS header on screenshot */}
                  <div className="flex items-center px-2.5 py-1.5 bg-slate-900/90 border-b border-slate-800 select-none">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                      <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                      <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="ml-2 font-mono text-[9px] text-slate-400 truncate">
                      {activeProject.id}.preview
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                    <img
                      src={activeProject.image}
                      alt={activeProject.title}
                      className="w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-white/90">
                      <span className="bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
                        {profile.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* INTERACTIVE NAVIGATION TABS                                        */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 flex items-center gap-1.5 px-4 sm:px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar font-mono text-xs shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Architecture Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stack')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'stack'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stack &amp; Metrics</span>
          </button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MODAL BODY CONTENT                                                 */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* ================================================================ */}
          {/* TAB 1: ARCHITECTURE SPECS                                        */}
          {/* ================================================================ */}
          {activeTab === 'specs' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Architectural Abstract Blueprint Callout */}
              <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    SYSTEM ARCHITECTURE SPECIFICATION ABSTRACT
                  </span>
                  <span className="hidden sm:inline font-mono">SPEC REF // {activeProject.id.toUpperCase()}</span>
                </div>
                <p className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeProject.abstract ||
                    `${activeProject.title} implements modular client-server architectures, responsive rendering boundaries, and resilient asynchronous telemetry.`}
                </p>
              </div>

              {/* Key Architectural Innovations Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Key Architectural Innovations</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {profile.innovations.map((item, idx) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            INNOVATION 0{idx + 1}
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500/80" />
                        </div>
                        <h4 className="font-['Space_Grotesk'] text-sm font-bold text-slate-950 dark:text-white leading-snug">
                          {item.title}
                        </h4>
                        <p className="font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SLA & Reliability Guarantee Box */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                      PRODUCTION SLA &amp; STABILITY GUARANTEE
                    </span>
                    <p className="font-['Hanken_Grotesk'] text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium">
                      {profile.sla}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>ONLINE // 99.99%</span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: STACK & METRICS                                           */}
          {/* ================================================================ */}
          {activeTab === 'stack' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Primary Performance Metrics Cards */}
              {activeProject.metrics && activeProject.metrics.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                    <Activity className="w-4 h-4 text-cyan-500" />
                    <span>Telemetry &amp; Production Metrics</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {activeProject.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-2xs"
                      >
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                          {metric.label}
                        </span>
                        <span className="font-mono text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies Architecture Breakdown */}
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3">
                  <Cpu className="w-4 h-4 text-emerald-500" />
                  <span>Verified Technology Stack Breakdown</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeProject.technologies?.map((tech, index) => (
                    <div
                      key={tech}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-2xs flex items-center gap-3"
                    >
                      <BrandIcon
                        slug={resolveBrandSlug(tech)}
                        name={tech}
                        className="w-5 h-5 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-slate-100 block truncate">
                          {tech}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                          {index === 0
                            ? 'Primary Core'
                            : index === 1
                            ? 'Platform / Engine'
                            : index === 2
                            ? 'Data / State'
                            : 'Runtime / Tool'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engineering Standards Checklist */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <span className="font-mono text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  ARCHITECTURAL COMPLIANCE &amp; QUALITY METRICS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Strict Type Safety &amp; AST Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Responsive Layout &amp; Zero CLS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Stateless Micro-Islands Architecture</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* MODAL FOOTER CONTROLS                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-7 py-3.5 bg-slate-100/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">ARCHITECTURE SYSTEM SPECIFICATION ENGINE // CEZAR NARESWARA RESPATI</span>
            <span className="sm:hidden font-bold">SYS {String(currentIndex + 1).padStart(2, '0')} SPEC</span>
          </div>

          <div className="flex items-center gap-2.5">
            {projects && projects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none font-mono text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none font-mono text-xs font-semibold transition-colors cursor-pointer"
                >
                  Next →
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveProject(null)}
              className="px-4 py-1.5 rounded-lg bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-mono text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
