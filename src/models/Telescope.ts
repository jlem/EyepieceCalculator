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
    this.aperture = aperture;
    this.focalLength = focalLength;
    this.focalRatio = focalRatio;
    this.focuserSize = focuserSize;
    this.apertureInches = aperture / 25.4;
  }
}
