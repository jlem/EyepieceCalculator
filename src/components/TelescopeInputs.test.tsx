import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelescopeInputs } from './TelescopeInputs';
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

describe('TelescopeInputs Component', () => {
  it('should render focal ratio and input mode controls', () => {
    const handleChange = vi.fn();
    render(<TelescopeInputs inputs={defaultInputs} onChange={handleChange} />);

    // Focal ratio should render
    const fratioInput = screen.getByLabelText(/Focal ratio/);
    expect(fratioInput).toHaveValue(5);

    // Typing in focal ratio triggers onChange
    fireEvent.change(fratioInput, { target: { value: '6' } });
    expect(handleChange).toHaveBeenCalledWith('fratio', 6);
  });

  it('should switch mode toggles and handle unit toggles', () => {
    const handleChange = vi.fn();
    
    // Renders with inputMode: 'ap' (aperture)
    const apInputs = { ...defaultInputs, inputMode: 'ap' as const };
    render(<TelescopeInputs inputs={apInputs} onChange={handleChange} />);

    // Aperture buttons are active/visible
    const mmButton = screen.getByRole('button', { name: 'mm' });
    expect(mmButton).toHaveClass('active');

    // Clicking 'in' unit button triggers unit switch
    const inButton = screen.getByRole('button', { name: 'in' });
    fireEvent.click(inButton);
    expect(handleChange).toHaveBeenCalledWith('apertureUnit', 'in');
  });

  it('should toggle step strategy choices and trigger slider resets', () => {
    const handleChange = vi.fn();
    render(<TelescopeInputs inputs={defaultInputs} onChange={handleChange} />);

    const select = screen.getByLabelText(/Step Strategy/) as HTMLSelectElement;
    expect(select.value).toBe('percent');

    // Switch to brightness mode
    fireEvent.change(select, { target: { value: 'brightness' } });
    expect(handleChange).toHaveBeenCalledWith('stepMode', 'brightness');
    expect(handleChange).toHaveBeenCalledWith('stepVal', 50);
  });
});
