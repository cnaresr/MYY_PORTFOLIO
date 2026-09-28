import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  FolderGit2,
  Cpu,
  ShieldCheck,
  Mail,

  KeyRound,
  Terminal,
  ArrowRight,
  X,
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Actions';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge?: string;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette' as any, handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette' as any, handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-projects',
        category: 'Navigation',
        title: 'Explore Architecture Systems',
        subtitle: 'Navigate to distributed case studies & system telemetry',
        icon: <FolderGit2 className="w-4 h-4 text-emerald-400" />,
        badge: '#projects',
        action: () => {
          setIsOpen(false);
          const el = document.getElementById('projects');
          el?.scrollIntoView({ behavior: 'smooth' });
        },
      },
      {
        id: 'nav-skills',
        category: 'Navigation',
        title: 'Technical Radar & Skills Matrix',
        subtitle: 'View languages, frameworks, and continuous marquee ticker',
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        badge: '#skills',
        action: () => {
          setIsOpen(false);
          const el = document.getElementById('skills');
          el?.scrollIntoView({ behavior: 'smooth' });
        },
      },
      {
        id: 'nav-certificates',
        category: 'Navigation',
        title: 'Cryptographic Credentials Ledger',
        subtitle: 'SHA-256 verifiable architecture certifications',
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        badge: '#certificates',
        action: () => {
          setIsOpen(false);
          const el = document.getElementById('certificates');
          el?.scrollIntoView({ behavior: 'smooth' });
        },
      },
      {
        id: 'nav-contact',
        category: 'Navigation',
        title: 'Dispatch Inquiry / Contact',
        subtitle: 'Transmit message to secure dispatch console',
        icon: <Mail className="w-4 h-4 text-rose-400" />,
        badge: '#contact',
        action: () => {
          setIsOpen(false);
          const el = document.getElementById('contact');
          el?.scrollIntoView({ behavior: 'smooth' });
        },
      },

      // Actions
      {
        id: 'act-copy-email-alt',
        category: 'Actions',
        title: 'Copy Dispatch Email',
        subtitle: 'Send a secure inquiry via email',
        icon: <KeyRound className="w-4 h-4 text-emerald-400" />,
        badge: 'MAIL',
        action: () => {
          navigator.clipboard.writeText('cezar.nares@gmail.com');
          setIsOpen(false);
          showToast('Dispatch email copied to clipboard!');
        },
      },
      {
        id: 'act-open-spec',
        category: 'Actions',
        title: 'Inspect Veloce Architecture Spec (SYS 01)',
        subtitle: 'Open distributed query fabric specifications & SLA',
        icon: <Terminal className="w-4 h-4 text-emerald-400" />,
        badge: 'SYS 01',
        action: () => {
          setIsOpen(false);
          if (typeof (window as any).openSpecModal === 'function') {
            (window as any).openSpecModal('veloce');
          } else {
            window.dispatchEvent(new CustomEvent('open-spec-modal', { detail: { projectId: 'veloce' } }));
          }
        },
      },
    ],
    []
  );

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.badge?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Handle arrow key navigation in list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-950 text-white font-mono text-xs shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-4 pt-16 sm:pt-24 animate-in fade-in duration-150"
        onClick={() => setIsOpen(false)}
      >
        {/* Modal Window */}
        <div
          className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-white animate-in zoom-in-95 duration-150"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleListKeyDown}
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800 bg-slate-950/60">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command, navigate sections, or search architecture..."
              className="w-full bg-transparent text-sm sm:text-base font-['Space_Grotesk'] text-white placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-500 hover:text-slate-300 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400 uppercase">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div ref={listRef} className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
            {filteredCommands.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-slate-500">
                No matching commands found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    type="button"
                    onClick={cmd.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 text-white shadow-inner'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-slate-900 border-slate-700'
                            : 'bg-slate-800/80 border-slate-700/50'
                        }`}
                      >
                        {cmd.icon}
                      </div>
                      <div className="truncate">
                        <div className="font-['Space_Grotesk'] text-sm font-semibold text-white truncate flex items-center gap-2">
                          <span>{cmd.title}</span>
                          <span className="text-[10px] font-mono font-normal text-slate-500 uppercase">
                            [{cmd.category}]
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-400 truncate mt-0.5">
                          {cmd.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cmd.badge && (
                        <span className="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 font-mono text-[10px] text-slate-400">
                          {cmd.badge}
                        </span>
                      )}
                      {isSelected && <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Bottom Footer Info Bar */}
          <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 mr-1">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 mr-1.5">
                  ↓
                </kbd>
                Navigate
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 mr-1">
                  ↵
                </kbd>
                Execute
              </span>
            </div>
            <span className="text-slate-400">ARCH.CMS COMMAND ENGINE</span>
          </div>
        </div>
      </div>
    </>
  );
};
