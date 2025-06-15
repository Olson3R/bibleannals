'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isWithinDateRange } from '../../../utils/date-parsing';
import { RegionCard } from '../../../components/ui';
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">📅 Filter by Time Period:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="4004"
                  value={minYear ? Math.abs(minYear) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setMinYear(val ? (minEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
                  }}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BC">BC</option>
                  <option value="AD">AD</option>
                </select>
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="100"
                  value={maxYear ? Math.abs(maxYear) : ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setMaxYear(val ? (maxEra === 'BC' ? -Math.abs(val) : Math.abs(val)) : null);
                  }}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BC">BC</option>
                  <option value="AD">AD</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                setMinYear(null);
                setMaxYear(null);
                setMinEra('BC');
                setMaxEra('AD');
              }}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
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
                <RegionCard key={region.id} region={region} />
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