import React from 'react';
import { CalculatorInputs } from '../utils/types';

interface TelescopeInputsProps {
  inputs: CalculatorInputs;
  onChange: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
}

export const TelescopeInputs: React.FC<TelescopeInputsProps> = ({
  inputs,
  onChange,
}) => {
  const { fratio, inputMode, flengthVal, apertureVal, apertureUnit, stepMode, stepVal, stepModeType } = inputs;

  const isFlengthProvided = inputMode === 'fl' ? !!flengthVal : !!apertureVal;

  const handleStepModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextMode = e.target.value as CalculatorInputs['stepMode'];
    onChange('stepMode', nextMode);
    
    // Reset standard default values for range slider depending on step mode
    if (nextMode === 'brightness') {
      onChange('stepVal', 50);
    } else if (nextMode === 'pupil') {
      onChange('stepVal', 0.50);
    } else {
      onChange('stepVal', 40);
    }
  };

  // Resolve step slider constraints
  let sliderMin = 20;
  let sliderMax = 60;
  let sliderStep = 1;
  let unit = '%';

  if (stepMode === 'brightness') {
    sliderMin = 25;
    sliderMax = 100;
    sliderStep = 1;
    unit = '%';
  } else if (stepMode === 'pupil') {
    sliderMin = 0.25;
    sliderMax = 1.00;
    sliderStep = 0.05;
    unit = 'mm';
  } else if (stepMode === 'fixed') {
    sliderMin = 20;
    sliderMax = 60;
    sliderStep = 1;
    unit = 'x';
  }

  const sliderLabelVal = stepMode === 'pupil' ? stepVal.toFixed(2) : stepVal;

  return (
    <div className={`controls ${stepModeType === 'advanced' ? 'controls-advanced' : ''}`}>
      {/* 1. Focal Ratio */}
      <div>
        <label htmlFor="fratio">Focal ratio (f/#)</label>
        <input
          type="number"
          id="fratio"
          value={fratio || ''}
          min="2"
          max="20"
          step="0.1"
          onChange={(e) => onChange('fratio', parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* 2. Focal Length / Aperture */}
      <div>
        <div className="label-segmented-row">
          <div className="segmented-control" id="mode-toggle">
            <button
              type="button"
              className={`segment-btn ${inputMode === 'fl' ? 'active' : ''}`}
              onClick={() => onChange('inputMode', 'fl')}
            >
              Focal Length
            </button>
            <button
              type="button"
              className={`segment-btn ${inputMode === 'ap' ? 'active' : ''}`}
              onClick={() => onChange('inputMode', 'ap')}
            >
              Aperture
            </button>
          </div>
        </div>
        <div className="input-unit-row">
          <input
            type="text"
            id="fl-ap-input"
            value={inputMode === 'fl' ? flengthVal : apertureVal}
            placeholder={inputMode === 'fl' ? 'e.g. 1000 mm (optional)' : 'e.g. 200 mm'}
            inputMode="decimal"
            onChange={(e) => {
              const val = e.target.value;
              if (inputMode === 'fl') {
                onChange('flengthVal', val);
              } else {
                onChange('apertureVal', val);
              }
            }}
          />
          {inputMode === 'ap' && (
            <div className="segmented-control" id="unit-toggle">
              <button
                type="button"
                className={`segment-btn ${apertureUnit === 'mm' ? 'active' : ''}`}
                onClick={() => onChange('apertureUnit', 'mm')}
              >
                mm
              </button>
              <button
                type="button"
                className={`segment-btn ${apertureUnit === 'in' ? 'active' : ''}`}
                onClick={() => onChange('apertureUnit', 'in')}
              >
                in
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Simple Step Controls (hidden in advanced setup) */}
      {stepModeType === 'simple' && (
        <div id="simple-step-controls">
          <div className="adv-field-row strategy-row">
            <label htmlFor="step-mode-select">Step Strategy</label>
            <select
              id="step-mode-select"
              className="step-mode-select"
              value={stepMode}
              onChange={handleStepModeChange}
            >
              <option value="percent">Percent</option>
              <option value="brightness">Percent brightness</option>
              <option
                value="fixed"
                disabled={!isFlengthProvided}
                title={!isFlengthProvided ? 'You must enter a focal length so magnification can be calculated.' : ''}
              >
                Fixed mag
              </option>
              <option value="pupil">Fixed exit pupil</option>
            </select>
          </div>
          <div className="adv-field-row">
            <label
              htmlFor="step"
              title="This value may differ from the computed values because rounding is necessary to get the results to fit within the prescribed exit pupil limits."
            >
              Step size
            </label>
            <input
              type="range"
              id="step"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={stepVal}
              onChange={(e) => onChange('stepVal', parseFloat(e.target.value))}
            />
            <span className="step-out" id="step-out">
              {sliderLabelVal}
              {unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
