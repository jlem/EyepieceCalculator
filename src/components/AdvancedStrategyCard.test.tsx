import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedStrategyCard } from './AdvancedStrategyCard';

describe('AdvancedStrategyCard Component', () => {
  it('should render details correctly', () => {
    const handleStrategyChange = vi.fn();
    const handleStepChange = vi.fn();

    render(
      <AdvancedStrategyCard
        cardId="card-low"
        title="Low Spacing Card"
        strategy="percent"
        step={40}
        isFlengthProvided={true}
        onStrategyChange={handleStrategyChange}
        onStepChange={handleStepChange}
      />
    );

    expect(screen.getByText('Low Spacing Card')).toBeInTheDocument();
    expect(screen.getByLabelText('Step Strategy')).toHaveValue('percent');
  });

  it('should disable fixed mag option when focal length is not provided', () => {
    const handleStrategyChange = vi.fn();
    const handleStepChange = vi.fn();

    render(
      <AdvancedStrategyCard
        cardId="card-low"
        title="Low Spacing Card"
        strategy="percent"
        step={40}
        isFlengthProvided={false}
        onStrategyChange={handleStrategyChange}
        onStepChange={handleStepChange}
      />
    );

    // Option "Fixed mag" should be disabled
    const fixedOption = screen.getByRole('option', { name: 'Fixed mag' }) as HTMLOptionElement;
    expect(fixedOption.disabled).toBe(true);
  });

  it('should trigger events on strategy change and step slide', () => {
    const handleStrategyChange = vi.fn();
    const handleStepChange = vi.fn();

    render(
      <AdvancedStrategyCard
        cardId="card-low"
        title="Low Spacing Card"
        strategy="percent"
        step={40}
        isFlengthProvided={true}
        onStrategyChange={handleStrategyChange}
        onStepChange={handleStepChange}
      />
    );

    // Swap strategy to pupil
    const select = screen.getByLabelText('Step Strategy');
    fireEvent.change(select, { target: { value: 'pupil' } });
    expect(handleStrategyChange).toHaveBeenCalledWith('pupil');
    expect(handleStepChange).toHaveBeenCalledWith(0.50);

    // Drag step slider
    const slider = screen.getByLabelText('Step Size');
    fireEvent.change(slider, { target: { value: '45' } });
    expect(handleStepChange).toHaveBeenCalledWith(45);
  });
});
