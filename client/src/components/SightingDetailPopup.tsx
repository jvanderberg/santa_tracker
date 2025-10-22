import type { Sighting } from '../types';

interface SightingDetailPopupProps {
  sighting: Sighting;
  onClose: () => void;
  onDelete: () => void;
}

export function SightingDetailPopup({ sighting, onClose, onDelete }: SightingDetailPopupProps) {
  // Convert GMT timestamp to local time
  const sightedDate = new Date(sighting.sighted_at);
  const reportedDate = new Date(sighting.reported_at);

  const formatLocalDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Sighting Details</h2>

        <div className="space-y-3 mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-600">Sighted At:</p>
            <p className="text-gray-800">{formatLocalDateTime(sightedDate)}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Reported At:</p>
            <p className="text-gray-800">{formatLocalDateTime(reportedDate)}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Location:</p>
            <p className="text-gray-800">
              {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Description:</p>
            <p className="text-gray-800">{sighting.details}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDelete}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
