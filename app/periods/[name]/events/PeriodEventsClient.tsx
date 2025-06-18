'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isWithinDateRange } from '../../../utils/date-parsing';
import { EventCard, OverlapChart, AdvancedFilters, type AdvancedFiltersType } from '../../../components/ui';
import { DateRangeSlider } from '../../../components/ui/DateRangeSlider';
import { NavLink } from '../../../components/ui/NavLink';
import { useDateFilter } from '../../../hooks/useDateFilter';
import { downloadYaml, generateYamlFilename, extractUniqueValues } from '../../../utils/yaml-export';
import type { BiblicalEvent, BiblicalPerson, TimelinePeriod } from '../../../types/biblical';

interface PeriodEventsClientProps {
  period: {
    name: string;
    slug: string;
    dateRange: string;
    description: string;
  };
  allEvents: BiblicalEvent[];
  allPeople: BiblicalPerson[];
  timelinePeriods: TimelinePeriod[];
  eventLocationNames: Record<string, string>;
  dataMinYear: number;
  dataMaxYear: number;
}

export function PeriodEventsClient({ period, allEvents, allPeople, timelinePeriods, eventLocationNames, dataMinYear, dataMaxYear }: PeriodEventsClientProps) {
  const router = useRouter();
  const [fromTimeline, setFromTimeline] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [isMobile, setIsMobile] = useState(false);
  
  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>({
    personTypes: [],
    eventTypes: [],
    locations: []
  });
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setFromTimeline(urlParams.get('from') === 'timeline');
    
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Check for view mode in URL params, but force list view on mobile
    const view = urlParams.get('view');
    if (view === 'chart' && window.innerWidth >= 768) {
      setViewMode('chart');
    } else {
      setViewMode('list');
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Client-side location name resolver
  const getLocationName = (locationId: string): string => {
    return eventLocationNames[locationId] || locationId;
  };

  // Advanced filter helper functions
  const matchesPersonTypeFilter = (person: BiblicalPerson): boolean => {
    if (advancedFilters.personTypes.length === 0) return true;
    return person.ethnicity ? advancedFilters.personTypes.includes(person.ethnicity) : false;
  };

  const matchesEventTypeFilter = (event: BiblicalEvent): boolean => {
    if (advancedFilters.eventTypes.length === 0) return true;
    const name = event.name.toLowerCase();
    let eventType = 'Other';
    if (name.includes('birth')) eventType = 'Birth';
    else if (name.includes('death')) eventType = 'Death';
    else if (name.includes('marriage') || name.includes('marries')) eventType = 'Marriage';
    else if (name.includes('covenant')) eventType = 'Covenant';
    else if (name.includes('plague')) eventType = 'Plague';
    else if (name.includes('miracle') || name.includes('healing')) eventType = 'Miracle';
    else if (name.includes('prophecy') || name.includes('vision')) eventType = 'Prophecy';
    else if (name.includes('battle') || name.includes('war')) eventType = 'Battle';
    else if (name.includes('temple') || name.includes('tabernacle')) eventType = 'Temple/Worship';
    else if (name.includes('exile') || name.includes('captivity')) eventType = 'Exile';
    
    return advancedFilters.eventTypes.includes(eventType);
  };

  const matchesLocationFilter = (event: BiblicalEvent): boolean => {
    if (advancedFilters.locations.length === 0) return true;
    const locationName = getLocationName(event.location);
    return advancedFilters.locations.includes(locationName);
  };
  
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
    resetFilter
  } = useDateFilter();

  // Filter events based on date range and advanced filters (scoped to period)
  const events = allEvents.filter(event => {
    // Date range filter
    const withinDateRange = !minYear && !maxYear ? true : isWithinDateRange(event.date, minYear, maxYear);
    if (!withinDateRange) return false;
    
    // Advanced filters
    return matchesEventTypeFilter(event) && matchesLocationFilter(event);
  });

  // Filter people based on advanced filters (scoped to period participants)
  const periodParticipantIds = new Set<string>();
  allEvents.forEach(event => {
    event.participants.forEach(p => periodParticipantIds.add(p));
  });
  
  const scopedPeople = allPeople.filter(person => {
    // Only include people who participated in this period's events
    if (!periodParticipantIds.has(person.id)) return false;
    
    // Apply advanced filters
    const withinDateRange = !minYear && !maxYear ? true : isWithinDateRange(person.birth_date || '', minYear, maxYear);
    return withinDateRange && matchesPersonTypeFilter(person);
  });

  // Generate filter options from period data
  const personTypeOptions = Array.from(new Set(
    scopedPeople.map(p => p.ethnicity).filter((ethnicity): ethnicity is string => Boolean(ethnicity))
  )).sort();
  
  const eventTypeOptions = Array.from(new Set(
    events.map(e => {
      const name = e.name.toLowerCase();
      if (name.includes('birth')) return 'Birth';
      if (name.includes('death')) return 'Death';
      if (name.includes('marriage') || name.includes('marries')) return 'Marriage';
      if (name.includes('covenant')) return 'Covenant';
      if (name.includes('plague')) return 'Plague';
      if (name.includes('miracle') || name.includes('healing')) return 'Miracle';
      if (name.includes('prophecy') || name.includes('vision')) return 'Prophecy';
      if (name.includes('battle') || name.includes('war')) return 'Battle';
      if (name.includes('temple') || name.includes('tabernacle')) return 'Temple/Worship';
      if (name.includes('exile') || name.includes('captivity')) return 'Exile';
      return 'Other';
    })
  )).sort();
  
  const locationOptions = Array.from(new Set(
    events.map(e => getLocationName(e.location))
  )).sort().slice(0, 20);

  // Navigation handlers for chart clicks
  const handleEventClick = (event: BiblicalEvent) => {
    const params = new URLSearchParams({ from: 'period-events' });
    params.set('period', period.slug);
    if (viewMode === 'chart') params.set('view', 'chart');
    if (minYear !== null) params.set('minYear', minYear.toString());
    if (maxYear !== null) params.set('maxYear', maxYear.toString());
    router.push(`/events/${event.id}?${params.toString()}`);
  };

  const handlePersonClick = (person: BiblicalPerson) => {
    const params = new URLSearchParams({ from: 'period-events' });
    params.set('period', period.slug);
    if (viewMode === 'chart') params.set('view', 'chart');
    if (minYear !== null) params.set('minYear', minYear.toString());
    if (maxYear !== null) params.set('maxYear', maxYear.toString());
    router.push(`/people/${person.id}?${params.toString()}`);
  };

  // Download period events data as YAML
  const handleDownloadYaml = () => {
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        page_type: 'period-events',
        page_title: `Events in ${period.name}`,
        date_range: period.dateRange,
        filters_applied: {
          date_range: minYear || maxYear ? { 
            min_year: minYear ?? undefined, 
            max_year: maxYear ?? undefined 
          } : undefined,
          advanced_filters: {
            person_types: advancedFilters.personTypes,
            event_types: advancedFilters.eventTypes,
            locations: advancedFilters.locations
          }
        }
      },
      period: {
        name: period.name,
        slug: period.slug,
        date_range: period.dateRange,
        description: period.description
      },
      events: events,
      people: scopedPeople,
      ethnicities: extractUniqueValues(scopedPeople, p => p.ethnicity),
      event_types: eventTypeOptions,
      locations: locationOptions
    };

    const filename = generateYamlFilename('period-events', period.name);
    downloadYaml(exportData, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Events in {period.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{period.dateRange}</p>
            </div>
            <div className="flex gap-2">
              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden md:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="List view"
                >
                  📋 <span className="hidden lg:inline">List</span>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${
                    viewMode === 'chart'
                      ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="Chart view"
                >
                  📊 <span className="hidden lg:inline">Chart</span>
                </button>
              </div>

              {/* Download Button - More subtle */}
              <button
                onClick={handleDownloadYaml}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Download period events data as YAML"
              >
                📥
              </button>
              
              {!fromTimeline && (
                <NavLink
                  href={`/periods/${period.slug}`}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                >
                  ← Back to Period
                </NavLink>
              )}
              <NavLink
                href={fromTimeline ? `/#period-${period.slug}` : "/"}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {fromTimeline ? "← Back to Timeline" : "Timeline"}
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <DateRangeSlider
              minYear={minYear}
              maxYear={maxYear}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              onReset={resetFilter}
              dataMinYear={dataMinYear}
              dataMaxYear={dataMaxYear}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Advanced Filters */}
          <AdvancedFilters
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            personTypeOptions={personTypeOptions}
            eventTypeOptions={eventTypeOptions}
            locationOptions={locationOptions}
          />

          {viewMode === 'chart' && !isMobile ? (
            <OverlapChart
              events={events}
              persons={scopedPeople}
              timelinePeriods={timelinePeriods}
              showEvents={true}
              showPeople={false}
              minYear={minYear}
              maxYear={maxYear}
              onEventClick={handleEventClick}
              onPersonClick={handlePersonClick}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">All Events ({events.length})</h2>
                <p className="text-gray-600 dark:text-gray-400">{period.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    periodSlug={period.slug}
                    locationName={eventLocationNames[event.id]}
                  />
                ))}
              </div>

              {events.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No events found for this date range.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}