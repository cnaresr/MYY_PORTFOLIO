import React from 'react';

/*
 * ConfirmDialog — confirmation dialog (alert-dialog style), dual-theme:
 * light slate by default, deep navy cockpit inside .dark/.admin-cockpit.
 *
 * API is a controlled component: drive it with `open` / `onOpenChange`;
 * call `onConfirm` when the destructive action is chosen.
 */
export const ConfirmDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Icon rendered in the destructive accent tile (default: Trash2). */
  icon?: React.ReactNode;
  onConfirm: () => void;
}> = ({
  open,
  onOpenChange,
  title = 'Delete this item?',
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  icon,
  onConfirm,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="bg-white dark:bg-cockpit-panel border border-slate-300 dark:border-cockpit-line-strong rounded-xl shadow-2xl max-w-sm w-full overflow-hidden text-slate-900 dark:text-cockpit-text animate-in fade-in zoom-in-95"
      >
        {/* Header with destructive accent media + title */}
        <div className="px-6 pt-6 pb-4 flex flex-col items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center">
            {icon || (
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            )}
          </div>
          <div>
            <h3
              id="confirm-dialog-title"
              className="font-['Space_Grotesk'] text-base font-bold text-slate-950 dark:text-cockpit-text tracking-tight"
            >
              {title}
            </h3>
            {description && (
              <p
                id="confirm-dialog-desc"
                className="font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-cockpit-muted leading-relaxed mt-1"
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-6 pt-1 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-cockpit-line-strong hover:bg-slate-100 dark:hover:bg-cockpit-hover text-slate-700 dark:text-cockpit-muted font-mono text-xs font-medium transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
