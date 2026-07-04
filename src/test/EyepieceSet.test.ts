import { describe, it, expect } from 'vitest';
import { Telescope } from '../models/Telescope';
import { Eyepiece } from '../models/Eyepiece';
import { EyepieceCalculation } from '../models/EyepieceCalculation';
import { EyepieceSet } from '../models/EyepieceSet';

describe('EyepieceSet Model', () => {
  const scope = new Telescope(1000, 10, false);
  const calcs = [
    new EyepieceCalculation(new Eyepiece(30), scope), // 30mm (3mm ep, 33.3x mag)
    new EyepieceCalculation(new Eyepiece(10), scope), // 10mm (1mm ep, 100x mag)
    new EyepieceCalculation(new Eyepiece(20), scope), // 20mm (2mm ep, 50x mag)
  ];
  const set = new EyepieceSet(calcs);

  it('should compute count, shortestFL and longestFL correctly', () => {
    expect(set.count).toBe(3);
    expect(set.shortestFL).toBe(10);
    expect(set.longestFL).toBe(30);
  });

  it('should support sorting by focal length', () => {
    const sortedDesc = set.sorted('fl', 'desc');
    expect(sortedDesc[0].eyepiece.focalLength).toBe(30);
    expect(sortedDesc[1].eyepiece.focalLength).toBe(20);
    expect(sortedDesc[2].eyepiece.focalLength).toBe(10);

    const sortedAsc = set.sorted('fl', 'asc');
    expect(sortedAsc[0].eyepiece.focalLength).toBe(10);
    expect(sortedAsc[1].eyepiece.focalLength).toBe(20);
    expect(sortedAsc[2].eyepiece.focalLength).toBe(30);
  });

  it('should support sorting by exit pupil', () => {
    const sortedDesc = set.sorted('ep', 'desc');
    expect(sortedDesc[0].exitPupil).toBe(3);
    expect(sortedDesc[1].exitPupil).toBe(2);
    expect(sortedDesc[2].exitPupil).toBe(1);
  });

  it('should support sorting by magnification', () => {
    const sortedDesc = set.sorted('mag', 'desc');
    expect(sortedDesc[0].magnification).toBe(100);
    expect(sortedDesc[1].magnification).toBe(50);
    expect(sortedDesc[2].magnification).toBeCloseTo(33.333, 2);
  });
});
