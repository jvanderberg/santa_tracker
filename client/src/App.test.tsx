import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as api from './services/api';

// Mock the API module
vi.mock('./services/api');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header and map container', async () => {
    vi.mocked(api.getSightings).mockResolvedValue([]);
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 5,
      geoname: 'Springfield',
    });
    render(<App />);

    expect(screen.getByText('Santa Tracker')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add sighting/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });
  });
});
