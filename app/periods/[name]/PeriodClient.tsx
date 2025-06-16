'use client';

import { EventCard, PersonCard, RegionCard, NavLink } from '../../components/ui';
import { DateRangeSlider } from '../../components/ui/DateRangeSlider';
import { useDateFilter } from '../../hooks/useDateFilter';
import { isWithinDateRange } from '../../utils/date-parsing';
import { calculateDateRangeFromPeriods } from '../../utils/date-range';

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
  allPeriods: TimelinePeriod[];
  eventLocationNames: Record<string, string>;
}

export function PeriodClient({ period, events: allEvents, people: allPeople, regions: allRegions, allPeriods, eventLocationNames }: PeriodClientProps) {
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    minEra,
    maxEra,
    setMinYear,
    setMaxYear,
    setMinEra,
    setMaxEra,
    updateDateRange,
    resetFilter
  } = useDateFilter();
  
  // Get dynamic date range from timeline periods data
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(allPeriods);

  // Find adjacent periods for navigation
  const currentIndex = allPeriods.findIndex(p => p.slug === period.slug);
  const previousPeriod = currentIndex > 0 ? allPeriods[currentIndex - 1] : null;
  const nextPeriod = currentIndex < allPeriods.length - 1 ? allPeriods[currentIndex + 1] : null;

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
            <DateRangeSlider
              minYear={minYear}
              maxYear={maxYear}
              minEra={minEra}
              maxEra={maxEra}
              onDateRangeChange={updateDateRange}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              onMinEraChange={setMinEra}
              onMaxEraChange={setMaxEra}
              onReset={resetFilter}
              dataMinYear={dataMinYear}
              dataMaxYear={dataMaxYear}
            />
            
            <NavLink
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Timeline
            </NavLink>
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

          {/* Period Navigation */}
          {(previousPeriod || nextPeriod) && (
            <div className="flex justify-between items-center mb-8 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex-1">
                {previousPeriod && (
                  <NavLink
                    href={`/periods/${previousPeriod.slug}`}
                    className="flex items-center text-blue-600 hover:text-blue-800 group"
                  >
                    <span className="mr-2">←</span>
                    <div>
                      <div className="text-sm text-gray-500">Previous Period</div>
                      <div className="font-semibold group-hover:underline">{previousPeriod.name}</div>
                      <div className="text-sm text-gray-600">{previousPeriod.dateRange}</div>
                    </div>
                  </NavLink>
                )}
              </div>
              
              <div className="flex-1 text-right">
                {nextPeriod && (
                  <NavLink
                    href={`/periods/${nextPeriod.slug}`}
                    className="flex items-center justify-end text-blue-600 hover:text-blue-800 group"
                  >
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Next Period</div>
                      <div className="font-semibold group-hover:underline">{nextPeriod.name}</div>
                      <div className="text-sm text-gray-600">{nextPeriod.dateRange}</div>
                    </div>
                    <span className="ml-2">→</span>
                  </NavLink>
                )}
              </div>
            </div>
          )}

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <NavLink
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
            </NavLink>

            <NavLink
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
            </NavLink>

            <NavLink
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
            </NavLink>
          </div>

          {/* Quick Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Events */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Events</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    showDescription={false} 
                    className="p-3"
                    locationName={eventLocationNames[event.id]}
                    periodSlug={period.slug}
                  />
                ))}
                {events.length > 3 && (
                  <NavLink
                    href={`/periods/${period.slug}/events`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {events.length} events →
                  </NavLink>
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
                  <PersonCard key={person.id} person={person} showDates={true} className="p-3" periodSlug={period.slug} />
                ))}
                {people.length > 3 && (
                  <NavLink
                    href={`/periods/${period.slug}/people`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {people.length} people →
                  </NavLink>
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
                  <RegionCard key={region.id} region={region} showDescription={false} className="p-3" periodSlug={period.slug} />
                ))}
                {regions.length > 3 && (
                  <NavLink
                    href={`/periods/${period.slug}/regions`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {regions.length} regions →
                  </NavLink>
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