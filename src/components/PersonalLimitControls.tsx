import React from 'react';
import { CalculatorInputs } from '../utils/types';

interface PersonalLimitControlsProps {
  inputs: CalculatorInputs;
  isOpen: boolean;
  minEnforcedActive: boolean;
  maxEnforcedActive: boolean;
  onChange: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
}

export const PersonalLimitControls: React.FC<PersonalLimitControlsProps> = ({
  inputs,
  isOpen,
  minEnforcedActive,
  maxEnforcedActive,
  onChange,
}) => {
  const {
    fratio,
    personalEpLimit,
    enforceLimit,
    epMin,
    epMax,
    minLimitMode,
    maxLimitMode,
  } = inputs;

  const isRangeError = epMin >= epMax;
  const isMaxWarn = epMax > personalEpLimit;

  // Compute presentation values
  const minPresVal = minLimitMode === 'ep' ? epMin : Math.round(epMin * fratio * 10) / 10;
  const maxPresVal = maxLimitMode === 'ep' ? epMax : Math.round(epMax * fratio * 10) / 10;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (minLimitMode === 'ep') {
      onChange('epMin', val);
    } else {
      onChange('epMin', val / fratio);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (maxLimitMode === 'ep') {
      onChange('epMax', val);
    } else {
      onChange('epMax', val / fratio);
    }
  };

  const handleMinModeChange = (mode: 'ep' | 'fl') => {
    onChange('minLimitMode', mode);
  };

  const handleMaxModeChange = (mode: 'ep' | 'fl') => {
    onChange('maxLimitMode', mode);
  };

  // Warning tooltip for max limit
  const maxEpCalculated = epMax;
  const maxWarningTooltip = maxLimitMode === 'fl'
    ? `This eyepiece focal length results in an exit pupil of ${maxEpCalculated.toFixed(1)}mm, which exceeds your personal exit pupil limit.`
    : `This exit pupil exceeds your personal exit pupil limit.`;

  return (
    <div className={`pupil-range-wrapper ${isOpen ? 'open' : ''}`}>
      {/* Personal Limit Row */}
      <div className="personal-limit-row">
        <div>
          <label htmlFor="personal-ep-limit">Personal exit pupil limit (mm)</label>
          <input
            type="number"
            id="personal-ep-limit"
            value={personalEpLimit || ''}
            min="0.1"
            max="25"
            step="0.1"
            onChange={(e) => onChange('personalEpLimit', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div className="enforce-limit-col">
          <label style={{ userSelect: 'none' }}>&nbsp;</label>
          <div className="checkbox-wrap">
            <input
              type="checkbox"
              id="enforce-personal-limit"
              checked={enforceLimit}
              onChange={(e) => onChange('enforceLimit', e.target.checked)}
            />
            <label
              htmlFor="enforce-personal-limit"
              style={{ cursor: 'pointer', userSelect: 'none', marginLeft: '8px', marginBottom: 0, display: 'inline-block' }}
            >
              Enforce limit
            </label>
          </div>
        </div>
      </div>

      {/* Pupil Range Row */}
      <div className="pupil-range-row">
        {/* Min Input */}
        <div>
          <div className="label-segmented-row">
            <div className="segmented-control" id="min-mode-toggle">
              <button
                type="button"
                className={`segment-btn ${minLimitMode === 'ep' ? 'active' : ''}`}
                onClick={() => handleMinModeChange('ep')}
              >
                Min exit pupil
              </button>
              <button
                type="button"
                className={`segment-btn ${minLimitMode === 'fl' ? 'active' : ''}`}
                onClick={() => handleMinModeChange('fl')}
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

        {/* Max Input */}
        <div>
          <div className="label-segmented-row">
            <div className="segmented-control" id="max-mode-toggle">
              <button
                type="button"
                className={`segment-btn ${maxLimitMode === 'ep' ? 'active' : ''}`}
                onClick={() => handleMaxModeChange('ep')}
              >
                Max exit pupil
              </button>
              <button
                type="button"
                className={`segment-btn ${maxLimitMode === 'fl' ? 'active' : ''}`}
                onClick={() => handleMaxModeChange('fl')}
              >
                Max eyepiece FL
              </button>
            </div>
          </div>
          <div className={`input-warning-wrapper ${isMaxWarn ? 'warning-active' : ''}`} id="epmax-warning-wrapper">
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
            {isMaxWarn && (
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
      </div>
    </div>
  );
};
