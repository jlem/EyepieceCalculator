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
  it('should render all calculator inputs and statistics summary elements', () => {
    const handleChange = vi.fn();
    const handleInputModeToggle = vi.fn();
    const handleApertureUnitToggle = vi.fn();
    const handleShareClick = vi.fn();
    const setPupilRangeOpen = vi.fn();

    render(
      <PlannerTab
        inputs={mockInputs}
        onChange={handleChange}
        onInputModeToggle={handleInputModeToggle}
        onApertureUnitToggle={handleApertureUnitToggle}
        onShareClick={handleShareClick}
        minEnforced={false}
        maxEnforced={false}
        pupilRangeOpen={false}
        setPupilRangeOpen={setPupilRangeOpen}
        telescope={new Telescope('', 'Test', 200, 1200, 6, '2')}
        hasFlength={true}
        eyepieceSet={null}
        focusTelescopeInput={vi.fn()}
      />
    );

    // Verify main fields are rendered
    expect(screen.getByLabelText('Focal ratio (f/#)')).toBeInTheDocument();
    expect(screen.getByText('Focal Length')).toBeInTheDocument();
    expect(screen.getByText('Aperture')).toBeInTheDocument();
    expect(screen.getByText('Eyepieces needed')).toBeInTheDocument();
  });
});
