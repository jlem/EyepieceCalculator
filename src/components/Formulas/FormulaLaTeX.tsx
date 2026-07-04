import React, { useEffect, useRef } from 'react';
import styles from './Formulas.module.css';

interface FormulaLaTeXProps {
  latex: string;
}

export const FormulaLaTeX: React.FC<FormulaLaTeXProps> = ({ latex }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(el, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '\\(', right: '\\)', display: false },
        ],
      });
    }
  }, [latex]);

  return (
    <div ref={containerRef} className={styles.formulaLatex}>
      {latex}
    </div>
  );
};
