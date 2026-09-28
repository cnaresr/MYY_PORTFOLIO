import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  X,
  FileCode,
  Search,
  Power,
} from 'lucide-react';
import { formatRange } from '../../lib/formatDate';
import { AdminToast } from '../ui/alert';
import { ConfirmDialog } from '../ui/alert-dialog';
import { MonthPicker } from '../ui/monthPicker';
import { Combobox } from '../ui/combobox';
import { StatusBadge } from '../ui/statusBadge';
import { ImageUploader } from './ImageUploader';

interface Metric {
  label: string;
  value: string;
}

interface Project {
  id: string;
  status: 'published' | 'inprogress' | 'draft' | 'archived';
  startDate: string;
  endDate: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  image?: string;
  abstract?: string;
  metrics?: Metric[];
}

interface ProjectsManagerProps {
  initialProjects: Project[];
}

const sysNum = (index: number): string => `SYS ${String(index + 1).padStart(2, '0')}`;

interface StatusBadge {
  label: string;
}

const STATUS_BADGE: Record<Project['status'], StatusBadge> = {
  published: { label: 'Live in production' },
  inprogress: { label: 'In progress' },
  draft: { label: 'Draft / staging' },
  archived: { label: 'Archived' },
};

const STATUS_OPTIONS: ReadonlyArray<{ value: Project['status']; label: string }> = [
  { value: 'published', label: 'Published (Production Live)' },
  { value: 'inprogress', label: 'In Progress (Under Development)' },
  { value: 'draft', label: 'Draft (Staging / Internal)' },
  { value: 'archived', label: 'Archived' },
];

const TECH_PRESET = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Vite', 'Astro', 'Tailwind',
  'PostgreSQL', 'MySQL', 'Redis', 'MongoDB', 'Kafka', 'Docker', 'Kubernetes',
  'Rust', 'Go', 'Node.js', 'Python', 'GraphQL', 'WebSockets', 'SSE Streams',
  'WebRTC', 'Protobuf', 'Wasm', 'Cloudflare', 'AWS',
] as const;

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({ initialProjects }) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'published' | 'inprogress' | 'draft' | 'archived'>('ALL');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [toast, setToast] = useState<{ title: string; description?: string; variant?: 'success' | 'info' } | null>(null);

  // Modal State for Edit / New
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalForm, setModalForm] = useState<Project>({
    id: '',
    status: 'published',
    startDate: '2024',
    endDate: '2024',
    title: '',
    description: '',
    technologies: [],
    githubUrl: '',
    image: '',
    abstract: '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Confirm-delete state
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const showToast = (title: string, description?: string, variant: 'success' | 'info' = 'success') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3500);
  };

  // Extract all unique technology tags for filter pills
  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.technologies?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
        if (selectedTag && !p.technologies?.includes(selectedTag)) return false;
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTech = p.technologies?.some((t) => t.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchTech;
        }
        return true;
      })
      .sort((a, b) => projects.indexOf(a) - projects.indexOf(b));
  }, [projects, filterStatus, selectedTag, searchQuery]);

  const nextOrderNumber = (): number => projects.length + 1;

  const openNewModal = () => {
    setIsEditing(false);
    const newProject: Project = {
      id: `sys-arch-${Date.now()}`,
      status: 'published',
      startDate: '2024',
      endDate: '2024',
      title: '',
      description: '',
      technologies: [],
      githubUrl: '',
      image: '',
      abstract: '',
      metrics: [
        { label: 'Availability', value: '99.99%' },
        { label: 'Latency P99', value: '< 5ms' },
        { label: 'Scaling', value: 'Horizontal' },
      ],
    };
    setModalForm(newProject);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setIsEditing(true);
    const formCopy: Project = JSON.parse(JSON.stringify(proj));
    if (!formCopy.metrics || formCopy.metrics.length === 0) {
      formCopy.metrics = [
        { label: 'Availability', value: '99.99%' },
        { label: 'Latency P99', value: '< 5ms' },
        { label: 'Scaling', value: 'Horizontal' },
      ];
    }
    setModalForm(formCopy);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedProject: Project = {
        ...modalForm,
        technologies: modalForm.technologies,
      };

      let updatedList: Project[];
      let savedIndex: number;
      if (isEditing) {
        savedIndex = projects.findIndex((p) => p.id === updatedProject.id);
        // Keep original position, renumber everything.
        updatedList = projects.map((p) =>
          p.id === updatedProject.id ? updatedProject : p
        );
      } else {
        savedIndex = projects.length;
        updatedList = [...projects, updatedProject];
      }

      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
        setProjects(updatedList);
        setIsModalOpen(false);
        showToast(
          'Project saved',
          isEditing
            ? `${sysNum(savedIndex)} updated in content/projects.json.`
            : `${sysNum(savedIndex)} appended.`
        );
      } else {
        showToast('Save failed', 'Failed to save project. Server returned error.', 'info');
      }
    } catch {
      showToast('Save failed', 'Error persisting project changes.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (projId: string) => {
    const STATUS_CYCLE: Project['status'][] = ['published', 'inprogress', 'draft', 'archived'];
    const updatedList = projects.map((p) => {
      if (p.id === projId) {
        const idx = STATUS_CYCLE.indexOf(p.status);
        const nextStatus = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
        return { ...p, status: nextStatus };
      }
      return p;
    });

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
        setProjects(updatedList);
        const changeIndex = updatedList.findIndex((p) => p.id === projId);
        const changed = updatedList[changeIndex];
        showToast('Status updated', `${sysNum(changeIndex)} status → ${STATUS_BADGE[changed?.status || 'draft'].label}`);
      } else {
        showToast('Update failed', 'Failed to toggle status.', 'info');
      }
    } catch {
      showToast('Update failed', 'Error updating status.', 'info');
    }
  };

  const handleDelete = async (projId: string) => {
    const delIndex = projects.findIndex((p) => p.id === projId);

    try {
      const removed = projects.filter((p) => p.id !== projId);
      // Renumber remaining projects sequentially.
      const updatedList = removed;
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
        setProjects(updatedList);
        showToast('Project deleted', `${sysNum(delIndex)} deleted. Remaining systems renumbered.`);
      } else {
        showToast('Delete failed', 'Failed to delete project.', 'info');
      }
    } catch {
      showToast('Delete failed', 'Error deleting project.', 'info');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    const newList = [...projects];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newList),
      });
      if (res.ok) {
        setProjects(newList);
        showToast('Order updated', 'Project display order updated and renumbered.');
      }
    } catch {
      showToast('Update failed', 'Error updating display order.', 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <AdminToast title={toast.title} description={toast.description} variant={toast.variant} />
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-cockpit-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-cockpit-text tracking-tight">
              PROJECT SHOWCASE MANAGER // CASE STUDIES
            </h1>
          </div>
          <p className="text-xs font-mono text-cockpit-muted mt-1 flex items-center gap-2">
            <span>SOURCE: <code className="text-cockpit-text font-semibold">content/projects.json</code></span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">AUTO-ID SEQUENTIAL</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 font-mono text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ ADD NEW PROJECT</span>
          </button>
        </div>
      </div>

      {/* ACTIVE CASE STUDIES Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase tracking-wider font-semibold">
            TOTAL CASE STUDIES
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-cockpit-text mt-1">
            {projects.length}
          </div>
          <div className="text-[10px] font-mono text-cockpit-muted mt-0.5">In portfolio collection</div>
        </div>

        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase tracking-wider font-semibold">
            ACTIVE CASE STUDIES
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-400 mt-1">
            {projects.filter((p) => p.status === 'published').length} / {projects.length}
          </div>
          <div className="text-[10px] font-mono text-emerald-300 mt-0.5">Published live</div>
        </div>

        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase tracking-wider font-semibold">
            IN PROGRESS
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-sky-400 mt-1">
            {projects.filter((p) => p.status === 'inprogress').length}
          </div>
          <div className="text-[10px] font-mono text-sky-300 mt-0.5">Under development</div>
        </div>

        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase tracking-wider font-semibold">
            DRAFTS
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-amber-400 mt-1">
            {projects.filter((p) => p.status === 'draft').length}
          </div>
          <div className="text-[10px] font-mono text-cockpit-muted mt-0.5">In staging</div>
        </div>

        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase tracking-wider font-semibold">
            ARCHIVED
          </div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-cockpit-text mt-1">
            {projects.filter((p) => p.status === 'archived').length}
          </div>
          <div className="text-[10px] font-mono text-cockpit-muted mt-0.5">Retired</div>
        </div>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cockpit-faint absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project title, tech stack..."
              className="w-full pl-9 pr-3 py-2 bg-cockpit/70 border border-cockpit-line rounded-lg text-xs font-mono text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-cockpit-faint"
            />
          </div>

          <div className="flex items-center gap-1 bg-cockpit-hover p-1 rounded-lg text-xs font-mono">
            {(
              [
                { id: 'ALL', label: `ALL (${projects.length})` },
                { id: 'published', label: `PRODUCTION (${projects.filter((p) => p.status === 'published').length})` },
                { id: 'inprogress', label: `IN PROGRESS (${projects.filter((p) => p.status === 'inprogress').length})` },
                { id: 'draft', label: `DRAFTS (${projects.filter((p) => p.status === 'draft').length})` },
                { id: 'archived', label: `ARCHIVED (${projects.filter((p) => p.status === 'archived').length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`py-1 px-2.5 rounded-md font-medium transition-colors cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-cockpit-raised text-cockpit-text shadow-2xs font-semibold'
                    : 'text-cockpit-muted hover:text-cockpit-text'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Technology Tag Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-cockpit-line">
          <span className="text-[11px] font-mono text-cockpit-muted mr-1">TECH FILTER:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
              selectedTag === null
                ? 'bg-emerald-500 text-cockpit font-bold'
                : 'bg-cockpit-hover text-cockpit-muted hover:bg-cockpit-hover'
            }`}
          >
            All Tech
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-cockpit font-bold'
                  : 'bg-cockpit-hover text-cockpit-muted hover:bg-cockpit-hover'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center bg-cockpit-raised border border-cockpit-line rounded-xl font-mono text-xs text-cockpit-muted">
            No projects matched your query.
          </div>
        ) : (
          filteredProjects.map((project) => {
            const realIndex = projects.findIndex((p) => p.id === project.id);
            return (
              <div
                key={project.id}
                className="bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs overflow-hidden transition-all hover:border-cockpit-line-strong"
              >
                {/* Card Top Action Bar */}
                <div className="p-4 bg-cockpit/60 border-b border-cockpit-line flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2.5 py-1 rounded bg-cockpit-hover text-cockpit-text text-xs font-bold tracking-wide ring-1 ring-cockpit-line-strong">
                      {sysNum(realIndex)}
                    </span>
                    <StatusBadge
                      status={project.status}
                      label={STATUS_BADGE[project.status].label}
                    />
                    <span className="text-cockpit-faint text-xs hidden sm:inline">•</span>
                    <span className="text-cockpit-muted text-xs font-medium hidden sm:inline">
                      {project.status === 'inprogress' && (project.endDate === 'now' || project.endDate === 'NOW')
                        ? formatRange(project.startDate, 'now')
                        : formatRange(project.startDate, project.endDate)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      onClick={() => handleMoveOrder(realIndex, 'up')}
                      disabled={realIndex === 0}
                      className="p-1.5 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-30 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveOrder(realIndex, 'down')}
                      disabled={realIndex === projects.length - 1}
                      className="p-1.5 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-30 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleToggleStatus(project.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-cockpit-raised border border-cockpit-line hover:bg-cockpit-hover text-cockpit-text font-semibold shadow-2xs transition-colors cursor-pointer"
                      title="Advance status (Production → In Progress → Draft → Archived)"
                    >
                      <Power className={`w-3.5 h-3.5 ${
                        project.status === 'published'
                          ? 'text-emerald-500'
                          : project.status === 'inprogress'
                          ? 'text-sky-500'
                          : 'text-cockpit-faint'
                      }`} />
                      <span className="hidden sm:inline">Status</span>
                    </button>

                    <button
                      onClick={() => openEditModal(project)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>EDIT</span>
                    </button>

                    <button
                      onClick={() => setPendingDelete(project)}
                      className="p-1.5 rounded-lg border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Preview */}
                  <div className="lg:col-span-5">
                    {project.image ? (
                      <div className="relative rounded-lg overflow-hidden border border-cockpit-line bg-black aspect-video shadow-md">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="w-full h-full object-cover opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"></div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-cockpit-line-strong bg-cockpit aspect-video shadow-md flex flex-col items-center justify-center gap-1.5 text-cockpit-faint">
                        <span className="material-symbols-outlined text-[22px]">image</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider">No cover image</span>
                      </div>
                    )}
                  </div>

                  {/* Right Synopsis */}
                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <h3 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text tracking-tight">
                        {project.title}
                      </h3>
                      <p className="text-xs text-cockpit-muted font-sans leading-relaxed mt-1">
                        {project.description}
                      </p>
                    </div>

                    {project.abstract && (
                      <div className="p-3.5 rounded-lg bg-cockpit/60 border border-cockpit-line/80">
                        <div className="text-[10px] font-mono font-bold text-cockpit-muted uppercase tracking-wide mb-1">
                          ARCHITECTURE ABSTRACT
                        </div>
                        <p className="text-xs font-mono text-cockpit-text leading-relaxed">{project.abstract}</p>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono text-cockpit-muted uppercase font-semibold">
                        ENGINEERING STACK
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {project.technologies?.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-md bg-cockpit-hover border border-cockpit-line font-mono text-xs text-cockpit-text font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {project.metrics && project.metrics.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono text-cockpit-muted uppercase font-semibold">
                          BENTO METRICS DECK
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {project.metrics.map((m, mIdx) => (
                            <div key={mIdx} className="p-2 rounded-lg bg-cockpit/80 border border-cockpit-line">
                              <span className="font-mono text-[9px] uppercase tracking-wider text-cockpit-muted block truncate">
                                {m.label || `METRIC ${mIdx + 1}`}
                              </span>
                              <span className="font-mono text-xs font-bold text-emerald-400 block truncate">
                                {m.value || 'N/A'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono text-cockpit-text hover:text-cockpit-text font-semibold"
                        >
                          <span>GitHub Repository</span>
                          <ExternalLink className="w-3 h-3 text-cockpit-faint" />
                        </a>
                      )}
                      <span className="text-cockpit-faint">•</span>
                      <button
                        onClick={() => openEditModal(project)}
                        className="inline-flex items-center gap-1 text-xs font-mono text-cockpit-text hover:text-cockpit-text font-semibold cursor-pointer"
                      >
                        <FileCode className="w-3 h-3 text-cockpit-faint" />
                        <span>Edit Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit / New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cockpit-raised border border-cockpit-line-strong rounded-xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden text-cockpit-text animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-cockpit-raised text-cockpit-text border-b border-cockpit-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <h3 className="font-['Space_Grotesk'] text-base font-bold">
                  {isEditing
                    ? `EDIT PROJECT // ${sysNum(projects.findIndex((p) => p.id === modalForm.id))}`
                    : `ADD NEW PROJECT // ${sysNum(nextOrderNumber() - 1)}`}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-cockpit-faint hover:text-cockpit-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">SYSTEM ID (AUTO)</label>
                  <input
                    type="text"
                    readOnly
                    value={isEditing
                      ? sysNum(Math.max(projects.findIndex((p) => p.id === modalForm.id), 0))
                      : sysNum(nextOrderNumber() - 1)}
                    className="w-full px-3 py-2 bg-cockpit-hover border border-cockpit-line rounded font-bold text-cockpit-muted focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">STATUS</label>
                  <Combobox
                    items={STATUS_OPTIONS}
                    value={modalForm.status}
                    onValueChange={(v) =>
                      setModalForm({
                        ...modalForm,
                        status: v as Project['status'],
                      })
                    }
                    placeholder="Select status..."
                  />
                </div>

                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">TIMELINE — START DATE</label>
                  <MonthPicker
                    value={modalForm.startDate}
                    onChange={(v) => setModalForm({ ...modalForm, startDate: v })}
                  />
                  <span className="text-[10px] text-cockpit-faint mt-0.5 block">Pilih bulan & tahun mulai.</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cockpit-muted font-bold mb-2">TIMELINE — END DATE</label>
                  <MonthPicker
                    value={modalForm.endDate}
                    onChange={(v) => setModalForm({ ...modalForm, endDate: v })}
                    disabled={modalForm.endDate === 'now' || modalForm.endDate === 'NOW'}
                  />
                  <label className="mt-2 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={modalForm.endDate === 'now' || modalForm.endDate === 'NOW'}
                      onChange={(e) =>
                        setModalForm({ ...modalForm, endDate: e.target.checked ? 'now' : '' })
                      }
                      className="w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-cockpit-muted">
                      Masih berjalan / belum selesai (End = Present / Now)
                    </span>
                  </label>
                  <span className="text-[10px] text-cockpit-faint mt-1 block">
                    {modalForm.endDate === 'now' || modalForm.endDate === 'NOW'
                      ? 'Akan tampil sebagai "Start – Present".'
                      : 'Pilih bulan & tahun selesai, atau centang "Masih berjalan".'}
                  </span>
                </div>
                <div>
                  <ImageUploader
                    label="PROJECT SCHEMATIC / PREVIEW IMAGE"
                    currentUrl={modalForm.image}
                    onUploadSuccess={(url) => setModalForm((prev) => ({ ...prev, image: url }))}
                  />
                  <input
                    type="text"
                    value={modalForm.image || ''}
                    onChange={(e) => setModalForm({ ...modalForm, image: e.target.value })}
                    className="mt-2 w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder=""
                  />
                </div>
              </div>

              <div>
                <label className="block text-cockpit-muted font-bold mb-1">PROJECT TITLE</label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-sm font-['Space_Grotesk'] font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. Veloce Query Fabric"
                />
              </div>

              <div>
                <label className="block text-cockpit-muted font-bold mb-1">PROJECT DESCRIPTION</label>
                <textarea
                  rows={3}
                  required
                  value={modalForm.description}
                  onChange={(e) => setModalForm({ ...modalForm, description: e.target.value })}
                  className="w-full p-3 bg-cockpit border border-cockpit-line-strong rounded font-sans text-xs text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Describe the architecture, scope, and what the system does..."
                />
              </div>

              <div>
                <label className="block text-cockpit-muted font-bold mb-1">ARCHITECTURE ABSTRACT</label>
                <textarea
                  rows={3}
                  value={modalForm.abstract || ''}
                  onChange={(e) => setModalForm({ ...modalForm, abstract: e.target.value })}
                  className="w-full p-3 bg-cockpit border border-cockpit-line-strong rounded text-xs font-mono text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Short technical summary of the system architecture..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-cockpit-muted font-bold">
                    ENGINEERING METRICS <span className="font-normal text-cockpit-faint">— Bento Grid 3-Box Deck</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModalForm({
                        ...modalForm,
                        metrics: [
                          { label: 'Availability', value: '99.99%' },
                          { label: 'Latency P99', value: '< 5ms' },
                          { label: 'Scaling', value: 'Horizontal' },
                        ],
                      });
                    }}
                    className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Defaults
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-cockpit border border-cockpit-line rounded-lg">
                  {[0, 1, 2].map((idx) => {
                    const currentMetrics = modalForm.metrics || [
                      { label: 'Availability', value: '99.99%' },
                      { label: 'Latency P99', value: '< 5ms' },
                      { label: 'Scaling', value: 'Horizontal' },
                    ];
                    const metric = currentMetrics[idx] || { label: '', value: '' };
                    return (
                      <div key={idx} className="space-y-1.5">
                        <span className="text-[10px] font-bold text-cockpit-muted">BOX {idx + 1}</span>
                        <input
                          type="text"
                          value={metric.label}
                          placeholder="Label (e.g. Ingest Throughput)"
                          onChange={(e) => {
                            const updated = [...currentMetrics];
                            updated[idx] = { ...metric, label: e.target.value };
                            setModalForm({ ...modalForm, metrics: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-cockpit-raised border border-cockpit-line rounded text-xs text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                        <input
                          type="text"
                          value={metric.value}
                          placeholder="Value (e.g. 450k TPS)"
                          onChange={(e) => {
                            const updated = [...currentMetrics];
                            updated[idx] = { ...metric, value: e.target.value };
                            setModalForm({ ...modalForm, metrics: updated });
                          }}
                          className="w-full px-2.5 py-1.5 bg-cockpit-raised border border-cockpit-line rounded text-xs font-bold text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-cockpit-muted font-bold mb-2">
                  TECHNOLOGIES STACK <span className="font-normal text-cockpit-faint">— klik untuk memilih (bisa lebih dari satu)</span>
                </label>
                <div className="p-3 bg-cockpit border border-cockpit-line rounded-lg max-h-44 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {TECH_PRESET.map((tech) => {
                      const selected = (modalForm.technologies || []).includes(tech);
                      return (
                        <button
                          key={tech}
                          type="button"
                          onClick={() => {
                            const current = modalForm.technologies || [];
                            const next = selected
                              ? current.filter((t) => t !== tech)
                              : [...current, tech];
                            setModalForm({ ...modalForm, technologies: next });
                          }}
                          className={`px-2.5 py-1 rounded-md font-mono text-xs border transition-colors cursor-pointer ${
                            selected
                              ? 'bg-emerald-500 text-cockpit border-emerald-500 font-semibold'
                              : 'bg-cockpit-raised text-cockpit-text border-cockpit-line hover:border-cockpit-line-strong'
                          }`}
                        >
                          {selected ? '✓ ' : '+ '}{tech}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {modalForm.technologies && modalForm.technologies.length > 0 && (
                  <span className="text-[10px] text-cockpit-muted mt-1 block font-mono">
                    Terpilih: {modalForm.technologies.join(' • ')}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-cockpit-muted font-bold mb-1">GITHUB / REPOSITORY URL</label>
                <input
                  type="url"
                  value={modalForm.githubUrl || ''}
                  onChange={(e) => setModalForm({ ...modalForm, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="https://github.com/..."
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-cockpit-line flex items-center justify-between">
                <span className="text-[10px] text-cockpit-muted">
                  Writes directly to <code className="text-cockpit-text">content/projects.json</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-cockpit-line-strong hover:bg-cockpit-hover text-cockpit-text font-mono font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50 font-mono font-bold shadow-xs cursor-pointer disabled:cursor-not-allowed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isSaving ? 'Persisting...' : 'Save Project Specs'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title="Delete case study?"
        description={
          pendingDelete
            ? `This will permanently delete "${pendingDelete.title}" from content/projects.json. Remaining case studies will be renumbered.`
            : ''
        }
        onConfirm={() => {
          if (pendingDelete) handleDelete(pendingDelete.id);
        }}
      />
    </div>
  );
};