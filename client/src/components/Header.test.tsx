import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';
import { ConfigProvider } from '../contexts/ConfigContext';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

// Helper to render with ConfigProvider
function renderWithConfig(ui: React.ReactElement) {
  return render(<ConfigProvider>{ui}</ConfigProvider>);
}

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getConfig).mockResolvedValue({
      centerLat: 38.5,
      centerLon: -117.0,
      radiusMiles: 3,
      geoname: 'Springfield',
    });
  });

  it('renders the title', () => {
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );
    expect(screen.getByText('Santa Tracker')).toBeInTheDocument();
  });

  it('renders an Add Sighting button', () => {
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );
    const button = screen.getByRole('button', { name: /add sighting/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a Filter button', () => {
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );
    const button = screen.getByRole('button', { name: /filter sightings/i });
    expect(button).toBeInTheDocument();
  });

  it('renders a Help button', () => {
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );
    const button = screen.getByRole('button', { name: /help/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onAddSighting when add button is clicked', () => {
    const handleAddSighting = vi.fn();
    renderWithConfig(
      <Header onAddSighting={handleAddSighting} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );

    const button = screen.getByRole('button', { name: /add sighting/i });
    fireEvent.click(button);

    expect(handleAddSighting).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenFilter when filter button is clicked', () => {
    const handleOpenFilter = vi.fn();
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={handleOpenFilter} onOpenHelp={() => {}} />
    );

    const button = screen.getByRole('button', { name: /filter sightings/i });
    fireEvent.click(button);

    expect(handleOpenFilter).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenHelp when help button is clicked', () => {
    const handleOpenHelp = vi.fn();
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={handleOpenHelp} />
    );

    const button = screen.getByRole('button', { name: /help/i });
    fireEvent.click(button);

    expect(handleOpenHelp).toHaveBeenCalledTimes(1);
  });

  it('displays the geoname from geofence config', () => {
    renderWithConfig(
      <Header onAddSighting={() => {}} onOpenFilter={() => {}} onOpenHelp={() => {}} />
    );
    expect(screen.getByText('Springfield')).toBeInTheDocument();
  });
});
