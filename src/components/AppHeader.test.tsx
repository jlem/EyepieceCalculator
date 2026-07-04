import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppHeader } from './AppHeader';

describe('AppHeader Component', () => {
  it('should render title and exit pupil range subtitle link', () => {
    const handleToggle = vi.fn();
    render(<AppHeader epMin={0.5} epMax={7.0} onToggleRange={handleToggle} />);

    // Check title renders
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Eyepiece set calculator');

    // Check link contains correct range text
    const link = screen.getByRole('button');
    expect(link).toHaveTextContent('0.5-7.0mm');

    // Click link and assert callback fires
    fireEvent.click(link);
    expect(handleToggle).toHaveBeenCalled();
  });
});
