import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';

/**
 * Alert primitives (shadcn-style API), dual-theme:
 * - default: light slate (public pages)
 * - inside .dark / .admin-cockpit: deep navy cockpit surfaces
 */
export const AlertTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`font-['Space_Grotesk'] text-sm font-bold text-slate-950 dark:text-cockpit-text tracking-tight ${className}`}
  >
    {children}
  </div>
);

export const AlertDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={`font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-cockpit-muted leading-relaxed mt-0.5 ${className}`}
  >
    {children}
  </div>
);

export const Alert: React.FC<{
  variant?: 'success' | 'info';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'info', icon, children, className = '' }) => {
  const accentVar =
    variant === 'success'
      ? {
          bg: 'bg-emerald-50/70 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/30',
          icon: '#059669',
          darkIcon: '#34d399',
          label: 'SUCCESS',
        }
      : {
          bg: 'bg-slate-50 dark:bg-cockpit-raised',
          border: 'border-slate-200 dark:border-cockpit-line-strong',
          icon: '#0f172a',
          darkIcon: '#8fa3c0',
          label: 'INFO',
        };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-sm border ${accentVar.bg} ${accentVar.border} ${className}`}
    >
      <span className="mt-0.5 shrink-0">
        {icon || (
          <CheckCircle2
            className="w-4 h-4 dark:hidden"
            style={{ color: accentVar.icon }}
          />
        )}
        {icon || (
          <Info
            className="w-4 h-4 hidden dark:block"
            style={{ color: accentVar.darkIcon }}
          />
        )}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
      <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest font-bold text-slate-400 dark:text-cockpit-faint">
        {accentVar.label}
      </span>
    </div>
  );
};

/** Toast wrapper used by admin managers — renders the alert stack bottom-right. */
export const AdminToast: React.FC<{
  title: string;
  description?: string;
  variant?: 'success' | 'info';
}> = ({ title, description, variant = 'success' }) => (
  <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,360px)] animate-in fade-in slide-in-from-bottom-2 duration-200">
    <Alert variant={variant}>
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  </div>
);
