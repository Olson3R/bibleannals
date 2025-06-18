'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NavLink, EventCard, PersonCard, RegionCard, OverlapChart } from '../../components/ui';
import { DateRangeSlider } from '../../components/ui/DateRangeSlider';
import { useDateFilter } from '../../hooks/useDateFilter';
import { isWithinDateRange } from '../../utils/date-parsing';
import { getPeriodColors } from '../../utils/color-palette';
import { downloadYaml, generateYamlFilename } from '../../utils/yaml-export';

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
  colorIndex: number;
  description: string;
  primaryBooks: string[];
}

interface PeriodClientProps {
  period: TimelinePeriod;
  events: BiblicalEvent[];
  people: BiblicalPerson[];
  regions: BiblicalRegion[];
  dataMinYear: number;
  dataMaxYear: number;
}

export function PeriodClient({ period, events: periodEvents, people: periodPeople, regions: periodRegions, dataMinYear, dataMaxYear }: PeriodClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
    resetFilter
  } = useDateFilter();

  // View mode state
  const [viewMode, setViewMode] = useState<'timeline' | 'chart'>('timeline');
  const [isMobile, setIsMobile] = useState(false);

  // Set view mode from URL params after hydration and check mobile
  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const view = searchParams.get('view');
    if (view === 'chart' && window.innerWidth >= 768) {
      setViewMode('chart');
    } else {
      setViewMode('timeline');
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);

  // Handle view mode changes with URL updates
  const handleViewModeChange = (newViewMode: 'timeline' | 'chart') => {
    setViewMode(newViewMode);
    const params = new URLSearchParams(searchParams);
    if (newViewMode === 'chart') {
      params.set('view', 'chart');
    } else {
      params.delete('view');
    }
    router.replace(`/periods/${period.slug}?${params.toString()}`);
  };

  // Filter data based on date range
  const events = periodEvents.filter(event => 
    isWithinDateRange(event.date, minYear, maxYear)
  );
  
  const people = periodPeople.filter(person => 
    isWithinDateRange(person.birth_date || '', minYear, maxYear)
  );
  
  const regions = periodRegions.filter(region => 
    isWithinDateRange(region.estimated_dates || '', minYear, maxYear)
  );

  // Download period data as YAML
  const handleDownloadYaml = () => {
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        page_type: 'period-overview',
        page_title: `${period.name} Overview`,
        date_range: period.dateRange,
        filters_applied: {
          date_range: minYear || maxYear ? { 
            min_year: minYear ?? undefined, 
            max_year: maxYear ?? undefined 
          } : undefined
        }
      },
      period: {
        name: period.name,
        slug: period.slug,
        date_range: period.dateRange,
        description: period.description,
        primary_books: period.primaryBooks
      },
      events: events,
      people: people,
      regions: regions,
      summary: {
        total_events: events.length,
        total_people: people.length,
        total_regions: regions.length
      }
    };

    const filename = generateYamlFilename('period-overview', period.name);
    downloadYaml(exportData, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{period.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{period.dateRange}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Date Range Filter */}
              <DateRangeSlider
                minYear={minYear}
                maxYear={maxYear}
                onMinYearChange={setMinYear}
                onMaxYearChange={setMaxYear}
                onReset={resetFilter}
                dataMinYear={dataMinYear}
                dataMaxYear={dataMaxYear}
              />
              
              {/* View Mode Toggle - Hidden on mobile */}
              <div className="hidden md:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('timeline')}
                  className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${
                    viewMode === 'timeline'
                      ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  title="Timeline view"
                >
                  📜 <span className="hidden lg:inline">Timeline</span>
                </button>
                <button
                  onClick={() => handleViewModeChange('chart')}
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
                title="Download period overview data as YAML"
              >
                📥
              </button>
              
              <NavLink
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Timeline
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Period Overview */}
          <div className={`rounded-lg border-2 ${getPeriodColors(period.colorIndex)} shadow-lg mb-8 overflow-hidden`}>
            <div className={`p-6 ${getPeriodColors(period.colorIndex)}`}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{period.name}</h2>
              <p className="text-gray-800 dark:text-gray-100 mb-4">{period.description}</p>
            </div>
          </div>

          {/* Chart View */}
          {viewMode === 'chart' && !isMobile && (
            <div className="mb-8">
              <OverlapChart
                events={events}
                persons={people}
                timelinePeriods={[period]}
                showEvents={true}
                showPeople={true}
                minYear={minYear}
                maxYear={maxYear}
                onEventClick={(event) => {
                  const params = new URLSearchParams({ from: 'period' });
                  if (minYear !== null) {
                    params.set('minYear', minYear.toString());
                  }
                  if (maxYear !== null) {
                    params.set('maxYear', maxYear.toString());
                  }
                  router.push(`/events/${event.id}?${params.toString()}`);
                }}
                onPersonClick={(person) => {
                  const params = new URLSearchParams({ from: 'period' });
                  if (minYear !== null) {
                    params.set('minYear', minYear.toString());
                  }
                  if (maxYear !== null) {
                    params.set('maxYear', maxYear.toString());
                  }
                  router.push(`/people/${person.id}?${params.toString()}`);
                }}
              />
            </div>
          )}
          
          {/* Timeline View Content */}
          {viewMode === 'timeline' && (
            <>
              {/* Events Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">📅 Events ({events.length})</h3>
              <NavLink
                href={`/periods/${period.slug}/events?from=period`}
                className="px-3 py-2 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors min-h-[44px] sm:min-h-0 flex items-center"
              >
                View All →
              </NavLink>
            </div>
            
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.slice(0, 6).map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    periodSlug={period.slug}
                    locationName={event.location}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No events found for the selected date range.</p>
            )}
            
            {events.length > 6 && (
              <div className="text-center mt-4">
                <NavLink
                  href={`/periods/${period.slug}/events?from=period`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  View all {events.length} events →
                </NavLink>
              </div>
            )}
          </div>

          {/* People Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">👥 People ({people.length})</h3>
              <NavLink
                href={`/periods/${period.slug}/people?from=period`}
                className="px-3 py-2 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors min-h-[44px] sm:min-h-0 flex items-center"
              >
                View All →
              </NavLink>
            </div>
            
            {people.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {people.slice(0, 12).map(person => (
                  <PersonCard 
                    key={person.id} 
                    person={person} 
                    showDates={true} 
                    className="text-center" 
                    periodSlug={period.slug} 
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No people found for the selected date range.</p>
            )}
            
            {people.length > 12 && (
              <div className="text-center mt-4">
                <NavLink
                  href={`/periods/${period.slug}/people?from=period`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  View all {people.length} people →
                </NavLink>
              </div>
            )}
          </div>

          {/* Regions Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">🗺️ Regions ({regions.length})</h3>
              <NavLink
                href={`/periods/${period.slug}/regions?from=period`}
                className="px-3 py-2 sm:py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors min-h-[44px] sm:min-h-0 flex items-center"
              >
                View All →
              </NavLink>
            </div>
            
            {regions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.slice(0, 6).map(region => (
                  <RegionCard 
                    key={region.id} 
                    region={region}
                    periodSlug={period.slug}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No regions found for the selected date range.</p>
            )}
            
            {regions.length > 6 && (
              <div className="text-center mt-4">
                <NavLink
                  href={`/periods/${period.slug}/regions?from=period`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                >
                  View all {regions.length} regions →
                </NavLink>
              </div>
            )}
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}