import React, { useState } from 'react';
import type { AboutMeData } from '../../data/aboutMe';

export function AboutMeManager({ initialData }: { initialData: AboutMeData }) {
  const [data, setData] = useState<AboutMeData>({
    badgeLabel: initialData.badgeLabel || 'ABOUT ME // BACKGROUND',
    topLabel: initialData.topLabel || '',
    title: initialData.title || '',
    subtitle: initialData.subtitle || '',
    stackLabel: initialData.stackLabel || 'TECH / STACK HIGHLIGHT',
    stackText: initialData.stackText || '',
    quote: initialData.quote || '',
    paragraphs: initialData.paragraphs || [],
  });
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
    <div className="max-w-5xl space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-['Space_Grotesk'] text-2xl font-bold text-cockpit-text">About Me Configuration</h1>
          <p className="text-cockpit-muted text-sm mt-1">
            Konfigurasi seluruh teks dan konten section "About Me" yang ditampilkan di dashboard utama.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-mono text-sm shadow-sm transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isSaving ? 'sync' : 'save'}
          </span>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveMessage && (
        <div
          className={`p-3 rounded-lg text-sm font-medium border ${
            saveMessage.includes('error') || saveMessage.includes('Error')
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          {saveMessage}
        </div>
      )}

      {/* Group 1: Header & Headline Info */}
      <div className="p-6 rounded-xl border border-cockpit-line bg-cockpit-panel space-y-6">
        <div className="border-b border-cockpit-line pb-2 flex items-center justify-between">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">1. Header & Headline Identity</h2>
          <span className="font-mono text-[11px] text-cockpit-muted uppercase">Bagian Atas Section</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Badge Tag / Kategori</label>
            <input
              type="text"
              value={data.badgeLabel || ''}
              onChange={(e) => updateField('badgeLabel', e.target.value)}
              placeholder="e.g. ABOUT ME // BACKGROUND"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Top Label / Lokasi (Kanan Atas)</label>
            <input
              type="text"
              value={data.topLabel}
              onChange={(e) => updateField('topLabel', e.target.value)}
              placeholder="e.g. BASED IN SEMARANG, TEMBALANG"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Main Title / Role Utama</label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Full-Stack Developer"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm font-semibold text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Subtitle / Tagline</label>
            <input
              type="text"
              value={data.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="e.g. Membuat Website Sesuai Kebutuhan"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Group 2: Left Sidebar (Tech Highlight & Quote) */}
      <div className="p-6 rounded-xl border border-cockpit-line bg-cockpit-panel space-y-6">
        <div className="border-b border-cockpit-line pb-2 flex items-center justify-between">
          <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">2. Highlights & Quote</h2>
          <span className="font-mono text-[11px] text-cockpit-muted uppercase">Kolom Kiri Dashboard</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Tech / Stack Title Label</label>
            <input
              type="text"
              value={data.stackLabel || ''}
              onChange={(e) => updateField('stackLabel', e.target.value)}
              placeholder="e.g. TECH / STACK HIGHLIGHT"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Tech / Stack Highlight Value</label>
            <input
              type="text"
              value={data.stackText}
              onChange={(e) => updateField('stackText', e.target.value)}
              placeholder="e.g. NODEJS · EXPRESSJS · CSS · HTML"
              className="w-full px-3 py-2 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-cockpit-muted uppercase mb-1">Focus Quote / Motto Personal</label>
            <textarea
              rows={3}
              value={data.quote || ''}
              onChange={(e) => updateField('quote', e.target.value)}
              placeholder="e.g. Fokus menciptakan antarmuka yang bersih, responsif, dan fungsional dengan performa yang konsisten."
              className="w-full p-3 bg-cockpit-bg border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none leading-relaxed resize-y"
            />
            <p className="text-[11px] text-cockpit-muted mt-1 italic">
              Teks kutipan/motto yang ditampilkan di bawah sorotan tech stack dengan garis aksen vertikal di kolom kiri.
            </p>
          </div>
        </div>
      </div>

      {/* Group 3: Right Column (Paragraphs) */}
      <div className="p-6 rounded-xl border border-cockpit-line bg-cockpit-panel space-y-6">
        <div className="flex items-center justify-between border-b border-cockpit-line pb-2">
          <div>
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">3. Biography & Narrative Paragraphs</h2>
            <p className="text-cockpit-muted text-xs mt-0.5">Kolom Kanan Dashboard (setiap item menjadi paragraf terpisah)</p>
          </div>
          <button
            type="button"
            onClick={() => updateField('paragraphs', [...data.paragraphs, ''])}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold font-mono transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            ADD PARAGRAPH
          </button>
        </div>

        <div className="space-y-4">
          {data.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-cockpit-bg border border-cockpit-line rounded-lg">
              <span className="font-mono text-xs font-bold text-cockpit-muted pt-2 shrink-0">#{i + 1}</span>
              <textarea
                value={p}
                onChange={(e) => {
                  const newP = [...data.paragraphs];
                  newP[i] = e.target.value;
                  updateField('paragraphs', newP);
                }}
                rows={4}
                placeholder="Tuliskan cerita / paragraf tentang diri Anda..."
                className="flex-1 px-3 py-2 bg-cockpit-panel border border-cockpit-line rounded-lg text-sm text-cockpit-text focus:border-emerald-500 focus:outline-none resize-y leading-relaxed"
              />
              <button
                type="button"
                onClick={() => {
                  const newP = data.paragraphs.filter((_, idx) => idx !== i);
                  updateField('paragraphs', newP);
                }}
                title="Hapus Paragraf"
                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))}
          {data.paragraphs.length === 0 && (
            <p className="text-xs text-cockpit-muted italic py-6 text-center">
              Belum ada paragraf. Klik "+ ADD PARAGRAPH" untuk menambahkan cerita Anda.
            </p>
          )}
        </div>
      </div>

      {/* Group 4: Live Dashboard Preview */}
      <div className="p-6 rounded-xl border border-cockpit-line bg-cockpit-panel space-y-4">
        <div className="flex items-center justify-between border-b border-cockpit-line pb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">visibility</span>
            <h2 className="font-['Space_Grotesk'] text-lg font-bold text-cockpit-text">Live Preview (Dashboard Utama)</h2>
          </div>
          <span className="font-mono text-[11px] text-cockpit-muted uppercase">Real-Time Sync</span>
        </div>

        <div className="p-6 md:p-8 rounded-xl bg-cockpit-bg border border-cockpit-line">
          {/* Header Preview */}
          <div className="flex flex-col md:flex-row md:items-end justify-between pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cockpit-panel border border-cockpit-line mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-mono text-[10px] text-cockpit-text uppercase tracking-widest font-bold">
                  {data.badgeLabel || 'ABOUT ME // BACKGROUND'}
                </span>
              </div>
              <h3 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-cockpit-text tracking-tight">
                {data.title || 'Role / Judul Belum Diisi'}
              </h3>
              <p className="text-sm sm:text-base text-cockpit-muted mt-1">
                {data.subtitle || 'Subtitle belum diisi'}
              </p>
            </div>
            {data.topLabel && (
              <div className="mt-3 md:mt-0">
                <span className="font-mono text-xs text-cockpit-muted uppercase font-semibold">
                  {data.topLabel}
                </span>
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-cockpit-line my-6"></div>

          {/* Grid Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              {data.stackText && (
                <div>
                  <span className="font-mono text-[11px] font-bold text-cockpit-muted uppercase tracking-widest block mb-1">
                    {data.stackLabel || 'TECH / STACK HIGHLIGHT'}
                  </span>
                  <p className="font-mono text-xs sm:text-sm font-semibold text-cockpit-text">
                    {data.stackText}
                  </p>
                </div>
              )}
              {data.quote && (
                <div className="pl-3 border-l-2 border-emerald-500/70">
                  <p className="text-xs text-cockpit-muted italic leading-relaxed">
                    "{data.quote}"
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-8 space-y-4">
              {data.paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  className={`text-cockpit-text text-xs sm:text-sm leading-relaxed ${
                    idx === 0 ? 'font-medium text-cockpit-text' : 'text-cockpit-muted'
                  }`}
                >
                  {p}
                </p>
              ))}
              {data.paragraphs.length === 0 && (
                <p className="text-xs text-cockpit-muted italic">Tidak ada paragraf biografi.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
