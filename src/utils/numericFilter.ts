export type NumericFilterFn = (v: number | null) => boolean;

export function parseNumericFilter(raw: string): NumericFilterFn | null {
  const s = raw.trim();
  if (!s) return null;
  let m;
  if ((m = s.match(/^>=\s*(\d+(?:\.\d+)?)$/))) {
    const n = parseFloat(m[1]);
    return (v) => v !== null && v >= n;
  }
  if ((m = s.match(/^<=\s*(\d+(?:\.\d+)?)$/))) {
    const n = parseFloat(m[1]);
    return (v) => v !== null && v <= n;
  }
  if ((m = s.match(/^>\s*(\d+(?:\.\d+)?)$/))) {
    const n = parseFloat(m[1]);
    return (v) => v !== null && v > n;
  }
  if ((m = s.match(/^<\s*(\d+(?:\.\d+)?)$/))) {
    const n = parseFloat(m[1]);
    return (v) => v !== null && v < n;
  }
  if ((m = s.match(/^~\s*(\d+(?:\.\d+)?)$/))) {
    const n = parseFloat(m[1]);
    const lo = n * 0.9, hi = n * 1.1;
    return (v) => v !== null && v >= lo && v <= hi;
  }
  if ((m = s.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/))) {
    const a = parseFloat(m[1]), b = parseFloat(m[2]);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return (v) => v !== null && v >= lo && v <= hi;
  }
  if ((m = s.match(/^(\d+(?:\.\d+)?)$/))) {
    const n = parseFloat(m[1]);
    return (v) => v !== null && Math.abs(v - n) < 1e-9;
  }
  return null; // unrecognized syntax
}
