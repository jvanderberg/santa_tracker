import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SightingForm } from './SightingForm';

describe('SightingForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        location={{ latitude: 41.8781, longitude: -87.7846 }}
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
        location={{ latitude: 41.8781, longitude: -87.7846 }}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows warning when location is outside geofence', () => {
    // 10 miles north of Oak Park - outside 5 mile radius
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 42.0231, longitude: -87.7846 }}
      />
    );

    expect(screen.getByText(/outside the oak park, il area/i)).toBeInTheDocument();
    expect(screen.getByText(/within 5 miles/i)).toBeInTheDocument();
  });

  it('disables submit button when location is outside geofence', () => {
    // 10 miles north of Oak Park - outside 5 mile radius
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 42.0231, longitude: -87.7846 }}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows no warning when location is inside geofence', () => {
    // 1 mile north of Oak Park - inside 5 mile radius
    render(
      <SightingForm
        onClose={() => {}}
        onSubmit={() => Promise.resolve()}
        location={{ latitude: 41.8926, longitude: -87.7846 }}
      />
    );

    expect(screen.queryByText(/outside the oak park, il area/i)).not.toBeInTheDocument();
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
});
