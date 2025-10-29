import { useState } from 'react';
import { X } from 'lucide-react';

export interface FilterOptions {
  timeHours: 1 | 4 | 12 | 24;
  location: 'nearme' | 'geofence';
}

interface FilterPopupProps {
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
  initialFilters: FilterOptions;
  geoname: string;
}

export function FilterPopup({ onApply, onClose, initialFilters, geoname }: FilterPopupProps) {
  const [timeHours, setTimeHours] = useState<FilterOptions['timeHours']>(initialFilters.timeHours);
  const [location, setLocation] = useState<FilterOptions['location']>(initialFilters.location);
  const [isClosing, setIsClosing] = useState(false);

  const handleTimeChange = (value: FilterOptions['timeHours']) => {
    setTimeHours(value);
    onApply({ timeHours: value, location });
  };

  const handleLocationChange = (value: FilterOptions['location']) => {
    setLocation(value);
    onApply({ timeHours, location: value });
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200); // Match scale-out animation duration
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div
      data-testid="filter-backdrop"
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${
        !isClosing && 'animate-fade-in'
      }`}
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg p-6 max-w-md w-full relative ${
          isClosing ? 'animate-scale-out' : 'animate-scale-in'
        }`}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 pr-8">Filter Sightings</h2>

        {/* Time Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Time</h3>
          <div className="space-y-3">
            {[
              { value: 1, label: 'Last hour' },
              { value: 4, label: 'Last 4 hours' },
              { value: 12, label: 'Last 12 hours' },
              { value: 24, label: 'Last 24 hours' },
            ].map(option => (
              <label
                key={option.value}
                className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="time"
                  value={option.value}
                  checked={timeHours === option.value}
                  onChange={() => handleTimeChange(option.value as FilterOptions['timeHours'])}
                  className="w-5 h-5 text-red-600 focus:ring-red-500"
                />
                <span className="text-base">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Location</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="location"
                value="nearme"
                checked={location === 'nearme'}
                onChange={() => handleLocationChange('nearme')}
                className="w-5 h-5 text-red-600 focus:ring-red-500"
              />
              <span className="text-base">Near me (within 0.25 miles)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="location"
                value="geofence"
                checked={location === 'geofence'}
                onChange={() => handleLocationChange('geofence')}
                className="w-5 h-5 text-red-600 focus:ring-red-500"
              />
              <span className="text-base">{geoname}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
