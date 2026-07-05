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
});
