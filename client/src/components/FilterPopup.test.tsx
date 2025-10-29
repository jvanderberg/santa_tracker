import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterPopup } from './FilterPopup';

describe('FilterPopup Component', () => {
  const mockOnApply = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the filter popup', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    expect(screen.getByText('Filter Sightings')).toBeInTheDocument();
  });

  it('renders time filter options', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    expect(screen.getByLabelText('Last hour')).toBeInTheDocument();
    expect(screen.getByLabelText('Last 4 hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Last 12 hours')).toBeInTheDocument();
    expect(screen.getByLabelText('Last 24 hours')).toBeInTheDocument();
  });

  it('renders location filter options', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    expect(screen.getByLabelText('Near me (within 0.25 miles)')).toBeInTheDocument();
    expect(screen.getByLabelText('Oak Park, IL')).toBeInTheDocument();
  });

  it('defaults to 24 hours time filter', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    const radio = screen.getByLabelText('Last 24 hours') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it('defaults to geofence location filter', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    const radio = screen.getByLabelText('Oak Park, IL') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it('auto-applies filters when options are selected', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    // Select 4 hours - should auto-apply
    fireEvent.click(screen.getByLabelText('Last 4 hours'));

    expect(mockOnApply).toHaveBeenCalledWith({
      timeHours: 4,
      location: 'geofence',
    });

    // Select Near me - should auto-apply
    fireEvent.click(screen.getByLabelText('Near me (within 0.25 miles)'));

    expect(mockOnApply).toHaveBeenCalledWith({
      timeHours: 4,
      location: 'nearme',
    });
  });

  it('calls onClose when X button is clicked', () => {
    vi.useFakeTimers();
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    fireEvent.click(screen.getByLabelText('Close'));

    // Animation delay before close
    vi.advanceTimersByTime(200);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('can change time filter', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    const radio1h = screen.getByLabelText('Last hour') as HTMLInputElement;
    fireEvent.click(radio1h);

    expect(radio1h.checked).toBe(true);
  });

  it('can change location filter', () => {
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    const radioNearMe = screen.getByLabelText('Near me (within 0.25 miles)') as HTMLInputElement;
    fireEvent.click(radioNearMe);

    expect(radioNearMe.checked).toBe(true);
  });

  it('closes when clicking outside the popup', () => {
    vi.useFakeTimers();
    render(
      <FilterPopup
        onApply={mockOnApply}
        onClose={mockOnClose}
        initialFilters={{ timeHours: 24, location: 'geofence' }}
        geoname="Oak Park, IL"
      />
    );

    // Click on the backdrop
    const backdrop = screen.getByTestId('filter-backdrop');
    fireEvent.click(backdrop);

    // Animation delay before close
    vi.advanceTimersByTime(200);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
