import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormulaCard } from './FormulaCard';

describe('FormulaCard Component', () => {
  beforeAll(() => {
    (window as any).renderMathInElement = vi.fn();
  });

  afterAll(() => {
    delete (window as any).renderMathInElement;
  });

  it('should render title and children explanation content', () => {
    render(
      <FormulaCard title="Test Formula title" latex="\\[ a = b \\]">
        <li>Explanation bullet</li>
      </FormulaCard>
    );

    // Title should render
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Formula title');

    // List child element should render
    expect(screen.getByRole('listitem')).toHaveTextContent('Explanation bullet');
  });
});
