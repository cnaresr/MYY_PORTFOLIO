import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  Home,
  User,
  FolderGit2,
  Cpu,
  Mail,
  ShieldCheck,
  Briefcase,
  KeyRound,
  Terminal,
  ArrowRight,
  X,
} from 'lucide-react';
import type { Project } from '../../data/projects';
import type { Certificate, CertificateItem } from '../../data/certificates';
import { formatServicePrice, type ServicePackage } from '../../config';

type CommandGroup = 'Pages' | 'Projects' | 'Certificates' | 'Services';
type CommandCertificate = Certificate | CertificateItem;

const GROUP_ORDER: CommandGroup[] = ['Pages', 'Projects', 'Certificates', 'Services'];

export interface CommandPaletteProps {
  projects?: Project[];
  certificates?: CommandCertificate[];
  services?: ServicePackage[];
  email?: string;
}

interface CommandItem {
  id: string;
  group: CommandGroup;
  title: string;
  subtitle: string;
  searchText: string;
  icon: React.ReactNode;
  badge?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  projects = [],
  certificates = [],
  services = [],
  email = 'cezar.nares@gmail.com',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const navigateToSection = useCallback((hash: string) => {
    setIsOpen(false);
    if (hash === '#') {
      if (window.location.pathname !== '/') {
        window.location.href = '/';
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const id = hash.replace(/^#/, '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${hash}`;
    }
  }, []);

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

  const commands: CommandItem[] = useMemo(() => {
    const pageCommands: CommandItem[] = [
      {
        id: 'page-hero',
        group: 'Pages',
        title: 'Overview / Hero',
        subtitle: 'Jump to the top of the portfolio',
        searchText: 'overview hero home top',
        icon: <Home className="w-4 h-4 text-slate-300" />,
        badge: '#',
        action: () => navigateToSection('#'),
      },
      {
        id: 'page-about',
        group: 'Pages',
        title: 'About Me',
        subtitle: 'Read background, engineering focus, and profile',
        searchText: 'about me profile bio background',
        icon: <User className="w-4 h-4 text-sky-400" />,
        badge: '#about',
        action: () => navigateToSection('#about'),
      },
      {
        id: 'page-skills',
        group: 'Pages',
        title: 'Technical Stack',
        subtitle: 'View languages, frameworks, and runtime capabilities',
        searchText: 'technical stack skills languages frameworks tools',
        icon: <Cpu className="w-4 h-4 text-cyan-400" />,
        badge: '#skills',
        action: () => navigateToSection('#skills'),
      },
      {
        id: 'page-projects',
        group: 'Pages',
        title: 'Projects',
        subtitle: 'Navigate to project showcase & case studies',
        searchText: 'projects showcase architecture case studies',
        icon: <FolderGit2 className="w-4 h-4 text-emerald-400" />,
        badge: '#projects',
        action: () => navigateToSection('#projects'),
      },
      {
        id: 'page-certificates',
        group: 'Pages',
        title: 'Certificates',
        subtitle: 'View verified accreditations and credentials',
        searchText: 'certificates credentials accreditations verified',
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        badge: '#certificates',
        action: () => navigateToSection('#certificates'),
      },
      {
        id: 'page-services',
        group: 'Pages',
        title: 'Services',
        subtitle: 'Explore available engineering & automation packages',
        searchText: 'services packages pricing hire',
        icon: <Briefcase className="w-4 h-4 text-violet-400" />,
        badge: '#services',
        action: () => navigateToSection('#services'),
      },
      {
        id: 'page-contact',
        group: 'Pages',
        title: 'Contact',
        subtitle: 'Transmit message to secure dispatch console',
        searchText: 'contact inquiry message dispatch email',
        icon: <Mail className="w-4 h-4 text-rose-400" />,
        badge: '#contact',
        action: () => navigateToSection('#contact'),
      },
      {
        id: 'act-copy-email',
        group: 'Pages',
        title: 'Copy Dispatch Email',
        subtitle: `Copy ${email || 'cezar.nares@gmail.com'} to clipboard`,
        searchText: `copy dispatch email ${email}`,
        icon: <KeyRound className="w-4 h-4 text-emerald-400" />,
        badge: 'MAIL',
        action: () => {
          navigator.clipboard.writeText(email || 'cezar.nares@gmail.com');
          setIsOpen(false);
          showToast('Dispatch email copied to clipboard!');
        },
      },
    ];

    const projectCommands: CommandItem[] = projects.map((project) => {
      const stack = Array.isArray(project.technologies) ? project.technologies : [];
      const caseStudyText = [
        project.caseStudy?.problem,
        project.caseStudy?.process,
        project.caseStudy?.outcome,
      ]
        .filter(Boolean)
        .join(' ');

      return {
        id: `project-${project.id}`,
        group: 'Projects',
        title: project.title,
        subtitle: project.description || stack.join(' · '),
        searchText: [
          project.title,
          stack.join(' '),
          project.description,
          project.abstract,
          caseStudyText,
        ]
          .filter(Boolean)
          .join(' '),
        icon: <Terminal className="w-4 h-4 text-emerald-400" />,
        badge: stack.slice(0, 2).join(' · ') || project.status,
        action: () => {
          setIsOpen(false);
          if (typeof (window as any).openSpecModal === 'function') {
            (window as any).openSpecModal(project.id);
          } else {
            window.dispatchEvent(
              new CustomEvent('open-spec-modal', { detail: { projectId: project.id } })
            );
          }
        },
      };
    });

    const certificateCommands: CommandItem[] = certificates.map((cert, idx) => {
      const issued = 'issued' in cert ? cert.issued : cert.year;
      const level = 'level' in cert ? cert.level : '';
      const certId = 'id' in cert && cert.id ? cert.id : `cert-${idx}`;

      return {
        id: `certificate-${certId}`,
        group: 'Certificates',
        title: cert.title,
        subtitle: [cert.issuer, issued, level].filter(Boolean).join(' · '),
        searchText: [cert.title, cert.issuer, issued, level].filter(Boolean).join(' '),
        icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
        badge: issued || cert.issuer,
        action: () => navigateToSection('#certificates'),
      };
    });

    const serviceCommands: CommandItem[] = services.map((service) => {
      const priceLabel = formatServicePrice(service);
      const featuresText = Array.isArray(service.features) ? service.features.join(' ') : '';

      return {
        id: `service-${service.id}`,
        group: 'Services',
        title: service.name,
        subtitle: service.summary,
        searchText: [service.name, service.summary, featuresText, priceLabel]
          .filter(Boolean)
          .join(' '),
        icon: <Briefcase className="w-4 h-4 text-violet-400" />,
        badge: priceLabel,
        action: () => navigateToSection('#services'),
      };
    });

    return [...pageCommands, ...projectCommands, ...certificateCommands, ...serviceCommands];
  }, [projects, certificates, services, email, navigateToSection, showToast]);

  // Filter commands by search query and group in fixed order
  const groupedCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? commands.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            c.subtitle.toLowerCase().includes(q) ||
            c.group.toLowerCase().includes(q) ||
            c.searchText.toLowerCase().includes(q) ||
            c.badge?.toLowerCase().includes(q)
        )
      : commands;

    return GROUP_ORDER.map((group) => ({
      group,
      items: matches.filter((item) => item.group === group),
    })).filter((section) => section.items.length > 0);
  }, [commands, query]);

  const flatFilteredCommands = useMemo(
    () => groupedCommands.flatMap((section) => section.items),
    [groupedCommands]
  );

  // Handle arrow key navigation across flat ordered list of visible items
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flatFilteredCommands.length === 0) return;
      setSelectedIndex((prev) => (prev < flatFilteredCommands.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flatFilteredCommands.length === 0) return;
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatFilteredCommands.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatFilteredCommands[selectedIndex]) {
        flatFilteredCommands[selectedIndex].action();
      }
    }
  };

  if (!isOpen) {
    return toastMessage ? (
      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-950 text-white font-mono text-xs shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
        <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    ) : null;
  }

  let runningIndex = 0;

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
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
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
              placeholder="Search pages, projects, certificates, or services..."
              className="w-full bg-transparent text-sm sm:text-base font-['Space_Grotesk'] text-white placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSelectedIndex(0);
                  inputRef.current?.focus();
                }}
                className="text-slate-500 hover:text-slate-300 p-1 rounded"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-400 uppercase">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-2">
            {flatFilteredCommands.length === 0 ? (
              <div className="py-12 text-center font-mono text-xs text-slate-500">
                No matching results found for &ldquo;{query}&rdquo;
              </div>
            ) : (
              groupedCommands.map((section) => (
                <div key={section.group} className="space-y-1">
                  <div className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                    {section.group}
                  </div>
                  {section.items.map((cmd) => {
                    const itemIndex = runningIndex++;
                    const isSelected = itemIndex === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
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
                            <div className="font-['Space_Grotesk'] text-sm font-semibold text-white truncate">
                              {cmd.title}
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
                  })}
                </div>
              ))
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
