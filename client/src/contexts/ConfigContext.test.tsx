import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from './ConfigContext';
import * as api from '../services/api';

// Mock the API module
vi.mock('../services/api');

describe('ConfigContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ConfigProvider', () => {
    it('fetches config on mount and provides it to children', async () => {
      const mockConfig = {
        centerLat: 41.8781,
        centerLon: -87.7846,
        radiusMiles: 3,
        geoname: 'Oak Park, IL',
      };

      vi.mocked(api.getConfig).mockResolvedValue(mockConfig);

      // Test component that uses the config
      function TestComponent() {
        const config = useConfig();
        return (
          <div>
            <span data-testid="geoname">{config.geoname}</span>
            <span data-testid="radius">{config.radiusMiles}</span>
          </div>
        );
      }

      render(
        <ConfigProvider>
          <TestComponent />
        </ConfigProvider>
      );

      // Initially shows default config
      expect(screen.getByTestId('geoname')).toHaveTextContent('Springfield');

      // Wait for API call to complete
      await waitFor(() => {
        expect(screen.getByTestId('geoname')).toHaveTextContent('Oak Park, IL');
      });

      expect(screen.getByTestId('radius')).toHaveTextContent('3');
      expect(api.getConfig).toHaveBeenCalledTimes(1);
    });

    it('falls back to default config if API fails', async () => {
      vi.mocked(api.getConfig).mockRejectedValue(new Error('API Error'));

      function TestComponent() {
        const config = useConfig();
        return <div data-testid="geoname">{config.geoname}</div>;
      }

      render(
        <ConfigProvider>
          <TestComponent />
        </ConfigProvider>
      );

      // Should still show default config
      await waitFor(() => {
        expect(screen.getByTestId('geoname')).toHaveTextContent('Springfield');
      });
    });
  });

  describe('useConfig hook', () => {
    it('throws error when used outside ConfigProvider', () => {
      function TestComponent() {
        useConfig();
        return <div>Test</div>;
      }

      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useConfig must be used within a ConfigProvider'
      );

      consoleError.mockRestore();
    });
  });
});
