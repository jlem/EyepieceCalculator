import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSummary } from './StatsSummary';

describe('StatsSummary Component', () => {
  it('should render dashes when no calculations or data is provided', () => {
    render(
      <StatsSummary
        count={null}
        shortestFL={null}
        longestFL={null}
        longestEp={null}
        personalEpLimit={7.0}
      />
    );

    expect(screen.getByText('Eyepieces needed')).toBeInTheDocument();
    // Verify values display placeholder dash
    const countEl = document.getElementById('out-count');
    expect(countEl).toHaveTextContent('—');
  });

  it('should render computed stats and warn icon if longest eyepiece exceeds exit pupil limit', () => {
    const { rerender } = render(
      <StatsSummary
        count={5}
        shortestFL={6.0}
        longestFL={30.0}
        longestEp={6.0}
        personalEpLimit={7.0}
      />
    );

    // No warning shown because longestEp (6.0) <= personalEpLimit (7.0)
    expect(document.getElementById('longest-fl-warn-icon')).not.toBeInTheDocument();
    expect(document.getElementById('out-count')).toHaveTextContent('5');
    expect(document.getElementById('out-short')).toHaveTextContent('6.0mm');
    expect(document.getElementById('out-long')).toHaveTextContent('30.0mm');

    // Rerender with longestEp exceeding limit
    rerender(
      <StatsSummary
        count={5}
        shortestFL={6.0}
        longestFL={40.0}
        longestEp={8.0}
        personalEpLimit={7.0}
      />
    );

    // Warning icon should be visible
    expect(document.getElementById('longest-fl-warn-icon')).toBeInTheDocument();
    expect(document.getElementById('out-long')).toHaveStyle({ color: 'var(--text-warn)' });
  });
});
