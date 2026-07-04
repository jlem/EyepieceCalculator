import React from 'react';

interface AdvancedStrategyCardProps {
  cardId: 'card-low' | 'card-high';
  title: string;
  strategy: 'percent' | 'brightness' | 'fixed' | 'pupil';
  step: number;
  isFlengthProvided: boolean;
  onStrategyChange: (strategy: 'percent' | 'brightness' | 'fixed' | 'pupil') => void;
  onStepChange: (step: number) => void;
}

export const AdvancedStrategyCard: React.FC<AdvancedStrategyCardProps> = ({
  cardId,
  title,
  strategy,
  step,
  isFlengthProvided,
  onStrategyChange,
  onStepChange,
}) => {
  const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStrategy = e.target.value as 'percent' | 'brightness' | 'fixed' | 'pupil';
    onStrategyChange(nextStrategy);
    
    // Set default value for new mode
    if (nextStrategy === 'brightness') {
      onStepChange(50);
    } else if (nextStrategy === 'pupil') {
      onStepChange(0.50);
    } else {
      onStepChange(40);
    }
  };

  let sliderMin = 20;
  let sliderMax = 60;
  let sliderStep = 1;
  let unit = '%';

  if (strategy === 'brightness') {
    sliderMin = 25;
    sliderMax = 100;
    sliderStep = 1;
    unit = '%';
  } else if (strategy === 'pupil') {
    sliderMin = 0.25;
    sliderMax = 1.00;
    sliderStep = 0.05;
    unit = 'mm';
  } else if (strategy === 'fixed') {
    sliderMin = 20;
    sliderMax = 60;
    sliderStep = 1;
    unit = 'x';
  }

  const sliderLabelVal = strategy === 'pupil' ? step.toFixed(2) : step;

  return (
    <div className="active-config-card" id={cardId}>
      <div className="config-header">
        <h4>{title}</h4>
      </div>
      <div className="config-fields-stacked">
        <div className="adv-field-row strategy-row">
          <label htmlFor={`adv-strategy-${cardId}`}>Step Strategy</label>
          <select
            id={`adv-strategy-${cardId}`}
            className="step-mode-select"
            value={strategy}
            onChange={handleStrategyChange}
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
          <label htmlFor={`adv-step-${cardId}`}>Step Size</label>
          <input
            type="range"
            id={`adv-step-${cardId}`}
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            value={step}
            onChange={(e) => onStepChange(parseFloat(e.target.value))}
          />
          <span className="step-out" id={`adv-step-out-${cardId}`}>
            {sliderLabelVal}
            {unit}
          </span>
        </div>
      </div>
    </div>
  );
};
