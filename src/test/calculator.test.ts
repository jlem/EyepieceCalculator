import { describe, it, expect } from 'vitest';
import {
  computeSet,
  computeSetBrightness,
  computeSetPupil,
  computeSetFixed,
  calculateEyepieceSet,
  cleanNumber
} from '../utils/calculator';
import { CalculatorInputs } from '../utils/types';

describe('Calculator cleanNumber', () => {
  it('should clean numbers to 4 decimal places by default', () => {
    expect(cleanNumber(0.5)).toBe(0.5);
    expect(cleanNumber(1.5555555555555556)).toBe(1.5556);
    expect(cleanNumber(1.5555499999999996)).toBe(1.5555);
    expect(cleanNumber(7.000000000000001)).toBe(7);
  });

  it('should let me override precision', () => {
    expect(cleanNumber(0.525234, 2)).toBe(0.53);
  });
})

describe('Calculator Utilities', () => {
  it('should compute geometric percent eyepiece spacing correctly', () => {
    const res = computeSet(10, 40, 0.5, 7.0); // f/10, 40% spacing, 0.5mm to 7mm
    expect(res.eps[0]).toBe(0.5);
    expect(res.eps[res.eps.length - 1]).toBe(7.0);
    expect(res.fls[0]).toBe(5.0);
    expect(res.fls[res.fls.length - 1]).toBe(70.0);
  });

  it('should compute brightness eyepiece spacing correctly', () => {
    const res = computeSetBrightness(6, 50, 1.0, 6.0); // f/6, 50% brightness steps
    expect(res.eps[0]).toBe(1.0);
    expect(res.eps[res.eps.length - 1]).toBe(6.0);
  });

  it('should compute linear exit pupil spacing correctly', () => {
    const res = computeSetPupil(5, 0.5, 0.5, 5.0); // f/5, 0.5mm exit pupil steps
    expect(res.eps[0]).toBe(0.5);
    expect(res.eps[1]).toBeCloseTo(1.0, 1);
    expect(res.eps[res.eps.length - 1]).toBe(5.0);
  });

  it('should compute fixed magnification steps correctly', () => {
    const res = computeSetFixed(8, 40, 0.5, 6.0, 2000); // f/8, 40x steps, 2000mm focal length
    expect(res.eps[0]).toBe(0.5);
    expect(res.eps[res.eps.length - 1]).toBe(6.0);
  });

  it('should compute simple and advanced eyepiece sets via calculateEyepieceSet', () => {
    const inputs: CalculatorInputs = {
      fratio: 10,
      inputMode: 'fl',
      flengthVal: '1000',
      apertureVal: '100',
      apertureUnit: 'mm',
      stepMode: 'percent',
      stepVal: 40,
      stepModeType: 'simple',
      personalEpLimit: 7,
      enforceLimit: false,
      epMin: 0.5,
      epMax: 7.0,
      minLimitMode: 'ep',
      maxLimitMode: 'ep',
      epTrans: 2.0,
      lowStrategy: 'percent',
      lowStep: 40,
      highStrategy: 'pupil',
      highStep: 0.5,
    };

    const simpleSet = calculateEyepieceSet(inputs);
    expect(simpleSet.count).toBeGreaterThan(1);
    expect(simpleSet.shadingStartIdx).toBeNull();

    const advInputs = { ...inputs, stepModeType: 'advanced' as const };
    const advSet = calculateEyepieceSet(advInputs);
    expect(advSet.count).toBeGreaterThan(1);
    expect(advSet.shadingStartIdx).not.toBeNull();
  });
});
