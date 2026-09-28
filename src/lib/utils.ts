/**
 * Minimal className joiner — filters falsey values and joins with a space.
 * Mirrors the reference "cn" helper without pulling in clsx/tailwind-merge.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}