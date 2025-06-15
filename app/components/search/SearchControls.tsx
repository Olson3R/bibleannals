// Search and filter controls component

import type { Era } from '../../types/biblical';

interface SearchControlsProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  minYear: number | null;
  maxYear: number | null;
  minEra: Era;
  maxEra: Era;
  onMinYearChange: (year: number | null) => void;
  onMaxYearChange: (year: number | null) => void;
  onMinEraChange: (era: Era) => void;
  onMaxEraChange: (era: Era) => void;
  onClearDateFilter: () => void;
  showEvents: boolean;
  showPeople: boolean;
  showRegions: boolean;
  onToggleEvents: (show: boolean) => void;
  onTogglePeople: (show: boolean) => void;
  onToggleRegions: (show: boolean) => void;
}

export function SearchControls({
  searchTerm,
  onSearchChange,
  minYear,
  maxYear,
  minEra,
  maxEra,
  onMinYearChange,
  onMaxYearChange,
  onMinEraChange,
  onMaxEraChange,
  onClearDateFilter,
  showEvents,
  showPeople,
  showRegions,
  onToggleEvents,
  onTogglePeople,
  onToggleRegions,
}: SearchControlsProps) {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-4">
      {/* Search Input */}
      <div className="w-full max-w-md relative">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Date Range Filter */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-700 font-medium">📅</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            placeholder="4004"
            value={minYear ? Math.abs(minYear) : ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              onMinYearChange(val ? (minEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
            }}
            className="w-12 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={minEra}
            onChange={(e) => {
              const newEra = e.target.value as Era;
              onMinEraChange(newEra);
              if (minYear) {
                onMinYearChange(newEra === 'BC' ? -Math.abs(minYear) : Math.abs(minYear));
              }
            }}
            className="text-xs border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="BC">BC</option>
            <option value="AD">AD</option>
          </select>
        </div>
        <span className="text-gray-500">-</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            placeholder="100"
            value={maxYear ? Math.abs(maxYear) : ''}
            onChange={(e) => {
              const val = e.target.value ? parseInt(e.target.value) : null;
              onMaxYearChange(val ? (maxEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
            }}
            className="w-12 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={maxEra}
            onChange={(e) => {
              const newEra = e.target.value as Era;
              onMaxEraChange(newEra);
              if (maxYear) {
                onMaxYearChange(newEra === 'BC' ? -Math.abs(maxYear) : Math.abs(maxYear));
              }
            }}
            className="text-xs border border-gray-300 rounded px-1 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="AD">AD</option>
            <option value="BC">BC</option>
          </select>
        </div>
        {(minYear || maxYear) && (
          <button
            onClick={onClearDateFilter}
            className="text-xs text-gray-500 hover:text-gray-700 ml-1"
            title="Clear date filter"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Content Toggles */}
      <div className="flex gap-2 lg:gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showEvents}
            onChange={(e) => onToggleEvents(e.target.checked)}
            className="mr-1"
          />
          <span className="text-xs lg:text-sm font-medium text-gray-700">
            📅 <span className="hidden lg:inline">Events</span>
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showPeople}
            onChange={(e) => onTogglePeople(e.target.checked)}
            className="mr-1"
          />
          <span className="text-xs lg:text-sm font-medium text-gray-700">
            👥 <span className="hidden lg:inline">People</span>
          </span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={showRegions}
            onChange={(e) => onToggleRegions(e.target.checked)}
            className="mr-1"
          />
          <span className="text-xs lg:text-sm font-medium text-gray-700">
            🗺️ <span className="hidden lg:inline">Regions</span>
          </span>
        </label>
      </div>
    </div>
  );
}