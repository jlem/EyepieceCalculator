import React from 'react';
import { EyepieceSet } from '../models/EyepieceSet';
import { Telescope } from '../models/Telescope';
import { LineChart } from './LineChart';

interface ChartsContainerProps {
  eyepieceSet: EyepieceSet | null;
  telescope: Telescope | null;
  hasFlength: boolean;
  onAddTelescopeClick: () => void;
}

export const ChartsContainer: React.FC<ChartsContainerProps> = ({
  eyepieceSet,
  telescope,
  hasFlength,
  onAddTelescopeClick,
}) => {
  if (!eyepieceSet || eyepieceSet.count === 0) {
    // If range error is active or no data, we still render the layout grid but show empty states / defaults
    return (
      <div className="right-panel">
        <div className="charts-grid">
          <div className="chart-container">
            <p className="chart-label">Eyepiece focal lengths</p>
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              —
            </div>
          </div>
          <div className="chart-container">
            <p className="chart-label">Relative brightness (Exit Pupil²)</p>
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              —
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { calculations, shadingStartIdx } = eyepieceSet;
  const fls = calculations.map((c) => c.eyepiece.focalLength);
  const eps = calculations.map((c) => c.exitPupil);
  const mags = calculations.map((c) => c.magnification);

  // Compute brightness values (ep^2)
  const brightnesses = eps.map((ep) => ep * ep);

  // Compute brightness change per step
  const brightnessChanges: number[] = [];
  const brightnessChangeLabels: string[] = [];
  for (let i = 1; i < eps.length; i++) {
    const prevEp = eps[i - 1];
    const ratio = (eps[i] * eps[i]) / (prevEp * prevEp);
    brightnessChanges.push((ratio - 1) * 100);
    brightnessChangeLabels.push(`${i}→${i + 1}`);
  }

  const changeShadingIdx = shadingStartIdx !== null ? shadingStartIdx - 0.5 : null;

  return (
    <div className="right-panel">
      <div className="charts-grid">
        {/* 1. Focal Length Chart */}
        <div className="chart-container">
          <p className="chart-label">Eyepiece focal lengths</p>
          <LineChart
            values={fls}
            lineClass="fl"
            shadingStartIdx={shadingStartIdx}
            pointFormatter={(v) => `${v.toFixed(1)}mm`}
            axisFormatter={(v) => `${v.toFixed(0)}mm`}
          />
        </div>

        {/* 2. Relative Brightness Chart */}
        <div className="chart-container">
          <p className="chart-label">Relative brightness (Exit Pupil²)</p>
          <LineChart
            values={brightnesses}
            lineClass="brightness"
            shadingStartIdx={shadingStartIdx}
            pointFormatter={(v) => v.toFixed(1)}
            axisFormatter={(v) => v.toFixed(1)}
          />
        </div>

        {/* 3. Brightness Change per Step */}
        {eps.length > 1 && (
          <div className="chart-container" id="brightness-change-chart-wrap">
            <p className="chart-label">Brightness change per step (%)</p>
            <LineChart
              values={brightnessChanges}
              xLabels={brightnessChangeLabels}
              lineClass="brightness-change"
              shadingStartIdx={changeShadingIdx}
              pointFormatter={(v) => `${v.toFixed(0)}%`}
              axisFormatter={(v) => `${v.toFixed(0)}%`}
            />
          </div>
        )}

        {/* 4. Magnification Chart / Placeholder */}
        <div
          className={`chart-container ${!hasFlength ? 'placeholder-active' : ''}`}
          id="mag-chart-wrap"
        >
          <p className="chart-label">Magnification</p>
          {hasFlength ? (
            <LineChart
              values={mags}
              lineClass="mag"
              shadingStartIdx={shadingStartIdx}
              pointFormatter={(v) => `${v.toFixed(0)}x`}
              axisFormatter={(v) => `${v.toFixed(0)}x`}
            />
          ) : (
            <div className="placeholder-text-wrap" id="mag-chart-placeholder">
              <span className="placeholder-text">
                <button
                  type="button"
                  className="placeholder-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    font: 'inherit',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'var(--accent)',
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    onAddTelescopeClick();
                  }}
                >
                  Add or select a telescope
                </button>{' '}
                to calculate magnifications and show this graph
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
