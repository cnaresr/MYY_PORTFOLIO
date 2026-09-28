import React from 'react';
import { cn } from '../../lib/utils';

/*
 * Attachment primitives — compound card API (Attachment / Media / Content /
 * Title / Description / Trigger / Actions / Action), dual-theme:
 * light slate default, cockpit dark inside .dark.
 *
 * The whole card is `relative` so `AttachmentTrigger` can overlay it as the
 * single, real click target while the card's own focus-within ring supplies
 * the visible focus state.
 */

interface AttachmentProps extends React.ComponentPropsWithoutRef<'div'> {
  /** "idle" draws the resting card; "uploading"/"error" recolour it. */
  state?: 'idle' | 'uploading' | 'error';
  size?: 'sm' | 'md';
}

export const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(
  ({ className, state = 'idle', size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      data-slot="attachment"
      data-state={state}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border bg-white dark:bg-cockpit-raised text-slate-900 dark:text-cockpit-text transition-colors',
        'focus-within:ring-2 focus-within:ring-slate-900/70 dark:focus-within:ring-emerald-500/50 focus-within:ring-offset-1 dark:focus-within:ring-offset-cockpit',
        size === 'sm' ? 'p-2.5' : 'p-4',
        state === 'idle' && 'border-slate-200 dark:border-cockpit-line',
        state === 'uploading' && 'border-amber-300 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-500/5',
        state === 'error' && 'border-rose-300 dark:border-rose-500/50 bg-rose-50/40 dark:bg-rose-500/5',
        className
      )}
      {...props}
    />
  )
);
Attachment.displayName = 'Attachment';

/** Dashed-outline variant used for the empty picker card. */
export const AttachmentPicker = React.forwardRef<HTMLDivElement, AttachmentProps>(
  ({ className, ...props }, ref) => (
    <Attachment
      ref={ref}
      className={cn(
        'border-dashed border-slate-300 dark:border-cockpit-line-strong bg-slate-50/60 dark:bg-cockpit-raised hover:border-slate-400 dark:hover:border-cockpit-line-strong hover:bg-slate-50 dark:hover:bg-cockpit-hover cursor-pointer',
        className
      )}
      {...props}
    />
  )
);
AttachmentPicker.displayName = 'AttachmentPicker';

export const AttachmentMedia: React.FC<
  React.ComponentPropsWithoutRef<'div'> & { variant?: 'icon' | 'image' }
> = ({ className, variant = 'icon', children, ...props }) => (
  <div
    data-slot="attachment-media"
    className={cn(
      'shrink-0 grid place-items-center overflow-hidden',
      variant === 'image'
        ? 'size-12 rounded-lg border border-slate-200 dark:border-cockpit-line bg-slate-100 dark:bg-cockpit'
        : 'size-10 rounded-lg bg-slate-100 dark:bg-cockpit border border-slate-200 dark:border-cockpit-line text-slate-600 dark:text-cockpit-muted [&_svg]:size-5',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const AttachmentContent: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => <div data-slot="attachment-content" className={cn('min-w-0 flex-1', className)} {...props} />;

export const AttachmentTitle: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="attachment-title"
    className={cn(
      "truncate font-['Space_Grotesk'] text-xs font-bold text-slate-950 dark:text-cockpit-text",
      className
    )}
    {...props}
  />
);

export const AttachmentDescription: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="attachment-description"
    className={cn('truncate font-mono text-[10px] text-slate-500 dark:text-cockpit-faint mt-0.5', className)}
    {...props}
  />
);

export const AttachmentActions: React.FC<React.ComponentPropsWithoutRef<'div'>> = ({
  className,
  ...props
}) => (
  <div
    data-slot="attachment-actions"
    className={cn('shrink-0 flex items-center gap-1', className)}
    {...props}
  />
);

export const AttachmentAction: React.FC<React.ComponentPropsWithoutRef<'button'>> = ({
  className,
  ...props
}) => (
  <button
    data-slot="attachment-action"
    className={cn(
      'grid place-items-center size-7 rounded-lg border border-slate-200 dark:border-cockpit-line-strong text-slate-500 dark:text-cockpit-muted',
      'hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/50 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer',
      '[&_svg]:size-3.5',
      className
    )}
    {...props}
  />
);

/**
 * Invisible full-card click target. Kept as a real <button> so keyboard focus
 * lands on something meaningful instead of an invisible overlay div.
 */
export const AttachmentTrigger: React.FC<React.ComponentPropsWithoutRef<'button'>> = ({
  className,
  ...props
}) => (
  <button
    data-slot="attachment-trigger"
    className={cn('absolute inset-0 cursor-pointer rounded-xl outline-none', className)}
    {...props}
  />
);
