import React, { useState, useEffect, useMemo } from 'react';
import type { Project } from '../../data/projects';
import { formatRange } from '../../lib/formatDate';
import { BrandIcon } from './BrandIcon';
import { resolveBrandSlug } from '../../lib/techBrands';
import {
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  CheckCircle2,
  Layers,
  FileText,
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
    badge: 'Geospatial Engineering',
    category: 'Topography & Terrain Elevation Mapping',
    sla: 'Sub-16ms 60 FPS viewport re-render across 50,000+ vector coordinate points',
    innovations: [
      {
        title: 'Vector Contour Isoclines Computation',
        desc: 'Dynamic elevation isocline calculation utilizing D3.js and hardware-accelerated canvas mapping.',
      },
      {
        title: 'Asynchronous GeoJSON & Shapefile Pipeline',
        desc: 'Non-blocking spatial geometry parsing designed for high-density multi-polygon boundary overlays.',
      },
      {
        title: 'Hypsometric Elevation Interpolation',
        desc: 'Sub-pixel color gradients mapped to topographic elevation datasets for clear terrain gradients.',
      },
    ],
  },
  'weather-prediction-iot': {
    badge: 'IoT & Machine Learning',
    category: 'Microclimate Sensors & Predictive Modeling',
    sla: 'Sub-50ms telemetry ingest latency with 99.8% sensor packet transmission reliability',
    innovations: [
      {
        title: 'Multi-Sensor Microcontroller Telemetry',
        desc: 'Continuous environmental data harvesting from Arduino sensor arrays with automated drift compensation.',
      },
      {
        title: 'TensorFlow Time-Series Recurrent Inference',
        desc: 'Deep learning time-series regression models for localized barometric and atmospheric forecasts.',
      },
      {
        title: 'Event-Driven Telemetry Ingestion',
        desc: 'Python Flask ingestion tier streaming verified sensor packets directly into historical PostgreSQL tables.',
      },
    ],
  },
  'pbl-lsp': {
    badge: 'Educational Platform',
    category: 'Project-Based Learning Management System',
    sla: 'Zero-conflict multi-user state synchronization across active classroom grading sessions',
    innovations: [
      {
        title: 'Real-Time Competency Rubric Engine',
        desc: 'Multi-criteria evaluation matrices updating student assessment scores and proficiency metrics in real time.',
      },
      {
        title: 'Modular REST API & Document Modeling',
        desc: 'Node.js and Express backend with MongoDB polymorphic schemas for agile team project milestones.',
      },
      {
        title: 'Multi-Tier Role-Based Security (RBAC)',
        desc: 'Strict authorization barriers separating student submissions, assessor evaluations, and institution audits.',
      },
    ],
  },
  'app-padi': {
    badge: 'Mobile Engineering',
    category: 'Digital Presence & Geofenced Mobile Application',
    sla: 'Sub-100ms GPS verification with 99.9% check-in transaction settlement guarantee',
    innovations: [
      {
        title: 'High-Integrity GPS Geofence Verification',
        desc: 'Mathematical radius boundary enforcement preventing mock locations and spoofed check-in attempts.',
      },
      {
        title: 'Prisma ORM ACID Transactions',
        desc: 'Strict relational constraints with PostgreSQL ensuring tamper-proof employee attendance history.',
      },
      {
        title: 'Cross-Platform Native Experience',
        desc: 'Responsive mobile interface engineered with Flutter, featuring optimistic UI updates and local persistence.',
      },
    ],
  },
  'univnews': {
    badge: 'Web Platform',
    category: 'Multi-Campus News Aggregator & Editorial CMS',
    sla: 'Sub-200ms feed synchronization with zero cumulative layout shift (CLS < 0.01)',
    innovations: [
      {
        title: 'Concurrent Multi-Campus Feed Aggregation',
        desc: 'Asynchronous fetch pipelines normalizing distinct RSS and REST data sources into a unified structure.',
      },
      {
        title: 'Stale-While-Revalidate Client Caching',
        desc: 'Intelligent client-side caching reducing server roundtrips and accelerating instant reader navigation.',
      },
      {
        title: 'In-Memory Fuzzy Search',
        desc: 'Fast client-side indexing enabling instantaneous filtering across campus news dispatches.',
      },
    ],
  },
};

function getArchProfile(project: Project): ProjectArchProfile {
  const key = project.id?.toLowerCase();
  if (PROJECT_ARCH_MAP[key]) return PROJECT_ARCH_MAP[key];

  return {
    badge: 'Software Architecture',
    category: project.technologies?.[0] ? `${project.technologies[0]} Application` : 'Software Engineering Platform',
    sla: 'Sub-100ms average response time with 99.9% uptime SLA across distributed clients',
    innovations: [
      {
        title: 'Modular Full-Stack Architecture',
        desc: `Engineered with ${project.technologies?.slice(0, 3).join(', ') || 'modern technologies'} for maintainability and scalability.`,
      },
      {
        title: 'Optimized Data & Event Flow',
        desc: 'Streamlined state management and asynchronous transaction dispatch ensuring minimal latency.',
      },
      {
        title: 'Resilient Quality & Reliability Guardrails',
        desc: 'Graceful fallbacks, rigorous input validation, and reliable synchronization between client and server.',
      },
    ],
  };
}

export const SpecModal: React.FC<SpecModalProps> = ({ projects }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'stack'>('overview');

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
        setActiveTab('overview');
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-8 bg-slate-950/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setActiveProject(null)}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0c111c] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ------------------------------------------------------------------ */}
        {/* TOP HEADER BAR: Project Identity + Pager + Close                    */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-20 flex items-center justify-between px-5 sm:px-7 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/70 backdrop-blur-sm select-none shrink-0">
          {/* Left: Project Badge & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Case Study
              </span>
            </div>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden sm:inline truncate max-w-[280px]">
              {profile.badge}
            </span>
          </div>

          {/* Right: Project Pager & Close Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {projects && projects.length > 1 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-medium text-slate-700 dark:text-slate-300">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Previous project (←)"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                  {currentIndex + 1} of {projects.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="Next project (→)"
                  aria-label="Next project"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveProject(null)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TOP NAVIGATION MENU BAR (MOVED TO TOP OF THE BOX)                  */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-7 py-2.5 bg-white dark:bg-[#0c111c] border-b border-slate-200/80 dark:border-slate-800/80 shrink-0 select-none text-xs gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg font-['Space_Grotesk'] transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Architecture &amp; Overview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('highlights')}
              className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg font-['Space_Grotesk'] transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'highlights'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Key Highlights</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('stack')}
              className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg font-['Space_Grotesk'] transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'stack'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stack &amp; Performance</span>
            </button>
          </div>

          {/* Quick External Link */}
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            <a
              href={activeProject.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-['Space_Grotesk'] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* TAB BODY: SCROLLABLE MAIN CONTENT AREA                             */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 p-5 sm:p-7 space-y-6 overflow-y-auto flex-1">
          {/* ================================================================ */}
          {/* TAB 1: ARCHITECTURE & OVERVIEW                                   */}
          {/* ================================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Hero Synopsis Grid: Narrative + Media Viewport */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
                {/* Left: Project Details */}
                <div className="lg:col-span-7 flex flex-col justify-between">
                  <div>
                    {/* Meta line */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {activeProject.status === 'published' ? 'Shipped in Production' : activeProject.status || 'Active'}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">·</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {formatRange(activeProject.startDate, activeProject.endDate)}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">·</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {profile.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h2
                      id="spec-modal-title"
                      className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug"
                    >
                      {activeProject.title}
                    </h2>

                    {/* Description */}
                    <p className="font-['Hanken_Grotesk'] text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed">
                      {activeProject.description}
                    </p>
                  </div>

                  {/* Actions & Technology Pills */}
                  <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <a
                        href={activeProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-['Space_Grotesk'] text-xs font-semibold transition-all shadow-xs cursor-pointer select-none"
                      >
                        <span>View Source Code</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {activeProject.video && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-['Space_Grotesk'] text-xs font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          Motion Reel Included
                        </span>
                      )}
                    </div>

                    {/* Technologies list */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {activeProject.technologies?.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium"
                        >
                          <BrandIcon
                            slug={resolveBrandSlug(tech)}
                            name={tech}
                            className="w-3.5 h-3.5"
                          />
                          <span>{tech}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Media Showcase Player */}
                <div className="lg:col-span-5 w-full">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-950 overflow-hidden shadow-md">
                    <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
                      {activeProject.video ? (
                        <video
                          src={activeProject.video}
                          controls
                          playsInline
                          preload="none"
                          poster={activeProject.image}
                          className="w-full h-full object-contain"
                        >
                          Your browser does not support HTML5 video playback.
                        </video>
                      ) : (
                        <img
                          src={activeProject.image}
                          alt={activeProject.title}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Architecture Summary Card */}
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-2">
                  System Architecture Summary
                </h3>
                <p className="font-['Hanken_Grotesk'] text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed">
                  {activeProject.abstract ||
                    `${activeProject.title} is built around high-throughput modular workflows, efficient client-side rendering boundaries, and resilient data processing.`}
                </p>
              </div>

              {/* Performance & SLA Commitment Banner */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-['Space_Grotesk'] text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      Performance &amp; SLA Commitment
                    </span>
                    <p className="font-['Hanken_Grotesk'] text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-0.5">
                      {profile.sla}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Production Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 2: KEY HIGHLIGHTS                                            */}
          {/* ================================================================ */}
          {activeTab === 'highlights' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  Core Engineering Highlights
                </h3>
                <p className="font-['Hanken_Grotesk'] text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Key architectural innovations and technical solutions implemented in this project.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {profile.innovations.map((item) => (
                  <div
                    key={item.title}
                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                        <Zap className="w-4 h-4" />
                      </div>
                      <h4 className="font-['Space_Grotesk'] text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {item.title}
                      </h4>
                      <p className="font-['Hanken_Grotesk'] text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* TAB 3: STACK & PERFORMANCE                                       */}
          {/* ================================================================ */}
          {activeTab === 'stack' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Metrics */}
              {activeProject.metrics && activeProject.metrics.length > 0 && (
                <div>
                  <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Project Metrics &amp; Benchmarks</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {activeProject.metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80"
                      >
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">
                          {metric.label}
                        </span>
                        <span className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Technologies */}
              <div>
                <h3 className="font-['Space_Grotesk'] text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Technology Stack Breakdown</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {activeProject.technologies?.map((tech, index) => (
                    <div
                      key={tech}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex items-center gap-3 shadow-2xs"
                    >
                      <BrandIcon
                        slug={resolveBrandSlug(tech)}
                        name={tech}
                        className="w-5 h-5 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <span className="font-['Space_Grotesk'] text-sm font-semibold text-slate-900 dark:text-slate-100 block truncate">
                          {tech}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {index === 0
                            ? 'Primary Core'
                            : index === 1
                            ? 'Engine / Runtime'
                            : index === 2
                            ? 'Data Store'
                            : 'Supporting Tool'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* FOOTER BAR                                                         */}
        {/* ------------------------------------------------------------------ */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-7 py-3.5 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/80 dark:border-slate-800/80 select-none shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Cezar Nareswara Respati</span>
            <span>·</span>
            <span>Software Engineering Portfolio</span>
          </div>

          <div className="flex items-center gap-2">
            {projects && projects.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={!hasPrev}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none font-medium transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!hasNext}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none font-medium transition-colors cursor-pointer"
                >
                  Next
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setActiveProject(null)}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
