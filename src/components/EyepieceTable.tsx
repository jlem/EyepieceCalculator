import React, { useState } from 'react';
import { EyepieceSet } from '../models/EyepieceSet';

interface EyepieceTableProps {
  eyepieceSet: EyepieceSet | null;
  personalEpLimit: number;
  hasFlength: boolean;
}

export const EyepieceTable: React.FC<EyepieceTableProps> = ({
  eyepieceSet,
  personalEpLimit,
  hasFlength,
}) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (!eyepieceSet || eyepieceSet.count === 0) {
    return null;
  }

  // Sort Calculations by Eyepiece Focal Length
  const sortedCalcs = [...eyepieceSet.calculations].sort((a, b) => {
    const flA = a.eyepiece.focalLength;
    const flB = b.eyepiece.focalLength;
    return sortOrder === 'asc' ? flA - flB : flB - flA;
  });

  const toggleSort = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const arrow = sortOrder === 'asc' ? ' ▲' : ' ▼';

  return (
    <div id="table-wrap">
      <table>
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: hasFlength ? '30%' : '45%' }} />
          <col style={{ width: hasFlength ? '30%' : '45%' }} />
          {hasFlength && <col style={{ width: '30%' }} />}
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th
              className="sortable-header sort-active"
              style={{ cursor: 'pointer' }}
              onClick={toggleSort}
            >
              Focal length{arrow}
            </th>
            <th>Exit pupil</th>
            {hasFlength && <th>Magnification</th>}
          </tr>
        </thead>
        <tbody>
          {sortedCalcs.map((calc, i) => {
            const isWarn = calc.exitPupil > personalEpLimit;
            const eyepieceNum = eyepieceSet.calculations.indexOf(calc) + 1;

            // Delta Brightness
            let brightnessChangeText = '';
            if (i > 0) {
              const prevEp = sortedCalcs[i - 1].exitPupil;
              const currEp = calc.exitPupil;
              const brightnessRatio = (currEp * currEp) / (prevEp * prevEp);
              const brightnessChangePct = (brightnessRatio - 1) * 100;
              brightnessChangeText = ` (${brightnessChangePct >= 0 ? '+' : ''}${brightnessChangePct.toFixed(0)}%)`;
            } else {
              brightnessChangeText = ' (—)';
            }

            // Delta Magnification
            let magChangeText = '';
            if (hasFlength) {
              if (i > 0) {
                const prevMag = sortedCalcs[i - 1].magnification;
                const currMag = calc.magnification;
                const magDiff = currMag - prevMag;
                magChangeText = ` (${magDiff >= 0 ? '+' : ''}${magDiff.toFixed(0)}x)`;
              } else {
                magChangeText = ' (—)';
              }
            }

            return (
              <tr key={eyepieceNum} className={isWarn ? 'row-warn' : ''}>
                <td>{eyepieceNum}</td>
                <td>{calc.eyepiece.focalLength.toFixed(1)}mm</td>
                <td>
                  {isWarn && (
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="var(--text-warn)"
                      style={{ verticalAlign: 'middle', marginRight: '4px', marginTop: '-2px' }}
                      title="This exit pupil exceeds your personal exit pupil limit"
                    >
                      <title>This exit pupil exceeds your personal exit pupil limit</title>
                      <path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V8h2v4z" />
                    </svg>
                  )}
                  {calc.exitPupil.toFixed(2)}mm
                  <span className="text-muted">{brightnessChangeText}</span>
                </td>
                {hasFlength && (
                  <td>
                    {calc.magnification.toFixed(0)}x
                    <span className="text-muted">{magChangeText}</span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
