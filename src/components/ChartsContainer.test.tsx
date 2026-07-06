import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartsContainer } from './ChartsContainer';
import { EyepieceSet } from '../models/EyepieceSet';
import { EyepieceCalculation } from '../models/EyepieceCalculation';
import { Eyepiece } from '../models/Eyepiece';
import { Telescope } from '../models/Telescope';

describe('ChartsContainer Component', () => {
  it('should render dashes when eyepieceSet is null or empty', () => {
    const handleAddClick = vi.fn();
    render(
      <ChartsContainer
        eyepieceSet={null}
        telescope={null}
        hasFlength={false}
        onAddTelescopeClick={handleAddClick}
      />
    );

    // Should display placeholder dashes for focal lengths and relative brightness
    expect(screen.getByText('Eyepiece focal lengths')).toBeInTheDocument();
    expect(screen.getByText('Relative brightness (Exit Pupil²)')).toBeInTheDocument();
  });

  it('should render charts and magnification placeholder link when focal length is missing', () => {
    const handleAddClick = vi.fn();
    const tel = new Telescope('', 'Test', 200, 1000, 5, '2');
    const ep1 = new Eyepiece(10);
    const ep2 = new Eyepiece(20);
    const set = new EyepieceSet([
      new EyepieceCalculation(ep1, tel),
      new EyepieceCalculation(ep2, tel),
    ]);

    render(
      <ChartsContainer
        eyepieceSet={set}
        telescope={tel}
        hasFlength={false}
        onAddTelescopeClick={handleAddClick}
      />
    );

    // Magnification chart should render placeholder link
    const link = screen.getByRole('button', { name: /Add or select a telescope/ });
    expect(link).toBeInTheDocument();

    fireEvent.click(link);
    expect(handleAddClick).toHaveBeenCalled();
  });
});
