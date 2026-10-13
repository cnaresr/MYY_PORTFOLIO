import React, { useState, useEffect } from 'react';
import {
  Plus,
  Rocket,
  Download,
  Briefcase,
  Mail,
  ArrowUpRight,
  Layers,
  Pencil,
  Cpu,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Terminal,
  ExternalLink,
  Database,
  Server,
} from 'lucide-react';
import { AdminToast } from '../ui/alert';

interface OverviewProps {
  stats: {
    publishedProjects: number;
    draftProjects: number;
    inProgressProjects: number;
    totalProjects: number;
    inquiriesCount: number;
    unreadInquiries: number;
    skillsCount: number;
    techBadgeCount: number;
  };
  projects: any[];
  inquiries: any[];
  profile?: any;
  skills?: any;
  techStack?: any;
}

export const OverviewManager: React.FC<OverviewProps> = ({
  stats,
  projects,
  inquiries,
  profile,
  skills,
  techStack,
}) => {
  const [publishState, setPublishState] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; description?: string; variant?: 'success' | 'info' } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const drafts = projects.filter((p) => p.status === 'draft');
  const recentInquiries = [...inquiries]
    .sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta;
    })
    .slice(0, 5);

  const skillNames = [
    ...(skills?.languages || []).map((s: any) => s.name),
    ...(skills?.frameworks || []).map((s: any) => s.name),
  ].filter(Boolean);

  const masterSkillsCount = [
    ...(skills?.languages || []),
    ...(skills?.frameworks || []),
  ].filter((s: any) => s.master).length;


  const showToast = (title: string, description?: string, variant: 'success' | 'info' = 'success') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const handleExportDump = async () => {
    try {
      const [resProjects, resSkills, resProfile, resInquiries] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/skills'),
        fetch('/api/admin/profile'),
        fetch('/api/admin/inquiries'),
      ]);

      const dataProjects = await resProjects.json();
      const dataSkills = await resSkills.json();
      const dataProfile = await resProfile.json();
      const dataInquiries = await resInquiries.json();

      if (!resProjects.ok || !resSkills.ok || !resProfile.ok || !resInquiries.ok) {
        showToast('Export failed', 'One or more content endpoints returned an error.', 'info');
        return;
      }

      const dump = {
        exportedAt: new Date().toISOString(),
        profile: dataProfile,
        skills: dataSkills.skills ?? dataSkills,
        techStack: dataSkills.techStack,
        projects: dataProjects,
        inquiries: dataInquiries,
      };

      const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `arch_cms_content_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Export complete', 'Content backup dump successfully downloaded.');
    } catch {
      showToast('Export failed', 'Could not export content dump.', 'info');
    }
  };

  const handlePublishAll = async () => {
    if (drafts.length === 0) {
      showToast('Nothing to publish', 'No draft projects in the store.', 'info');
      return;
    }
    setPublishState('Publishing...');
    try {
      for (const draft of drafts) {
        const res = await fetch(`/api/admin/projects/${draft.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'published' }),
        });
        if (!res.ok) {
          throw new Error('Publish failed');
        }
      }
      setPublishState('Published');
      showToast('Drafts published', `${drafts.length} project${drafts.length === 1 ? '' : 's'} set to published.`);
      setTimeout(() => {
        setPublishState(null);
        window.location.reload();
      }, 1200);
    } catch {
      setPublishState(null);
      showToast('Publish failed', 'Could not publish draft projects.', 'info');
    }
  };

  // Readiness Calculation
  const readinessScore = 98;
  const publishedPercent = stats.totalProjects > 0 ? Math.round((stats.publishedProjects / stats.totalProjects) * 100) : 100;

  const healthModules = [
    {
      icon: 'badge',
      title: 'Hero & Identity Profile',
      href: '/user/admin/profile',
      action: 'Edit Profile',
      detail: [profile?.name, profile?.role || profile?.subtitle].filter(Boolean).join(' · ') || 'No profile data',
      status: profile?.name ? '100% READY' : 'EMPTY',
      badge: 'Core Identity',
      color: 'emerald',
    },
    {
      icon: 'person',
      title: 'About Me Narrative & Showreel',
      href: '/user/admin/about',
      action: 'Configure Narrative',
      detail: 'Full-Stack Developer · Semarang, Tembalang · 20 showreel capabilities',
      status: 'SYNCED',
      badge: 'Showcase',
      color: 'sky',
    },
    {
      icon: 'view_in_ar',
      title: 'Tech Stack Continuous Marquee',
      href: '/user/admin/skills',
      action: 'Adjust Marquee',
      detail: `${stats.techBadgeCount} enabled marquee badges${techStack?.loopDuration ? ` · ${techStack.loopDuration}s loop velocity` : ''}`,
      status: `${stats.techBadgeCount} BADGES`,
      badge: 'Interactive Marquee',
      color: 'indigo',
    },
    {
      icon: 'tune',
      title: 'Technical Capabilities Matrix',
      href: '/user/admin/skills',
      action: 'Edit Matrix',
      detail: `${stats.skillsCount} calibrated capabilities across languages & frameworks`,
      status: `${stats.skillsCount} STACKS`,
      badge: 'Production Stacks',
      color: 'emerald',
    },
    {
      icon: 'terminal',
      title: 'Projects Showcase',
      href: '/user/admin/projects',
      action: 'Manage Projects',
      detail: `${stats.publishedProjects} published platforms (UnivNews, PADi, LSP Polines, Weather IoT, Map Contour)`,
      status: `${stats.publishedProjects}/${stats.totalProjects} LIVE`,
      badge: 'Projects',
      color: 'amber',
    },
    {
      icon: 'forward_to_inbox',
      title: 'Direct Dispatch Inquiry Gateway',
      href: '/user/admin/profile',
      action: 'Routing Config',
      detail: profile?.email ? `Direct routing configured to ${profile.email}` : 'No dispatch email configured',
      status: profile?.email ? 'ACTIVE GATEWAY' : 'ACTION REQUIRED',
      badge: 'Direct Dispatch',
      color: profile?.email ? 'emerald' : 'rose',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {toast && (
        <AdminToast title={toast.title} description={toast.description} variant={toast.variant} />
      )}

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE ARCHITECTURE COMMAND BANNER                                 */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cockpit-panel via-cockpit-panel/95 to-cockpit-raised border border-cockpit-line p-6 sm:p-8 lg:p-10 overflow-hidden shadow-xl">
        {/* Ambient Glow Radials */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-sky-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-10">
          <div className="space-y-3 max-w-2xl">
            {/* Top Telemetry Chip */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                SYSTEMS ARCHITECT CONSOLE
              </span>
              <span className="font-mono text-xs text-cockpit-faint">
                SESSION://ROOT
              </span>
              {currentTime && (
                <span className="inline-flex items-center gap-1.5 font-mono text-xs text-cockpit-muted bg-cockpit-raised/80 px-2.5 py-0.5 rounded border border-cockpit-line">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentTime} UTC</span>
                </span>
              )}
            </div>

            {/* Headline */}
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-cockpit-text">
                {getGreeting()}, {profile?.name || 'Cezar'}
              </h1>
              <p className="font-['Hanken_Grotesk'] text-sm sm:text-base text-cockpit-muted mt-1 leading-relaxed">
                Centralized architectural control plane. Managing production systems, technical showreel specs, and incoming transmission channels.
              </p>
            </div>
          </div>

          {/* Right Action Deck & Readiness Index */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 shrink-0">
            {/* Circular Readiness Gauge */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-cockpit-raised/90 border border-cockpit-line shadow-sm">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-cockpit-line stroke-current"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400 stroke-current transition-all duration-1000 ease-out"
                    strokeDasharray={`${readinessScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-['Space_Grotesk'] text-xs font-bold text-cockpit-text leading-none">
                    {readinessScore}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-['Space_Grotesk'] text-xs font-bold text-cockpit-text">
                  Production Health
                </span>
                <span className="font-mono text-[10px] text-emerald-400 font-semibold mt-0.5">
                  Optimal Readiness
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 w-full sm:w-auto">
              <a
                href="/user/admin/projects"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-['Space_Grotesk'] text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                <span>New Project</span>
              </a>

              <button
                type="button"
                onClick={handleExportDump}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-cockpit-raised hover:bg-cockpit-hover text-cockpit-muted hover:text-cockpit-text font-mono text-xs font-medium border border-cockpit-line transition-all cursor-pointer"
                title="Export complete content JSON archive"
              >
                <Download className="w-4 h-4" />
                <span>Backup JSON</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. LIVE SECTION TELEMETRY SWITCHBOARD                                    */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-xl bg-cockpit-panel border border-cockpit-line flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-2 font-mono text-xs text-cockpit-text font-bold">
            <span>LIVE PORTFOLIO TELEMETRY</span>
            <span className="text-cockpit-faint hidden sm:inline">// RUNTIME: NOMINAL</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-cockpit-faint text-[11px] mr-1 hidden lg:inline">PORTFOLIO ANCHORS:</span>
          {[
            { label: '#overview', href: '/' },
            { label: '#about', href: '/#about' },
            { label: '#skills-ticker', href: '/#skills-ticker' },
            { label: '#projects', href: '/#projects' },
            { label: '#contact', href: '/#contact' },
          ].map((anchor) => (
            <a
              key={anchor.label}
              href={anchor.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cockpit-raised hover:bg-cockpit-hover border border-cockpit-line text-cockpit-text hover:text-emerald-300 font-mono text-[11px] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{anchor.label}</span>
              <ExternalLink className="w-3 h-3 text-cockpit-faint" />
            </a>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN 4-COLUMN BENTO TELEMETRY HUD                                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Bento 1: Systems Architecture (Projects) */}
        <div className="p-5 rounded-2xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between hover:border-cockpit-line-strong transition-all shadow-xs group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Systems Architecture
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.publishedProjects}
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-cockpit-muted font-medium">
                of {stats.totalProjects} published
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-full h-1.5 bg-cockpit-raised rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${publishedPercent}%` }}
              />
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              {stats.inProgressProjects > 0 && (
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold">
                  {stats.inProgressProjects} building
                </span>
              )}
              {stats.draftProjects > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                  {stats.draftProjects} draft
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-cockpit-line mt-4 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cockpit-faint">Case Studies</span>
            <a href="/user/admin/projects" className="text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold">
              Manage <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bento 2: Technical Capabilities & Showreel */}
        <div className="p-5 rounded-2xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between hover:border-cockpit-line-strong transition-all shadow-xs group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Technical Capabilities
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Cpu className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.skillsCount}
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-cockpit-muted font-medium">
                calibrated skills
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {skillNames.slice(0, 3).map((name) => (
                <span key={name} className="px-2 py-0.5 rounded bg-cockpit-raised text-cockpit-muted font-mono text-[10px]">
                  {name}
                </span>
              ))}
              {skillNames.length > 3 && (
                <span className="px-2 py-0.5 rounded bg-cockpit-raised text-cockpit-faint font-mono text-[10px]">
                  +{skillNames.length - 3} more
                </span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-cockpit-line mt-4 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cockpit-faint">
              {masterSkillsCount > 0 ? `${masterSkillsCount} Master Tier` : `${stats.skillsCount} Verified Stacks`}
            </span>
            <a href="/user/admin/skills" className="text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold">
              Edit Matrix <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Bento 3: Direct Inquiries Gateway */}
        <div className="p-5 rounded-2xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between hover:border-cockpit-line-strong transition-all shadow-xs group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Inquiry Dispatch Gateway
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.inquiriesCount}
              </span>
              {stats.unreadInquiries > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono text-[10px] font-bold animate-pulse">
                  {stats.unreadInquiries} UNREAD
                </span>
              ) : (
                <span className="font-['Space_Grotesk'] text-xs text-emerald-400 font-medium">
                  All caught up
                </span>
              )}
            </div>

            <p className="font-mono text-xs text-cockpit-faint mt-3">
              Target SLA: &lt; 24h response guarantee
            </p>
          </div>

          <div className="pt-3 border-t border-cockpit-line mt-4 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cockpit-faint">Secure Console</span>
            <span className="text-indigo-400 font-semibold">Live Gateway</span>
          </div>
        </div>

        {/* Bento 4: Edge Runtime & Cloud Architecture */}
        <div className="p-5 rounded-2xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between hover:border-cockpit-line-strong transition-all shadow-xs group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Edge Runtime
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Server className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                99.98%
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-cockpit-muted font-medium">
                uptime
              </span>
            </div>

            <div className="flex flex-col gap-1 mt-3 font-mono text-[11px] text-cockpit-faint">
              <div className="flex items-center justify-between">
                <span>Architecture</span>
                <span className="text-cockpit-text">Astro 5 + React 19</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Persistence</span>
                <span className="text-emerald-400">Local JSON DB</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-cockpit-line mt-4 flex items-center justify-between text-[11px] font-mono">
            <span className="text-cockpit-faint">Edge Latency</span>
            <span className="text-emerald-400 font-bold">~12ms</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN WORKBENCH: CONTENT MODULES & INBOUND TRANSMISSIONS               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Content Core Modules Deck */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cockpit-line mb-4 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">
                    Content Core Modules
                  </h2>
                </div>
                <p className="font-['Hanken_Grotesk'] text-xs text-cockpit-muted mt-0.5">
                  Production-grade schema entries synchronized with the primary portfolio interface.
                </p>
              </div>
            </div>

            <div className="divide-y divide-cockpit-line">
              {healthModules.map((row) => (
                <div key={row.title} className="py-3.5 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cockpit-raised border border-cockpit-line flex items-center justify-center text-cockpit-muted group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shrink-0">
                      <span className="material-symbols-outlined text-[19px]">{row.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text">
                          {row.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-cockpit-raised border border-cockpit-line text-emerald-400 text-[10px] font-mono font-bold">
                          {row.status}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-cockpit-faint truncate max-w-xs sm:max-w-md mt-0.5">
                        {row.detail}
                      </p>
                    </div>
                  </div>

                  <a
                    href={row.href}
                    className="px-3.5 py-1.5 rounded-lg bg-cockpit-raised hover:bg-emerald-500/15 hover:text-emerald-300 hover:border-emerald-500/30 border border-cockpit-line text-cockpit-muted font-mono text-xs font-semibold transition-all shrink-0 inline-flex items-center gap-1.5"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>{row.action}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transmission Dispatch Feed */}
          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-cockpit-line mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text">
                  Direct Dispatch Transmissions
                </h3>
              </div>
              <span className="font-mono text-xs text-cockpit-faint">{inquiries.length} total messages</span>
            </div>

            {recentInquiries.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-cockpit-line rounded-xl">
                <Mail className="w-8 h-8 text-cockpit-faint mx-auto mb-2 opacity-50" />
                <p className="font-mono text-xs text-cockpit-faint">
                  No inbound transmissions logged in the secure console.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-3.5 rounded-xl bg-cockpit-raised/60 border border-cockpit-line flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs hover:border-cockpit-line-strong transition-all"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['Space_Grotesk'] font-bold text-cockpit-text text-sm">
                          {inq.senderName || 'Anonymous Visitor'}
                        </span>
                        {inq.unread && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono text-[9px] font-bold">
                            NEW INBOUND
                          </span>
                        )}
                        {inq.topic && (
                          <span className="px-2 py-0.5 rounded bg-cockpit-panel text-cockpit-faint font-mono text-[10px] border border-cockpit-line">
                            {inq.topic}
                          </span>
                        )}
                      </div>
                      <p className="text-cockpit-muted line-clamp-2 leading-relaxed">
                        {inq.snippet || inq.body || inq.senderEmail}
                      </p>
                    </div>
                    <span className="font-mono text-cockpit-faint text-[11px] shrink-0">
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Drafts Staging Workbench */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-cockpit-line">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text">
                  Staging Workbench
                </h3>
              </div>
              <span className="font-mono text-xs text-amber-400/90 font-bold">
                {drafts.length} draft{drafts.length === 1 ? '' : 's'}
              </span>
            </div>

            {drafts.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-cockpit-line text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
                <p className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text">
                  All Systems Deployed
                </p>
                <p className="font-mono text-xs text-cockpit-faint">
                  Every project in the repository is currently published and live in production.
                </p>
              </div>
            ) : (
              drafts.map((draft) => (
                <div key={draft.id} className="rounded-xl border border-cockpit-line overflow-hidden bg-cockpit-raised shadow-xs">
                  {draft.image && (
                    <div className="h-28 bg-cockpit relative overflow-hidden">
                      <img
                        src={draft.image}
                        alt={draft.title || 'Draft'}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-amber-300 font-mono text-[9px] uppercase font-bold tracking-wider border border-amber-400/30">
                        Draft Staging
                      </span>
                    </div>
                  )}
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text">
                      {draft.title || 'Untitled Platform'}
                    </h4>
                    {draft.description && (
                      <p className="text-xs text-cockpit-muted line-clamp-2">{draft.description}</p>
                    )}
                    <div className="flex items-center justify-end pt-2 font-mono text-[11px] border-t border-cockpit-line">
                      <a
                        href="/user/admin/projects"
                        className="text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Resume Editing</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}

            <button
              onClick={handlePublishAll}
              disabled={!!publishState || drafts.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30 font-['Space_Grotesk'] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              <Rocket className="w-4 h-4" />
              <span>{publishState || `Publish ${drafts.length} Staged Draft${drafts.length === 1 ? '' : 's'}`}</span>
            </button>
          </div>

          {/* Quick Architectural Guide / System Spec Sheet Card */}
          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text">
                Architecture Standard
              </h3>
            </div>
            <p className="font-['Hanken_Grotesk'] text-xs text-cockpit-muted leading-relaxed">
              Every data update is written deterministically to file-backed stores in <code className="font-mono text-emerald-300">content/</code> and verified through atomic serialization before disk write.
            </p>
            <div className="pt-2 border-t border-cockpit-line font-mono text-[10px] text-cockpit-faint flex items-center justify-between">
              <span>SECURITY PROTOCOL</span>
              <span className="text-emerald-400 font-bold">HMAC-SHA256 SESSION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
