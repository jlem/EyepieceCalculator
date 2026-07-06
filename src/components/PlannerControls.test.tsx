import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlannerControls } from './PlannerControls';
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

describe('PlannerControls Component', () => {
  it('should render min/max exit pupil labels and step controls in simple mode', () => {
    const handleChange = vi.fn();
    render(
      <PlannerControls
        inputs={defaultInputs}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    // Simple mode: plain labels (not segmented buttons)
    expect(screen.getByLabelText('Min exit pupil')).toBeInTheDocument();
    expect(screen.getByLabelText('Max exit pupil')).toBeInTheDocument();

    // Step controls should be rendered
    expect(screen.getByLabelText('Step Strategy')).toBeInTheDocument();

    // Min input shows the exit pupil value directly
    expect(screen.getByDisplayValue('0.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('7')).toBeInTheDocument();
  });

  it('should render EP/FL toggle segmented buttons in advanced mode', () => {
    const handleChange = vi.fn();
    const advancedInputs = { ...defaultInputs, stepModeType: 'advanced' as const };
    render(
      <PlannerControls
        inputs={advancedInputs}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    // Advanced mode: segmented toggle buttons
    expect(screen.getByRole('button', { name: 'Min exit pupil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Min eyepiece FL' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Max exit pupil' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Max eyepiece FL' })).toBeInTheDocument();

    // Step controls should NOT be rendered in advanced mode
    expect(screen.queryByLabelText('Step Strategy')).not.toBeInTheDocument();
  });

  it('should toggle step strategy choices and trigger resets', () => {
    const handleChange = vi.fn();
    render(
      <PlannerControls
        inputs={defaultInputs}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    const select = screen.getByLabelText('Step Strategy') as HTMLSelectElement;

    // Switch to brightness mode
    fireEvent.change(select, { target: { value: 'brightness' } });
    expect(handleChange).toHaveBeenCalledWith('stepMode', 'brightness');
    expect(handleChange).toHaveBeenCalledWith('stepVal', 50);
  });

  it('should show range error icons when epMin >= epMax', () => {
    const handleChange = vi.fn();
    const errorInputs = { ...defaultInputs, epMin: 8, epMax: 7 };
    const { container } = render(
      <PlannerControls
        inputs={errorInputs}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    expect(container.querySelector('#epmin-warning-wrapper')).toHaveClass('error-active');
    expect(container.querySelector('#epmin-error-icon')).toBeInTheDocument();
  });

  it('should show max warning icon when epMax exceeds personal limit', () => {
    const handleChange = vi.fn();
    const warnInputs = { ...defaultInputs, epMax: 8, personalEpLimit: 7, stepModeType: 'advanced' as const };
    const { container } = render(
      <PlannerControls
        inputs={warnInputs}
        minEnforcedActive={false}
        maxEnforcedActive={false}
        onChange={handleChange}
      />
    );

    expect(container.querySelector('#epmax-warning-wrapper')).toHaveClass('warning-active');
    expect(container.querySelector('#epmax-warning-icon')).toBeInTheDocument();
  });
});
