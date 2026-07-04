import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LegendItem } from './LegendItem';

describe('LegendItem Component', () => {
  it('should render legend text and bold variables with subscript helper formatting', () => {
    const { container, rerender } = render(
      <LegendItem variables={['N']} text="is the recommended quantity." />
    );

    // Should contain bullet symbol and text
    expect(container.textContent).toContain('• N is the recommended quantity.');

    // Variable should be rendered inside strong tag
    const strong = container.querySelector('strong');
    expect(strong).toBeInTheDocument();
    expect(strong).toHaveTextContent('N');

    // Test subscript formatting for variable with underscore
    rerender(
      <LegendItem variables={['EP_max', 'EP_min']} text="are parameters." />
    );

    expect(container.textContent).toContain('• EPmax and EPmin are parameters.');

    const strongs = container.querySelectorAll('strong');
    expect(strongs.length).toBe(2);

    expect(strongs[0]).toHaveTextContent('EPmax');
    const sub = strongs[0].querySelector('sub');
    expect(sub).toBeInTheDocument();
    expect(sub).toHaveTextContent('max');
  });
});
