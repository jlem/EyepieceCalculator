import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LineChart } from './LineChart';

describe('LineChart Component', () => {
  it('should render SVG layout and corresponding points', () => {
    const values = [10, 20, 30, 40];
    const { container } = render(
      <LineChart
        values={values}
        lineClass="fl"
      />
    );

    // Verify SVG is rendered
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('line-chart');

    // Should have 4 data dots
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(4);
    circles.forEach((c) => {
      expect(c).toHaveClass('fl-dot');
    });

    // Should render a path
    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass('fl-line');
  });

  it('should render shaded High Range container when shadingStartIdx is provided', () => {
    const values = [10, 20, 30, 40];
    const { container } = render(
      <LineChart
        values={values}
        lineClass="fl"
        shadingStartIdx={2}
      />
    );

    // Should render shading rect and helper line
    const rect = container.querySelector('rect.chart-shading');
    expect(rect).toBeInTheDocument();
    expect(container.querySelector('.chart-shading-text')).toHaveTextContent('HIGH RANGE');
  });
});
