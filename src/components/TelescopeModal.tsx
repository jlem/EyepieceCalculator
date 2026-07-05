import React, { useState, useEffect } from 'react';
import { Telescope } from '../models/Telescope';

interface TelescopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (telescope: Telescope) => void;
  telescopeToEdit: Telescope | null;
}

interface ParsedSpecs {
  aperture?: string;
  apertureUnit?: 'mm' | 'in';
  focalLength?: string;
  focalRatio?: string;
}

const parseTelescopeSpecs = (nameStr: string): ParsedSpecs | null => {
  // Case 1: Aperture in inches/mm and focal ratio, e.g. 24" F/3, 8in f/6, 8" f5, 80mm f/6
  const apInchesRegex = /(\d+(?:\.\d+)?)\s*(?:"|in\b|inch(?:es)?\b)/i;
  const apMmRegex = /(\d+(?:\.\d+)?)\s*(?:mm\b)/i;
  const frRegex = /(?:f\s*\/\s*|f\s*|f\s*#\s*)(\d+(?:\.\d+)?)/i;

  const apInchesMatch = nameStr.match(apInchesRegex);
  const apMmMatch = nameStr.match(apMmRegex);
  const frMatch = nameStr.match(frRegex);

  if ((apInchesMatch || apMmMatch) && frMatch) {
    const frVal = parseFloat(frMatch[1]);
    if (frVal > 0) {
      if (apInchesMatch) {
        const apVal = parseFloat(apInchesMatch[1]);
        const flVal = Math.round(apVal * 25.4 * frVal);
        return {
          aperture: apVal.toString(),
          apertureUnit: 'in',
          focalRatio: parseFloat(frVal.toFixed(2)).toString(),
          focalLength: flVal.toString(),
        };
      } else if (apMmMatch) {
        const apVal = parseFloat(apMmMatch[1]);
        const flVal = Math.round(apVal * frVal);
        return {
          aperture: apVal.toString(),
          apertureUnit: 'mm',
          focalRatio: parseFloat(frVal.toFixed(2)).toString(),
          focalLength: flVal.toString(),
        };
      }
    }
  }

  // Case 2: [Aperture]/[Focal Length], e.g. 114/900, 150/1200, 80/600, 4.5/900
  const slashRegex = /(?<!f\s*)\b(\d+(?:\.\d+)?)\s*\/\s*(\d+)\b/i;
  const slashMatch = nameStr.match(slashRegex);
  if (slashMatch) {
    const firstNum = parseFloat(slashMatch[1]);
    const secondNum = parseFloat(slashMatch[2]);
    if (firstNum > 0 && secondNum > 0) {
      const isInch = firstNum < 30;
      const apMM = isInch ? firstNum * 25.4 : firstNum;
      const frVal = secondNum / apMM;
      return {
        aperture: firstNum.toString(),
        apertureUnit: isInch ? 'in' : 'mm',
        focalLength: secondNum.toString(),
        focalRatio: parseFloat(frVal.toFixed(2)).toString(),
      };
    }
  }

  return null;
};

export const TelescopeModal: React.FC<TelescopeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  telescopeToEdit,
}) => {
  const [name, setName] = useState('');
  const [focalRatio, setFocalRatio] = useState('5');
  const [focalLength, setFocalLength] = useState('1000');
  const [aperture, setAperture] = useState('200');
  const [apertureUnit, setApertureUnit] = useState<'mm' | 'in'>('mm');
  const [focuserSize, setFocuserSize] = useState<'1.25' | '2' | '3'>('2');
  const [lastTyped, setLastTyped] = useState<'fl' | 'ap'>('fl');
  const [errorMsg, setErrorMsg] = useState('');
  const [focusedField, setFocusedField] = useState<'fl' | 'ap' | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (telescopeToEdit) {
        setName(telescopeToEdit.name);
        setFocalRatio(telescopeToEdit.focalRatio.toString());
        setFocalLength(telescopeToEdit.focalLength.toString());
        setAperture(telescopeToEdit.aperture.toString());
        setApertureUnit('mm'); // Be sure the control indicates mm by default when editing
        setFocuserSize(telescopeToEdit.focuserSize);
        setLastTyped('fl');
      } else {
        setName('');
        setFocalRatio('5');
        setFocalLength('1000');
        setAperture('200');
        setApertureUnit('mm');
        setFocuserSize('2');
        setLastTyped('fl');
      }
      setErrorMsg('');
    }
  }, [isOpen, telescopeToEdit]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    const parsed = parseTelescopeSpecs(val);
    if (parsed) {
      if (parsed.aperture !== undefined) setAperture(parsed.aperture);
      if (parsed.apertureUnit !== undefined) setApertureUnit(parsed.apertureUnit);
      if (parsed.focalLength !== undefined) setFocalLength(parsed.focalLength);
      if (parsed.focalRatio !== undefined) setFocalRatio(parsed.focalRatio);
    }
  };

  const handleFocalRatioChange = (val: string) => {
    setFocalRatio(val);
    const fr = parseFloat(val) || 0;
    if (fr > 0) {
      const ap = parseFloat(aperture) || 0;
      const apMM = apertureUnit === 'in' ? ap * 25.4 : ap;
      setFocalLength(Math.round(apMM * fr).toString());
    }
  };

  const handleFocalLengthChange = (val: string) => {
    setFocalLength(val);
    setLastTyped('fl');
    const fl = parseFloat(val) || 0;
    const fr = parseFloat(focalRatio) || 0;
    if (fr > 0) {
      const apMM = fl / fr;
      if (apertureUnit === 'in') {
        setAperture((apMM / 25.4).toFixed(2));
      } else {
        setAperture(Math.round(apMM).toString());
      }
    }
  };

  const handleApertureChange = (val: string) => {
    setAperture(val);
    setLastTyped('ap');
    const ap = parseFloat(val) || 0;
    const apMM = apertureUnit === 'in' ? ap * 25.4 : ap;
    const fr = parseFloat(focalRatio) || 0;
    setFocalLength(Math.round(apMM * fr).toString());
  };

  const handleApertureUnitChange = (newUnit: 'mm' | 'in') => {
    if (newUnit === apertureUnit) return;
    const ap = parseFloat(aperture) || 0;
    setApertureUnit(newUnit);
    if (newUnit === 'in') {
      setAperture((ap / 25.4).toFixed(2));
    } else {
      setAperture(Math.round(ap * 25.4).toString());
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a telescope name.');
      return;
    }

    const fr = parseFloat(focalRatio) || 0;
    const fl = parseFloat(focalLength) || 0;
    const ap = parseFloat(aperture) || 0;
    const apMM = apertureUnit === 'in' ? ap * 25.4 : ap;

    if (fr <= 0 || fl <= 0 || apMM <= 0) {
      setErrorMsg('Focal ratio, focal length, and aperture must be positive values.');
      return;
    }

    const id = telescopeToEdit ? telescopeToEdit.id : `tele_${Date.now()}`;
    const newTelescope = new Telescope(id, name.trim(), apMM, fl, fr, focuserSize);
    onSave(newTelescope);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="telescope-modal">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{telescopeToEdit ? 'Edit Telescope' : 'Add Telescope'}</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div>
          {errorMsg && <div className="modal-error">{errorMsg}</div>}

          {/* First Row: Telescope Name (Full Width) */}
          <div className="modal-form-group">
            <div className="modal-label">Telescope</div>
            <input
              type="text"
              id="modal-label"
              name="telescope-label"
              value={name}
              placeholder="e.g. 8'' Dobsonian"
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              data-testid="modal-label-input"
            />
          </div>

          {/* Second Row: Focal Ratio and Focuser Size Side-by-Side */}
          <div className="modal-form-grid">
            <div className="modal-form-group">
              <div className="modal-label">Focal Ratio (f/#)</div>
              <input
                type="number"
                id="modal-fratio"
                step="0.1"
                min="1"
                max="50"
                value={focalRatio}
                onChange={(e) => handleFocalRatioChange(e.target.value)}
                onFocus={() => setFocusedField('fr')}
                onBlur={() => setFocusedField(null)}
                onKeyDown={handleKeyDown}
                data-testid="modal-fratio-input"
              />
            </div>

            <div className="modal-form-group">
              <div className="modal-label">Focuser Size</div>
              <select
                id="modal-focuser"
                value={focuserSize}
                onChange={(e) => setFocuserSize(e.target.value as any)}
                className="step-mode-select"
                data-testid="modal-focuser-select"
              >
                <option value="1.25">1.25"</option>
                <option value="2">2"</option>
                <option value="3">3"</option>
              </select>
            </div>
          </div>

          {/* Third Row: Aperture and Focal Length Side-by-Side with "or" between */}
          <div className="modal-spec-row">
            {/* Aperture (First) */}
            <div className="modal-form-group spec-input-group">
              <div className="aperture-label-row">
                <div className="modal-label">Aperture</div>
                <div className="segmented-control" id="modal-unit-toggle">
                  <button
                    type="button"
                    className={`segment-btn ${apertureUnit === 'mm' ? 'active' : ''}`}
                    onClick={() => handleApertureUnitChange('mm')}
                  >
                    mm
                  </button>
                  <button
                    type="button"
                    className={`segment-btn ${apertureUnit === 'in' ? 'active' : ''}`}
                    onClick={() => handleApertureUnitChange('in')}
                  >
                    in
                  </button>
                </div>
              </div>
              <div className={`modal-input-wrapper ${focusedField === 'fl' ? 'is-calculated' : ''}`}>
                <input
                  type="number"
                  id="modal-aperture"
                  step="0.1"
                  min="0.1"
                  max="1000"
                  value={aperture}
                  onChange={(e) => handleApertureChange(e.target.value)}
                  onFocus={() => setFocusedField('ap')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  data-testid="modal-aperture-input"
                />
                {focusedField === 'fl' && (
                  <div className="calculator-indicator" title="Calculated automatically">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.8" />
                      <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.8" />
                      <line x1="5" y1="7" x2="9" y2="7" />
                      <line x1="15" y1="7" x2="19" y2="7" />
                      <line x1="17" y1="5" x2="17" y2="9" />
                      <line x1="5" y1="15" x2="9" y2="15" />
                      <line x1="5" y1="18" x2="9" y2="18" />
                      <line x1="15" y1="15" x2="19" y2="19" />
                      <line x1="19" y1="15" x2="15" y2="19" />
                    </svg>
                  </div>
                )}
                {focusedField === 'fr' && (
                  <div className="lock-indicator" title="Aperture is locked/fixed when changing focal ratio">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-or-separator">or</div>

            {/* Focal Length (Second) */}
            <div className="modal-form-group spec-input-group">
              <div className="modal-label">Focal Length (mm)</div>
              <div className={`modal-input-wrapper ${focusedField === 'ap' || focusedField === 'fr' ? 'is-calculated' : ''}`}>
                <input
                  type="number"
                  id="modal-flength"
                  step="1"
                  min="1"
                  max="10000"
                  value={focalLength}
                  onChange={(e) => handleFocalLengthChange(e.target.value)}
                  onFocus={() => setFocusedField('fl')}
                  onBlur={() => setFocusedField(null)}
                  onKeyDown={handleKeyDown}
                  data-testid="modal-flength-input"
                />
                {(focusedField === 'ap' || focusedField === 'fr') && (
                  <div className="calculator-indicator" title="Calculated automatically">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="22" strokeWidth="1.8" />
                      <line x1="2" y1="12" x2="22" y2="12" strokeWidth="1.8" />
                      <line x1="5" y1="7" x2="9" y2="7" />
                      <line x1="15" y1="7" x2="19" y2="7" />
                      <line x1="17" y1="5" x2="17" y2="9" />
                      <line x1="5" y1="15" x2="9" y2="15" />
                      <line x1="5" y1="18" x2="9" y2="18" />
                      <line x1="15" y1="15" x2="19" y2="19" />
                      <line x1="19" y1="15" x2="15" y2="19" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={() => handleSave()}>
              Save Telescope
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
