'use client';

import { useState } from 'react';

export interface AdvancedFilters {
  personTypes: string[];
  eventTypes: string[];
  locations: string[];
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  personTypeOptions: string[];
  eventTypeOptions: string[];
  locationOptions: string[];
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  personTypeOptions, 
  eventTypeOptions, 
  locationOptions 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePersonTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.personTypes, type]
      : filters.personTypes.filter(t => t !== type);
    
    onFiltersChange({
      ...filters,
      personTypes: newTypes
    });
  };

  const handleEventTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked 
      ? [...filters.eventTypes, type]
      : filters.eventTypes.filter(t => t !== type);
    
    onFiltersChange({
      ...filters,
      eventTypes: newTypes
    });
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const newLocations = checked 
      ? [...filters.locations, location]
      : filters.locations.filter(l => l !== location);
    
    onFiltersChange({
      ...filters,
      locations: newLocations
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      personTypes: [],
      eventTypes: [],
      locations: []
    });
  };

  const hasActiveFilters = filters.personTypes.length > 0 || filters.eventTypes.length > 0 || filters.locations.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Filters
          {hasActiveFilters && (
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
              {filters.personTypes.length + filters.eventTypes.length + filters.locations.length}
            </span>
          )}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Person Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Person Types</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {personTypeOptions.map(type => (
                <label key={type} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.personTypes.includes(type)}
                    onChange={(e) => handlePersonTypeChange(type, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Event Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Types</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {eventTypeOptions.map(type => (
                <label key={type} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.eventTypes.includes(type)}
                    onChange={(e) => handleEventTypeChange(type, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locations</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {locationOptions.slice(0, 10).map(location => (
                <label key={location} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.locations.includes(location)}
                    onChange={(e) => handleLocationChange(location, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{location}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}