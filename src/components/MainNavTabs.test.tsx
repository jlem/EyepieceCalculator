import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MainNavTabs } from './MainNavTabs';

describe('MainNavTabs Component', () => {
  it('should render all three tab buttons', () => {
    const handleChange = vi.fn();
    render(<MainNavTabs activeTab="calculator" onChange={handleChange} />);

    expect(screen.getByText('Eyepiece Database')).toBeInTheDocument();
    expect(screen.getByText('Planner')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  it('should apply active class correctly based on props', () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <MainNavTabs activeTab="calculator" onChange={handleChange} />
    );

    expect(screen.getByText('Planner')).toHaveClass('active');
    expect(screen.getByText('Eyepiece Database')).not.toHaveClass('active');
    expect(screen.getByText('Recommendations')).not.toHaveClass('active');

    rerender(<MainNavTabs activeTab="database" onChange={handleChange} />);
    expect(screen.getByText('Eyepiece Database')).toHaveClass('active');
    expect(screen.getByText('Planner')).not.toHaveClass('active');

    rerender(<MainNavTabs activeTab="recommendations" onChange={handleChange} />);
    expect(screen.getByText('Recommendations')).toHaveClass('active');
    expect(screen.getByText('Eyepiece Database')).not.toHaveClass('active');
  });

  it('should call onChange with correct tab name when buttons are clicked', () => {
    const handleChange = vi.fn();
    render(<MainNavTabs activeTab="calculator" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Eyepiece Database'));
    expect(handleChange).toHaveBeenCalledWith('database');

    fireEvent.click(screen.getByText('Recommendations'));
    expect(handleChange).toHaveBeenCalledWith('recommendations');
  });
});
