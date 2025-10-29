import { X } from 'lucide-react';
import { VERSION } from '../version';

interface HelpPopupProps {
  onClose: () => void;
  geoname: string;
}

export function HelpPopup({ onClose, geoname }: HelpPopupProps) {
  return (
    <div
      data-testid="help-popup-backdrop"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 2000 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-scroll relative"
        onClick={e => e.stopPropagation()}
      >
        {/* X button in upper right - sticky to stay visible when scrolling */}
        <button
          type="button"
          onClick={onClose}
          className="sticky top-4 right-4 float-right text-gray-500 hover:text-gray-700 transition-colors z-10 bg-white rounded-full p-1"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="p-6 pr-12 clear-right">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              We hear Santa has been in the neighborhood. So exciting! Santa! Use this app to track
              Santa and see what he's been up to.
            </p>
          </div>

          <h2 className="text-xl font-bold mb-4">How to Use This App</h2>

          <div className="space-y-4">
            <section>
              <h3 className="font-semibold text-gray-800 mb-2">📍 Viewing Sightings</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>The map shows recent Santa sightings in the {geoname} area</li>
                <li>
                  Colored markers indicate how recent each sighting is:
                  <ul className="ml-6 mt-1 space-y-1">
                    <li>Red: Less than 30 minutes ago</li>
                    <li>Orange: Less than 1 hour ago</li>
                    <li>Yellow: 1-2 hours ago</li>
                    <li>Blue: Over 2 hours ago</li>
                  </ul>
                </li>
                <li>Tap any marker to see details and exact time</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-2">🔍 Filtering Sightings</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Use the filter button (≡) to narrow down what you see</li>
                <li>Choose a time range: Last 1, 4, 12, or 24 hours</li>
                <li>Show only sightings near you (within ¼ mile) or all in the {geoname} area</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-2">➕ Report a Sighting</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Spotted Santa? Tap the + button to report it!</li>
                <li>Click the map to mark where you saw him</li>
                <li>Or use "Current Location" to mark your exact spot</li>
                <li>Add details about what Santa was up to</li>
                <li>Your report helps everyone track Santa's journey</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-2">⏱️ Auto-Updates</h3>
              <p className="text-sm text-gray-700">
                The map refreshes every minute to show the latest sightings.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-gray-800 mb-2">🔒 Privacy</h3>
              <p className="text-sm text-gray-700">
                All sightings are anonymous and no user data is stored or tracked, we wouldn't want
                anyone to get on the naughty list would we.
              </p>
            </section>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs italic text-gray-400">{VERSION}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
