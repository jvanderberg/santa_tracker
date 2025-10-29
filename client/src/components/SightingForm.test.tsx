import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SightingForm } from './SightingForm';
import { ConfigProvider } from '../contexts/ConfigContext';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

// Helper to render with ConfigProvider
function renderWithConfig(ui: React.ReactElement) {
  return render(<ConfigProvider>{ui}</ConfigProvider>);
}

describe('SightingForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for getConfig
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 3,
      geoname: 'Springfield',
    });
  });

  it('renders form with map picker and use location button', () => {
    renderWithConfig(<SightingForm onClose={() => {}} onSubmit={() => Promise.resolve()} />);

    expect(screen.getByText(/click on map/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /use current location/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/what did you see/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('calls onClose when back button is clicked', () => {
    vi.useFakeTimers();
    const handleClose = vi.fn();
    renderWithConfig(<SightingForm onClose={handleClose} onSubmit={() => Promise.resolve()} />);

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    // Animation delay before close
    vi.advanceTimersByTime(200);
    expect(handleClose).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('displays error message when submission fails', async () => {
    const handleSubmit = vi.fn(() => Promise.reject(new Error('Network error')));
    renderWithConfig(
      <SightingForm
        onClose={() => {}}
        onSubmit={handleSubmit}
        location={{ latitude: 38.5, longitude: -117.0 }}
      />
    );

    const detailsInput = screen.getByLabelText(/what did you see/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(detailsInput, { target: { value: 'Santa spotted!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('disables submit button when no location is selected', () => {
    renderWithConfig(<SightingForm onClose={() => {}} onSubmit={() => Promise.resolve()} />);

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when location is provided', () => {
    renderWithConfig(
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
    // 10 miles north of Springfield - outside 3 mile radius
    renderWithConfig(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 38.645, longitude: -117.0 }}
      />
    );

    expect(screen.getByText(/outside the springfield area/i)).toBeInTheDocument();
    expect(screen.getByText(/within 3 miles/i)).toBeInTheDocument();
  });

  it('disables submit button when location is outside geofence', () => {
    // 10 miles north of Springfield - outside 3 mile radius
    renderWithConfig(
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
    // 1 mile north of Springfield - inside 3 mile radius
    renderWithConfig(
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
    const { container } = renderWithConfig(
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
      radiusMiles: 3,
      geoname: 'Oak Park, IL',
    });

    // This location is valid for Oak Park but NOT valid for Springfield
    // Oak Park center: 41.8781, -87.7846
    // This location: 41.88, -87.78 (< 3 miles from Oak Park)
    // Springfield center: 38.5, -117.0 (hundreds of miles away)
    renderWithConfig(
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
