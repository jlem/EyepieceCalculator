import React from 'react';

interface AdvancedTransitionSliderProps {
  epMin: number;
  epMax: number;
  epTrans: number;
  onChange: (value: number) => void;
}

export const AdvancedTransitionSlider: React.FC<AdvancedTransitionSliderProps> = ({
  epMin,
  epMax,
  epTrans,
  onChange,
}) => {
  const minVal = parseFloat((epMin + 0.1).toFixed(1));
  const maxVal = parseFloat((epMax - 0.1).toFixed(1));

  // Clamp current epTrans value to stay within range bounds
  const clampedTrans = Math.round(Math.min(Math.max(epTrans, minVal), maxVal) * 10) / 10;

  const totalRange = epMax - epMin;
  const lowWidth = totalRange > 0 ? ((clampedTrans - epMin) / totalRange) * 100 : 50;
  const highWidth = 100 - lowWidth;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="adv-slider-section">
      <div className="adv-trans-row">
        <span id="adv-epmin-label" className="adv-trans-bound">
          {epMin.toFixed(1)}mm
        </span>
        <div className="adv-trans-track-wrap">
          <div
            className="adv-trans-bubble"
            id="adv-trans-bubble-container"
            style={{ left: `${lowWidth}%` }}
          >
            Transition point: <span id="adv-trans-val">{clampedTrans.toFixed(1)}mm</span>
          </div>
          <div className="bisected-slider-wrap">
            <div className="slider-segment" id="segment-low" style={{ width: `${lowWidth}%` }}></div>
            <div className="slider-segment" id="segment-high" style={{ width: `${highWidth}%` }}></div>
            <input
              type="range"
              id="adv-trans-slider"
              min={minVal}
              max={maxVal}
              step="0.1"
              value={clampedTrans}
              onChange={handleSliderChange}
              disabled={minVal >= maxVal}
            />
          </div>
        </div>
        <span id="adv-epmax-label" className="adv-trans-bound">
          {epMax.toFixed(1)}mm
        </span>
      </div>
    </div>
  );
};
