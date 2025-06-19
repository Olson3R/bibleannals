'use client';

import { useState, useMemo } from 'react';

export interface AdvancedFilters {
  personTypes: string[];
  eventTypes: string[];
  locations: string[];
  tags: string[];
}

interface AdvancedFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  personTypeOptions: string[];
  eventTypeOptions: string[];
  locationOptions: string[];
  tagOptions: string[];
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  personTypeOptions, 
  eventTypeOptions, 
  locationOptions,
  tagOptions 
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    eventTypes: '',
    personTypes: '',
    locations: '',
    tags: ''
  });

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

  const handleTagChange = (tag: string, checked: boolean) => {
    const newTags = checked 
      ? [...filters.tags, tag]
      : filters.tags.filter(t => t !== tag);
    
    onFiltersChange({
      ...filters,
      tags: newTags
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      personTypes: [],
      eventTypes: [],
      locations: [],
      tags: []
    });
  };

  // Filter options based on search terms - show all matching options, not just currently visible ones
  const filteredEventTypes = useMemo(() => {
    if (!searchTerms.eventTypes) return eventTypeOptions;
    return eventTypeOptions.filter(type => 
      type.toLowerCase().includes(searchTerms.eventTypes.toLowerCase())
    );
  }, [eventTypeOptions, searchTerms.eventTypes]);

  const filteredPersonTypes = useMemo(() => {
    if (!searchTerms.personTypes) return personTypeOptions;
    return personTypeOptions.filter(type => 
      type.toLowerCase().includes(searchTerms.personTypes.toLowerCase())
    );
  }, [personTypeOptions, searchTerms.personTypes]);

  const filteredLocations = useMemo(() => {
    if (!searchTerms.locations) return locationOptions;
    return locationOptions.filter(location => 
      location.toLowerCase().includes(searchTerms.locations.toLowerCase())
    );
  }, [locationOptions, searchTerms.locations]);

  const filteredTags = useMemo(() => {
    if (!searchTerms.tags) return tagOptions;
    return tagOptions.filter(tag => 
      tag.toLowerCase().includes(searchTerms.tags.toLowerCase())
    );
  }, [tagOptions, searchTerms.tags]);

  const hasActiveFilters = filters.personTypes.length > 0 || filters.eventTypes.length > 0 || filters.locations.length > 0 || filters.tags.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        aria-expanded={isExpanded}
        aria-controls="advanced-filters-content"
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} advanced filters`}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced Filters
          {hasActiveFilters && (
            <span 
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
              aria-label={`${filters.personTypes.length + filters.eventTypes.length + filters.locations.length + filters.tags.length} active filters`}
            >
              {filters.personTypes.length + filters.eventTypes.length + filters.locations.length + filters.tags.length}
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            aria-label="Clear all active filters"
          >
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div 
          id="advanced-filters-content"
          className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          role="region"
          aria-label="Advanced filtering options"
        >
          {/* Event Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Types</h4>
            <input
              type="text"
              placeholder="Search event types..."
              value={searchTerms.eventTypes}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, eventTypes: e.target.value }))}
              className="w-full mb-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredEventTypes.map(type => (
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

          {/* Person Types */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Person Types</h4>
            <input
              type="text"
              placeholder="Search person types..."
              value={searchTerms.personTypes}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, personTypes: e.target.value }))}
              className="w-full mb-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredPersonTypes.map(type => (
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

          {/* Locations */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Locations</h4>
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerms.locations}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, locations: e.target.value }))}
              className="w-full mb-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredLocations.map(location => (
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

          {/* Tags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerms.tags}
              onChange={(e) => setSearchTerms(prev => ({ ...prev, tags: e.target.value }))}
              className="w-full mb-2 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredTags.map(tag => (
                <label key={tag} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={filters.tags.includes(tag)}
                    onChange={(e) => handleTagChange(tag, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-600 dark:text-gray-400">{tag}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}