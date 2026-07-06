import { cleanNumber } from '../utils/calculator';

export class Telescope {
  readonly id: string;
  readonly name: string;
  readonly aperture: number;       // in mm
  readonly focalLength: number;     // in mm
  readonly focalRatio: number;      // f/#
  readonly focuserSize: '1.25' | '2' | '3';
  readonly apertureInches: number;  // in inches, pre-calculated

  constructor(
    id: string,
    name: string,
    aperture: number,
    focalLength: number,
    focalRatio: number,
    focuserSize: '1.25' | '2' | '3'
  ) {
    this.id = id;
    this.name = name;
    this.aperture = cleanNumber(aperture, 4);
    this.focalLength = cleanNumber(focalLength, 4);
    this.focalRatio = cleanNumber(focalRatio, 4);
    this.focuserSize = focuserSize;
    this.apertureInches = cleanNumber(aperture / 25.4, 4);
  }

  displayAperture(unit: 'mm' | 'in'): string {
    const val = unit === 'in' ? this.apertureInches : this.aperture;
    return Telescope.formatValue(val);
  }

  static mmToInches(mm: number): number {
    return cleanNumber(mm / 25.4, 4);
  }

  static inchesToMm(inches: number): number {
    return cleanNumber(inches * 25.4, 4);
  }

  static formatValue(value: number): string {
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
  }
}
