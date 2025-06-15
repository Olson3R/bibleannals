'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EventCard, PersonCard, RegionCard } from '../../components/ui';
import { isWithinDateRange } from '../../utils/date-parsing';

interface BiblicalPerson {
  id: string;
  name: string;
  names?: { name: string; reference: string }[];
  gender?: string;
  ethnicity?: string;
  age?: string;
  birth_date?: string;
  death_date?: string;
  parents?: string[];
  spouses?: string[];
  references?: string[];
  created?: boolean;
  translated?: boolean;
  foster_father?: string;
}

interface BiblicalEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  participants: string[];
  references: string[];
}

interface BiblicalRegion {
  id: string;
  name: string;
  description: string;
  location: string;
  time_period: string;
  estimated_dates: string;
  notable_people: string[];
}

interface TimelinePeriod {
  name: string;
  slug: string;
  dateRange: string;
  color: string;
  description: string;
}

interface PeriodClientProps {
  period: TimelinePeriod;
  events: BiblicalEvent[];
  people: BiblicalPerson[];
  regions: BiblicalRegion[];
}

export function PeriodClient({ period, events: allEvents, people: allPeople, regions: allRegions }: PeriodClientProps) {
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [minEra, setMinEra] = useState<'BC' | 'AD'>('BC');
  const [maxEra, setMaxEra] = useState<'AD' | 'BC'>('AD');

  // Filter data based on date range
  const events = allEvents.filter(event => 
    isWithinDateRange(event.date, minYear, maxYear)
  );
  
  const people = allPeople.filter(person => 
    isWithinDateRange(person.birth_date || '', minYear, maxYear)
  );
  
  const regions = allRegions.filter(region => 
    isWithinDateRange(region.estimated_dates || '', minYear, maxYear)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{period.name}</h1>
              <p className="text-gray-600">{period.dateRange}</p>
            </div>
            
            {/* Date Range Filter */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-700 font-medium">📅 Filter:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="4004"
                  value={minYear ? Math.abs(minYear) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setMinYear(val ? (minEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
                  }}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={minEra}
                  onChange={(e) => {
                    const newEra = e.target.value as 'BC' | 'AD';
                    setMinEra(newEra);
                    if (minYear) {
                      setMinYear(newEra === 'BC' ? -Math.abs(minYear) : Math.abs(minYear));
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
                    setMaxYear(val ? (maxEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
                  }}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={maxEra}
                  onChange={(e) => {
                    const newEra = e.target.value as 'BC' | 'AD';
                    setMaxEra(newEra);
                    if (maxYear) {
                      setMaxYear(newEra === 'BC' ? -Math.abs(maxYear) : Math.abs(maxYear));
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
                  onClick={() => { 
                    setMinYear(null); 
                    setMaxYear(null); 
                    setMinEra('BC'); 
                    setMaxEra('AD'); 
                  }}
                  className="text-xs text-gray-500 hover:text-gray-700 ml-1"
                  title="Clear date filter"
                >
                  ✕
                </button>
              )}
            </div>
            
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Timeline
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Period Overview */}
          <div className={`rounded-lg border-2 ${period.color} shadow-lg mb-8 overflow-hidden`}>
            <div className={`p-6 ${period.color}`}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{period.name}</h2>
              <p className="text-gray-700">{period.description}</p>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href={`/periods/${period.slug}/events`}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📅 Events</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {events.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Explore all the major events that occurred during this period
              </p>
            </Link>

            <Link
              href={`/periods/${period.slug}/people`}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">👥 People</h3>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {people.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Learn about the key figures who lived during this time
              </p>
            </Link>

            <Link
              href={`/periods/${period.slug}/regions`}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🗺️ Regions</h3>
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {regions.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Discover the important places and locations of this era
              </p>
            </Link>
          </div>

          {/* Quick Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Events */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Events</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map(event => (
                  <EventCard key={event.id} event={event} showDescription={false} className="p-3" />
                ))}
                {events.length > 3 && (
                  <Link
                    href={`/periods/${period.slug}/events`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {events.length} events →
                  </Link>
                )}
                {events.length === 0 && (
                  <p className="text-gray-500 text-sm">No events found for the selected date range.</p>
                )}
              </div>
            </div>

            {/* Featured People */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured People</h3>
              <div className="space-y-3">
                {people.slice(0, 3).map(person => (
                  <PersonCard key={person.id} person={person} showDates={true} className="p-3" />
                ))}
                {people.length > 3 && (
                  <Link
                    href={`/periods/${period.slug}/people`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {people.length} people →
                  </Link>
                )}
                {people.length === 0 && (
                  <p className="text-gray-500 text-sm">No people found for the selected date range.</p>
                )}
              </div>
            </div>

            {/* Featured Regions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Regions</h3>
              <div className="space-y-3">
                {regions.slice(0, 3).map(region => (
                  <RegionCard key={region.id} region={region} showDescription={false} className="p-3" />
                ))}
                {regions.length > 3 && (
                  <Link
                    href={`/periods/${period.slug}/regions`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {regions.length} regions →
                  </Link>
                )}
                {regions.length === 0 && (
                  <p className="text-gray-500 text-sm">No regions found for the selected date range.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}