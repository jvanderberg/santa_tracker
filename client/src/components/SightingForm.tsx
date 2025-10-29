import { useState, type FormEvent } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, ZoomControl } from 'react-leaflet';
import { isWithinGeofence } from '../lib/geofence';
import { useConfig } from '../contexts/ConfigContext';
import { ChevronLeft, MapPin } from 'lucide-react';

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
        fillOpacity: 0,
        weight: 2,
      }}
    />
  );
}

export function SightingForm({ onClose, onSubmit, location }: SightingFormProps) {
  const geofenceConfig = useConfig();
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    location ? { lat: location.latitude, lng: location.longitude } : null
  );
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check if selected location is within geofence
  const isLocationValid =
    selectedLocation &&
    isWithinGeofence(selectedLocation.lat, selectedLocation.lng, geofenceConfig);

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
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      <style>{`
        .leaflet-top.leaflet-left {
          top: 50%;
          transform: translateY(-50%);
        }
      `}</style>
      {/* Full-page map */}
      <MapContainer
        key={`${geofenceConfig.centerLat}-${geofenceConfig.centerLon}`}
        center={
          selectedLocation
            ? [selectedLocation.lat, selectedLocation.lng]
            : [geofenceConfig.centerLat, geofenceConfig.centerLon]
        }
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topleft" />
        <GeofenceCircle config={geofenceConfig} />
        <LocationPicker
          position={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null}
          onLocationSelect={handleLocationSelect}
        />
      </MapContainer>

      {/* Floating header with instructions */}
      <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-95 rounded-lg shadow-lg p-3 z-[1000]">
        {/* Header with back button */}
        <div className="flex items-center gap-1 mb-2">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Back"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-lg font-bold">Report Santa Sighting</h2>
        </div>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center gap-2 px-3 py-2 mb-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
        >
          <MapPin size={16} />
          Use Current Location
        </button>
        <p className="text-sm text-gray-600 mb-1">Click on map to select location</p>
        {selectedLocation && (
          <p className="text-xs text-gray-500">
            {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
          </p>
        )}
        {selectedLocation && !isLocationValid && (
          <p className="text-sm text-red-600 mt-1">
            Location is outside the {geofenceConfig.geoname} area. Please select a location within{' '}
            {geofenceConfig.radiusMiles} miles.
          </p>
        )}
      </div>

      {/* Floating form at bottom */}
      <form onSubmit={handleSubmit} className="absolute bottom-4 left-4 right-4 z-[1000]">
        <div className="bg-white bg-opacity-95 rounded-lg shadow-lg p-4 space-y-3">
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
              What did you see?
            </label>
            <textarea
              id="details"
              value={details}
              onChange={e => setDetails(e.target.value)}
              required
              rows={2}
              placeholder="Describe what you saw..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {error && <div className="p-2 bg-red-50 text-red-600 rounded-md text-sm">{error}</div>}

          <button
            type="submit"
            disabled={submitting || !selectedLocation || !isLocationValid}
            className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? 'Submitting...' : 'Submit Sighting'}
          </button>
        </div>
      </form>
    </div>
  );
}
