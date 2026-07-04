import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useHashState } from './hooks/useHashState';
import { calculateEyepieceSet } from './utils/calculator';
import { SetupTabs } from './components/SetupTabs';
import { TelescopeInputs } from './components/TelescopeInputs';
import { PersonalLimitControls } from './components/PersonalLimitControls';
import { AdvancedTransitionSlider } from './components/AdvancedTransitionSlider';
import { AdvancedStrategyCard } from './components/AdvancedStrategyCard';
import { StatsSummary } from './components/StatsSummary';
import { EyepieceTable } from './components/EyepieceTable';
import { ChartsContainer } from './components/ChartsContainer';
import { AppHeader } from './components/AppHeader';
import { ShareModal } from './components/ShareModal';
import { FormulaReference } from './components/Formulas/FormulaReference';
import { CalculatorInputs } from './utils/types';
import { Telescope } from './models/Telescope';

export default function App() {
  const [inputs, setInputs, enableHashUpdate] = useHashState();

  // Transient limit-enforced overlays state
  const [minEnforced, setMinEnforced] = useState(false);
  const [maxEnforced, setMaxEnforced] = useState(false);
  const [pupilRangeOpen, setPupilRangeOpen] = useState(false);

  // Timeouts references
  const minEnforceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxEnforceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal share link visibility state
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Input change handler supporting limit enforcement clamps
  const handleInputChange = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    setInputs((prev) => {
      const next = { ...prev, [key]: value };

      // Enforce limit logic: clamp epMax to personal limit if checked
      if (next.enforceLimit) {
        if (next.epMax > next.personalEpLimit) {
          next.epMax = next.personalEpLimit;
          setMaxEnforced(true);
          if (maxEnforceTimeoutRef.current) clearTimeout(maxEnforceTimeoutRef.current);
          maxEnforceTimeoutRef.current = setTimeout(() => setMaxEnforced(false), 2000);
        }
      }

      return next;
    });
  };

  // Convert input values on inputMode toggle (FL <-> AP)
  const handleInputModeToggle = (nextMode: 'fl' | 'ap') => {
    if (nextMode === inputs.inputMode) return;

    let nextVal = '';
    const rawVal = inputs.inputMode === 'fl' ? inputs.flengthVal : inputs.apertureVal;
    if (rawVal) {
      const numVal = parseFloat(rawVal) || 0;
      if (nextMode === 'ap') {
        const aperture = numVal / inputs.fratio;
        if (inputs.apertureUnit === 'in') {
          nextVal = (aperture / 25.4).toFixed(2);
        } else {
          nextVal = Math.round(aperture).toString();
        }
        handleInputChange('apertureVal', nextVal);
      } else {
        let aperture = numVal;
        if (inputs.apertureUnit === 'in') {
          aperture = numVal * 25.4;
        }
        nextVal = Math.round(aperture * inputs.fratio).toString();
        handleInputChange('flengthVal', nextVal);
      }
    }
    handleInputChange('inputMode', nextMode);
  };

  // Convert input values on aperture unit toggle (mm <-> in)
  const handleApertureUnitToggle = (nextUnit: 'mm' | 'in') => {
    if (nextUnit === inputs.apertureUnit) return;

    let nextVal = '';
    if (inputs.apertureVal) {
      const numVal = parseFloat(inputs.apertureVal) || 0;
      if (nextUnit === 'in') {
        nextVal = (numVal / 25.4).toFixed(2);
      } else {
        nextVal = Math.round(numVal * 25.4).toString();
      }
      handleInputChange('apertureVal', nextVal);
    }
    handleInputChange('apertureUnit', nextUnit);
  };

  // Focus utility for chart placeholder link
  const focusTelescopeInput = () => {
    const input = document.getElementById('fl-ap-input');
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Trigger KaTeX parsing when App mounts
  useEffect(() => {
    if ((window as any).renderMathInElement) {
      (window as any).renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
      });
    }
  }, []);

  // Compute resolved telescope & eyepiece specifications
  const telescope = useMemo(() => {
    let flength = 0;
    if (inputs.inputMode === 'fl') {
      flength = parseFloat(inputs.flengthVal) || 0;
    } else {
      const ap = parseFloat(inputs.apertureVal) || 0;
      const apMM = inputs.apertureUnit === 'in' ? ap * 25.4 : ap;
      flength = apMM * inputs.fratio;
    }
    return flength > 0 ? new Telescope(flength, inputs.fratio, false) : null;
  }, [inputs.inputMode, inputs.flengthVal, inputs.apertureVal, inputs.apertureUnit, inputs.fratio]);

  const hasFlength = !!telescope;

  // Reactively calculate full eyepiece list set
  const eyepieceSet = useMemo(() => {
    if (inputs.epMin >= inputs.epMax) return null; // stop calculations if range is invalid
    return calculateEyepieceSet(inputs);
  }, [inputs]);

  // Share link handlers
  const handleShareClick = () => {
    enableHashUpdate();
    setShareModalOpen(true);
  };

  const getShareUrl = () => {
    const params = new URLSearchParams();
    params.set('fr', inputs.fratio.toString());
    params.set('mode', inputs.inputMode);
    
    const val = inputs.inputMode === 'fl' ? inputs.flengthVal : inputs.apertureVal;
    if (val) params.set('val', val);

    if (inputs.inputMode === 'ap') {
      params.set('unit', inputs.apertureUnit);
    }

    params.set('minmode', inputs.minLimitMode);
    params.set('maxmode', inputs.maxLimitMode);

    const minVal = inputs.minLimitMode === 'ep' ? inputs.epMin : inputs.epMin * inputs.fratio;
    const maxVal = inputs.maxLimitMode === 'ep' ? inputs.epMax : inputs.epMax * inputs.fratio;
    params.set('min', minVal.toFixed(inputs.minLimitMode === 'fl' ? 1 : 2));
    params.set('max', maxVal.toFixed(inputs.maxLimitMode === 'fl' ? 1 : 2));

    params.set('pepl', inputs.personalEpLimit.toString());
    if (inputs.enforceLimit) {
      params.set('enf', '1');
    }

    params.set('type', inputs.stepModeType);

    if (inputs.stepModeType === 'simple') {
      params.set('strat', inputs.stepMode);
      params.set('step', inputs.stepVal.toString());
    } else {
      params.set('trans', inputs.epTrans.toFixed(1));
      params.set('lstrat', inputs.lowStrategy);
      params.set('lstep', inputs.lowStep.toString());
      params.set('hstrat', inputs.highStrategy);
      params.set('hstep', inputs.highStep.toString());
    }
    return window.location.origin + window.location.pathname + '#' + params.toString();
  };

  const handleToggleRange = (e: React.MouseEvent) => {
    e.preventDefault();
    setPupilRangeOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const minEl = document.getElementById('epmin');
          if (minEl) {
            minEl.focus();
            minEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 0);
      }
      return next;
    });
  };

  return (
    <main>
      <AppHeader
        epMin={inputs.epMin}
        epMax={inputs.epMax}
        onToggleRange={handleToggleRange}
      />

      <div className="app-layout">
        {/* Left Panel: Inputs and List Grid */}
        <div className="left-panel">
          <div className="setup-box">
            <SetupTabs
              activeTab={inputs.stepModeType}
              onChange={(tab) => {
                handleInputChange('stepModeType', tab);
                setPupilRangeOpen(tab === 'advanced');
              }}
              onShare={handleShareClick}
            />

            {/* Telescope Specs */}
            <TelescopeInputs
              inputs={inputs}
              onChange={(key, value) => {
                if (key === 'inputMode') {
                  handleInputModeToggle(value as any);
                } else if (key === 'apertureUnit') {
                  handleApertureUnitToggle(value as any);
                } else {
                  handleInputChange(key, value);
                }
              }}
            />

            {/* Exit Pupil Ranges (Always directly below controls) */}
            <PersonalLimitControls
              inputs={inputs}
              isOpen={pupilRangeOpen}
              minEnforcedActive={minEnforced}
              maxEnforcedActive={maxEnforced}
              onChange={handleInputChange}
            />

            {/* Advanced Configurations Slider & Cards */}
            {inputs.stepModeType === 'advanced' && (
              <div id="advanced-step-container" className="advanced-step-container">
                <AdvancedTransitionSlider
                  epMin={inputs.epMin}
                  epMax={inputs.epMax}
                  epTrans={inputs.epTrans}
                  onChange={(val) => handleInputChange('epTrans', val)}
                />
                <div className="adv-cards-grid">
                  <AdvancedStrategyCard
                    cardId="card-low"
                    title={`Low Range (${inputs.epMin.toFixed(1)}mm → ${inputs.epTrans.toFixed(1)}mm)`}
                    strategy={inputs.lowStrategy}
                    step={inputs.lowStep}
                    isFlengthProvided={hasFlength}
                    onStrategyChange={(val) => handleInputChange('lowStrategy', val)}
                    onStepChange={(val) => handleInputChange('lowStep', val)}
                  />
                  <AdvancedStrategyCard
                    cardId="card-high"
                    title={`High Range (${inputs.epTrans.toFixed(1)}mm → ${inputs.epMax.toFixed(1)}mm)`}
                    strategy={inputs.highStrategy}
                    step={inputs.highStep}
                    isFlengthProvided={hasFlength}
                    onStrategyChange={(val) => handleInputChange('highStrategy', val)}
                    onStepChange={(val) => handleInputChange('highStep', val)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Stats summary boxes */}
          <StatsSummary
            count={eyepieceSet ? eyepieceSet.count : null}
            shortestFL={eyepieceSet ? eyepieceSet.shortestFL : null}
            longestFL={eyepieceSet ? eyepieceSet.longestFL : null}
            longestEp={
              eyepieceSet && eyepieceSet.calculations.length > 0
                ? eyepieceSet.calculations[eyepieceSet.calculations.length - 1].exitPupil
                : null
            }
            personalEpLimit={inputs.personalEpLimit}
          />

          {/* Eyepiece Grid Table */}
          <EyepieceTable
            eyepieceSet={eyepieceSet}
            personalEpLimit={inputs.personalEpLimit}
            hasFlength={hasFlength}
          />

          {/* Formulas reference guide */}
          <FormulaReference />
        </div>

        {/* Right Panel: Charts Container */}
        <ChartsContainer
          eyepieceSet={eyepieceSet}
          telescope={telescope}
          hasFlength={hasFlength}
          onFocusTelescopeInput={focusTelescopeInput}
        />
      </div>

      <footer className="app-footer">
        Inspired by Don Pensack (Starman1) and his invaluable insights and contributions to the amateur astronomy community. Thank you, Don!
      </footer>

      {/* Share Link Modal popup */}
      <ShareModal
        isOpen={shareModalOpen}
        shareUrl={getShareUrl()}
        onClose={() => setShareModalOpen(false)}
      />
    </main>
  );
}
