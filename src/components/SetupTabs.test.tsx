import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetupTabs } from './SetupTabs';

describe('SetupTabs Component', () => {
  it('should render tabs with active class based on props', () => {
    const handleChange = vi.fn();
    const handleShare = vi.fn();

    const { rerender } = render(
      <SetupTabs activeTab="simple" onChange={handleChange} onShare={handleShare} />
    );

    const simpleBtn = screen.getByText('Simple Setup');
    const advBtn = screen.getByText('Advanced Setup');

    expect(simpleBtn).toHaveClass('active');
    expect(advBtn).not.toHaveClass('active');

    rerender(
      <SetupTabs activeTab="advanced" onChange={handleChange} onShare={handleShare} />
    );

    expect(simpleBtn).not.toHaveClass('active');
    expect(advBtn).toHaveClass('active');
  });

  it('should call onChange and onShare on button interactions', () => {
    const handleChange = vi.fn();
    const handleShare = vi.fn();

    render(
      <SetupTabs activeTab="simple" onChange={handleChange} onShare={handleShare} />
    );

    fireEvent.click(screen.getByText('Advanced Setup'));
    expect(handleChange).toHaveBeenCalledWith('advanced');

    fireEvent.click(screen.getByText('Share Setup'));
    expect(handleShare).toHaveBeenCalled();
  });
});
