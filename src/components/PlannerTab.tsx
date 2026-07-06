import React from 'react';
import { SetupTabs } from './SetupTabs';
import { PlannerControls } from './PlannerControls';
import { AdvancedTransitionSlider } from './AdvancedTransitionSlider';
import { AdvancedStrategyCard } from './AdvancedStrategyCard';
import { StatsSummary } from './StatsSummary';
import { EyepieceTable } from './EyepieceTable';
import { ChartsContainer } from './ChartsContainer';
import { FormulaReference } from './Formulas/FormulaReference';
import { CalculatorInputs } from '../utils/types';
import { Telescope } from '../models/Telescope';
import { EyepieceSet } from '../models/EyepieceSet';

interface PlannerTabProps {
  inputs: CalculatorInputs;
  onChange: <K extends keyof CalculatorInputs>(key: K, value: CalculatorInputs[K]) => void;
  onShareClick: () => void;
  minEnforced: boolean;
  maxEnforced: boolean;
  telescope: Telescope | null;
  hasFlength: boolean;
  eyepieceSet: EyepieceSet | null;
  onAddTelescopeClick: () => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  inputs,
  onChange,
  onShareClick,
  minEnforced,
  maxEnforced,
  telescope,
  hasFlength,
  eyepieceSet,
  onAddTelescopeClick,
}) => {
  return (
    <div className="app-layout" data-testid="planner-tab">
      {/* Left Panel: Inputs and List Grid */}
      <div className="left-panel">
        <div className="setup-box">
          <SetupTabs
            activeTab={inputs.stepModeType}
            onChange={(tab) => {
              onChange('stepModeType', tab);
            }}
            onShare={onShareClick}
          />

          {/* Exit Pupil Range & Step Controls */}
          <PlannerControls
            inputs={inputs}
            minEnforcedActive={minEnforced}
            maxEnforcedActive={maxEnforced}
            onChange={onChange}
          />

          {/* Advanced: Personal Limit + Enforce row */}
          {inputs.stepModeType === 'advanced' && (
            <div className="personal-limit-row">
              <div>
                <label htmlFor="personal-ep-limit">Personal exit pupil limit (mm)</label>
                <input
                  type="number"
                  id="personal-ep-limit"
                  value={inputs.personalEpLimit || ''}
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
                    checked={inputs.enforceLimit}
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
          )}

          {/* Advanced: Transition Slider & Strategy Cards */}
          {inputs.stepModeType === 'advanced' && (
            <div id="advanced-step-container" className="advanced-step-container">
              <AdvancedTransitionSlider
                epMin={inputs.epMin}
                epMax={inputs.epMax}
                epTrans={inputs.epTrans}
                onChange={(val) => onChange('epTrans', val)}
              />
              <div className="adv-cards-grid">
                <AdvancedStrategyCard
                  cardId="card-low"
                  title={`Low Range (${inputs.epMin.toFixed(1)}mm → ${inputs.epTrans.toFixed(1)}mm)`}
                  strategy={inputs.lowStrategy}
                  step={inputs.lowStep}
                  isFlengthProvided={hasFlength}
                  onStrategyChange={(val) => onChange('lowStrategy', val)}
                  onStepChange={(val) => onChange('lowStep', val)}
                />
                <AdvancedStrategyCard
                  cardId="card-high"
                  title={`High Range (${inputs.epTrans.toFixed(1)}mm → ${inputs.epMax.toFixed(1)}mm)`}
                  strategy={inputs.highStrategy}
                  step={inputs.highStep}
                  isFlengthProvided={hasFlength}
                  onStrategyChange={(val) => onChange('highStrategy', val)}
                  onStepChange={(val) => onChange('highStep', val)}
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
          stepModeType={inputs.stepModeType}
        />

        {/* Eyepiece Grid Table */}
        <EyepieceTable
          eyepieceSet={eyepieceSet}
          personalEpLimit={inputs.personalEpLimit}
          hasFlength={hasFlength}
          stepModeType={inputs.stepModeType}
        />

        {/* Formulas reference guide */}
        <FormulaReference />
      </div>

      {/* Right Panel: Charts Container */}
      <ChartsContainer
        eyepieceSet={eyepieceSet}
        telescope={telescope}
        hasFlength={hasFlength}
        onAddTelescopeClick={onAddTelescopeClick}
      />
    </div>
  );
};
