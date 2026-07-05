import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

describe('App Layout Component', () => {
  it('should render simple setup tab default layout', () => {
    render(<App />);

    // Check header
    expect(screen.getByText('Eyepiece Planner')).toBeInTheDocument();

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

  it('should render top-level main navigation tabs', () => {
    render(<App />);
    expect(screen.getByText('Eyepiece Database')).toBeInTheDocument();
    expect(screen.getByText('Planner')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  it('should default to Planner tab and switch tabs when clicked and update pathname', () => {
    window.history.replaceState(null, '', '/planner');
    render(<App />);
    
    // Planner is active by default (e.g. telescope controls are visible)
    expect(screen.getByLabelText('Focal ratio (f/#)')).toBeInTheDocument();
    expect(screen.queryByTestId('database-tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('recommendations-tab')).not.toBeInTheDocument();

    // Click Eyepiece Database tab
    fireEvent.click(screen.getByText('Eyepiece Database'));

    // Database tab placeholder should be visible, planner should be hidden
    expect(window.location.pathname).toBe('/database');
    expect(screen.getByTestId('database-tab')).toBeInTheDocument();
    expect(screen.queryByLabelText('Focal ratio (f/#)')).not.toBeInTheDocument();

    // Click Recommendations tab
    fireEvent.click(screen.getByText('Recommendations'));

    // Recommendations tab placeholder should be visible, database should be hidden
    expect(window.location.pathname).toBe('/recommendations');
    expect(screen.getByTestId('recommendations-tab')).toBeInTheDocument();
    expect(screen.queryByTestId('database-tab')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Focal ratio (f/#)')).not.toBeInTheDocument();

    // Click Planner tab again
    fireEvent.click(screen.getByText('Planner'));

    // Planner is back
    expect(window.location.pathname).toBe('/planner');
    expect(screen.getByLabelText('Focal ratio (f/#)')).toBeInTheDocument();

    // Clean up
    window.history.replaceState(null, '', '/planner');
  });

  it('should load Database tab directly if URL pathname is /database', () => {
    window.history.replaceState(null, '', '/database');
    render(<App />);
    expect(screen.getByTestId('database-tab')).toBeInTheDocument();
    expect(screen.queryByLabelText('Focal ratio (f/#)')).not.toBeInTheDocument();
    // Clean up
    window.history.replaceState(null, '', '/planner');
  });

  it('should load Recommendations tab directly if URL pathname is /recommendations', () => {
    window.history.replaceState(null, '', '/recommendations');
    render(<App />);
    expect(screen.getByTestId('recommendations-tab')).toBeInTheDocument();
    expect(screen.queryByLabelText('Focal ratio (f/#)')).not.toBeInTheDocument();
    // Clean up
    window.history.replaceState(null, '', '/planner');
  });

  it('should switch tabs when window popstate event fires', () => {
    window.history.replaceState(null, '', '/planner');
    render(<App />);
    expect(screen.getByLabelText('Focal ratio (f/#)')).toBeInTheDocument();

    // Trigger popstate event programmatically wrapped in act
    act(() => {
      window.history.replaceState(null, '', '/database');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByTestId('database-tab')).toBeInTheDocument();
    expect(screen.queryByLabelText('Focal ratio (f/#)')).not.toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, '', '/recommendations');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByTestId('recommendations-tab')).toBeInTheDocument();

    act(() => {
      window.history.replaceState(null, '', '/planner');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(screen.getByLabelText('Focal ratio (f/#)')).toBeInTheDocument();

    // Clean up
    window.history.replaceState(null, '', '/planner');
  });

  it('should leverage localStorage to load and save telescopes', () => {
    // 1. Pre-populate localStorage with custom mock telescopes
    const mockTelescopes = [
      { id: 'tele_mock_1', name: 'Mock Dobsonian', aperture: 250, focalLength: 1250, focalRatio: 5, focuserSize: '2' }
    ];
    localStorage.setItem('saved_telescopes', JSON.stringify(mockTelescopes));

    const { container } = render(<App />);

    // 2. Mock telescope should be rendered as a tab
    expect(screen.getByText('Mock Dobsonian')).toBeInTheDocument();

    // 3. Select Mock Dobsonian and assert input updates
    fireEvent.click(screen.getByText('Mock Dobsonian'));
    expect(screen.getByLabelText('Focal ratio (f/#)')).toHaveValue(5);
    expect(container.querySelector('#fl-ap-input')).toHaveValue('1250');

    // Clean up
    localStorage.removeItem('saved_telescopes');
  });
});
