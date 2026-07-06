export const ALIAS_MAP: Record<string, string> = {
  "tv": "tele vue",
  "televue": "tele vue",
  "es": "explore scientific",
  "at": "astro tech",
  "tak": "takahashi",
};

export function normalizeBase(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/\ba-t\b/g, "at") // "A-T" -> "at" before hyphens become spaces
    .replace(/["'()]/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function expandToken(token: string): string {
  if (ALIAS_MAP[token]) return ALIAS_MAP[token];
  const m = token.match(/^([a-z]+)(\d+.*)$/);
  if (m && ALIAS_MAP[m[1]]) return ALIAS_MAP[m[1]] + " " + m[2];
  return token;
}

export function searchTerms(query: string): string[] {
  return normalizeBase(query)
    .split(" ")
    .filter(Boolean)
    .map(expandToken);
}

export function matchesName(fullName: string, query: string): boolean {
  if (!query) return true;
  const terms = searchTerms(query);
  const searchNorm = normalizeBase(fullName);
  return terms.every((t) => searchNorm.includes(t));
}
