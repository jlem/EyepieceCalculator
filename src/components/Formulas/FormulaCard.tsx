import React from 'react';
import { FormulaLaTeX } from './FormulaLaTeX';
import styles from './Formulas.module.css';

interface FormulaCardProps {
  title: string;
  latex: string;
  children: React.ReactNode;
}

export const FormulaCard: React.FC<FormulaCardProps> = ({ title, latex, children }) => {
  return (
    <div className={styles.formulaGroup}>
      <h3>{title}</h3>
      <FormulaLaTeX latex={latex} />
      <ul className={styles.formulaLegend}>
        {children}
      </ul>
    </div>
  );
};
