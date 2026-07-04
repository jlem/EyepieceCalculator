export class Telescope {
  readonly aperture: number;   // in mm
  readonly focalLength: number; // in mm
  readonly focalRatio: number;  // f/#

  constructor(apertureOrFlength: number, fratio: number, isAperture = false) {
    this.focalRatio = fratio;
    if (isAperture) {
      this.aperture = apertureOrFlength;
      this.focalLength = apertureOrFlength * fratio;
    } else {
      this.focalLength = apertureOrFlength;
      this.aperture = fratio > 0 ? apertureOrFlength / fratio : 0;
    }
  }

  get apertureMM(): number {
    return this.aperture;
  }

  get apertureIN(): number {
    return this.aperture / 25.4;
  }
}
