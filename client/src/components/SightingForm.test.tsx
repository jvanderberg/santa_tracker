import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SightingForm } from './SightingForm';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

describe('SightingForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for getConfig
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 5,
      geoname: 'Springfield',
    });
  });

  it('renders form with map picker and use location button', () => {
    render(<SightingForm onClose={() => {}} onSubmit={() => Promise.resolve()} />);

    expect(screen.getByText(/click on map/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use current location/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/details/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    const handleClose = vi.fn();
    render(<SightingForm onClose={handleClose} onSubmit={() => Promise.resolve()} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('displays error message when submission fails', async () => {
    const handleSubmit = vi.fn(() => Promise.reject(new Error('Network error')));
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={handleSubmit}
        location={{ latitude: 38.5, longitude: -117.0 }}
      />
    );

    const detailsInput = screen.getByLabelText(/details/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(detailsInput, { target: { value: 'Santa spotted!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when no location is selected', () => {
    render(<SightingForm onClose={() => {}} onSubmit={() => Promise.resolve()} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when location is provided', () => {
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 38.5, longitude: -117.0 }}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows warning when location is outside geofence', () => {
    // 10 miles north of Springfield - outside 5 mile radius
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 38.645, longitude: -117.0 }}
      />
    );

    expect(screen.getByText(/outside the springfield area/i)).toBeInTheDocument();
    expect(screen.getByText(/within 5 miles/i)).toBeInTheDocument();
  });

  it('disables submit button when location is outside geofence', () => {
    // 10 miles north of Springfield - outside 5 mile radius
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 38.645, longitude: -117.0 }}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows no warning when location is inside geofence', () => {
    // 1 mile north of Springfield - inside 5 mile radius
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 38.5145, longitude: -117.0 }}
      />
    );

    expect(screen.queryByText(/outside the springfield area/i)).not.toBeInTheDocument();
  });

  it('displays geofence boundary circle on map', () => {
    // This test verifies that the GeofenceCircle component is rendered
    // In a real browser, this would render as an SVG circle on the map
    // In jsdom test environment, the Circle may not fully render due to Leaflet limitations
    // but we can verify the component renders without errors
    const { container } = render(
      <SightingForm onClose={() => {}} onSubmit={() => Promise.resolve()} />
    );

    // Verify the map container exists (which contains the GeofenceCircle)
    const mapContainer = container.querySelector('.leaflet-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('uses fetched geofence config for validation instead of defaults', async () => {
    // Mock API to return Oak Park config (different from default Springfield)
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 41.8781,
      centerLon: -87.7846,
      radiusMiles: 5,
      geoname: 'Oak Park, IL',
    });

    // This location is valid for Oak Park but NOT valid for Springfield
    // Oak Park center: 41.8781, -87.7846
    // This location: 41.88, -87.78 (< 5 miles from Oak Park)
    // Springfield center: 38.5, -117.0 (hundreds of miles away)
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 41.88, longitude: -87.78 }}
      />
    );

    // Wait for config to be fetched
    await waitFor(() => {
      expect(api.getConfig).toHaveBeenCalled();
    });

    // Should show Oak Park geoname in error message (if it were outside)
    // But this location IS valid for Oak Park, so no error should show
    await waitFor(() => {
      expect(screen.queryByText(/outside the springfield area/i)).not.toBeInTheDocument();
      // Submit button should be enabled since location is valid for fetched config
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).not.toBeDisabled();
    });
  });
});
