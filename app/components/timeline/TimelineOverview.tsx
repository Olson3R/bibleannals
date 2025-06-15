// Timeline overview component with period buttons

import type { TimelinePeriod } from '../../types/biblical';
import { isWithinDateRange } from '../../utils/date-parsing';

interface TimelineOverviewProps {
  timelinePeriods: TimelinePeriod[];
  selectedPeriod: string | null;
  minYear: number | null;
  maxYear: number | null;
  onPeriodClick: (periodSlug: string) => void;
}

export function TimelineOverview({
  timelinePeriods,
  selectedPeriod,
  minYear,
  maxYear,
  onPeriodClick,
}: TimelineOverviewProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12 border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Timeline Overview</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {timelinePeriods
          .filter(period => isWithinDateRange(period.dateRange, minYear, maxYear))
          .map((period, index) => {
            const periodSlug = period.name.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            const isPeriodSelected = selectedPeriod === `period:${periodSlug}`;
            
            return (
              <button
                key={index}
                className={`px-4 py-2 rounded-full border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                  isPeriodSelected 
                    ? `bg-indigo-50 border-indigo-500 text-indigo-900 shadow-lg ring-2 ring-indigo-300` 
                    : `${period.color}`
                }`}
                onClick={() => onPeriodClick(periodSlug)}
              >
                <div className="font-medium">{period.name}</div>
                <div className="text-xs opacity-75">{period.dateRange}</div>
              </button>
            );
          })}
      </div>
    </div>
  );
}