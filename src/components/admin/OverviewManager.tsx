import React, { useState } from 'react';
import {
  Plus,
  Rocket,
  Download,
  Briefcase,
  Mail,
  ShieldCheck,
  ArrowUpRight,
  Layers,
  Pencil,
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
    certsCount: number;
    skillsCount: number;
    techBadgeCount: number;
  };
  projects: any[];
  inquiries: any[];
  profile?: any;
  skills?: any;
  certificates?: any[];
  techStack?: any;
}

export const OverviewManager: React.FC<OverviewProps> = ({
  stats,
  projects,
  inquiries,
  profile,
  skills,
  certificates = [],
  techStack,
}) => {
  const [publishState, setPublishState] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; description?: string; variant?: 'success' | 'info' } | null>(null);

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

  const projectTitles = projects.map((p) => p.title).filter(Boolean);
  const certTitles = certificates.map((c: any) => c.title).filter(Boolean);

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
      showToast('Export complete', 'Content dump downloaded.');
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

  const healthRows = [
    {
      icon: 'badge',
      title: 'Hero & profile',
      href: '/user/admin/profile',
      action: 'Edit',
      detail: [profile?.name, profile?.subtitle || profile?.role].filter(Boolean).join(' · ') || 'No profile data',
      badge: profile?.name ? 'Ready' : 'Empty',
    },
    {
      icon: 'view_in_ar',
      title: 'Tech stack ticker',
      href: '/user/admin/skills',
      action: 'Edit',
      detail: `${stats.techBadgeCount} enabled badge${stats.techBadgeCount === 1 ? '' : 's'}${techStack?.loopDuration ? ` · ${techStack.loopDuration}s loop` : ''}`,
      badge: `${stats.techBadgeCount}`,
    },
    {
      icon: 'tune',
      title: 'Skills matrix',
      href: '/user/admin/skills',
      action: 'Edit',
      detail: skillNames.slice(0, 6).join(', ') || 'No skills yet',
      badge: `${stats.skillsCount}`,
    },
    {
      icon: 'terminal',
      title: 'Projects showcase',
      href: '/user/admin/projects',
      action: 'Manage',
      detail: projectTitles.slice(0, 4).join(', ') || 'No projects yet',
      badge: `${stats.publishedProjects}/${stats.totalProjects}`,
    },
    {
      icon: 'verified',
      title: 'Credentials',
      href: '/user/admin/credentials',
      action: 'Edit',
      detail: certTitles.slice(0, 4).join(', ') || 'No credentials yet',
      badge: `${stats.certsCount}`,
    },
    {
      icon: 'forward_to_inbox',
      title: 'Contact routing',
      href: '/user/admin/profile',
      action: 'Configure',
      detail: profile?.email || 'No dispatch email set',
      badge: profile?.email ? 'Set' : 'Missing',
    },
  ];

  return (
    <div className="space-y-6">
      {toast && (
        <AdminToast title={toast.title} description={toast.description} variant={toast.variant} />
      )}

      <div className="rounded-2xl bg-cockpit-panel text-cockpit-text p-6 sm:p-8 relative overflow-hidden border border-cockpit-line">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-cockpit-text">
              Welcome back, {profile?.name || 'Operator'}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-cockpit-muted">
              {stats.totalProjects} projects · {stats.skillsCount} skills · {stats.certsCount} credentials · {stats.inquiriesCount} inquiries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/user/admin/projects"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 font-['Space_Grotesk'] text-xs font-bold hover:bg-emerald-500/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New project</span>
            </a>

            <button
              type="button"
              onClick={handleExportDump}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-cockpit-raised hover:bg-cockpit-hover text-cockpit-muted hover:text-cockpit-text font-mono text-xs font-medium border border-cockpit-line transition-all"
              title="Export all content files into a single JSON backup"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export dump</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live System Telemetry & Section Quick-Jumps Deck */}
      <div className="p-4 rounded-xl bg-cockpit-panel border border-cockpit-line flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-center gap-2 font-mono text-xs text-cockpit-text font-bold">
            <span>LIVE TELEMETRY: ALL SYSTEMS OPERATIONAL</span>
            <span className="text-cockpit-muted text-[11px] hidden sm:inline">// LATENCY ~12ms</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="text-cockpit-muted text-[11px] mr-1 hidden md:inline">LIVE SECTIONS:</span>
          <a
            href="/#about"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-cockpit-raised hover:bg-cockpit-hover border border-cockpit-line text-cockpit-text transition-colors"
          >
            #about
          </a>
          <a
            href="/#skills"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-cockpit-raised hover:bg-cockpit-hover border border-cockpit-line text-cockpit-text transition-colors"
          >
            #skills
          </a>
          <a
            href="/#projects"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-cockpit-raised hover:bg-cockpit-hover border border-cockpit-line text-cockpit-text transition-colors"
          >
            #projects
          </a>
          <a
            href="/#certificates"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-cockpit-raised hover:bg-cockpit-hover border border-cockpit-line text-cockpit-text transition-colors"
          >
            #certificates
          </a>
          <a
            href="/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-cockpit-raised hover:bg-cockpit-hover border border-cockpit-line text-cockpit-text transition-colors"
          >
            #contact
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Published projects
              </span>
              <div className="w-7 h-7 rounded bg-cockpit-raised flex items-center justify-center text-cockpit-muted">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.publishedProjects}
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-cockpit-muted font-medium">
                of {stats.totalProjects}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {stats.inProgressProjects > 0 && (
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30 font-mono text-[10px] font-bold">
                  {stats.inProgressProjects} in progress
                </span>
              )}
              {stats.draftProjects > 0 && (
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono text-[10px] font-bold">
                  {stats.draftProjects} draft
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Inquiries
              </span>
              <div className="w-7 h-7 rounded bg-cockpit-raised flex items-center justify-center text-cockpit-muted">
                <Mail className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.inquiriesCount}
              </span>
              {stats.unreadInquiries > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-mono text-[10px] font-bold">
                  {stats.unreadInquiries} unread
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Credentials
              </span>
              <div className="w-7 h-7 rounded bg-cockpit-raised flex items-center justify-center text-cockpit-muted">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.certsCount}
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-cockpit-muted font-medium">
                stored
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-cockpit-panel border border-cockpit-line flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Space_Grotesk'] text-[10px] text-cockpit-muted uppercase tracking-widest font-bold">
                Skills
              </span>
              <div className="w-7 h-7 rounded bg-cockpit-raised flex items-center justify-center text-cockpit-muted">
                <Layers className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-['Space_Grotesk'] text-3xl font-bold text-cockpit-text tracking-tight">
                {stats.skillsCount}
              </span>
              <span className="font-['Space_Grotesk'] text-xs text-cockpit-muted font-medium">
                entries
              </span>
            </div>
            {skillNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {skillNames.slice(0, 3).map((name) => (
                  <span key={name} className="px-2 py-0.5 rounded bg-cockpit-raised text-cockpit-muted font-mono text-[10px]">
                    {name}
                  </span>
                ))}
                {skillNames.length > 3 && (
                  <span className="px-2 py-0.5 rounded bg-cockpit-raised text-cockpit-faint font-mono text-[10px]">
                    +{skillNames.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cockpit-line mb-5 gap-2">
              <div>
                <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">
                  Content modules
                </h2>
                <p className="font-['Hanken_Grotesk'] text-xs text-cockpit-muted mt-0.5">
                  Counts come from the JSON store. Jump to the matching editor.
                </p>
              </div>
            </div>

            <div className="divide-y divide-cockpit-line">
              {healthRows.map((row) => (
                <div key={row.title} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cockpit-raised flex items-center justify-center text-cockpit-muted shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{row.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text">{row.title}</span>
                        <span className="px-1.5 py-0.5 rounded bg-cockpit-raised text-cockpit-muted text-[10px] font-mono font-bold">
                          {row.badge}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-cockpit-faint truncate max-w-xs sm:max-w-md">
                        {row.detail}
                      </p>
                    </div>
                  </div>
                  <a
                    href={row.href}
                    className="px-3 py-1.5 rounded-lg bg-cockpit-raised hover:bg-cockpit-hover text-cockpit-muted hover:text-cockpit-text font-mono text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-1"
                  >
                    <Pencil className="w-3 h-3" />
                    {row.action}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line">
            <div className="flex items-center justify-between pb-4 border-b border-cockpit-line mb-4">
              <h3 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text">
                Recent inquiries
              </h3>
              <span className="font-mono text-xs text-cockpit-faint">{inquiries.length} total</span>
            </div>

            {recentInquiries.length === 0 ? (
              <p className="font-mono text-xs text-cockpit-faint">No inquiries in the store.</p>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map((inq) => (
                  <div key={inq.id} className="flex items-start justify-between text-xs pb-3 border-b border-cockpit-line last:border-0 last:pb-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['Space_Grotesk'] font-bold text-cockpit-text">
                          {inq.senderName || 'Visitor'}
                        </span>
                        {inq.unread && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 font-mono text-[10px] font-bold">
                            unread
                          </span>
                        )}
                        {inq.topic && (
                          <span className="text-cockpit-faint truncate">{inq.topic}</span>
                        )}
                      </div>
                      <p className="text-cockpit-muted line-clamp-2">{inq.snippet || inq.body || inq.senderEmail}</p>
                    </div>
                    <span className="font-mono text-cockpit-faint text-[11px] shrink-0 ml-3">
                      {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-cockpit-panel border border-cockpit-line space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cockpit-line">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cockpit-muted" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text">Drafts</h3>
              </div>
              <span className="font-mono text-xs text-cockpit-faint">{drafts.length} draft{drafts.length === 1 ? '' : 's'}</span>
            </div>

            {drafts.length === 0 ? (
              <p className="font-mono text-xs text-cockpit-faint">No draft projects.</p>
            ) : (
              drafts.map((draft) => (
                <div key={draft.id} className="rounded-xl border border-cockpit-line overflow-hidden bg-cockpit-raised">
                  {draft.image && (
                    <div className="h-28 bg-cockpit relative overflow-hidden">
                      <img
                        src={draft.image}
                        alt={draft.title || 'Draft'}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] uppercase font-bold tracking-wider">
                        Draft
                      </span>
                    </div>
                  )}
                  <div className="p-3.5 space-y-1.5">
                    <h4 className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text">
                      {draft.title || 'Untitled'}
                    </h4>
                    {draft.description && (
                      <p className="text-xs text-cockpit-muted line-clamp-2">{draft.description}</p>
                    )}
                    <div className="flex items-center justify-end pt-2 font-mono text-[11px] border-t border-cockpit-line">
                      <a
                        href="/user/admin/projects"
                        className="text-emerald-300 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>Resume</span>
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30 font-['Space_Grotesk'] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Rocket className="w-4 h-4" />
              <span>{publishState || `Publish ${drafts.length} draft${drafts.length === 1 ? '' : 's'}`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
