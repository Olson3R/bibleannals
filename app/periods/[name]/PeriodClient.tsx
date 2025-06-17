'use client';

import { NavLink } from '../../components/ui';
import { DateRangeSlider } from '../../components/ui/DateRangeSlider';
import { useDateFilter } from '../../hooks/useDateFilter';
import { isWithinDateRange } from '../../utils/date-parsing';
import { getPeriodColors } from '../../utils/color-palette';

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
  
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
    resetFilter
  } = useDateFilter();

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
          
          {/* Content Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📅 Events ({events.length})</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Events from this period</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">👥 People ({people.length})</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">People from this period</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🗺️ Regions ({regions.length})</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Regions from this period</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}