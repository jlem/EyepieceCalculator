import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EyepieceTable } from './EyepieceTable';
import { EyepieceSet } from '../models/EyepieceSet';
import { EyepieceCalculation } from '../models/EyepieceCalculation';
import { Eyepiece } from '../models/Eyepiece';
import { Telescope } from '../models/Telescope';

describe('EyepieceTable Component', () => {
  it('should render null when eyepieceSet is null or empty', () => {
    const { container } = render(
      <EyepieceTable eyepieceSet={null} personalEpLimit={7.0} hasFlength={true} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render eyepiece rows and respond to sort clicks', () => {
    const tel = new Telescope(1000, 5);
    const ep1 = new Eyepiece(10);
    const ep2 = new Eyepiece(20);
    const set = new EyepieceSet([
      new EyepieceCalculation(ep1, tel),
      new EyepieceCalculation(ep2, tel),
    ]);

    const { container } = render(
      <EyepieceTable eyepieceSet={set} personalEpLimit={3.0} hasFlength={true} />
    );

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3); // header + 2 calculations

    // The exit pupil of ep2 is 20/5 = 4mm, which exceeds limit (3.0mm)
    // Row 1 (20mm eyepiece) should have row-warn class
    expect(rows[1]).toHaveClass('row-warn');
    expect(rows[2]).not.toHaveClass('row-warn');

    // Default sort is desc: 20.0mm row should come first, then 10.0mm
    expect(rows[1]).toHaveTextContent('20.0mm');
    expect(rows[2]).toHaveTextContent('10.0mm');

    // Click sort header to sort ascending
    const flHeader = screen.getByText(/Focal length/);
    fireEvent.click(flHeader);

    // 10.0mm should come first now
    const reorderedRows = screen.getAllByRole('row');
    expect(reorderedRows[1]).toHaveTextContent('10.0mm');
    expect(reorderedRows[2]).toHaveTextContent('20.0mm');
  });
});
