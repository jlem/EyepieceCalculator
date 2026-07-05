import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader Component', () => {
  it('should render title and subtitle', () => {
    render(<AppHeader />);

    // Check title renders
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eyepiece Planner');

    // Check subtitle renders
    expect(
      screen.getByText(
        /Enter information about a telescope you want to create an eyepiece plan for/
      )
    ).toBeInTheDocument();
  });
});
