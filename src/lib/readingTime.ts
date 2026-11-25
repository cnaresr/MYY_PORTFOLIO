/**
 * Estimates reading time in minutes from raw markdown/MDX text.
 * Uses ~200 words per minute with a minimum of 1 minute.
 */
export function getReadingTime(text: string): number {
  const cleaned = text
    .replace(/^---[\s\S]*?---/, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`~>\[\]()!-]/g, ' ')
    .trim();

  if (!cleaned) return 1;

  const words = cleaned.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
