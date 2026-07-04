import React from 'react';
import { FormulaCard } from './FormulaCard';
import { LegendItem } from './LegendItem';
import styles from './Formulas.module.css';

export const FormulaReference: React.FC = () => {
  return (
    <details className={styles.formulas}>
      <summary>
        <h2>Formula Reference</h2>
      </summary>
      <div className={styles.formulasBody}>
        {/* Percent Step Mode */}
        <FormulaCard
          title="Percent Step Mode"
          latex={`\\[ {\\color{#ea9991} N} = \\left\\lceil \\frac{\\ln({\\color{#ea9991} {EP}_{\\text{max}}} / {\\color{#ea9991} {EP}_{\\text{min}}})}{\\ln\\left(1 + \\frac{{\\color{#ea9991} Step\\%}}{100}\\right)} \\right\\rceil + 1 \\]`}
        >
          <LegendItem variables={['N']} text="is the recommended quantity of eyepieces in your set." />
          <LegendItem variables={['EP_max', 'EP_min']} text="are the maximum and minimum exit pupil inputs." />
          <LegendItem variables={['Step%']} text="is the magnification step size percentage." />
          <LegendItem variables={['⌈...⌉']} text="denotes the ceiling function (rounding up to the next integer)." />
        </FormulaCard>

        {/* Percent Brightness Step Mode */}
        <FormulaCard
          title="Percent Brightness Step Mode"
          latex={`\\[ {\\color{#ea9991} N} = \\left\\lceil \\frac{\\ln({\\color{#ea9991} {EP}_{\\text{max}}} / {\\color{#ea9991} {EP}_{\\text{min}}})}{\\ln\\left(\\sqrt{1 + \\frac{{\\color{#ea9991} Step\\%}}{100}}\\right)} \\right\\rceil + 1 \\]`}
        >
          <LegendItem variables={['N']} text="is the recommended quantity of eyepieces in your set." />
          <LegendItem variables={['EP_max', 'EP_min']} text="are the maximum and minimum exit pupil inputs." />
          <LegendItem variables={['Step%']} text="is the brightness step size percentage." />
          <LegendItem variables={['⌈...⌉']} text="denotes the ceiling function (rounding up to the next integer)." />
        </FormulaCard>

        {/* Fixed Magnification Step Mode */}
        <FormulaCard
          title="Fixed Magnification Step Mode"
          latex={`\\[ {\\color{#ea9991} N} = \\left\\lceil \\frac{\\frac{{\\color{#ea9991} F_l}}{{\\color{#ea9991} {EP}_{\\text{min}}} \\times {\\color{#ea9991} F_r}} - \\frac{{\\color{#ea9991} F_l}}{{\\color{#ea9991} {EP}_{\\text{max}}} \\times {\\color{#ea9991} F_r}}}{{\\color{#ea9991} Step}} \\right\\rceil + 1 \\]`}
        >
          <LegendItem variables={['N']} text="is the recommended quantity of eyepieces in your set." />
          <LegendItem variables={['F_l']} text="is the telescope focal length." />
          <LegendItem variables={['F_r']} text="is the telescope focal ratio." />
          <LegendItem variables={['EP_max', 'EP_min']} text="are the maximum and minimum exit pupil inputs." />
          <LegendItem variables={['Step']} text="is the desired magnification step size (e.g. 40x)." />
          <LegendItem variables={['⌈...⌉']} text="denotes the ceiling function (rounding up to the next integer)." />
        </FormulaCard>

        {/* Fixed Exit Pupil Step Mode */}
        <FormulaCard
          title="Fixed Exit Pupil Step Mode"
          latex={`\\[ {\\color{#ea9991} N} = \\left\\lceil \\frac{{\\color{#ea9991} {EP}_{\\text{max}}} - {\\color{#ea9991} {EP}_{\\text{min}}}}{{\\color{#ea9991} Step}} \\right\\rceil + 1 \\]`}
        >
          <LegendItem variables={['N']} text="is the recommended quantity of eyepieces in your set." />
          <LegendItem variables={['EP_max', 'EP_min']} text="are the maximum and minimum exit pupil inputs." />
          <LegendItem variables={['Step']} text="is the desired exit pupil step size (in mm)." />
          <LegendItem variables={['⌈...⌉']} text="denotes the ceiling function (rounding up to the next integer)." />
        </FormulaCard>
      </div>
    </details>
  );
};
