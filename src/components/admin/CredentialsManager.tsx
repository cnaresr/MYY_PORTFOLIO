import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  ArrowUp,
  ArrowDown,
  X,
  Lock,
} from 'lucide-react';
import { AdminToast } from '../ui/alert';
import { ConfirmDialog } from '../ui/alert-dialog';

interface Certificate {
  id: string;
  title: string;
  level: string;
  issuer: string;
  icon: string;
  status: string;
  issued: string;
  validityLabel: string;
  validityValue: string;
  hash: string;
  verifyUrl: string;
  verifyButtonText: string;
  order: number;
}

interface CredentialsManagerProps {
  initialCertificates: Certificate[];
}

export const CredentialsManager: React.FC<CredentialsManagerProps> = ({
  initialCertificates,
}) => {
  const [certs, setCerts] = useState<Certificate[]>(initialCertificates);
  const [toast, setToast] = useState<{ title: string; description?: string; variant?: 'success' | 'info' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalForm, setModalForm] = useState<Certificate>({
    id: '',
    title: '',
    level: '',
    issuer: '',
    icon: 'cloud_done',
    status: 'ACTIVE',
    issued: String(new Date().getFullYear()),
    validityLabel: 'EXPIRY',
    validityValue: String(new Date().getFullYear() + 3),
    hash: '',
    verifyUrl: '',
    verifyButtonText: 'Verify Credential',
    order: 1,
  });
  const [isSaving, setIsSaving] = useState(false);

  // Confirm-delete state
  const [pendingDelete, setPendingDelete] = useState<Certificate | null>(null);

  const showToast = (title: string, description?: string, variant: 'success' | 'info' = 'success') => {
    setToast({ title, description, variant });
    setTimeout(() => setToast(null), 3500);
  };

  const openNewModal = () => {
    setIsEditing(false);
    const nextOrder = certs.length + 1;
    setModalForm({
      id: `cert-${Date.now()}`,
      title: '',
      level: '',
      issuer: '',
      icon: 'verified',
      status: 'ACTIVE',
      issued: new Date().getFullYear().toString(),
      validityLabel: 'EXPIRY',
      validityValue: (new Date().getFullYear() + 3).toString(),
      hash: '',
      verifyUrl: '',
      verifyButtonText: 'Verify Credential',
      order: nextOrder,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Certificate) => {
    setIsEditing(true);
    setModalForm({ ...item });
    setIsModalOpen(true);
  };

  const handleSaveModal = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let updatedList: Certificate[];
      if (isEditing) {
        updatedList = certs.map((c) => (c.id === modalForm.id ? modalForm : c));
      } else {
        updatedList = [...certs, modalForm];
      }

      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
        setCerts(updatedList);
        setIsModalOpen(false);
        showToast(
          'Credential saved',
          isEditing
            ? `Credential ${modalForm.title} updated in file store.`
            : 'New credential appended to content/certificates.json.'
        );
      } else {
        showToast('Save failed', 'Error persisting credentials.', 'info');
      }
    } catch (e) {
      showToast('Save failed', 'Network error while saving credentials.', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (certId: string) => {
    try {
      const updatedList = certs.filter((c) => c.id !== certId);
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });

      if (res.ok) {
        setCerts(updatedList);
        showToast('Credential deleted', 'Removed from content/certificates.json.');
      }
    } catch (e) {
      showToast('Delete failed', 'Error deleting credential.', 'info');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= certs.length) return;

    const list = [...certs];
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;

    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));

    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reordered),
      });
      if (res.ok) {
        setCerts(reordered);
        showToast('Order updated', 'Credential priority order updated.');
      }
    } catch (e) {
      showToast('Update failed', 'Failed to update order.', 'info');
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
              CREDENTIALS & CERTIFICATION LEDGER // PROOF OF EXPERTISE
            </h1>
          </div>
          <p className="text-xs font-mono text-cockpit-muted mt-1 flex items-center gap-2">
            <span>STORE: <code className="text-cockpit-text font-semibold">content/certificates.json</code></span>
            <span>•</span>
            <span className="text-emerald-300 font-semibold">JSON FILE STORE</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 font-mono text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ Add Credential Proof</span>
          </button>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase">Total Credentials</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-cockpit-text mt-1">
            {certs.length}
          </div>
          <div className="text-[10px] font-mono text-cockpit-muted mt-0.5">Persisted in JSON store</div>
        </div>

        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase">Active / Valid</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-emerald-400 mt-1">
            {certs.filter((c) => c.status === 'ACTIVE').length}
          </div>
          <div className="text-[10px] font-mono text-emerald-300 mt-0.5">Status ACTIVE</div>
        </div>

        <div className="p-4 bg-cockpit-raised border border-cockpit-line rounded-xl shadow-2xs">
          <div className="text-[11px] font-mono text-cockpit-muted uppercase">Other Status</div>
          <div className="text-2xl font-bold font-['Space_Grotesk'] text-cockpit-text mt-1">
            {certs.filter((c) => c.status !== 'ACTIVE').length}
          </div>
          <div className="text-[10px] font-mono text-cockpit-muted mt-0.5">Expired / inactive records</div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certs.map((cert, index) => (
          <div
            key={cert.id}
            className="bg-cockpit-raised border border-cockpit-line rounded-xl p-5 shadow-2xs hover:border-cockpit-line-strong transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Header: Issuer + Status + Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-cockpit-line">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded bg-cockpit-hover text-cockpit-text font-bold text-[10px]">
                    {cert.issuer}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                    {cert.status}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-20 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === certs.length - 1}
                    className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover disabled:opacity-20 text-cockpit-muted cursor-pointer disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => openEditModal(cert)}
                    className="p-1 rounded border border-cockpit-line hover:bg-cockpit-hover text-cockpit-text cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setPendingDelete(cert)}
                    className="p-1 rounded border border-rose-500/40 hover:bg-rose-500/10 text-rose-400 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Title & Level */}
              <div className="pt-3">
                <h3 className="font-['Space_Grotesk'] text-base font-bold text-cockpit-text">
                  {cert.title}
                </h3>
                <p className="text-xs font-mono text-cockpit-muted mt-0.5">{cert.level}</p>
              </div>

              {/* Ledger metadata */}
              <div className="mt-4 p-3 rounded-lg bg-cockpit border border-cockpit-line font-mono text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cockpit-muted">ISSUED:</span>
                  <span className="font-bold text-cockpit-text">{cert.issued}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-cockpit-muted">{cert.validityLabel}:</span>
                  <span className="font-bold text-cockpit-text">{cert.validityValue}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-cockpit-line">
                  <span className="text-cockpit-muted flex items-center gap-1">
                    <Lock className="w-3 h-3" /> HASH:
                  </span>
                  <span className="font-mono text-cockpit-text bg-cockpit-raised px-1.5 py-0.5 rounded border border-cockpit-line">
                    {cert.hash}
                  </span>
                </div>
              </div>
            </div>

            {/* External verification link */}
            <div className="pt-2">
              <a
                href={cert.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25 font-mono text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>{cert.verifyButtonText || 'Verify Ledger Badge'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-cockpit-faint" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-cockpit-raised border border-cockpit-line-strong rounded-xl shadow-2xl max-w-xl w-full my-8 overflow-hidden text-cockpit-text animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 bg-cockpit-raised text-cockpit-text border-b border-cockpit-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-['Space_Grotesk'] text-base font-bold">
                  {isEditing ? 'EDIT CREDENTIAL SPECIFICATION' : 'NEW CREDENTIAL SPECIFICATION'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-cockpit-faint hover:text-cockpit-text cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-cockpit-muted font-bold mb-1">CREDENTIAL TITLE</label>
                <input
                  type="text"
                  required
                  value={modalForm.title}
                  onChange={(e) => setModalForm({ ...modalForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded font-['Space_Grotesk'] font-bold text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="e.g. AWS Certified Solutions Architect"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">CERTIFICATION LEVEL</label>
                  <input
                    type="text"
                    value={modalForm.level}
                    onChange={(e) => setModalForm({ ...modalForm, level: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. Professional Level (SAP-C02)"
                  />
                </div>
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">ISSUING AUTHORITY</label>
                  <input
                    type="text"
                    value={modalForm.issuer}
                    onChange={(e) => setModalForm({ ...modalForm, issuer: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="e.g. AMAZON WEB SERVICES"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">YEAR ISSUED</label>
                  <input
                    type="text"
                    value={modalForm.issued}
                    onChange={(e) => setModalForm({ ...modalForm, issued: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">VALIDITY LABEL</label>
                  <input
                    type="text"
                    value={modalForm.validityLabel}
                    onChange={(e) => setModalForm({ ...modalForm, validityLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="EXPIRY or VALIDATION"
                  />
                </div>
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">VALIDITY VALUE</label>
                  <input
                    type="text"
                    value={modalForm.validityValue}
                    onChange={(e) => setModalForm({ ...modalForm, validityValue: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="2027 or PERPETUAL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-cockpit-muted font-bold">CRYPTOGRAPHIC HASH</label>
                    <button
                      type="button"
                      onClick={() => {
                        const hex = Array.from({ length: 16 }, () =>
                          Math.floor(Math.random() * 16).toString(16)
                        ).join('');
                        setModalForm({ ...modalForm, hash: `SHA-256 // ${hex}` });
                      }}
                      className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Generate Fingerprint
                    </button>
                  </div>
                  <input
                    type="text"
                    value={modalForm.hash}
                    onChange={(e) => setModalForm({ ...modalForm, hash: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    placeholder="SHA-256 // a8f9c0e2b4d1..."
                  />
                </div>
                <div>
                  <label className="block text-cockpit-muted font-bold mb-1">BUTTON TEXT</label>
                  <input
                    type="text"
                    value={modalForm.verifyButtonText}
                    onChange={(e) => setModalForm({ ...modalForm, verifyButtonText: e.target.value })}
                    className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cockpit-muted font-bold mb-1">VERIFICATION URL</label>
                <input
                  type="url"
                  value={modalForm.verifyUrl}
                  onChange={(e) => setModalForm({ ...modalForm, verifyUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-cockpit border border-cockpit-line-strong rounded text-cockpit-text focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-cockpit-line flex items-center justify-between">
                <span className="text-[10px] text-cockpit-muted">
                  Writes to <code className="text-cockpit-text">content/certificates.json</code>
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
                    <span>{isSaving ? 'Persisting...' : 'Save Credential'}</span>
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
        title="Delete credential?"
        description={
          pendingDelete
            ? `This will permanently remove "${pendingDelete.title}" from content/certificates.json and invalidate its ledger proof.`
            : ''
        }
        onConfirm={() => {
          if (pendingDelete) handleDelete(pendingDelete.id);
        }}
      />
    </div>
  );
};
