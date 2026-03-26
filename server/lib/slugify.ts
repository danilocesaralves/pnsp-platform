/**
 * Canonical slug generator for PNSP.
 * Strips diacritics, lowercases, removes non-alphanumeric chars,
 * collapses whitespace/hyphens, appends an optional suffix (e.g. Date.now()).
 */
export function slugify(text: string, suffix?: string | number): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
  return suffix != null ? `${base}-${suffix}` : base;
}
