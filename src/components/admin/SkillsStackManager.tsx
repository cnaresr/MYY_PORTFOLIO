import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Zap,
} from 'lucide-react';
import { AdminToast } from '../ui/alert';
import { ConfirmDialog } from '../ui/alert-dialog';
import { BRAND_LOGO_OPTIONS } from '../../lib/techBrands';
import { BrandIcon } from '../interactive/BrandIcon';

interface SkillItem {
  id: string;
  name: string;
  detail: string;
  proof?: string;
  percentage: number;
  master?: boolean;
  iconSlug?: string;
  order: number;
}

interface TechBadge {
  id: string;
  name: string;
  category: string;
  iconSlug?: string;
  enabled: boolean;
}

interface SkillsData {
  languages: SkillItem[];
  frameworks: SkillItem[];
}

interface TechStackData {
  loopDuration: number;
  track1: TechBadge[];
  track2: TechBadge[];
}

interface SkillsStackManagerProps {
  initialSkills: SkillsData;
  initialTechStack: TechStackData;
}

const clampPercent = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

export const SkillsStackManager: React.FC<SkillsStackManagerProps> = ({
  initialSkills,
  initialTechStack,
}) => {
  const [skills, setSkills] = useState<SkillsData>(initialSkills);
  const [techStack, setTechStack] = useState<TechStackData>(initialTechStack);
  const [toast, setToast] = useState<{ title: string; description?: string; variant?: 'success' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Confirm-delete target (skill metric or marquee badge)
  const [pendingDelete, setPendingDelete] = useState<
    | { kind: 'skill'; cat: 'languages' | 'frameworks'; id: string; name: string }
    | { kind: 'badge'; track: 'track1' | 'track2'; id: string; name: string }
    | null
  >(null);

  const showToast = (title: string, description?: string, variant: 'success' | 'info' = 'success') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePercentChange = (cat: 'languages' | 'frameworks', id: string, pct: number) => {
    setSkills((prev) => ({
      ...prev,
      [cat]: prev[cat].map((s) => (s.id === id ? { ...s, percentage: clampPercent(pct) } : s)),
    }));
  };

  const handleSkillLogoChange = (cat: 'languages' | 'frameworks', id: string, slug: string) => {
    setSkills((prev) => ({
      ...prev,
      [cat]: prev[cat].map((s) => (s.id === id ? { ...s, iconSlug: slug } : s)),
    }));
  };

  // Toggle mastery
  const handleToggleMaster = (cat: 'languages' | 'frameworks', id: string) => {
    setSkills((prev) => ({
      ...prev,
      [cat]: prev[cat].map((s) => (s.id === id ? { ...s, master: !s.master } : s)),
    }));
  };

  // Skill text update
  const handleSkillTextChange = (
    cat: 'languages' | 'frameworks',
    id: string,
    field: 'name' | 'detail' | 'proof',
    val: string
  ) => {
    setSkills((prev) => ({
      ...prev,
      [cat]: prev[cat].map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    }));
  };

  // Add new skill
  const handleAddSkill = (cat: 'languages' | 'frameworks') => {
    const list = skills[cat];
    const newId = `skill-${Date.now()}`;
    const newOrder = list.length + 1;
    const newItem: SkillItem = {
      id: newId,
      name: cat === 'languages' ? 'New Language' : 'New Framework',
      detail: 'Configuration • Architecture',
      proof: '',
      percentage: 85,
      master: false,
      iconSlug: '',
      order: newOrder,
    };
    setSkills((prev) => ({
      ...prev,
      [cat]: [...prev[cat], newItem],
    }));
    showToast('Skill added', `New ${cat === 'languages' ? 'language' : 'framework'} metric appended.`);
  };

  // Delete skill
  const handleDeleteSkill = (cat: 'languages' | 'frameworks', id: string) => {
    setSkills((prev) => ({
      ...prev,
      [cat]: prev[cat].filter((s) => s.id !== id),
    }));
    showToast('Skill deleted', 'Removed from the skills matrix.');
  };

  // Reorder skill
  const handleMoveSkill = (cat: 'languages' | 'frameworks', index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    const list = [...skills[cat]];
    if (target < 0 || target >= list.length) return;

    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    setSkills((prev) => ({
      ...prev,
      [cat]: reordered,
    }));
  };

  // Toggle badge in marquee
  const handleToggleBadge = (track: 'track1' | 'track2', badgeId: string) => {
    setTechStack((prev) => ({
      ...prev,
      [track]: prev[track].map((b) => (b.id === badgeId ? { ...b, enabled: !b.enabled } : b)),
    }));
  };

  // Add badge to a track
  const handleAddBadge = (track: 'track1' | 'track2') => {
    const newBadge: TechBadge = {
      id: `badge-${Date.now()}`,
      name: 'New Badge',
      category: 'misc',
      iconSlug: '',
      enabled: true,
    };
    setTechStack((prev) => ({
      ...prev,
      [track]: [...prev[track], newBadge],
    }));
    showToast('Badge added', `Badge appended to ${track === 'track1' ? 'Track 1' : 'Track 2'}.`);
  };

  // Delete badge from a track
  const handleDeleteBadge = (track: 'track1' | 'track2', badgeId: string) => {
    setTechStack((prev) => ({
      ...prev,
      [track]: prev[track].filter((b) => b.id !== badgeId),
    }));
    showToast('Badge removed', 'Removed from the logo marquee.');
  };

  // Rename badge
  const handleRenameBadge = (track: 'track1' | 'track2', badgeId: string, name: string) => {
    setTechStack((prev) => ({
      ...prev,
      [track]: prev[track].map((b) => (b.id === badgeId ? { ...b, name } : b)),
    }));
  };

  // Set logo slug for a badge
  const handleLogoChange = (track: 'track1' | 'track2', badgeId: string, slug: string) => {
    setTechStack((prev) => ({
      ...prev,
      [track]: prev[track].map((b) => (b.id === badgeId ? { ...b, iconSlug: slug } : b)),
    }));
  };

  // Loop duration update
  const handleDurationChange = (val: number) => {
    setTechStack((prev) => ({
      ...prev,
      loopDuration: val,
    }));
  };

  // Save All
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skills,
          techStack,
        }),
      });

      if (res.ok) {
        showToast('All changes saved', 'Skills matrix saved to content/ store.');
      } else {
        showToast('Save failed', 'Error saving data.', 'info');
      }
    } catch {
      showToast('Save failed', 'Connection error while persisting data.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <AdminToast title={toast.title} description={toast.description} variant={toast.variant} />
      )}

      {/* Top Header Bar matching Photo/screen (4).png */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-cockpit-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-cockpit-text tracking-tight">
              SKILLS & TECH STACK // ARCHITECTURAL REPOSITORY
            </h1>
          </div>
          <p className="text-xs font-mono text-cockpit-muted mt-1 flex items-center gap-2">
            <span>SOURCE: <code className="text-cockpit-text font-semibold">content/skills.json & tech-stack.json</code></span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">ZERO EXTERNAL DB</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50 font-mono text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isSaving ? 'Syncing Store...' : 'SAVE SKILLS MATRIX'}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text tracking-tight">
            Proficiency Sliders
          </h2>
          <p className="text-xs font-mono text-cockpit-muted">
            Calibrate technical capability scores and runtime constraints across languages & frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Column 1: Language Expertise */}
          <div className="bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cockpit-line">
              <div>
                <h3 className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text tracking-tight">
                  LANGUAGE EXPERTISE
                </h3>
                <span className="font-mono text-[10px] text-cockpit-muted uppercase">
                  {skills.languages?.length || 0} ACTIVE MODULES
                </span>
              </div>
              <button
                onClick={() => handleAddSkill('languages')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cockpit-hover hover:bg-cockpit-hover text-cockpit-text font-mono text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Language</span>
              </button>
            </div>

            <div className="space-y-3">
              {skills.languages?.map((skill, idx) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-lg bg-cockpit/60 border border-cockpit-line space-y-2.5 transition-all hover:bg-cockpit"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-xs font-bold text-cockpit-faint w-5">
                        0{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) =>
                          handleSkillTextChange('languages', skill.id, 'name', e.target.value)
                        }
                        className="px-2 py-0.5 bg-cockpit-raised border border-cockpit-line rounded font-['Space_Grotesk'] text-xs font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                      />
                      <input
                        type="text"
                        value={skill.detail}
                        onChange={(e) =>
                          handleSkillTextChange('languages', skill.id, 'detail', e.target.value)
                        }
                        className="px-2 py-0.5 bg-cockpit-raised border border-cockpit-line rounded font-mono text-[11px] text-cockpit-muted focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-1"
                        placeholder="e.g. Tokio • Wasm"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSkill('languages', idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-20 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveSkill('languages', idx, 'down')}
                        disabled={idx === skills.languages.length - 1}
                        className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-20 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          setPendingDelete({ kind: 'skill', cat: 'languages', id: skill.id, name: skill.name })
                        }
                        className="p-1 rounded border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={skill.proof || ''}
                    onChange={(e) =>
                      handleSkillTextChange('languages', skill.id, 'proof', e.target.value)
                    }
                    className="w-full px-2 py-1 bg-cockpit-raised border border-cockpit-line rounded font-mono text-[11px] text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Proof — e.g. Tokio + Wasm pipelines, zero-copy on hot paths"
                  />

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-cockpit-muted uppercase tracking-wider">Skill Level</span>
                        <button
                          type="button"
                          onClick={() => handleToggleMaster('languages', skill.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide text-[10px] transition-colors cursor-pointer ${
                            skill.master
                              ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                              : 'bg-cockpit-raised border-cockpit-line text-cockpit-faint hover:text-cockpit-muted'
                          }`}
                          title="Tandai sebagai sangat mahir / berpengalaman"
                        >
                          <Zap className="w-3 h-3" />
                          Master
                        </button>
                      </div>
                      <span className="font-bold text-cockpit-text px-1.5 py-0.5 rounded bg-cockpit-raised border border-cockpit-line tabular-nums">
                        {clampPercent(skill.percentage)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={clampPercent(skill.percentage)}
                        onChange={(e) => handlePercentChange('languages', skill.id, Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                        aria-label={`${skill.name} percentage`}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={clampPercent(skill.percentage)}
                        onChange={(e) => handlePercentChange('languages', skill.id, Number(e.target.value))}
                        className="w-14 px-1.5 py-0.5 bg-cockpit-raised border border-cockpit-line rounded text-right font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <BrandIcon slug={skill.iconSlug} name={skill.name} className="w-4 h-4" />
                      <select
                        value={skill.iconSlug || ''}
                        onChange={(e) => handleSkillLogoChange('languages', skill.id, e.target.value)}
                        className="flex-1 px-2 py-0.5 bg-cockpit-raised border border-cockpit-line rounded text-[11px] text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Auto from name</option>
                        {BRAND_LOGO_OPTIONS.map((opt) => (
                          <option key={opt.slug} value={opt.slug}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-[10px] text-cockpit-faint">
                      Slider 0–100. Pilih logo brand. Aktifkan Master jika sudah sangat mahir.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Framework & Engine Expertise */}
          <div className="bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cockpit-line">
              <div>
                <h3 className="font-['Space_Grotesk'] text-sm font-bold text-cockpit-text tracking-tight">
                  FRAMEWORK & ENGINE EXPERTISE
                </h3>
                <span className="font-mono text-[10px] text-cockpit-muted uppercase">
                  {skills.frameworks?.length || 0} ACTIVE MODULES
                </span>
              </div>
              <button
                onClick={() => handleAddSkill('frameworks')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-cockpit-hover hover:bg-cockpit-hover text-cockpit-text font-mono text-xs font-semibold cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Add Framework</span>
              </button>
            </div>

            <div className="space-y-3">
              {skills.frameworks?.map((skill, idx) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-lg bg-cockpit/60 border border-cockpit-line space-y-2.5 transition-all hover:bg-cockpit"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-mono text-xs font-bold text-cockpit-faint w-5">
                        0{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={skill.name}
                        onChange={(e) =>
                          handleSkillTextChange('frameworks', skill.id, 'name', e.target.value)
                        }
                        className="px-2 py-0.5 bg-cockpit-raised border border-cockpit-line rounded font-['Space_Grotesk'] text-xs font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                      />
                      <input
                        type="text"
                        value={skill.detail}
                        onChange={(e) =>
                          handleSkillTextChange('frameworks', skill.id, 'detail', e.target.value)
                        }
                        className="px-2 py-0.5 bg-cockpit-raised border border-cockpit-line rounded font-mono text-[11px] text-cockpit-muted focus:outline-none focus:ring-1 focus:ring-emerald-500 flex-1"
                        placeholder="e.g. Server Islands"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveSkill('frameworks', idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-20 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveSkill('frameworks', idx, 'down')}
                        disabled={idx === skills.frameworks.length - 1}
                        className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-20 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() =>
                          setPendingDelete({ kind: 'skill', cat: 'frameworks', id: skill.id, name: skill.name })
                        }
                        className="p-1 rounded border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 transition-colors cursor-pointer"
                        title="Delete Skill"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={skill.proof || ''}
                    onChange={(e) =>
                      handleSkillTextChange('frameworks', skill.id, 'proof', e.target.value)
                    }
                    className="w-full px-2 py-1 bg-cockpit-raised border border-cockpit-line rounded font-mono text-[11px] text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Proof — e.g. Concurrent islands, INP under 10ms on key routes"
                  />

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-cockpit-muted uppercase tracking-wider">Skill Level</span>
                        <button
                          type="button"
                          onClick={() => handleToggleMaster('frameworks', skill.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide text-[10px] transition-colors cursor-pointer ${
                            skill.master
                              ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                              : 'bg-cockpit-raised border-cockpit-line text-cockpit-faint hover:text-cockpit-muted'
                          }`}
                          title="Tandai sebagai sangat mahir / berpengalaman"
                        >
                          <Zap className="w-3 h-3" />
                          Master
                        </button>
                      </div>
                      <span className="font-bold text-cockpit-text px-1.5 py-0.5 rounded bg-cockpit-raised border border-cockpit-line tabular-nums">
                        {clampPercent(skill.percentage)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={clampPercent(skill.percentage)}
                        onChange={(e) => handlePercentChange('frameworks', skill.id, Number(e.target.value))}
                        className="flex-1 accent-emerald-500 cursor-pointer"
                        aria-label={`${skill.name} percentage`}
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={clampPercent(skill.percentage)}
                        onChange={(e) => handlePercentChange('frameworks', skill.id, Number(e.target.value))}
                        className="w-14 px-1.5 py-0.5 bg-cockpit-raised border border-cockpit-line rounded text-right font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <BrandIcon slug={skill.iconSlug} name={skill.name} className="w-4 h-4" />
                      <select
                        value={skill.iconSlug || ''}
                        onChange={(e) => handleSkillLogoChange('frameworks', skill.id, e.target.value)}
                        className="flex-1 px-2 py-0.5 bg-cockpit-raised border border-cockpit-line rounded text-[11px] text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">Auto from name</option>
                        {BRAND_LOGO_OPTIONS.map((opt) => (
                          <option key={opt.slug} value={opt.slug}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-[10px] text-cockpit-faint">
                      Slider 0–100. Pilih logo brand. Aktifkan Master jika sudah sangat mahir.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        title={pendingDelete?.kind === 'skill' ? 'Delete skill?' : 'Remove badge?'}
        description={
          pendingDelete
            ? pendingDelete.kind === 'badge'
              ? `This will remove "${pendingDelete.name}" from the ${pendingDelete.track === 'track1' ? 'Track 1' : 'Track 2'} logo marquee. Changes apply the next time you save.`
              : `This will remove "${pendingDelete.name}" from the skills matrix. Changes apply the next time you save.`
            : ''
        }
        confirmLabel={pendingDelete?.kind === 'badge' ? 'Remove' : 'Delete'}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.kind === 'skill') {
            handleDeleteSkill(pendingDelete.cat, pendingDelete.id);
          } else {
            handleDeleteBadge(pendingDelete.track, pendingDelete.id);
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
};

