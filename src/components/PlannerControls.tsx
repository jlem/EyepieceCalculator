import React from 'react';
import { CalculatorInputs } from '../utils/types';

interface PlannerControlsProps {
  inputs: CalculatorInputs;
  minEnforcedActive: boolean;
  maxEnforcedActive: boolean;
  onChange: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
}

export const PlannerControls: React.FC<PlannerControlsProps> = ({
  inputs,
  minEnforcedActive,
  maxEnforcedActive,
  onChange,
}) => {
  const {
    fratio,
    stepMode,
    stepVal,
    stepModeType,
    personalEpLimit,
    epMin,
    epMax,
    minLimitMode,
    maxLimitMode,
  } = inputs;

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

  const isRangeError = epMin >= epMax;
  const isMaxWarn = stepModeType === 'advanced' && epMax > personalEpLimit;

  // Advanced mode: compute presentation values with EP/FL toggle
  const minPresVal = minLimitMode === 'ep' ? epMin : Math.round(epMin * fratio * 10) / 10;
  const maxPresVal = maxLimitMode === 'ep' ? epMax : Math.round(epMax * fratio * 10) / 10;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (stepModeType === 'advanced' && minLimitMode === 'fl') {
      onChange('epMin', val / fratio);
    } else {
      onChange('epMin', val);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (stepModeType === 'advanced' && maxLimitMode === 'fl') {
      onChange('epMax', val / fratio);
    } else {
      onChange('epMax', val);
    }
  };

  // Warning tooltip for max limit
  const maxWarningTooltip = maxLimitMode === 'fl'
    ? `This eyepiece focal length results in an exit pupil of ${epMax.toFixed(1)}mm, which exceeds your personal exit pupil limit.`
    : `This exit pupil exceeds your personal exit pupil limit.`;

  return (
    <div className={`controls ${stepModeType === 'advanced' ? 'controls-advanced' : ''}`}>
      {/* ─── SIMPLE MODE ─── */}
      {stepModeType === 'simple' && (
        <>
          {/* 1. Min exit pupil */}
          <div>
            <label htmlFor="epmin">Min exit pupil</label>
            <div className={`input-warning-wrapper ${isRangeError ? 'error-active' : ''}`} id="epmin-warning-wrapper">
              <input
                type="number"
                id="epmin"
                value={epMin || ''}
                min="0.1"
                max="150"
                step="0.1"
                onChange={(e) => onChange('epMin', parseFloat(e.target.value) || 0)}
              />
              <div className={`limit-enforced-overlay ${minEnforcedActive ? 'show' : ''}`} id="min-limit-enforced-overlay">
                Limit enforced
              </div>
              {isRangeError && (
                <div
                  className="input-warning-icon"
                  id="epmin-error-icon"
                  title="Minimum value must be less than maximum value"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-error)">
                    <title>Minimum value must be less than maximum value</title>
                    <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 2. Max exit pupil */}
          <div>
            <label htmlFor="epmax">Max exit pupil</label>
            <div className={`input-warning-wrapper ${isRangeError ? 'error-active' : isMaxWarn ? 'warning-active' : ''}`} id="epmax-warning-wrapper">
              <input
                type="number"
                id="epmax"
                value={epMax || ''}
                min="0.1"
                max="250"
                step="0.5"
                onChange={(e) => onChange('epMax', parseFloat(e.target.value) || 0)}
              />
              <div className={`limit-enforced-overlay ${maxEnforcedActive ? 'show' : ''}`} id="limit-enforced-overlay">
                Limit enforced
              </div>
              {isRangeError && (
                <div
                  className="input-warning-icon"
                  id="epmax-error-icon"
                  title="Minimum value must be less than maximum value"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-error)">
                    <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                  </svg>
                </div>
              )}
              {(!isRangeError && isMaxWarn) && (
                <div
                  className="input-warning-icon"
                  id="epmax-warning-icon"
                  title={maxWarningTooltip}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-warn)">
                    <title>{maxWarningTooltip}</title>
                    <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 3. Step Strategy & Step Size */}
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
                <option value="fixed">Fixed mag</option>
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
        </>
      )}

      {/* ─── ADVANCED MODE ─── */}
      {stepModeType === 'advanced' && (
        <>
          {/* 1. Min limit with EP/FL toggle */}
          <div>
            <div className="label-segmented-row">
              <div className="segmented-control" id="min-mode-toggle">
                <button
                  type="button"
                  className={`segment-btn ${minLimitMode === 'ep' ? 'active' : ''}`}
                  onClick={() => onChange('minLimitMode', 'ep')}
                >
                  Min exit pupil
                </button>
                <button
                  type="button"
                  className={`segment-btn ${minLimitMode === 'fl' ? 'active' : ''}`}
                  onClick={() => onChange('minLimitMode', 'fl')}
                >
                  Min eyepiece FL
                </button>
              </div>
            </div>
            <div className={`input-warning-wrapper ${isRangeError ? 'error-active' : ''}`} id="epmin-warning-wrapper">
              <input
                type="number"
                id="epmin"
                value={minPresVal || ''}
                min="0.1"
                max="150"
                step="0.1"
                onChange={handleMinChange}
              />
              <div className={`limit-enforced-overlay ${minEnforcedActive ? 'show' : ''}`} id="min-limit-enforced-overlay">
                Limit enforced
              </div>
              {isRangeError && (
                <div
                  className="input-warning-icon"
                  id="epmin-error-icon"
                  title="Minimum value must be less than maximum value"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-error)">
                    <title>Minimum value must be less than maximum value</title>
                    <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* 2. Max limit with EP/FL toggle */}
          <div>
            <div className="label-segmented-row">
              <div className="segmented-control" id="max-mode-toggle">
                <button
                  type="button"
                  className={`segment-btn ${maxLimitMode === 'ep' ? 'active' : ''}`}
                  onClick={() => onChange('maxLimitMode', 'ep')}
                >
                  Max exit pupil
                </button>
                <button
                  type="button"
                  className={`segment-btn ${maxLimitMode === 'fl' ? 'active' : ''}`}
                  onClick={() => onChange('maxLimitMode', 'fl')}
                >
                  Max eyepiece FL
                </button>
              </div>
            </div>
            <div className={`input-warning-wrapper ${isRangeError ? 'error-active' : isMaxWarn ? 'warning-active' : ''}`} id="epmax-warning-wrapper">
              <input
                type="number"
                id="epmax"
                value={maxPresVal || ''}
                min="0.1"
                max="250"
                step="0.5"
                onChange={handleMaxChange}
              />
              <div className={`limit-enforced-overlay ${maxEnforcedActive ? 'show' : ''}`} id="limit-enforced-overlay">
                Limit enforced
              </div>
              {isRangeError && (
                <div
                  className="input-warning-icon"
                  id="epmax-error-icon"
                  title="Minimum value must be less than maximum value"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-error)">
                    <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                  </svg>
                </div>
              )}
              {(!isRangeError && isMaxWarn) && (
                <div
                  className="input-warning-icon"
                  id="epmax-warning-icon"
                  title={maxWarningTooltip}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-warn)">
                    <title>{maxWarningTooltip}</title>
                    <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
