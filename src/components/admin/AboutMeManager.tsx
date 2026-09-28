import React, { useState } from 'react';
import type { AboutMeData } from '../../data/aboutMe';

export function AboutMeManager({ initialData }: { initialData: AboutMeData }) {
  const [data, setData] = useState<AboutMeData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const res = await fetch('/api/admin/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSaveMessage('Saved successfully.');
      } else {
        setSaveMessage('Error saving data.');
      }
    } catch (e) {
      setSaveMessage('Network error.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const updateField = (field: keyof AboutMeData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-cockpit-text">About Me Configuration</h1>
          <p className="text-cockpit-muted text-sm mt-1">Configure the "About Me" text content displayed on your portfolio.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-mono text-sm shadow-sm transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSaving ? 'sync' : 'save'}
          </span>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMessage && (
        <div className={`p-3 rounded-lg text-sm font-medium ${saveMessage.includes('error') ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
          {saveMessage}
        </div>
      )}

      {/* Main Content Config */}
      <div className="p-6 rounded-xl border border-cockpit-line bg-cockpit-panel space-y-6">
        <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text border-b border-cockpit-line pb-2">Headline & Sub-labels</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Top Label / Location</label>
            <input
              type="text"
              value={data.topLabel}
              onChange={(e) => updateField('topLabel', e.target.value)}
              placeholder="e.g. BASED IN SEMARANG, TEMBALANG"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Tech / Stack Highlight</label>
            <input
              type="text"
              value={data.stackText}
              onChange={(e) => updateField('stackText', e.target.value)}
              placeholder="e.g. NODEJS · PYTHON · CSS · HTML"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Main Title / Role</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Subtitle</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="e.g. Membuat website simpel namun bagus"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Paragraphs Section */}
      <div className="p-6 rounded-xl border border-cockpit-line bg-cockpit-panel space-y-6">
        <div className="flex items-center justify-between border-b border-cockpit-line pb-2">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">Biography & Narrative Paragraphs</h2>
          <button
            type="button"
            onClick={() => updateField('paragraphs', [...data.paragraphs, ''])}
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 font-mono transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            ADD PARAGRAPH
          </button>
        </div>

        <div className="space-y-4">
          {data.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-cockpit-bg border border-cockpit-line rounded-lg">
              <span className="font-mono text-xs text-cockpit-muted pt-2 shrink-0">#{i + 1}</span>
              <textarea
                value={p}
                onChange={(e) => {
                  const newP = [...data.paragraphs];
                  newP[i] = e.target.value;
                  updateField('paragraphs', newP);
                }}
                rows={4}
                placeholder="Tuliskan cerita / paragraf tentang diri Anda..."
                className="flex-1 px-3 py-2 bg-cockpit-panel border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none resize-y"
              />
              <button
                type="button"
                onClick={() => {
                  const newP = data.paragraphs.filter((_, idx) => idx !== i);
                  updateField('paragraphs', newP);
                }}
                title="Hapus Paragraf"
                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
          {data.paragraphs.length === 0 && (
            <p className="text-xs text-cockpit-muted italic py-4 text-center">
              Belum ada paragraf. Klik "+ ADD PARAGRAPH" untuk menambahkan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
