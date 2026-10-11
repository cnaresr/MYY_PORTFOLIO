import { useEffect, useState } from 'react';
import { Download, ExternalLink, X, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  name?: string;
}

export function CvModal({ isOpen, onClose, pdfUrl, name = 'Resume' }: CvModalProps) {
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filename = `${(name || 'Resume').replace(/\s+/g, '_')}_CV.pdf`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-4xl h-[90vh] max-h-[860px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0">
              <FileText className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 id="cv-modal-title" className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                Curriculum Vitae Preview
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                {filename}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-['Space_Grotesk'] text-xs font-semibold shadow-xs transition-colors cursor-pointer",
                downloaded
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100"
              )}
              title="Download CV PDF"
            >
              {downloaded ? (
                <>
                  <Check className="size-3.5" />
                  <span>Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="size-3.5" />
                  <span>Download PDF</span>
                </>
              )}
            </button>

            {/* Open in New Tab Button */}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-['Space_Grotesk'] text-xs font-semibold shadow-xs transition-colors"
              title="Open PDF in new tab"
            >
              <ExternalLink className="size-3.5" />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close CV preview"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* PDF Frame / Fallback View */}
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950/80 relative overflow-hidden">
          <object
            data={`${pdfUrl}#toolbar=1&navpanes=0`}
            type="application/pdf"
            className="w-full h-full block"
          >
            <iframe
              src={`${pdfUrl}#toolbar=1`}
              title="Curriculum Vitae"
              className="w-full h-full border-0"
            >
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                <FileText className="size-16 text-slate-400" />
                <div>
                  <p className="font-['Space_Grotesk'] font-bold text-lg text-slate-900 dark:text-white">
                    PDF Preview
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-md">
                    Direct embed is not available in your browser. You can open the CV in a new tab or download it directly.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-['Space_Grotesk'] text-sm font-semibold shadow-md"
                  >
                    <ExternalLink className="size-4" />
                    Open in New Tab
                  </a>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 font-['Space_Grotesk'] text-sm font-semibold"
                  >
                    <Download className="size-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </iframe>
          </object>
        </div>
      </div>
    </div>
  );
}
