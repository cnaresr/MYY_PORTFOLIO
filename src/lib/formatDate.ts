const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Formats an ISO month value ("2023-01") into a human readable label ("Jan 2023").
 * Falls back to the raw string when the value is not an ISO month.
 */
export function formatMonth(value?: string): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (match) {
    const idx = parseInt(match[2], 10) - 1;
    if (idx >= 0 && idx < 12) {
      return `${MONTHS[idx]} ${match[1]}`;
    }
  }
  return value;
}

/**
 * Formats a timeline range ("Jan 2023 – Mar 2024").
 * When `end` is the special value "now", renders as "Jan 2023 – Present".
 */
export function formatRange(start?: string, end?: string): string {
  const s = formatMonth(start);
  const e = (end === 'now' || end === 'NOW' || end === 'Present')
    ? 'Present'
    : formatMonth(end);
  if (s && e) return `${s} – ${e}`;
  return s || e || '';
}