import { Telescope } from './Telescope';
import { Eyepiece } from './Eyepiece';
import { cleanNumber } from '../utils/calculator';

export class EyepieceCalculation {
  readonly eyepiece: Eyepiece;
  readonly telescope: Telescope;

  constructor(eyepiece: Eyepiece, telescope: Telescope) {
    this.eyepiece = eyepiece;
    this.telescope = telescope;
  }

  get exitPupil(): number {
    return cleanNumber(this.eyepiece.focalLength / this.telescope.focalRatio);
  }

  get magnification(): number {
    return cleanNumber(this.telescope.focalLength > 0 ? this.telescope.focalLength / this.eyepiece.focalLength : 0);
  }
}
