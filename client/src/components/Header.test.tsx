import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header Component', () => {
  it('renders the title', () => {
    render(<Header onAddSighting={() => {}} />);
    expect(screen.getByText('Santa Tracker')).toBeInTheDocument();
  });

  it('renders an Add Sighting button', () => {
    render(<Header onAddSighting={() => {}} />);
    const button = screen.getByRole('button', { name: /add sighting/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onAddSighting when button is clicked', () => {
    const handleAddSighting = vi.fn();
    render(<Header onAddSighting={handleAddSighting} />);

    const button = screen.getByRole('button', { name: /add sighting/i });
    fireEvent.click(button);

    expect(handleAddSighting).toHaveBeenCalledTimes(1);
  });

  it('displays the geoname from geofence config', () => {
    render(<Header onAddSighting={() => {}} />);
    expect(screen.getByText('Springfield')).toBeInTheDocument();
  });
});
