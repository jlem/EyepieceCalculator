import React from 'react';
import styles from './Formulas.module.css';

interface LegendItemProps {
  variables: string[];
  text: string;
}

export const LegendItem: React.FC<LegendItemProps> = ({ variables, text }) => {
  const renderedVars = variables.map((v, idx) => {
    // Format variables (e.g., EP_max -> EP_max with subscript)
    const hasUnderscore = v.includes('_');
    const formattedVar = hasUnderscore ? (
      <>
        {v.split('_')[0]}
        <sub>{v.split('_')[1]}</sub>
      </>
    ) : (
      v
    );

    return (
      <React.Fragment key={v}>
        {idx > 0 && (idx === variables.length - 1 ? ' and ' : ', ')}
        <strong className={styles.var}>{formattedVar}</strong>
      </React.Fragment>
    );
  });

  return (
    <li className={styles.legendItem}>
      • {renderedVars} {text}
    </li>
  );
};
