import React from 'react';
import { SetupTabs } from './SetupTabs';
import { TelescopeInputs } from './TelescopeInputs';
import { PersonalLimitControls } from './PersonalLimitControls';
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
  onInputModeToggle: (nextMode: 'fl' | 'ap') => void;
  onApertureUnitToggle: (nextUnit: 'mm' | 'in') => void;
  onShareClick: () => void;
  minEnforced: boolean;
  maxEnforced: boolean;
  pupilRangeOpen: boolean;
  setPupilRangeOpen: React.Dispatch<React.SetStateAction<boolean>>;
  telescope: Telescope | null;
  hasFlength: boolean;
  eyepieceSet: EyepieceSet | null;
  focusTelescopeInput: () => void;
}

export const PlannerTab: React.FC<PlannerTabProps> = ({
  inputs,
  onChange,
  onInputModeToggle,
  onApertureUnitToggle,
  onShareClick,
  minEnforced,
  maxEnforced,
  pupilRangeOpen,
  setPupilRangeOpen,
  telescope,
  hasFlength,
  eyepieceSet,
  focusTelescopeInput,
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
              setPupilRangeOpen(tab === 'advanced');
            }}
            onShare={onShareClick}
          />

          {/* Telescope Specs */}
          <TelescopeInputs
            inputs={inputs}
            onChange={(key, value) => {
              if (key === 'inputMode') {
                onInputModeToggle(value as any);
              } else if (key === 'apertureUnit') {
                onApertureUnitToggle(value as any);
              } else {
                onChange(key, value);
              }
            }}
          />

          {/* Exit Pupil Ranges (Always directly below controls) */}
          <PersonalLimitControls
            inputs={inputs}
            isOpen={pupilRangeOpen}
            minEnforcedActive={minEnforced}
            maxEnforcedActive={maxEnforced}
            onChange={onChange}
          />

          {/* Advanced Configurations Slider & Cards */}
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
  );
};
