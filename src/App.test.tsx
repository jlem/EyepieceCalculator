import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App Layout Component', () => {
  it('should render simple setup tab default layout', () => {
    render(<App />);

    // Check header
    expect(screen.getByText('Eyepiece set calculator')).toBeInTheDocument();

    // Check simple controls are rendered
    expect(screen.getByLabelText('Focal ratio (f/#)')).toBeInTheDocument();
    expect(screen.getByText('Focal Length')).toBeInTheDocument();
    expect(screen.getByText('Aperture')).toBeInTheDocument();
    expect(screen.getByLabelText('Step Strategy')).toBeInTheDocument();
  });

  it('should switch to advanced layout tab and display configuration cards', () => {
    render(<App />);

    // Click Advanced Setup tab
    fireEvent.click(screen.getByText('Advanced Setup'));

    // Check for advanced elements
    expect(screen.getByRole('heading', { name: /Low Range/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /High Range/i })).toBeInTheDocument();
  });

  it('should trigger range error highlights if epMin >= epMax', () => {
    const { container } = render(<App />);

    // Set epMin input to be larger than epMax
    const minInput = container.querySelector('#epmin') as HTMLInputElement;
    const maxInput = container.querySelector('#epmax') as HTMLInputElement;

    fireEvent.change(minInput, { target: { value: '8.0' } });
    fireEvent.change(maxInput, { target: { value: '7.0' } });

    // Expect error state outlines
    const minWrapper = container.querySelector('#epmin-warning-wrapper');
    expect(minWrapper).toHaveClass('error-active');

    // Stats should show empty indicator
    expect(screen.getByText('Eyepieces needed')).toBeInTheDocument();
    expect(container.querySelector('#out-count')).toHaveTextContent('—');
  });

  it('should default low range strategy to Fixed Mag (50x) in advanced setup mode', () => {
    const { container } = render(<App />);

    // Click Advanced Setup tab
    fireEvent.click(screen.getByText('Advanced Setup'));

    // Check low range card strategy and step output defaults
    const lowStrategySelect = container.querySelector('#adv-strategy-card-low') as HTMLSelectElement;
    expect(lowStrategySelect).toBeInTheDocument();
    expect(lowStrategySelect.value).toBe('fixed');

    const lowStepOutput = container.querySelector('#adv-step-out-card-low') as HTMLSpanElement;
    expect(lowStepOutput).toBeInTheDocument();
    expect(lowStepOutput).toHaveTextContent('50x');
  });

  it('should default high range strategy to Fixed Pupil (1.00mm) in advanced setup mode', () => {
    const { container } = render(<App />);

    // Click Advanced Setup tab
    fireEvent.click(screen.getByText('Advanced Setup'));

    // Check high range card strategy and step output defaults
    const highStrategySelect = container.querySelector('#adv-strategy-card-high') as HTMLSelectElement;
    expect(highStrategySelect).toBeInTheDocument();
    expect(highStrategySelect.value).toBe('pupil');

    const highStepOutput = container.querySelector('#adv-step-out-card-high') as HTMLSpanElement;
    expect(highStepOutput).toBeInTheDocument();
    expect(highStepOutput).toHaveTextContent('1.00mm');
  });
});
