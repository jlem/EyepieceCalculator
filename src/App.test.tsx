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
});
