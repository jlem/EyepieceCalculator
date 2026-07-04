import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PersonalLimitControls } from './PersonalLimitControls';
import { CalculatorInputs } from '../utils/types';

const defaultInputs: CalculatorInputs = {
  fratio: 5,
  inputMode: 'fl',
  flengthVal: '1000',
  apertureVal: '200',
  apertureUnit: 'mm',
  stepMode: 'percent',
  stepVal: 40,
  stepModeType: 'simple',
  personalEpLimit: 7,
  enforceLimit: false,
  epMin: 0.5,
  epMax: 7.0,
  minLimitMode: 'ep',
  maxLimitMode: 'ep',
  epTrans: 2.0,
  lowStrategy: 'percent',
  lowStep: 40,
  highStrategy: 'pupil',
  highStep: 0.50,
};

describe('PersonalLimitControls Component', () => {
  it('should render inputs and toggle limit checkboxes', () => {
    const handleChange = vi.fn();
    render(
      <PersonalLimitControls
        inputs={defaultInputs}
        isOpen={true}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    const checkbox = screen.getByLabelText('Enforce limit');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith('enforceLimit', true);
  });

  it('should trigger warnings and show error icons when constraints are violated', () => {
    const errorInputs = { ...defaultInputs, epMin: 8.0, epMax: 7.0 }; // epMin >= epMax
    const handleChange = vi.fn();

    render(
      <PersonalLimitControls
        inputs={errorInputs}
        isOpen={true}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    // Should show error icon under min input
    const errorIcon = document.getElementById('epmin-error-icon');
    expect(errorIcon).toBeInTheDocument();
  });
});
