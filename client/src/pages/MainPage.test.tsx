import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MainPage } from './MainPage';
import { ConfigProvider } from '../contexts/ConfigContext';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

// Helper to render with ConfigProvider
function renderWithConfig(ui: React.ReactElement) {
  return render(<ConfigProvider>{ui}</ConfigProvider>);
}

describe('MainPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for getConfig
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 3,
      geoname: 'Springfield',
    });
    // Mock getSightings to return empty array
    vi.mocked(api.getSightings).mockResolvedValue([]);
  });

  it('renders without crashing', () => {
    renderWithConfig(<MainPage />);
    expect(screen.getByText('Santa Tracker')).toBeInTheDocument();
  });

  it('opens help popup when help button is clicked', async () => {
    renderWithConfig(<MainPage />);

    const helpButton = screen.getByRole('button', { name: /help/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(screen.getByText(/How to Use This App/i)).toBeInTheDocument();
    });
  });

  it('displays geoname in help popup', async () => {
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 3,
      geoname: 'Oak Park, IL',
    });

    renderWithConfig(<MainPage />);

    const helpButton = screen.getByRole('button', { name: /help/i });
    fireEvent.click(helpButton);

    await waitFor(() => {
      expect(
        screen.getByText(/recent Santa sightings in the Oak Park, IL area/i)
      ).toBeInTheDocument();
    });
  });
});
