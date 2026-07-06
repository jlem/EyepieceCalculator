import { describe, it, expect } from 'vitest';
import { normalizeBase, expandToken, searchTerms, matchesName } from '../utils/fuzzySearch';

describe('fuzzySearch utilities', () => {
  describe('normalizeBase', () => {
    it('should lowercase and replace dashes/brackets with spaces', () => {
      expect(normalizeBase('12mm A-T Delos')).toBe('12mm at delos');
      expect(normalizeBase('Tele Vue (Delos) "12"')).toBe('tele vue delos 12');
    });
  });

  describe('expandToken', () => {
    it('should expand canonical brand aliases', () => {
      expect(expandToken('tv')).toBe('tele vue');
      expect(expandToken('televue')).toBe('tele vue');
      expect(expandToken('es')).toBe('explore scientific');
      expect(expandToken('at')).toBe('astro tech');
      expect(expandToken('tak')).toBe('takahashi');
    });

    it('should expand prefixes followed by numbers', () => {
      expect(expandToken('es92')).toBe('explore scientific 92');
      expect(expandToken('tv12')).toBe('tele vue 12');
    });

    it('should leave unknown tokens unchanged', () => {
      expect(expandToken('delos')).toBe('delos');
      expect(expandToken('12mm')).toBe('12mm');
    });
  });

  describe('searchTerms', () => {
    it('should split query and expand aliases', () => {
      expect(searchTerms('12 TV Delos')).toEqual(['12', 'tele vue', 'delos']);
      expect(searchTerms('12mm ES92')).toEqual(['12mm', 'explore scientific 92']);
    });
  });

  describe('matchesName', () => {
    it('should match correctly', () => {
      const name = '12.5mm Tele Vue Delos';
      expect(matchesName(name, '12.5 tv')).toBe(true);
      expect(matchesName(name, 'delos 12.5')).toBe(true);
      expect(matchesName(name, 'es')).toBe(false);
      expect(matchesName(name, '')).toBe(true);
    });
  });
});
