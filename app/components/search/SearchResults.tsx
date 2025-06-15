// Search results display component

import type { SearchResults, BiblicalPerson } from '../../types/biblical';

interface SearchResultsProps {
  searchTerm: string;
  searchResults: SearchResults;
  totalResults: number;
  onPersonClick: (person: BiblicalPerson) => void;
  onEventClick: (eventId: string) => void;
  onRegionClick: (regionId: string) => void;
  onPeriodClick: (periodSlug: string) => void;
}

export function SearchResultsDisplay({
  searchTerm,
  searchResults,
  totalResults,
  onPersonClick,
  onEventClick,
  onRegionClick,
  onPeriodClick,
}: SearchResultsProps) {
  if (!searchTerm) return null;

  if (totalResults === 0) {
    return (
      <div className="mb-8 text-center">
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Results Found</h3>
          <p className="text-gray-600">Try searching for different terms or check your spelling.</p>
        </div>
      </div>
    );
  }

  return (
    <div id="search-results" className="mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Search Results ({totalResults})
      </h3>
      
      {/* People Results */}
      {searchResults.persons.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            👥 People ({searchResults.persons.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {searchResults.persons.map(person => (
              <button
                key={person.id}
                onClick={() => onPersonClick(person)}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm text-left"
              >
                <div className="font-medium text-gray-800">{person.name}</div>
                {person.birth_date && (
                  <div className="text-xs text-gray-600">{person.birth_date}</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Events Results */}
      {searchResults.events.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            📅 Events ({searchResults.events.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.events.map(event => (
              <button
                key={event.id}
                onClick={() => onEventClick(event.id)}
                className="p-3 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm text-left"
              >
                <div className="font-medium text-gray-800">{event.name}</div>
                <div className="text-xs text-gray-600 mb-1">{event.date}</div>
                <div className="text-xs text-gray-500">
                  {event.description.slice(0, 80)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Regions Results */}
      {searchResults.regions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            🗺️ Regions ({searchResults.regions.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.regions.map(region => (
              <button
                key={region.id}
                onClick={() => onRegionClick(region.id)}
                className="p-3 bg-white border border-gray-300 rounded-lg hover:shadow-md transition-shadow text-sm text-left"
              >
                <div className="font-medium text-gray-800">{region.name}</div>
                <div className="text-xs text-gray-600 mb-1">{region.location}</div>
                <div className="text-xs text-gray-500">
                  {region.description.slice(0, 80)}...
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Periods Results */}
      {searchResults.periods.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            📜 Time Periods ({searchResults.periods.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {searchResults.periods.map((period, index) => (
              <button
                key={index}
                onClick={() => {
                  const periodSlug = period.name.toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                  onPeriodClick(periodSlug);
                }}
                className={`p-3 bg-white border-2 hover:shadow-md transition-shadow text-sm text-left rounded-lg ${
                  period.color.includes('border-') 
                    ? period.color.split(' ').find(c => c.includes('border-')) || 'border-gray-300' 
                    : 'border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{period.name}</div>
                <div className="text-xs text-gray-700 mb-1">{period.dateRange}</div>
                <div className="text-xs text-gray-600">{period.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}