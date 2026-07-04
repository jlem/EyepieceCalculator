export interface CalculatorInputs {
  fratio: number;
  inputMode: 'fl' | 'ap';
  flengthVal: string;
  apertureVal: string;
  apertureUnit: 'mm' | 'in';
  stepMode: 'percent' | 'brightness' | 'fixed' | 'pupil';
  stepVal: number;
  stepModeType: 'simple' | 'advanced';
  personalEpLimit: number;
  enforceLimit: boolean;
  epMin: number;
  epMax: number;
  minLimitMode: 'ep' | 'fl';
  maxLimitMode: 'ep' | 'fl';
  epTrans: number;
  lowStrategy: 'percent' | 'brightness' | 'fixed' | 'pupil';
  lowStep: number;
  highStrategy: 'percent' | 'brightness' | 'fixed' | 'pupil';
  highStep: number;
}
