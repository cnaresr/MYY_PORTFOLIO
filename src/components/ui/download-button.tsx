import React, {
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowDownToLine, Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Phase = 'idle' | 'downloading' | 'done';

export type DownloadButtonProps = Readonly<
  {
    /** URL of the file to download (absolute path served from /public). */
    href: string;
    /** Suggested filename for the downloaded file. */
    filename?: string;
    label?: string;
    downloadingLabel?: string;
    doneLabel?: string;
    /** How long the "downloading" phase stays before resolving to "done". */
    downloadMs?: number;
    /** How long the "done" phase lingers before returning to "idle". */
    resetMs?: number;
  } & Omit<React.ComponentPropsWithoutRef<'button'>, 'onClick'>
>;

// Icons stack in one fixed slot and crossfade, so nothing shifts.
const ICON_LAYER =
  'absolute inset-0 grid place-items-center transition-opacity duration-300 ease-out motion-reduce:transition-none';

// Labels stack in one grid cell; outgoing fades out, incoming fades in after.
const LABEL_LAYER =
  'col-start-1 row-start-1 text-left transition-opacity ease-out motion-reduce:transition-none';

/**
 * Download button — re-themed for the portfolio (slate neutrals instead of
 * the reference neutral-50 key, emerald "done" state kept). Unlike the
 * sample, this one performs a real download: it triggers an <a download>
 * click against `href` rather than simulating with a timer.
 */
export const DownloadButton = forwardRef<
  HTMLButtonElement,
  DownloadButtonProps
>((props, ref) => {
  const {
    className,
    href,
    filename,
    label = 'Download File',
    downloadingLabel = 'Downloading...',
    doneLabel = 'Downloaded',
    downloadMs = 1000,
    resetMs = 1800,
    ...rest
  } = props;

  const [phase, setPhase] = useState<Phase>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const schedule = (fn: () => void, ms: number) => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(fn, ms);
  };

  const handleClick = () => {
    if (phase !== 'idle' || !href) return;

    setPhase('downloading');

    // Real download: a temporary anchor fires the browser's download path,
    // then the button resolves to "done" and settles back to "idle".
    const a = document.createElement('a');
    a.href = href;
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    schedule(() => {
      setPhase('done');
      schedule(() => setPhase('idle'), resetMs);
    }, downloadMs);
  };

  const idle = phase === 'idle';
  const downloading = phase === 'downloading';
  const done = phase === 'done';

  return (
    <button
      ref={ref}
      type="button"
      data-slot="download-button"
      data-phase={phase}
      aria-busy={downloading || undefined}
      onClick={handleClick}
      className={cn(
        'inline-flex h-10 items-center gap-2 rounded-lg px-4 font-sans text-sm font-medium outline-none select-none',
        'transition-[background-color,box-shadow,color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900',
        // Soft 3D key; sinks in while pressed or downloading.
        'shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.08),inset_0_1px_2px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.08)]',
        downloading &&
          'shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_1px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(0,0,0,0.08),inset_0_2px_4px_rgba(0,0,0,0.04),inset_0_-1px_2px_rgba(0,0,0,0.05)]',
        idle &&
          'cursor-pointer bg-slate-50 text-slate-700 hover:text-slate-900 active:bg-slate-100',
        downloading && 'cursor-default bg-slate-100 text-slate-500',
        done &&
          'cursor-default bg-emerald-600 text-white shadow-[0_1px_1px_rgba(0,0,0,0.25),0_3px_6px_rgba(0,0,0,0.2),0_6px_12px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.22),inset_0_-3px_6px_rgba(0,0,0,0.35)]',
        className,
      )}
      {...rest}
    >
      <span className="sr-only" aria-live="polite">
        {downloading ? downloadingLabel : done ? doneLabel : ''}
      </span>

      {/* Fixed icon slot keeps the icon and label aligned in every phase. */}
      <span className="relative size-4 shrink-0">
        <span aria-hidden className={cn(ICON_LAYER, idle ? 'opacity-100' : 'opacity-0')}>
          <ArrowDownToLine size={15} strokeWidth={2} />
        </span>
        <span aria-hidden className={cn(ICON_LAYER, downloading ? 'opacity-100' : 'opacity-0')}>
          <Loader2 size={15} strokeWidth={2} className="animate-spin motion-reduce:animate-none" />
        </span>
        <span aria-hidden className={cn(ICON_LAYER, done ? 'opacity-100' : 'opacity-0')}>
          <Check size={15} strokeWidth={2.5} />
        </span>
      </span>

      <span className="grid">
        <span
          aria-hidden={!idle}
          className={cn(LABEL_LAYER, idle ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-200')}
        >
          {label}
        </span>
        <span
          aria-hidden={!downloading}
          className={cn(LABEL_LAYER, downloading ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-200')}
        >
          {downloadingLabel}
        </span>
        <span
          aria-hidden={!done}
          className={cn(LABEL_LAYER, done ? 'opacity-100 delay-200 duration-300' : 'opacity-0 duration-200')}
        >
          {doneLabel}
        </span>
      </span>
    </button>
  );
});

DownloadButton.displayName = 'DownloadButton';