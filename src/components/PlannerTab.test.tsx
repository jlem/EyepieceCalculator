import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlannerTab } from './PlannerTab';
import { CalculatorInputs } from '../utils/types';
import { Telescope } from '../models/Telescope';

const mockInputs: CalculatorInputs = {
  fratio: 6,
  inputMode: 'fl',
  flengthVal: '1200',
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
  lowStrategy: 'fixed',
  lowStep: 50,
  highStrategy: 'pupil',
  highStep: 1.00,
};

describe('PlannerTab Component', () => {
  it('should render exit pupil limits, step strategy, and stats elements', () => {
    const handleChange = vi.fn();
    const handleShareClick = vi.fn();

    render(
      <PlannerTab
        inputs={mockInputs}
        onChange={handleChange}
        onShareClick={handleShareClick}
        minEnforced={false}
        maxEnforced={false}
        telescope={new Telescope('', 'Test', 200, 1200, 6, '2')}
        hasFlength={true}
        eyepieceSet={null}
        onAddTelescopeClick={vi.fn()}
      />
    );

    // Verify exit pupil inputs are rendered (simple mode plain labels)
    expect(screen.getByLabelText('Min exit pupil')).toBeInTheDocument();
    expect(screen.getByLabelText('Max exit pupil')).toBeInTheDocument();
    expect(screen.getByLabelText('Step Strategy')).toBeInTheDocument();
    expect(screen.getByText('Eyepieces needed')).toBeInTheDocument();
  });
});
