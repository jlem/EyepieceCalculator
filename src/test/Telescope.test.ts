import { describe, it, expect } from 'vitest';
import { Telescope } from '../models/Telescope';

describe('Telescope Model', () => {
  it('should initialize with aperture and calculate focal length', () => {
    const scope = new Telescope(100, 5, true); // 100mm aperture, f/5
    expect(scope.apertureMM).toBe(100);
    expect(scope.focalLength).toBe(500);
    expect(scope.focalRatio).toBe(5);
    expect(scope.apertureIN).toBeCloseTo(3.937, 3);
  });

  it('should initialize with focal length and calculate aperture', () => {
    const scope = new Telescope(1000, 10, false); // 1000mm focal length, f/10
    expect(scope.focalLength).toBe(1000);
    expect(scope.focalRatio).toBe(10);
    expect(scope.apertureMM).toBe(100);
  });
});
