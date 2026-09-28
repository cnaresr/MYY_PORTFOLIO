import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Home,
  Mail,
  MapPin,
  FileText,
} from 'lucide-react';
import { AdminToast } from '../ui/alert';
import { AvatarUploader } from './AvatarUploader';

// Full country list (ISO 3166 common names). Indonesia first = default.
const COUNTRIES = [
  'Indonesia', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin',
  'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde',
  'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Brazzaville)',
  'Congo (Kinshasa)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland',
  'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
  'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Iraq', 'Ireland', 'Israel',
  'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
] as const;

interface SocialLink {
  name: string;
  href: string;
  icon?: string;
}

interface ProfileData {
  name: string;
  initials: string;
  role: string;
  title: string;
  subtitle: string;
  summary: string;
  email: string;
  /** Country / region shown on the contact card. */
  country?: string;
  /** Office / workplace address. */
  officeAddress?: string;
  /** Home / residence address. */
  homeAddress?: string;
  avatar: string;
  cvPdf: string;
  socialLinks: SocialLink[];
}

interface ProfileManagerProps {
  initialProfile: ProfileData;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ initialProfile }) => {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [toast, setToast] = useState<{ title: string; description?: string; variant?: 'success' | 'info' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (title: string, description?: string, variant: 'success' | 'info' = 'success') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        showToast('Profile saved', 'Profile & Hero specifications persisted to content/profile.json.');
      } else {
        showToast('Save failed', 'Failed to update profile.', 'info');
      }
    } catch (e) {
      showToast('Save failed', 'Network error while persisting profile data.', 'info');
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

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-cockpit-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-cockpit-text tracking-tight">
              PROFILE & HERO IDENTITY MANAGER // ROOT SPEC
            </h1>
          </div>
          <p className="text-xs font-mono text-cockpit-muted mt-1 flex items-center gap-2">
            <span>PERSISTENCE: <code className="text-cockpit-text font-semibold">content/profile.json</code></span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">ZERO DB ATOMIC STORE</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50 font-mono text-xs font-bold shadow-2xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isSaving ? 'Persisting Profile...' : 'Save Profile Specs'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Editor (7 cols) */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs p-6 space-y-4 font-mono text-xs">
          <div className="pb-3 border-b border-cockpit-line flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text tracking-tight">
              CORE IDENTITY PARAMETERS
            </h2>
            <span className="text-[10px] text-cockpit-muted">HOMEPAGE HERO HEADER</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-cockpit-muted font-bold mb-1">INITIALS</label>
              <input
                type="text"
                value={profile.initials}
                onChange={(e) => setProfile({ ...profile, initials: e.target.value })}
                className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-cockpit-muted font-bold mb-1">HERO DISPLAY HEADLINE (H1)</label>
              <input
                type="text"
                value={profile.title}
                onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded font-['Space_Grotesk'] font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
              />
            </div>
            <div>
              <label className="block text-cockpit-muted font-bold mb-1">SLOGAN (KARTU HERO)</label>
              <input
                type="text"
                value={profile.subtitle}
                onChange={(e) => setProfile({ ...profile, subtitle: e.target.value })}
                placeholder="e.g. Code with Passion, Build with Purpose"
                className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded font-['Space_Grotesk'] font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-cockpit-muted font-bold mb-1">PERIBAHASA / KATA-KATA PENYEMANGAT (KARTU HERO)</label>
            <textarea
              rows={4}
              value={profile.summary}
              onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
              placeholder="e.g. Di mana ada kemauan, di situ ada jalan. Teruslah berkarya dan berinovasi tanpa henti."
              className="w-full p-3 bg-cockpit border border-cockpit-line-strong rounded font-sans text-xs text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-cockpit-muted font-bold mb-1">DISPATCH EMAIL</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Country selector + office / home addresses */}
          <div>
            <label className="block text-cockpit-muted font-bold mb-2">LOCATION & ADDRESSES</label>
            <div className="mb-3">
              <label className="block text-cockpit-muted font-bold mb-1 text-[11px]">COUNTRY / REGION</label>
              <select
                value={profile.country || 'Indonesia'}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-cockpit-muted font-bold mb-1 text-[11px]">
                  <Building2 className="w-3.5 h-3.5" /> OFFICE
                </label>
                <textarea
                  rows={3}
                  value={profile.officeAddress || ''}
                  onChange={(e) => setProfile({ ...profile, officeAddress: e.target.value })}
                  className="w-full p-2.5 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Jl. Jend. Sudirman Kav. 52-53, Jakarta Selatan"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-cockpit-muted font-bold mb-1 text-[11px]">
                  <Home className="w-3.5 h-3.5" /> HOME
                </label>
                <textarea
                  rows={3}
                  value={profile.homeAddress || ''}
                  onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })}
                  className="w-full p-2.5 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                  placeholder="Jl. Kemang Raya No. 12, Jakarta Selatan"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-cockpit-muted font-bold mb-1">CV PDF DOWNLOAD PATH</label>
            <input
              type="text"
              value={profile.cvPdf}
              onChange={(e) => setProfile({ ...profile, cvPdf: e.target.value })}
              className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-cockpit-muted font-bold mb-1">AVATAR / PORTRAIT ASSET</label>
            <AvatarUploader
              value={profile.avatar}
              onChange={(path) => setProfile((prev) => ({ ...prev, avatar: path }))}
            />
            <input
              type="text"
              value={profile.avatar}
              onChange={(e) => setProfile({ ...profile, avatar: e.target.value })}
              className="mt-2 w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="/images/portrait.jpg"
            />
          </div>

          {/* Social Links */}
          <div className="space-y-2 pt-2 border-t border-cockpit-line">
            <label className="block text-cockpit-muted font-bold">SOCIAL & EXTERNAL REPOSITORIES</label>
            {profile.socialLinks?.map((link, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => {
                    const next = [...profile.socialLinks];
                    next[idx].name = e.target.value;
                    setProfile({ ...profile, socialLinks: next });
                  }}
                  className="w-36 px-2 py-1.5 bg-cockpit border border-cockpit-line-strong rounded font-bold text-cockpit-text"
                />
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => {
                    const next = [...profile.socialLinks];
                    next[idx].href = e.target.value;
                    setProfile({ ...profile, socialLinks: next });
                  }}
                  className="flex-1 px-2 py-1.5 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-cockpit-line flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-50 font-mono text-xs font-bold shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isSaving ? 'Syncing Store...' : 'Persist Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Right Column: Live Hero Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-cockpit rounded-xl p-6 border border-cockpit-line-strong shadow-xl text-cockpit-text space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cockpit-line text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold text-cockpit-text">LIVE HERO VIEWPORT SIMULATION</span>
              </div>
              <span className="text-emerald-400 text-[10px]">SSR SYNCED</span>
            </div>

            {/* Identity & Portrait */}
            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-cockpit-raised border border-cockpit-line shrink-0">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  onError={(e: any) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-cockpit-text tracking-tight">
                  {profile.name}
                </h3>
                <p className="text-xs font-mono text-emerald-400 font-semibold">{profile.subtitle}</p>
              </div>
            </div>

            {/* Slogan & Kata Penyemangat */}
            <p className="text-xs text-cockpit-muted font-sans italic leading-relaxed pt-2">
              "{profile.summary}"
            </p>

            {/* Contact details */}
            <div className="p-3 rounded-lg bg-cockpit-raised border border-cockpit-line font-mono text-[11px] space-y-1.5 text-cockpit-muted">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cockpit-muted" />
                <span>{profile.email}</span>
              </div>
              {profile.country && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cockpit-muted" />
                  <span>{profile.country}</span>
                </div>
              )}
              {profile.officeAddress && (
                <div className="flex items-start gap-2">
                  <Building2 className="w-3.5 h-3.5 text-cockpit-muted mt-0.5 shrink-0" />
                  <span className="whitespace-pre-line">{profile.officeAddress}</span>
                </div>
              )}
              {profile.homeAddress && (
                <div className="flex items-start gap-2">
                  <Home className="w-3.5 h-3.5 text-cockpit-muted mt-0.5 shrink-0" />
                  <span className="whitespace-pre-line">{profile.homeAddress}</span>
                </div>
              )}
            </div>

            {/* Action buttons preview */}
            <div className="pt-2 flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1.5 rounded bg-emerald-500 text-cockpit-text font-bold flex items-center gap-1">
                <span>Direct Contact</span>
              </span>
              <span className="px-3 py-1.5 rounded bg-cockpit-raised text-cockpit-text border border-cockpit-line-strong flex items-center gap-1">
                <FileText className="w-3 h-3 text-cockpit-faint" />
                <span>Download CV</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
