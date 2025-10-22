import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import {
  adminLogin,
  testAdminAuth,
  getSightings,
  deleteSighting,
  getConfig,
} from '../services/api';
import { SightingDetailPopup } from '../components/SightingDetailPopup';
import type { Sighting } from '../types';
import { getGeofenceConfig } from '../lib/geofence';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

const DEFAULT_ZOOM = 13;

// Get marker color based on sighting age in minutes
function getMarkerColor(ageMinutes: number): string {
  if (ageMinutes < 30) return '#ef4444'; // Red - less than 30 min
  if (ageMinutes < 60) return '#f97316'; // Orange - less than an hour
  if (ageMinutes < 120) return '#eab308'; // Yellow - 1-2 hours
  return '#3b82f6'; // Blue - older than 2 hours
}

// Create custom marker icon with color
function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C10.48 2 6 6.48 6 12c0 7.5 10 18 10 18s10-10.5 10-18c0-5.52-4.48-10-10-10zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
          fill="${color}"
          stroke="white"
          stroke-width="1.5"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

export function AdminPage() {
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [geofenceConfig, setGeofenceConfig] = useState(getGeofenceConfig());

  // Fetch geofence config on mount
  useEffect(() => {
    getConfig().then(setGeofenceConfig).catch(console.error);
  }, []);

  // Check for existing token on mount
  useEffect(() => {
    const existingToken = sessionStorage.getItem('adminToken');
    if (existingToken) {
      setIsLoading(true);
      testAdminAuth(existingToken)
        .then(isValid => {
          if (isValid) {
            setIsAuthenticated(true);
          } else {
            // Clear invalid token
            sessionStorage.removeItem('adminToken');
          }
        })
        .catch(() => {
          sessionStorage.removeItem('adminToken');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  // Fetch sightings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getSightings().then(setSightings).catch(console.error);
    }
  }, [isAuthenticated, refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthFailed(false);

    try {
      // Step 1: Login with passphrase to get token
      const jwtToken = await adminLogin(passphrase);

      // Step 2: Test the token against admin endpoint
      const isValid = await testAdminAuth(jwtToken);

      if (isValid) {
        // Store token in sessionStorage
        sessionStorage.setItem('adminToken', jwtToken);
        setIsAuthenticated(true);
      } else {
        setAuthFailed(true);
      }
    } catch (_error) {
      setAuthFailed(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSighting) return;

    const token = sessionStorage.getItem('adminToken');
    if (!token) return;

    try {
      await deleteSighting(selectedSighting.id, token);
      setSelectedSighting(null);
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Failed to delete sighting:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="fixed inset-0 flex flex-col">
        <div className="bg-blue-600 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm">Viewing last 24 hours - {sightings.length} sightings</p>
        </div>
        <div className="flex-1">
          <MapContainer
            center={[geofenceConfig.centerLat, geofenceConfig.centerLon]}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {sightings.map(sighting => (
              <Marker
                key={sighting.id}
                position={[sighting.latitude, sighting.longitude]}
                icon={createColoredIcon(getMarkerColor(sighting.sighted_age))}
                eventHandlers={{
                  click: () => setSelectedSighting(sighting),
                }}
              />
            ))}
          </MapContainer>
        </div>
        {selectedSighting && (
          <SightingDetailPopup
            sighting={selectedSighting}
            onClose={() => setSelectedSighting(null)}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="passphrase" className="block text-sm font-medium text-gray-700 mb-2">
              Passphrase
            </label>
            <input
              type="password"
              id="passphrase"
              value={passphrase}
              onChange={e => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admin passphrase"
              required
            />
          </div>

          {authFailed && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Failed to authenticate</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Authenticating...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
