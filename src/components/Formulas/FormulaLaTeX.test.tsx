import React from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render } from '@testing-library/react';
import { FormulaLaTeX } from './FormulaLaTeX';

describe('FormulaLaTeX Component', () => {
  const originalRenderMath = (window as any).renderMathInElement;

  beforeAll(() => {
    (window as any).renderMathInElement = vi.fn();
  });

  afterAll(() => {
    (window as any).renderMathInElement = originalRenderMath;
  });

  it('should render latex markup and call window.renderMathInElement on mount', () => {
    const testLatex = '\\[ E = mc^2 \\]';
    const { container } = render(<FormulaLaTeX latex={testLatex} />);

    // Renders the raw string
    expect(container.textContent).toContain('\\[ E = mc^2 \\]');

    // Triggers KaTeX parser on mount
    expect((window as any).renderMathInElement).toHaveBeenCalled();
  });
});
