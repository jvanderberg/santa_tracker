import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header Component', () => {
  it('renders the title', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />);
    expect(screen.getByText('Santa Tracker')).toBeInTheDocument();
  });

  it('renders an Add Sighting button', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />);
    const button = screen.getByRole('button', { name: /add sighting/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a Filter button', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />);
    const button = screen.getByRole('button', { name: /filter sightings/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a Help button', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />);
    const button = screen.getByRole('button', { name: /help/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onAddSighting when add button is clicked', () => {
    const handleAddSighting = vi.fn();
    render(
      <Header onAddSighting={handleAddSighting} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );

    const button = screen.getByRole('button', { name: /add sighting/i });
    fireEvent.click(button);

    expect(handleAddSighting).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenFilter when filter button is clicked', () => {
    const handleOpenFilter = vi.fn();
    render(
      <Header onAddSighting={() => {}} onOpenFilter={handleOpenFilter} onOpenHelp={() => {}} />
    );

    const button = screen.getByRole('button', { name: /filter sightings/i });
    fireEvent.click(button);

    expect(handleOpenFilter).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenHelp when help button is clicked', () => {
    const handleOpenHelp = vi.fn();
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={handleOpenHelp} />);

    const button = screen.getByRole('button', { name: /help/i });
    fireEvent.click(button);

    expect(handleOpenHelp).toHaveBeenCalledTimes(1);
  });

  it('displays the geoname from geofence config', () => {
    render(<Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />);
    expect(screen.getByText('Springfield')).toBeInTheDocument();
  });
});
