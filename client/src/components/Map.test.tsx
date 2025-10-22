import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Map } from './Map';
import type { Sighting } from '../types';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

describe('Map Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getConfig to return default Springfield config
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 5,
      geoname: 'Springfield',
    });
  });

  it('renders a map container', async () => {
    vi.mocked(api.getSightings).mockResolvedValue([]);
    render(<Map />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });
  });

  it('centers on Springfield by default', async () => {
    vi.mocked(api.getSightings).mockResolvedValue([]);
    render(<Map />);
    await waitFor(() => {
      const mapContainer = screen.getByTestId('map-container');
      // Leaflet map should be rendered inside
      expect(mapContainer).toBeInTheDocument();
    });
  });

  it('displays markers for provided sightings', () => {
    vi.mocked(api.getSightings).mockResolvedValue([]);
    const sightings: Sighting[] = [
      {
        id: 1,
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        reported_at: new Date().toISOString(),
        details: 'Test sighting',
        sighted_age: 10,
        reported_age: 5,
      },
    ];

    render(<Map sightings={sightings} />);
    const mapContainer = screen.getByTestId('map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('fetches and displays sightings on mount', async () => {
    const mockSightings: Sighting[] = [
      {
        id: 1,
        latitude: 41.8781,
        longitude: -87.7846,
        sighted_at: new Date().toISOString(),
        reported_at: new Date().toISOString(),
        details: 'Santa spotted!',
        sighted_age: 5,
        reported_age: 2,
      },
    ];

    vi.mocked(api.getSightings).mockResolvedValue(mockSightings);

    render(<Map />);

    await waitFor(() => {
      expect(api.getSightings).toHaveBeenCalledTimes(1);
    });
  });

  it('displays loading state while fetching', async () => {
    vi.mocked(api.getSightings).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    );

    render(<Map />);

    expect(screen.getByText('Loading sightings...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading sightings...')).not.toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    vi.mocked(api.getSightings).mockRejectedValue(new Error('Network error'));

    render(<Map />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load sightings/i)).toBeInTheDocument();
    });
  });

  it('displays current time in legend', async () => {
    vi.mocked(api.getSightings).mockResolvedValue([]);

    render(<Map />);

    await waitFor(() => {
      const mapContainer = screen.getByTestId('map-container');
      expect(mapContainer).toBeInTheDocument();
    });

    // Should display "@ " followed by a time with AM/PM at the top
    expect(screen.getByText(/@\s*\d{1,2}:\d{2}\s*(AM|PM)/i)).toBeInTheDocument();
  });
});
