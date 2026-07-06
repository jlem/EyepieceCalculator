import React from 'react';

interface StatsSummaryProps {
  count: number | null;
  shortestFL: number | null;
  longestFL: number | null;
  longestEp: number | null;
  personalEpLimit: number;
  stepModeType?: 'simple' | 'advanced';
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  count,
  shortestFL,
  longestFL,
  longestEp,
  personalEpLimit,
  stepModeType,
}) => {
  const hasData = count !== null && count > 0;

  const showWarn = hasData && stepModeType === 'advanced' && longestEp !== null && longestEp > personalEpLimit;
  const warnTooltip = showWarn
    ? `This eyepiece focal length results in an exit pupil of ${longestEp!.toFixed(1)}mm, which exceeds your personal exit pupil limit.`
    : '';

  const displayCount = hasData ? count.toString() : '—';
  const displayShort = hasData && shortestFL !== null ? `${shortestFL.toFixed(1)}mm` : '—';
  const displayLong = hasData && longestFL !== null ? `${longestFL.toFixed(1)}mm` : '—';

  return (
    <div className="stats">
      <div className="stat-card">
        <p className="stat-label">Eyepieces needed</p>
        <p className="stat-value" id="out-count">
          {displayCount}
        </p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Shortest FL</p>
        <p className="stat-value" id="out-short">
          {displayShort}
        </p>
      </div>
      <div className="stat-card">
        <p className="stat-label">Longest FL</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p
            className="stat-value"
            id="out-long"
            style={
              showWarn
                ? { color: 'var(--text-warn)', textShadow: '0 0 12px rgba(255, 167, 0, 0.15)' }
                : undefined
            }
          >
            {displayLong}
          </p>
          {showWarn && (
            <div
              id="longest-fl-warn-icon"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'help' }}
              title={warnTooltip}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--text-warn)">
                <title>{warnTooltip}</title>
                <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
