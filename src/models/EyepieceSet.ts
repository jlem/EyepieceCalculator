import { EyepieceCalculation } from './EyepieceCalculation';

export class EyepieceSet {
  readonly calculations: EyepieceCalculation[];
  readonly shadingStartIdx: number | null;

  constructor(calculations: EyepieceCalculation[], shadingStartIdx: number | null = null) {
    this.calculations = calculations;
    this.shadingStartIdx = shadingStartIdx;
  }

  sorted(column: 'fl' | 'ep' | 'mag', order: 'asc' | 'desc'): EyepieceCalculation[] {
    return [...this.calculations].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (column === 'fl') {
        valA = a.eyepiece.focalLength;
        valB = b.eyepiece.focalLength;
      } else if (column === 'ep') {
        valA = a.exitPupil;
        valB = b.exitPupil;
      } else if (column === 'mag') {
        valA = a.magnification;
        valB = b.magnification;
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });
  }

  get count(): number {
    return this.calculations.length;
  }

  get shortestFL(): number {
    if (this.calculations.length === 0) return 0;
    return Math.min(...this.calculations.map(c => c.eyepiece.focalLength));
  }

  get longestFL(): number {
    if (this.calculations.length === 0) return 0;
    return Math.max(...this.calculations.map(c => c.eyepiece.focalLength));
  }
}
