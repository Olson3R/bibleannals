'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isWithinDateRange } from '../../../utils/date-parsing';
import { RegionCard } from '../../../components/ui';
import { DateRangeSlider } from '../../../components/ui/DateRangeSlider';
import type { BiblicalRegion } from '../../../types/biblical';

interface PeriodRegionsClientProps {
  period: {
    name: string;
    slug: string;
    dateRange: string;
    description: string;
  };
  allRegions: BiblicalRegion[];
}

export function PeriodRegionsClient({ period, allRegions }: PeriodRegionsClientProps) {
  const [fromTimeline, setFromTimeline] = useState(false);
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setFromTimeline(urlParams.get('from') === 'timeline');
  }, []);
  // Date filtering state
  const [minYear, setMinYear] = useState<number | null>(null);
  const [maxYear, setMaxYear] = useState<number | null>(null);
  const [minEra, setMinEra] = useState<'BC' | 'AD'>('BC');
  const [maxEra, setMaxEra] = useState<'BC' | 'AD'>('AD');

  // Filter regions based on date range (using estimated_dates)
  const regions = allRegions.filter(region => {
    if (!minYear && !maxYear) return true;
    return isWithinDateRange(region.estimated_dates || '', minYear, maxYear);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Regions in {period.name}</h1>
              <p className="text-gray-600">{period.dateRange}</p>
            </div>
            <div className="flex gap-2">
              {!fromTimeline && (
                <Link
                  href={`/periods/${period.slug}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  ← Back to Period
                </Link>
              )}
              <Link
                href={fromTimeline ? `/#period-${period.slug}` : "/"}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {fromTimeline ? "← Back to Timeline" : "Timeline"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <DateRangeSlider
              minYear={minYear}
              maxYear={maxYear}
              minEra={minEra}
              maxEra={maxEra}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              onMinEraChange={setMinEra}
              onMaxEraChange={setMaxEra}
              onReset={() => {
                setMinYear(null);
                setMaxYear(null);
                setMinEra('BC');
                setMaxEra('AD');
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">All Regions ({regions.length})</h2>
              <p className="text-gray-600">{period.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {regions.map(region => (
                <RegionCard key={region.id} region={region} periodSlug={period.slug} />
              ))}
            </div>

            {regions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No regions found for this date range.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}