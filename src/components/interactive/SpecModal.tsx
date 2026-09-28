import React, { useState, useEffect } from 'react';
import type { Project } from '../../data/projects';
import { formatRange } from '../../lib/formatDate';
import { Terminal, Network, Code, Copy, Check, ShieldCheck, Zap } from 'lucide-react';

interface SpecModalProps {
  projects: Project[];
}

const activeIndex = (list: Project[], id: string): number =>
  list.findIndex((p) => p.id === id);

export const SpecModal: React.FC<SpecModalProps> = ({ projects }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'specs' | 'topology' | 'json'>('specs');
  const [jsonCopied, setJsonCopied] = useState(false);

  useEffect(() => {
    (window as any).openSpecModal = (targetId?: string) => {
      const found = projects?.find(
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
      if (e.key === 'Escape' && activeProject) {
        setActiveProject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProject]);

  if (!activeProject) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeProject, null, 2));
    setJsonCopied(true);
    setTimeout(() => setJsonCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spec-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setActiveProject(null)}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle blueprint CAD wireframe grid watermark */}
        <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none z-0" />
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 text-white select-none border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
            <span className="font-mono text-xs text-slate-300 ml-2">
              spec://architecture/{activeProject.id}.sys
            </span>
          </div>
          <button
            onClick={() => setActiveProject(null)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-mono px-2 py-1 rounded hover:bg-slate-800"
            aria-label="Close specification modal"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Tab Switcher Bar */}
        <div className="flex items-center gap-1 px-6 pt-4 pb-2 bg-slate-50 border-b border-slate-200 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'specs'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Architecture Specs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topology')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'topology'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>System Topology</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              activeTab === 'json'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw JSON Schema</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Main Title Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-mono text-[10px] font-bold tracking-wider">
                SYS {String(activeIndex(projects, activeProject.id) + 1).padStart(2, '0')}
              </span>
              <span className="font-mono text-xs text-slate-500">
                {formatRange(activeProject.startDate, activeProject.endDate)} • {activeProject.status}
              </span>
            </div>
            <h3
              id="spec-modal-title"
              className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight"
            >
              {activeProject.title}
            </h3>
            <p className="font-['Hanken_Grotesk'] text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              {activeProject.description}
            </p>
          </div>

          {/* TAB 1: ARCHITECTURE SPECS */}
          {activeTab === 'specs' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Abstract callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-['Space_Grotesk'] text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">
                  SYSTEM ARCHITECTURE SPECIFICATION
                </span>
                <p className="font-mono text-xs text-slate-800 leading-relaxed">
                  {activeProject.abstract ||
                    `${activeProject.title} delivers high-throughput distributed computation with low-latency streaming guarantees and zero-copy io_uring dispatch.`}
                </p>
              </div>

              {/* Architectural Innovations */}
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 uppercase">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Key Architectural Innovations</span>
                </div>
                <ul className="space-y-1.5 text-xs font-mono text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">›</span>
                    <span>Zero-copy memory arena allocation with lock-free circular buffer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">›</span>
                    <span>Sub-millisecond partition lease transfers over multi-region Raft clusters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">›</span>
                    <span>Edge streaming chunked HTML with zero initial JavaScript baseline</span>
                  </li>
                </ul>
              </div>

              {/* SLA Guarantee Box */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs font-mono text-emerald-950">
                  <strong className="font-bold">SLA Guarantee:</strong> Sub-2ms P99 latency at 450k TPS ingest rate across multi-zone edge nodes.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYSTEM TOPOLOGY */}
          {activeTab === 'topology' && (
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-white space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  DISTRIBUTED DATA PIPELINE TOPOLOGY
                </span>
                <span>EDGE ISOMORPHIC RUNTIME</span>
              </div>

              {/* Visual SVG Data Flow Node Graph */}
              <div className="py-4">
                <svg viewBox="0 0 600 140" className="w-full h-36">
                  <defs>
                    <linearGradient id="streamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>

                  {/* Connecting Data Pipeline Lines */}
                  <line x1="100" y1="70" x2="200" y2="70" stroke="url(#streamGrad)" strokeWidth="2.5" strokeDasharray="4 4" />
                  <line x1="260" y1="70" x2="360" y2="70" stroke="url(#streamGrad)" strokeWidth="2.5" strokeDasharray="4 4" />
                  <line x1="420" y1="70" x2="510" y2="70" stroke="url(#streamGrad)" strokeWidth="2.5" strokeDasharray="4 4" />

                  {/* Node 1: Edge Client */}
                  <rect x="20" y="45" width="80" height="50" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                  <text x="60" y="68" fill="#f8fafc" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">CLIENT</text>
                  <text x="60" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">IoT / Browser</text>

                  {/* Node 2: Cloudflare Edge Worker */}
                  <rect x="180" y="45" width="90" height="50" rx="8" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                  <text x="225" y="68" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">EDGE POP</text>
                  <text x="225" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Cloudflare KV</text>

                  {/* Node 3: Ingest Buffer / Rust Engine */}
                  <rect x="340" y="45" width="95" height="50" rx="8" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
                  <text x="387" y="68" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">RUST BUFFER</text>
                  <text x="387" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">io_uring Arena</text>

                  {/* Node 4: Sharded Database */}
                  <rect x="500" y="45" width="85" height="50" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="542" y="68" fill="#fbbf24" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">SHARDS</text>
                  <text x="542" y="82" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">Postgres Citus</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Throughput: <strong className="text-white">450,000 TPS</strong></span>
                <span>Latency P99: <strong className="text-emerald-400">&lt; 1.8ms</strong></span>
                <span>Zero Database Serialization Loss</span>
              </div>
            </div>
          )}

          {/* TAB 3: RAW JSON SCHEMA */}
          {activeTab === 'json' && (
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-4 text-white font-mono text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                <span>content/projects.json payload schema</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                >
                  {jsonCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-64 overflow-y-auto text-[11px] text-emerald-300 leading-relaxed">
                {JSON.stringify(activeProject, null, 2)}
              </pre>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <a
              href={activeProject.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 font-mono text-xs font-semibold transition-colors"
            >
              <span>View Source on GitHub</span>
              <span className="text-[14px]">↗</span>
            </a>
            <button
              onClick={() => setActiveProject(null)}
              className="px-5 py-2 rounded-lg bg-slate-950 text-white font-mono text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
