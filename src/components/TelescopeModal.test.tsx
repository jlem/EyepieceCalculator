import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelescopeModal } from './TelescopeModal';
import { Telescope } from '../models/Telescope';

describe('TelescopeModal Component', () => {
  it('should render field inputs with defaults in add mode', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    expect(screen.getByRole('heading', { name: 'Add Telescope' })).toBeInTheDocument();
    expect(screen.getByTestId('modal-label-input')).toHaveValue('');
    expect(screen.getByTestId('modal-fratio-input')).toHaveValue(null);
    expect(screen.getByTestId('modal-flength-input')).toHaveValue(null);
    expect(screen.getByTestId('modal-aperture-input')).toHaveValue(null);
    expect(screen.getByRole('button', { name: 'mm' })).toHaveClass('active');
    expect(screen.getByTestId('modal-focuser-select')).toHaveValue('2');
  });

  it('1. If I start typing a value in the focal length field, it computes the aperture from the focal ratio', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    const flInput = screen.getByTestId('modal-flength-input');
    const apInput = screen.getByTestId('modal-aperture-input');

    // Set focal ratio to 5 first
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '5' } });

    // Change focal length to 1500 (with focal ratio 5) -> Aperture should be computed as 1500 / 5 = 300
    fireEvent.change(flInput, { target: { value: '1500' } });
    expect(apInput).toHaveValue(300);
  });

  it('2. If I start typing a value in the aperture field, it overrides what\'s in the focal length field with a new computed value', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    const flInput = screen.getByTestId('modal-flength-input');
    const apInput = screen.getByTestId('modal-aperture-input');

    // Set focal ratio to 5 first
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '5' } });

    // Change aperture to 150 (with focal ratio 5) -> Focal length should be computed as 150 * 5 = 750
    fireEvent.change(apInput, { target: { value: '150' } });
    expect(flInput).toHaveValue(750);
  });

  it('3. Ensure that the toggle between mm and inches applies only to the aperture. Ultimately the aperture should always be converted to mm for computation purposes.', () => {
    const handleSave = vi.fn();
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
        telescopeToEdit={null}
      />
    );

    // Enter name
    fireEvent.change(screen.getByTestId('modal-label-input'), { target: { value: 'Inches Scope' } });

    // Populate initial specs: focalRatio=5, focalLength=1000, aperture=200mm
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('modal-flength-input'), { target: { value: '1000' } });
    fireEvent.change(screen.getByTestId('modal-aperture-input'), { target: { value: '200' } });

    // Click 'in' toggle to switch to inches
    const inButton = screen.getByRole('button', { name: 'in' });
    fireEvent.click(inButton);

    const apInput = screen.getByTestId('modal-aperture-input');
    const flInput = screen.getByTestId('modal-flength-input');

    // Aperture should convert: 200 / 25.4 = 7.874... which rounds to nearest 10th (7.9)
    expect(parseFloat(apInput.value)).toBeCloseTo(7.9, 1);
    // Focal length (mm) should remain 1000
    expect(flInput).toHaveValue(1000);

    // Type aperture as 8 inches (at focal ratio 5) -> Focal Length = 8 * 25.4 * 5 = 1016
    fireEvent.change(apInput, { target: { value: '8' } });
    expect(flInput).toHaveValue(1016);

    // Save telescope. The saved object should convert aperture back to mm (8 in * 25.4 = 203.2mm)
    fireEvent.click(screen.getByRole('button', { name: 'Save Telescope' }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedScope = handleSave.mock.calls[0][0] as Telescope;
    expect(savedScope.name).toBe('Inches Scope');
    expect(savedScope.aperture).toBe(203.2); // converted to mm
    expect(savedScope.focalLength).toBe(1016);
    expect(savedScope.focalRatio).toBe(5);
  });

  it('4. If I am editing a telescope, display the aperture in mm even if I had entered it in inches. Be sure the control indicates mm by default.', () => {
    // Telescope is stored in mm (aperture=203.2mm, focalLength=1016, focalRatio=5)
    // Even if it was originally typed in inches, editing it should display it in mm.
    const editScope = new Telescope('t-edit', 'Edited Scope', 203.2, 1016, 5, '2');

    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={editScope}
      />
    );

    expect(screen.getByRole('heading', { name: 'Edit Telescope' })).toBeInTheDocument();
    expect(screen.getByTestId('modal-label-input')).toHaveValue('Edited Scope');
    expect(screen.getByTestId('modal-fratio-input')).toHaveValue(5);
    expect(screen.getByTestId('modal-flength-input')).toHaveValue(1016);
    
    // Aperture must show mm value (203.2) and mm button must be active by default
    expect(screen.getByTestId('modal-aperture-input')).toHaveValue(203.2);
    expect(screen.getByRole('button', { name: 'mm' })).toHaveClass('active');
  });

  it('5. Upon save, the modal closes', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    render(
      <TelescopeModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        telescopeToEdit={null}
      />
    );

    fireEvent.change(screen.getByTestId('modal-label-input'), { target: { value: 'My Scope' } });
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('modal-flength-input'), { target: { value: '1000' } });
    fireEvent.change(screen.getByTestId('modal-aperture-input'), { target: { value: '200' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Telescope' }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should validate inputs before saving and show error', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    // Submit without name
    fireEvent.click(screen.getByRole('button', { name: 'Save Telescope' }));
    expect(screen.getByText('Please enter a telescope name.')).toBeInTheDocument();

    // Fill name but enter invalid focal ratio
    fireEvent.change(screen.getByTestId('modal-label-input'), { target: { value: 'Error Scope' } });
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Telescope' }));
    expect(screen.getByText('Focal ratio, focal length, and aperture must be positive values.')).toBeInTheDocument();
  });

  it('should apply dashed border styling and render calculator indicator on the other field when focused', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    const frInput = screen.getByTestId('modal-fratio-input');
    const flInput = screen.getByTestId('modal-flength-input');
    const apInput = screen.getByTestId('modal-aperture-input');

    // 1. Focus on Focal Length
    fireEvent.focus(flInput);

    // Aperture wrapper should have the class indicating it is being calculated
    expect(apInput.closest('.modal-input-wrapper')).toHaveClass('is-calculated');
    // Calculator indicator should be rendered
    expect(screen.getByTitle('Calculated automatically')).toBeInTheDocument();

    // 2. Blur Focal Length
    fireEvent.blur(flInput);
    expect(apInput.closest('.modal-input-wrapper')).not.toHaveClass('is-calculated');
    expect(screen.queryByTitle('Calculated automatically')).not.toBeInTheDocument();

    // 3. Focus on Aperture
    fireEvent.focus(apInput);
    expect(flInput.closest('.modal-input-wrapper')).toHaveClass('is-calculated');
    expect(screen.getByTitle('Calculated automatically')).toBeInTheDocument();
    fireEvent.blur(apInput);

    // 4. Focus on Focal Ratio
    fireEvent.focus(frInput);
    // Aperture should be locked
    expect(apInput.closest('.modal-input-wrapper')).not.toHaveClass('is-calculated');
    expect(screen.getByTitle('Aperture is locked/fixed when changing focal ratio')).toBeInTheDocument();
    // Focal Length should be calculated
    expect(flInput.closest('.modal-input-wrapper')).toHaveClass('is-calculated');
    expect(screen.getByTitle('Calculated automatically')).toBeInTheDocument();
  });

  it('should auto-populate focal ratio, aperture, and focal length by parsing the name input', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    const labelInput = screen.getByTestId('modal-label-input');
    const frInput = screen.getByTestId('modal-fratio-input');
    const flInput = screen.getByTestId('modal-flength-input');
    const apInput = screen.getByTestId('modal-aperture-input');

    // 1. Enter "24\" F/3 dob" (Format 1: Inches & Ratio)
    fireEvent.change(labelInput, { target: { value: '24" F/3 dob' } });
    expect(apInput).toHaveValue(24);
    expect(frInput).toHaveValue(3);
    expect(flInput).toHaveValue(1829);
    expect(screen.getByRole('button', { name: 'in' })).toHaveClass('active');

    // 2. Enter "80mm f/6 refractor" (Format 1: Metric & Ratio)
    fireEvent.change(labelInput, { target: { value: '80mm f/6 refractor' } });
    expect(apInput).toHaveValue(80);
    expect(frInput).toHaveValue(6);
    expect(flInput).toHaveValue(480);
    expect(screen.getByRole('button', { name: 'mm' })).toHaveClass('active');

    // 3. Enter "114/900" (Format 2: Metric Slashes)
    fireEvent.change(labelInput, { target: { value: '114/900' } });
    expect(apInput).toHaveValue(114);
    expect(flInput).toHaveValue(900);
    expect(frInput).toHaveValue(7.89);
    expect(screen.getByRole('button', { name: 'mm' })).toHaveClass('active');

    // 4. Enter "8/1000 Schmidt-Cassegrain" (Format 2: Inches Slashes)
    fireEvent.change(labelInput, { target: { value: '8/1000 Schmidt-Cassegrain' } });
    expect(apInput).toHaveValue(8);
    expect(flInput).toHaveValue(1000);
    expect(frInput).toHaveValue(4.92);
    expect(screen.getByRole('button', { name: 'in' })).toHaveClass('active');
  });

  it('should keep aperture fixed and calculate focal length when changing focal ratio', () => {
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    const frInput = screen.getByTestId('modal-fratio-input');
    const flInput = screen.getByTestId('modal-flength-input');
    const apInput = screen.getByTestId('modal-aperture-input');

    // Populate initial specs: aperture = 200, focalLength = 1000, focalRatio = 5
    fireEvent.change(frInput, { target: { value: '5' } });
    fireEvent.change(flInput, { target: { value: '1000' } });
    fireEvent.change(apInput, { target: { value: '200' } });

    // Change focal ratio to 8 -> Focal Length should update to 200 * 8 = 1600, Aperture stays 200
    fireEvent.change(frInput, { target: { value: '8' } });
    expect(apInput).toHaveValue(200);
    expect(flInput).toHaveValue(1600);
  });

  it('should close when clicking the Cancel button or backdrop', () => {
    const handleClose = vi.fn();
    render(
      <TelescopeModal
        isOpen={true}
        onClose={handleClose}
        onSave={vi.fn()}
        telescopeToEdit={null}
      />
    );

    // Click Cancel button
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click backdrop
    fireEvent.click(screen.getByTestId('telescope-modal'));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('should save and close when pressing the Enter key', () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();
    render(
      <TelescopeModal
        isOpen={true}
        onClose={handleClose}
        onSave={handleSave}
        telescopeToEdit={null}
      />
    );

    const labelInput = screen.getByTestId('modal-label-input');
    
    // Fill telescope details
    fireEvent.change(labelInput, { target: { value: 'My Scope' } });
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '5' } });
    fireEvent.change(screen.getByTestId('modal-flength-input'), { target: { value: '1000' } });
    fireEvent.change(screen.getByTestId('modal-aperture-input'), { target: { value: '200' } });
    
    // Press Enter
    fireEvent.keyDown(labelInput, { key: 'Enter', code: 'Enter' });
    
    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should preserve high-precision aperture when toggling units back and forth without losing precision', () => {
    const handleSave = vi.fn();
    render(
      <TelescopeModal
        isOpen={true}
        onClose={vi.fn()}
        onSave={handleSave}
        telescopeToEdit={null}
      />
    );

    const apInput = screen.getByTestId('modal-aperture-input');
    const inButton = screen.getByRole('button', { name: 'in' });
    const mmButton = screen.getByRole('button', { name: 'mm' });

    // 1. Enter 610mm
    fireEvent.change(apInput, { target: { value: '610' } });
    expect(apInput).toHaveValue(610);

    // 2. Toggle to inches -> should format to 24 (since 610 / 25.4 = 24.0157... which rounds to 24)
    fireEvent.click(inButton);
    expect(apInput).toHaveValue(24);

    // 3. Toggle back to mm -> should restore exactly 610 (not 609.6)
    fireEvent.click(mmButton);
    expect(apInput).toHaveValue(610);

    // 4. Save and verify that the constructed Telescope has the exact high-precision mm value (610)
    fireEvent.change(screen.getByTestId('modal-label-input'), { target: { value: 'Test Scope' } });
    fireEvent.change(screen.getByTestId('modal-fratio-input'), { target: { value: '3' } });
    fireEvent.change(screen.getByTestId('modal-flength-input'), { target: { value: '1830' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Telescope' }));

    expect(handleSave).toHaveBeenCalledTimes(1);
    const savedScope = handleSave.mock.calls[0][0] as Telescope;
    expect(savedScope.aperture).toBe(610);
  });
});
