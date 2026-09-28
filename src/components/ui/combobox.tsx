import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type ComboboxOption = { value: string; label: string };

interface ComboboxProps {
  items: ReadonlyArray<string | ComboboxOption>;
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
}

/** Dual-theme combobox: light slate default, cockpit dark inside .dark. */
export function Combobox({
  items,
  value,
  onValueChange,
  placeholder = 'Select an item...',
  emptyText = 'No items found.',
  className = '',
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Normalize items to { value, label }.
  const normalized = useMemo<ComboboxOption[]>(
    () =>
      items.map((item) =>
        typeof item === 'string' ? { value: item, label: item } : item
      ),
    [items]
  );

  const selected = normalized.find((item) => item.value === value);

  // While closed the input shows the selected label; while open it shows the query.
  const inputValue = open ? query : selected?.label ?? '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((item) => item.label.toLowerCase().includes(q));
  }, [normalized, query]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const openList = () => {
    setQuery('');
    setOpen(true);
  };

  const selectItem = (item: ComboboxOption) => {
    onValueChange?.(item.value);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={openList}
          onClick={() => !open && openList()}
          className="w-full pl-3 pr-9 py-2 text-xs font-['Hanken_Grotesk'] bg-slate-50 dark:bg-cockpit-raised border border-slate-300 dark:border-cockpit-line-strong rounded text-slate-900 dark:text-cockpit-text placeholder:text-slate-400 dark:placeholder:text-cockpit-faint focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500/60 focus:bg-white dark:focus:bg-cockpit-hover cursor-pointer transition-colors"
        />
        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-cockpit-faint absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[240px] rounded-xl bg-white dark:bg-cockpit-panel border border-slate-200 dark:border-cockpit-line-strong shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <ComboboxContent>
            {filtered.length === 0 && <ComboboxEmpty emptyText={emptyText} />}
            <ComboboxList>
              {filtered.map((item) => (
                <ComboboxItem
                  key={item.value}
                  value={item.value}
                  label={item.label}
                  selected={item.value === value}
                  onSelect={() => selectItem(item)}
                />
              ))}
            </ComboboxList>
          </ComboboxContent>
        </div>
      )}
    </div>
  );
}

export function ComboboxContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ComboboxEmpty({ emptyText }: { emptyText?: string }) {
  return (
    <p className="px-3 py-2 text-xs text-slate-400 dark:text-cockpit-faint font-['Hanken_Grotesk']">
      {emptyText}
    </p>
  );
}

export function ComboboxList({ children }: { children: React.ReactNode }) {
  return <div className="max-h-[220px] overflow-y-auto space-y-0.5">{children}</div>;
}

export function ComboboxItem({
  value,
  label,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      key={value}
      onClick={onSelect}
      className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-['Hanken_Grotesk'] text-left transition-colors cursor-pointer ${
        selected
          ? 'bg-emerald-500/15 text-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 font-semibold ring-1 ring-emerald-500/30'
          : 'text-slate-700 dark:text-cockpit-muted hover:bg-slate-100 dark:hover:bg-cockpit-hover dark:hover:text-cockpit-text'
      }`}
    >
      <span className="truncate">{label}</span>
      {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}
