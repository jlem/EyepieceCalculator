export interface DatabaseEyepiece {
  fullName: string;
  line: string;
  brand: string;
  mfrFocalLength: number | null;
  measuredFocalLength: number | null;
  mfrApparentFOV: number | null;
  measuredApparentFOV: number | null;
  weightOz: number | null;
  eyeRelief: number | null;
  mfrFieldStop: number | null;
  measuredFieldStop: number | null;
  calculatedFieldStop: number | null;
  elementCount: number | null;
}
