import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdvancedTransitionSlider } from './AdvancedTransitionSlider';

describe('AdvancedTransitionSlider Component', () => {
  it('should render the range boundary labels and clamped transition point bubble', () => {
    const handleChange = vi.fn();
    render(
      <AdvancedTransitionSlider
        epMin={0.5}
        epMax={7.0}
        epTrans={3.0}
        onChange={handleChange}
      />
    );

    // Assert min/max boundaries display
    expect(screen.getByText('0.5mm')).toBeInTheDocument();
    expect(screen.getByText('7.0mm')).toBeInTheDocument();

    // Assert current value is clamped and displayed
    expect(screen.getByText('3.0mm')).toBeInTheDocument();
  });

  it('should fire onChange on slide dragging', () => {
    const handleChange = vi.fn();
    render(
      <AdvancedTransitionSlider
        epMin={0.5}
        epMax={7.0}
        epTrans={3.0}
        onChange={handleChange}
      />
    );

    const slider = document.getElementById('adv-trans-slider') as HTMLInputElement;
    expect(slider).toBeInTheDocument();
    expect(slider.min).toBe('0.6');
    expect(slider.max).toBe('6.9');

    // Simulate change event
    fireEvent.change(slider, { target: { value: '4.5' } });
    expect(handleChange).toHaveBeenCalledWith(4.5);
  });
});
