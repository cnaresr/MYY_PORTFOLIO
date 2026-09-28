import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Dual-theme month picker: light slate default, cockpit dark inside .dark. */
export const MonthPicker: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}> = ({ value, onChange, disabled = false, placeholder = 'Pick a month' }) => {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState<number>(() => {
    const m = value ? value.match(/^(\d{4})/) : null;
    return m ? Number(m[1]) : new Date().getFullYear();
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectedMonth = value && /^\d{4}-\d{2}$/.test(value) ? Number(value.slice(5, 7)) - 1 : -1;

  const display = value && /^\d{4}-\d{2}$/.test(value)
    ? format(new Date(`${value}-01T00:00:00`), 'MMMM yyyy')
    : placeholder;

  const pick = (monthIndex: number) => {
    const iso = `${viewYear}-${String(monthIndex + 1).padStart(2, '0')}`;
    onChange(iso);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 dark:bg-cockpit-raised border border-slate-300 dark:border-cockpit-line-strong rounded text-left text-slate-900 dark:text-cockpit-text focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500/60 disabled:bg-slate-100 dark:disabled:bg-cockpit disabled:opacity-60 disabled:text-slate-400 dark:disabled:text-cockpit-faint cursor-pointer transition-colors hover:bg-white dark:hover:bg-cockpit-hover"
      >
        <span className="inline-flex items-center gap-2 min-w-0">
          <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-cockpit-faint shrink-0" />
          <span className={`text-sm font-['Hanken_Grotesk'] truncate ${!value || value === 'now' || value === 'NOW' ? 'text-slate-400 dark:text-cockpit-faint' : 'text-slate-900 dark:text-cockpit-text font-semibold'}`}>
            {value === 'now' || value === 'NOW' ? 'Present / Now' : display}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-cockpit-faint shrink-0 transition-transform" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[240px] rounded-xl bg-white dark:bg-cockpit-panel border border-slate-200 dark:border-cockpit-line-strong shadow-xl p-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setViewYear((y) => y - 1)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-cockpit-hover text-slate-600 dark:text-cockpit-muted cursor-pointer">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-['Space_Grotesk'] text-sm font-bold text-slate-950 dark:text-cockpit-text tracking-tight">{viewYear}</span>
            <button type="button" onClick={() => setViewYear((y) => y + 1)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-cockpit-hover text-slate-600 dark:text-cockpit-muted cursor-pointer">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, i) => {
              const isSel = i === selectedMonth && value?.startsWith(String(viewYear));
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => pick(i)}
                  className={`py-1.5 rounded-lg text-xs font-['Hanken_Grotesk'] transition-colors cursor-pointer ${isSel ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 font-bold' : 'text-slate-700 dark:text-cockpit-muted hover:bg-slate-100 dark:hover:bg-cockpit-hover dark:hover:text-cockpit-text'}`}
                >
                  {m.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
