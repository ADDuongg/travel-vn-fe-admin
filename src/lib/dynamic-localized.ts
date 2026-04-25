/** Language code (lowercase) → string. Matches BE `DynamicLocalized`. */
export type DynamicLocalized = Record<string, string>;

/**
 * Pick a display string from a dynamic localized map (API may return arbitrary language keys).
 */
export function pickDynamicLocalized(
  map: DynamicLocalized | undefined | null,
  preferredLocale?: string,
  fallback = '—',
): string {
  if (!map || typeof map !== 'object') return fallback;
  const keys = Object.keys(map);
  if (keys.length === 0) return fallback;
  const pref = preferredLocale?.toLowerCase();
  if (pref && map[pref]?.trim()) return map[pref].trim();
  if (map.vi?.trim()) return map.vi.trim();
  if (map.en?.trim()) return map.en.trim();
  const first = keys.map((k) => map[k]?.trim()).find(Boolean);
  return first || fallback;
}

/** Secondary line for list: prefer en, then another non-primary name. */
export function pickSecondaryLocalized(
  name: DynamicLocalized | undefined | null,
  fullName: DynamicLocalized | undefined | null,
): string | null {
  const primary = pickDynamicLocalized(name, undefined, '');
  const fromFull = pickDynamicLocalized(fullName, undefined, '');
  const n = name || {};
  const candidates: string[] = [
    n.en,
    fullName && 'vi' in fullName ? fullName.vi : undefined,
    fullName && 'en' in fullName ? fullName.en : undefined,
    ...Object.values(n).filter((v) => v && v !== primary),
  ].filter((v): v is string => Boolean(v));
  for (const c of candidates) {
    if (c && c !== primary) return c;
  }
  return fromFull && fromFull !== primary ? fromFull : null;
}

/** All string values from a localized map for search. */
export function localizedSearchHaystack(
  ...maps: (DynamicLocalized | undefined | null)[]
): string {
  const parts: string[] = [];
  for (const m of maps) {
    if (!m) continue;
    for (const v of Object.values(m)) {
      if (v) parts.push(v.toLowerCase());
    }
  }
  return parts.join(' ');
}

/** Label for province dropdowns / tables (name across locales, else code). */
export function getProvinceLabel(p: {
  name?: DynamicLocalized | null;
  code?: string;
}): string {
  const n = pickDynamicLocalized(p.name, undefined, '');
  if (n !== '—') return n;
  return p.code || '—';
}
