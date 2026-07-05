import { describe, it, expect } from 'vitest';
import { Telescope } from '../models/Telescope';
import { Eyepiece } from '../models/Eyepiece';
import { EyepieceCalculation } from '../models/EyepieceCalculation';

describe('EyepieceCalculation Model', () => {
  it('should calculate exit pupil and magnification correctly', () => {
    const scope = new Telescope('', 'Test', 100, 1000, 10, '2'); // 1000mm focal length, f/10
    const eyepiece = new Eyepiece(20);             // 20mm eyepiece
    const calc = new EyepieceCalculation(eyepiece, scope);

    expect(calc.exitPupil).toBe(2);      // 20 / 10 = 2mm
    expect(calc.magnification).toBe(50);  // 1000 / 20 = 50x
  });
});
