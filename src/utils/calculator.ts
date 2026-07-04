import { Telescope } from '../models/Telescope';
import { Eyepiece } from '../models/Eyepiece';
import { EyepieceCalculation } from '../models/EyepieceCalculation';
import { EyepieceSet } from '../models/EyepieceSet';
import { CalculatorInputs } from './types';

export function computeSet(fratio: number, stepPct: number, epMin: number, epMax: number) {
  const R = epMax / epMin;
  const k = 1 + stepPct / 100;
  const n = Math.log(R) / Math.log(k);
  const N = Math.ceil(n) + 1;
  const eps = [];
  for (let i = 0; i < N; i++) {
    const ep = epMin * Math.pow(k, i * (n / (N - 1)));
    eps.push(Math.min(ep, epMax));
  }
  eps[eps.length - 1] = epMax;
  const fls = eps.map(ep => ep * fratio);
  return { N, eps, fls };
}

export function computeSetBrightness(fratio: number, stepPct: number, epMin: number, epMax: number) {
  const R = epMax / epMin;
  const k = Math.sqrt(1 + stepPct / 100);
  const n = Math.log(R) / Math.log(k);
  const N = Math.ceil(n) + 1;
  const eps = [];
  for (let i = 0; i < N; i++) {
    const ep = epMin * Math.pow(k, i * (n / (N - 1)));
    eps.push(Math.min(ep, epMax));
  }
  eps[eps.length - 1] = epMax;
  const fls = eps.map(ep => ep * fratio);
  return { N, eps, fls };
}

export function computeSetPupil(fratio: number, stepVal: number, epMin: number, epMax: number) {
  const range = epMax - epMin;
  const N = Math.ceil(range / stepVal) + 1;
  const eps = [];
  for (let i = 0; i < N; i++) {
    const ep = epMin + i * (range / (N - 1));
    eps.push(Math.min(ep, epMax));
  }
  eps[eps.length - 1] = epMax;
  const fls = eps.map(ep => ep * fratio);
  return { N, eps, fls };
}

export function computeSetFixed(fratio: number, stepVal: number, epMin: number, epMax: number, flength: number) {
  const D = flength / fratio;
  const mMax = D / epMin;
  const mMin = D / epMax;
  const range = mMax - mMin;
  const N = Math.ceil(range / stepVal) + 1;
  const fls = [];
  const eps = [];
  for (let i = 0; i < N; i++) {
    const m = mMax - i * (range / (N - 1));
    fls.push(flength / m);
    eps.push(Math.min(D / m, epMax));
  }
  eps[eps.length - 1] = epMax;
  fls[fls.length - 1] = flength / mMin;
  return { N, eps, fls };
}

export function runCalculationForSegment(
  strategy: 'percent' | 'brightness' | 'fixed' | 'pupil',
  step: number,
  minVal: number,
  maxVal: number,
  fratio: number,
  flength: number
) {
  if (strategy === 'fixed') {
    return computeSetFixed(fratio, step, minVal, maxVal, flength);
  } else if (strategy === 'brightness') {
    return computeSetBrightness(fratio, step, minVal, maxVal);
  } else if (strategy === 'pupil') {
    return computeSetPupil(fratio, step, minVal, maxVal);
  } else {
    return computeSet(fratio, step, minVal, maxVal);
  }
}

export function calculateEyepieceSet(inputs: CalculatorInputs): EyepieceSet {
  const { fratio, flengthVal, apertureVal, apertureUnit, inputMode, stepMode, stepVal, stepModeType, epMin, epMax, epTrans, lowStrategy, lowStep, highStrategy, highStep } = inputs;
  
  // Resolve scope focal length
  let flength = 0;
  if (inputMode === 'fl') {
    flength = parseFloat(flengthVal) || 0;
  } else {
    const ap = parseFloat(apertureVal) || 0;
    const apMM = apertureUnit === 'in' ? ap * 25.4 : ap;
    flength = apMM * fratio;
  }

  const telescope = new Telescope(flength, fratio, false);

  let eps: number[] = [];
  let fls: number[] = [];
  let shadingStartIdx: number | null = null;

  if (stepModeType === 'simple') {
    const res = stepMode === 'fixed'
      ? computeSetFixed(fratio, stepVal, epMin, epMax, flength)
      : stepMode === 'brightness'
        ? computeSetBrightness(fratio, stepVal, epMin, epMax)
        : stepMode === 'pupil'
          ? computeSetPupil(fratio, stepVal, epMin, epMax)
          : computeSet(fratio, stepVal, epMin, epMax);
    eps = res.eps;
    fls = res.fls;
  } else {
    // Advanced Hybrid
    const epTransClamped = Math.round(Math.min(Math.max(epTrans, epMin + 0.1), epMax - 0.1) * 10) / 10;
    const lowRes = runCalculationForSegment(lowStrategy, lowStep, epMin, epTransClamped, fratio, flength);
    const highRes = runCalculationForSegment(highStrategy, highStep, epTransClamped, epMax, fratio, flength);
    eps = lowRes.eps.concat(highRes.eps.slice(1));
    fls = lowRes.fls.concat(highRes.fls.slice(1));
    shadingStartIdx = lowRes.eps.length - 1;
  }

  const calculations = eps.map((ep, i) => {
    const fl = fls[i];
    const eyepiece = new Eyepiece(fl);
    return new EyepieceCalculation(eyepiece, telescope);
  });

  return new EyepieceSet(calculations, shadingStartIdx);
}
