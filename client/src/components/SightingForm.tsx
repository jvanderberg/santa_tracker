import { useState, useEffect, type FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import { isWithinGeofence, getGeofenceConfig, type GeofenceConfig } from '../lib/geofence';
import { getConfig } from '../services/api';

interface SightingFormData {
  latitude: number;
  longitude: number;
  details: string;
}

interface SightingFormProps {
  onClose: () => void;
  onSubmit: (data: SightingFormData) => Promise<void>;
  location?: { latitude: number; longitude: number };
}

const METERS_PER_MILE = 1609.34;

function LocationPicker({
  position,
  onLocationSelect,
}: {
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

function GeofenceCircle({
  config,
}: {
  config: { centerLat: number; centerLon: number; radiusMiles: number };
}) {
  // Skip rendering Circle in test environment due to Leaflet renderer limitations in jsdom
  if (import.meta.env.MODE === 'test') {
    return null;
  }

  return (
    <Circle
      center={[config.centerLat, config.centerLon]}
      radius={config.radiusMiles * METERS_PER_MILE}
      pathOptions={{
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.1,
        weight: 2,
      }}
    />
  );
}

export function SightingForm({ onClose, onSubmit, location }: SightingFormProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    location ? { lat: location.latitude, lng: location.longitude } : null
  );
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [geofenceConfig, setGeofenceConfig] = useState<GeofenceConfig>(getGeofenceConfig());

  // Fetch config from API on mount
  useEffect(() => {
    getConfig()
      .then(config => setGeofenceConfig(config))
      .catch(() => {
        // Silently fall back to default if API fails
      });
  }, []);

  // Check if selected location is within geofence
  const isLocationValid =
    selectedLocation && isWithinGeofence(selectedLocation.lat, selectedLocation.lng);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          handleLocationSelect(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Unable to get your location');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) return;

    setError(null);
    setSubmitting(true);

    try {
      await onSubmit({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        details,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit sighting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative">
        <h2 className="text-2xl font-bold mb-4">Report Santa Sighting</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Use Current Location
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">Click on map to select location</p>
            <div className="h-64 border border-gray-300 rounded-md overflow-hidden">
              <MapContainer
                key={`${geofenceConfig.centerLat}-${geofenceConfig.centerLon}`}
                center={
                  selectedLocation
                    ? [selectedLocation.lat, selectedLocation.lng]
                    : [geofenceConfig.centerLat, geofenceConfig.centerLon]
                }
                zoom={13}
                className="h-full w-full"
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <GeofenceCircle config={geofenceConfig} />
                <LocationPicker
                  position={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null}
                  onLocationSelect={handleLocationSelect}
                />
              </MapContainer>
            </div>
            {selectedLocation && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            )}
            {selectedLocation && !isLocationValid && (
              <p className="text-sm text-red-600 mt-2">
                Location is outside the {geofenceConfig.geoname} area. Please select a location
                within {geofenceConfig.radiusMiles} miles.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              id="details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              required
              rows={3}
              placeholder="Describe what you saw..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error && <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedLocation || !isLocationValid}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
