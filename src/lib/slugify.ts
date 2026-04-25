/**
 * URL-safe slug (ASCII). Best-effort for Vietnamese: removes diacritics then kebab-case.
 */
export function slugify(input: string): string {
  const s = (input || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    s
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'post'
  );
}
