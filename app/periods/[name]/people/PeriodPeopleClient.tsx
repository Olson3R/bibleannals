'use client';

import { useState, useEffect } from 'react';
import { isWithinDateRange } from '../../../utils/date-parsing';
import { PersonCard, NavLink } from '../../../components/ui';
import { DateRangeSlider } from '../../../components/ui/DateRangeSlider';
import { useDateFilter } from '../../../hooks/useDateFilter';
import type { BiblicalPerson } from '../../../types/biblical';

interface PeriodPeopleClientProps {
  period: {
    name: string;
    slug: string;
    dateRange: string;
    description: string;
  };
  allPeople: BiblicalPerson[];
  dataMinYear: number;
  dataMaxYear: number;
}

export function PeriodPeopleClient({ period, allPeople, dataMinYear, dataMaxYear }: PeriodPeopleClientProps) {
  const [fromTimeline, setFromTimeline] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setFromTimeline(urlParams.get('from') === 'timeline');
  }, []);
  
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
    resetFilter
  } = useDateFilter();

  // Filter people based on date range (using birth_date)
  const people = allPeople.filter(person => {
    if (!minYear && !maxYear) return true;
    return isWithinDateRange(person.birth_date || '', minYear, maxYear);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">People in {period.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{period.dateRange}</p>
            </div>
            <div className="flex gap-2">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">All People ({people.length})</h2>
              <p className="text-gray-600 dark:text-gray-400">{period.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {people.map(person => (
                <PersonCard key={person.id} person={person} showDates={true} className="text-center" periodSlug={period.slug} />
              ))}
            </div>

            {people.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No people found for this date range.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}