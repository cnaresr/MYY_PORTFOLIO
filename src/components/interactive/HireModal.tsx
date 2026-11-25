import React, { useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight, Mail, MessageSquare, FileText, Briefcase } from 'lucide-react';
import { siGithub, siInstagram } from 'simple-icons';
import type { LinksConfig } from '@/config';

interface HireModalProps {
  links: LinksConfig;
}

export const HireModal: React.FC<HireModalProps> = ({ links }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contextService, setContextService] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const custom = e as CustomEvent<{ service?: string } | undefined>;
      lastActiveRef.current = document.activeElement as HTMLElement | null;
      setContextService(custom.detail?.service || null);
      setIsOpen(true);
    };

    window.addEventListener('open-hire-modal', handleOpen);
    return () => window.removeEventListener('open-hire-modal', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      // Simple focus trap within the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      lastActiveRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasWhatsapp = Boolean(links.whatsapp && links.whatsapp.trim());
  const hasLinkedin = Boolean(links.linkedin && links.linkedin.trim());
  const hasEmail = Boolean(links.email && links.email.trim());
  const hasGithub = Boolean(links.github && links.github.trim());
  const hasInstagram = Boolean(links.instagram && links.instagram.trim());

  const handleContactFormClick = () => {
    setIsOpen(false);
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#contact';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hire-modal-title"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest font-bold text-[#00bc7d] block mb-1">
              DIRECT CHANNELS
            </span>
            <h2
              id="hire-modal-title"
              className="font-['Space_Grotesk'] text-xl font-bold text-slate-950 dark:text-white tracking-tight"
            >
              {contextService ? `Discuss ${contextService}` : 'Start a conversation'}
            </h2>
            <p className="font-['Hanken_Grotesk'] text-sm text-slate-600 dark:text-slate-400 mt-1 text-pretty">
              Choose the channel that works best for your project.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close hire options dialog"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* Exact vertical order: 1) WhatsApp (if set), 2) Contact Form, 3) LinkedIn, 4) Email */}
        <div className="p-6 space-y-2.5">
          {hasWhatsapp && (
            <a
              href={links.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-[#00bc7d]/10 hover:bg-[#00bc7d]/20 border border-[#00bc7d]/30 text-slate-950 dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="size-4 text-[#00bc7d]" aria-hidden="true" />
                <span className="text-left">
                  <span className="font-['Space_Grotesk'] text-sm font-bold block">WhatsApp</span>
                  <span className="font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-slate-400 block">
                    Fastest response for project scope
                  </span>
                </span>
              </span>
              <ArrowUpRight className="size-4 text-[#00bc7d]" aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            onClick={handleContactFormClick}
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-950 dark:text-white transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
          >
            <span className="flex items-center gap-3">
              <FileText className="size-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
              <span>
                <span className="font-['Space_Grotesk'] text-sm font-bold block">Contact Form</span>
                <span className="font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-slate-400 block">
                  Send a detailed project brief on this page
                </span>
              </span>
            </span>
            <ArrowUpRight className="size-4 text-slate-500" aria-hidden="true" />
          </button>

          {hasLinkedin && (
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-950 dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
            >
              <span className="flex items-center gap-3">
                <Briefcase className="size-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                <span className="text-left">
                  <span className="font-['Space_Grotesk'] text-sm font-bold block">LinkedIn</span>
                  <span className="font-['Hanken_Grotesk'] text-xs text-slate-600 dark:text-slate-400 block">
                    Connect or message professionally
                  </span>
                </span>
              </span>
              <ArrowUpRight className="size-4 text-slate-500" aria-hidden="true" />
            </a>
          )}

          {hasEmail && (
            <a
              href={`mailto:${links.email}`}
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-950 dark:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
            >
              <span className="flex items-center gap-3">
                <Mail className="size-4 text-slate-700 dark:text-slate-300" aria-hidden="true" />
                <span className="text-left">
                  <span className="font-['Space_Grotesk'] text-sm font-bold block">Email</span>
                  <span className="font-mono text-xs text-slate-600 dark:text-slate-400 block">
                    {links.email}
                  </span>
                </span>
              </span>
              <ArrowUpRight className="size-4 text-slate-500" aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Bottom row: small GitHub & Instagram icons */}
        {(hasGithub || hasInstagram) && (
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              More profiles
            </span>
            <div className="flex items-center gap-2">
              {hasGithub && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub profile"
                  title="GitHub"
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={siGithub.path} />
                  </svg>
                </a>
              )}
              {hasInstagram && (
                <a
                  href={links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram profile"
                  title="Instagram"
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00bc7d]"
                >
                  <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d={siInstagram.path} />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
