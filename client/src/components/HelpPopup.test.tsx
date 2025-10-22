import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpPopup } from './HelpPopup';

describe('HelpPopup Component', () => {
  it('renders the opening message', () => {
    render(<HelpPopup onClose={() => {}} geoname="Oak Park, IL" />);

    expect(screen.getByText(/We hear Santa has been in the neighborhood/i)).toBeInTheDocument();
    expect(screen.getByText(/So exciting! Santa!/i)).toBeInTheDocument();
  });

  it('displays the geoname in the viewing sightings section', () => {
    render(<HelpPopup onClose={() => {}} geoname="Springfield" />);

    expect(screen.getByText(/recent Santa sightings in the Springfield area/i)).toBeInTheDocument();
  });

  it('displays the geoname in the filtering section', () => {
    render(<HelpPopup onClose={() => {}} geoname="Oak Park, IL" />);

    expect(screen.getByText(/all in the Oak Park, IL area/i)).toBeInTheDocument();
  });

  it('displays all help sections', () => {
    render(<HelpPopup onClose={() => {}} geoname="Oak Park, IL" />);

    expect(screen.getByText(/Viewing Sightings/i)).toBeInTheDocument();
    expect(screen.getByText(/Filtering Sightings/i)).toBeInTheDocument();
    expect(screen.getByText(/Report a Sighting/i)).toBeInTheDocument();
    expect(screen.getByText(/Auto-Updates/i)).toBeInTheDocument();
  });

  it('displays marker color information', () => {
    render(<HelpPopup onClose={() => {}} geoname="Oak Park, IL" />);

    expect(screen.getByText(/Red: Less than 30 minutes ago/i)).toBeInTheDocument();
    expect(screen.getByText(/Orange: Less than 1 hour ago/i)).toBeInTheDocument();
    expect(screen.getByText(/Yellow: 1-2 hours ago/i)).toBeInTheDocument();
    expect(screen.getByText(/Blue: Over 2 hours ago/i)).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<HelpPopup onClose={handleClose} geoname="Oak Park, IL" />);

    const backdrop = screen.getByTestId('help-popup-backdrop');
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<HelpPopup onClose={handleClose} geoname="Oak Park, IL" />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when popup content is clicked', () => {
    const handleClose = vi.fn();
    render(<HelpPopup onClose={handleClose} geoname="Oak Park, IL" />);

    const heading = screen.getByRole('heading', { name: /How to Use This App/i });
    fireEvent.click(heading);

    expect(handleClose).not.toHaveBeenCalled();
  });
});
