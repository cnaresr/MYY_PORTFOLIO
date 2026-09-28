import { getBrandIcon } from "@/lib/techBrands";
import { cn } from "@/lib/utils";

/**
 * Renders a bundled simple-icons SVG inline (no network requests).
 * Falls back to an initials tile when the slug is unknown.
 */
export function BrandIcon({
  slug,
  name,
  className,
  initialClassName,
}: {
  slug?: string | null;
  name?: string;
  className?: string;
  initialClassName?: string;
}) {
  const icon = getBrandIcon(slug);

  if (icon) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        aria-label={name || icon.title}
        fill={`#${icon.hex.replace(/^#/, "")}`}
        className={cn("shrink-0", className)}
        dangerouslySetInnerHTML={{ __html: `<title>${icon.title}</title><path d="${icon.path}" />` }}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-label={name || "Unknown brand"}
      className={cn("shrink-0 text-slate-400 dark:text-slate-500", className)}
      fill="currentColor"
    >
      <title>{name || "Unknown brand"}</title>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.2a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8ZM12 20c-2.5 0-4.7-1.3-6-3.2.1-2 4-3.1 6-3.1s5.9 1.1 6 3.1A7.2 7.2 0 0 1 12 20Z" />
    </svg>
  );
}
