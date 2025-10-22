import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header Component', () => {
  it('renders the title', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} />);
    expect(screen.getByText('Santa Tracker')).toBeInTheDocument();
  });

  it('renders an Add Sighting button', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} />);
    const button = screen.getByRole('button', { name: /add sighting/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a Filter button', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} />);
    const button = screen.getByRole('button', { name: /filter sightings/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onAddSighting when add button is clicked', () => {
    const handleAddSighting = vi.fn();
    render(<Header onAddSighting={handleAddSighting} onOpenFilter={() => {}} />);

    const button = screen.getByRole('button', { name: /add sighting/i });
    fireEvent.click(button);

    expect(handleAddSighting).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenFilter when filter button is clicked', () => {
    const handleOpenFilter = vi.fn();
    render(<Header onAddSighting={() => {}} onOpenFilter={handleOpenFilter} />);

    const button = screen.getByRole('button', { name: /filter sightings/i });
    fireEvent.click(button);

    expect(handleOpenFilter).toHaveBeenCalledTimes(1);
  });

  it('displays the geoname from geofence config', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} />);
    expect(screen.getByText('Springfield')).toBeInTheDocument();
  });
});
