import { describe, it, expect } from 'vitest';
import { parseNumericFilter } from '../utils/numericFilter';

describe('numericFilter utilities', () => {
  it('should parse exact match', () => {
    const filter = parseNumericFilter('12');
    expect(filter).not.toBeNull();
    expect(filter!(12)).toBe(true);
    expect(filter!(12.0001)).toBe(false);
    expect(filter!(null)).toBe(false);
  });

  it('should parse comparison operators', () => {
    const filterGte = parseNumericFilter('>= 15.5');
    expect(filterGte!(15.5)).toBe(true);
    expect(filterGte!(16)).toBe(true);
    expect(filterGte!(15)).toBe(false);
    expect(filterGte!(null)).toBe(false);

    const filterLt = parseNumericFilter('< 10');
    expect(filterLt!(9.9)).toBe(true);
    expect(filterLt!(10)).toBe(false);
    expect(filterLt!(null)).toBe(false);
  });

  it('should parse tolerance operator (~)', () => {
    const filterTol = parseNumericFilter('~ 10');
    // should match between 9 and 11
    expect(filterTol!(9)).toBe(true);
    expect(filterTol!(11)).toBe(true);
    expect(filterTol!(8.9)).toBe(false);
    expect(filterTol!(11.1)).toBe(false);
    expect(filterTol!(null)).toBe(false);
  });

  it('should parse ranges', () => {
    const filterRange = parseNumericFilter('10 - 20');
    expect(filterRange!(10)).toBe(true);
    expect(filterRange!(15)).toBe(true);
    expect(filterRange!(20)).toBe(true);
    expect(filterRange!(9.9)).toBe(false);
    expect(filterRange!(20.1)).toBe(false);
    expect(filterRange!(null)).toBe(false);
  });

  it('should return null for invalid or empty inputs', () => {
    expect(parseNumericFilter('')).toBeNull();
    expect(parseNumericFilter('   ')).toBeNull();
    expect(parseNumericFilter('abc')).toBeNull();
  });
});
