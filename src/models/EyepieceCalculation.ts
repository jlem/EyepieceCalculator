import { Telescope } from './Telescope';
import { Eyepiece } from './Eyepiece';

export class EyepieceCalculation {
  readonly eyepiece: Eyepiece;
  readonly telescope: Telescope;

  constructor(eyepiece: Eyepiece, telescope: Telescope) {
    this.eyepiece = eyepiece;
    this.telescope = telescope;
  }

  get exitPupil(): number {
    return this.eyepiece.focalLength / this.telescope.focalRatio;
  }

  get magnification(): number {
    return this.telescope.focalLength > 0 ? this.telescope.focalLength / this.eyepiece.focalLength : 0;
  }
}
