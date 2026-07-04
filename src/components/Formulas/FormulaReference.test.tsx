import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormulaReference } from './FormulaReference';

describe('FormulaReference Component', () => {
  beforeAll(() => {
    (window as any).renderMathInElement = vi.fn();
  });

  afterAll(() => {
    delete (window as any).renderMathInElement;
  });

  it('should render details toggle block and formulas summaries', () => {
    render(<FormulaReference />);

    // Details summary heading should render
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Formula Reference');

    // All standard 4 strategy titles should be inside
    expect(screen.getByRole('heading', { name: 'Percent Step Mode' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Percent Brightness Step Mode' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fixed Magnification Step Mode' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Fixed Exit Pupil Step Mode' })).toBeInTheDocument();
  });
});
