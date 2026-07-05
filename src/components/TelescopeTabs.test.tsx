import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TelescopeTabs } from './TelescopeTabs';
import { Telescope } from '../models/Telescope';

describe('TelescopeTabs Component', () => {
  const telescopes = [
    new Telescope('t1', 'Dobson 8"', 200, 1200, 6, '2'),
    new Telescope('t2', 'Refractor 80', 80, 600, 7.5, '1.25'),
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should render telescope list tabs', () => {
    render(
      <TelescopeTabs
        telescopes={telescopes}
        activeTelescopeId={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddClick={vi.fn()}
      />
    );

    // Other tabs are rendered but not active
    expect(screen.getByText('Dobson 8"')).toBeInTheDocument();
    expect(screen.getByText('Refractor 80')).toBeInTheDocument();

    // Add button is rendered
    expect(screen.getByRole('button', { name: '+ Add Telescope' })).toBeInTheDocument();
  });

  it('should call onSelect when a tab is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <TelescopeTabs
        telescopes={telescopes}
        activeTelescopeId={null}
        onSelect={handleSelect}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddClick={vi.fn()}
      />
    );

    // Click Dobson 8" tab
    fireEvent.click(screen.getByText('Dobson 8"'));
    expect(handleSelect).toHaveBeenCalledWith('t1');
  });

  it('should render action buttons only on the active telescope tab and invoke callbacks', () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    render(
      <TelescopeTabs
        telescopes={telescopes}
        activeTelescopeId="t1" // Dobson 8" is active
        onSelect={vi.fn()}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddClick={vi.fn()}
      />
    );

    // Dobson 8" wrap should be active
    const dobsonTab = screen.getByText('Dobson 8"');
    expect(dobsonTab.closest('.telescope-tab-btn-wrap')).toHaveClass('active');

    // Edit and Delete buttons should exist for Dobson 8"
    const editBtn = screen.getByTestId('edit-telescope-t1');
    const deleteBtn = screen.getByTestId('delete-telescope-t1');
    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    // Refractor 80 action buttons should NOT exist (since it's not active)
    expect(screen.queryByTestId('edit-telescope-t2')).not.toBeInTheDocument();

    // Click Edit button
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(telescopes[0]);

    // Click Delete button
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith('t1');
  });

  it('should trigger onAddClick when Add button is clicked', () => {
    const handleAddClick = vi.fn();
    render(
      <TelescopeTabs
        telescopes={telescopes}
        activeTelescopeId={null}
        onSelect={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddClick={handleAddClick}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '+ Add Telescope' }));
    expect(handleAddClick).toHaveBeenCalledTimes(1);
  });
});
