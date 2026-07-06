import { describe, it, expect } from 'vitest';
import { Telescope } from '../models/Telescope';

describe('Telescope Model', () => {
  it('should initialize with name, ID, aperture, focal length, focal ratio, and focuser size', () => {
    const scope = new Telescope('t1', 'My Scope', 100, 500, 5, '2');
    expect(scope.id).toBe('t1');
    expect(scope.name).toBe('My Scope');
    expect(scope.aperture).toBe(100);
    expect(scope.focalLength).toBe(500);
    expect(scope.focalRatio).toBe(5);
    expect(scope.focuserSize).toBe('2');
    expect(scope.apertureInches).toBeCloseTo(3.937, 3);
  });

  it('should display aperture properly formatted to nearest 10th and whole numbers if 0', () => {
    const scope1 = new Telescope('t1', 'Scope 1', 100, 500, 5, '2');
    expect(scope1.displayAperture('mm')).toBe('100');
    expect(scope1.displayAperture('in')).toBe('3.9'); // 3.937 -> 3.9

    const scope2 = new Telescope('t2', 'Scope 2', 609.6, 1829, 3, '2');
    expect(scope2.displayAperture('mm')).toBe('609.6');
    expect(scope2.displayAperture('in')).toBe('24'); // 24.0 -> 24
  });

  it('should convert units with high precision', () => {
    expect(Telescope.mmToInches(609.6)).toBe(24);
    expect(Telescope.inchesToMm(24)).toBe(609.6);
    expect(Telescope.mmToInches(200)).toBeCloseTo(7.874, 3);
    expect(Telescope.inchesToMm(7.874)).toBeCloseTo(199.9996, 3);
  });

  it('should format general values to nearest 10th or whole number', () => {
    expect(Telescope.formatValue(24.02)).toBe('24');
    expect(Telescope.formatValue(24.05)).toBe('24.1');
    expect(Telescope.formatValue(200.00)).toBe('200');
    expect(Telescope.formatValue(203.20)).toBe('203.2');
  });
});
