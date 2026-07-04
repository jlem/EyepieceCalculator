import React from 'react';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  epMin: number;
  epMax: number;
  onToggleRange: (e: React.MouseEvent) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ epMin, epMax, onToggleRange }) => {
  return (
    <>
      <h1>Eyepiece set calculator</h1>
      <p className="subtitle">
        Find out how many eyepieces you need to cover a{' '}
        <button
          type="button"
          id="desc-range-link"
          className={styles.descLink}
          onClick={onToggleRange}
        >
          <span id="desc-range">
            {epMin.toFixed(1)}-{epMax.toFixed(1)}mm
          </span>
        </button>{' '}
        exit pupil range for a given telescope focal ratio, and desired step size approach.
      </p>
    </>
  );
};
