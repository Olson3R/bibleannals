'use client';

import { useState, useEffect } from 'react';
import { NavLink, EventCard, RegionCard } from '../../components/ui';
import { getPeriodColors } from '../../utils/color-palette';
import type { BiblicalRegion, BiblicalPerson, BiblicalEvent, TimelinePeriod } from '../../types/biblical';

interface RegionDetailClientProps {
  region: BiblicalRegion;
  regionPeriod: string | null;
  regionPeriods: TimelinePeriod[];
  notablePeople: BiblicalPerson[];
  relatedEvents: BiblicalEvent[];
  relatedRegions: BiblicalRegion[];
  regionStudyUrl: string;
  eventLocationNames: Record<string, string>;
}

export function RegionDetailClient({ 
  region, 
  regionPeriod, 
  regionPeriods,
  notablePeople,
  relatedEvents,
  relatedRegions,
  regionStudyUrl,
  eventLocationNames
}: RegionDetailClientProps) {
  const [fromTimeline, setFromTimeline] = useState(false);
  const [fromPeriod, setFromPeriod] = useState(false);
  const [timelinePeriodSlug, setTimelinePeriodSlug] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromParam = urlParams.get('from');
    setFromTimeline(fromParam === 'timeline');
    setFromPeriod(fromParam === 'period');
    setTimelinePeriodSlug(urlParams.get('period'));
  }, []);

  // Simple function to create period timeline URL
  const getPeriodTimelineUrl = (periodSlug: string) => `/#period-${periodSlug}`;

  // Determine back URL based on where user came from
  let backUrl = '/';
  let backButtonText = '← Back to Timeline';
  
  if (fromTimeline) {
    // Use the specific period the user navigated from, or fall back to computed period
    const periodToUse = timelinePeriodSlug || regionPeriod;
    backUrl = periodToUse ? getPeriodTimelineUrl(periodToUse) : '/';
    backButtonText = '← Back to Timeline';
  } else if (fromPeriod && timelinePeriodSlug) {
    // User came from a specific period page
    backUrl = `/periods/${timelinePeriodSlug}`;
    backButtonText = '← Back to Period';
  } else if (regionPeriod) {
    // Default to earliest period this region belongs to
    backUrl = `/periods/${regionPeriod}`;
    backButtonText = '← Back to Period';
  }

  // regionPeriods is now passed as a prop

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{region.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Region Details</p>
            </div>
            <div className="flex gap-2">
              <NavLink
                href={backUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {backButtonText}
              </NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{region.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">{region.location}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Time Period:</span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">{region.time_period}</span>
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Estimated Dates:</span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">{region.estimated_dates}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Description:</span>
                <p className="mt-2 text-gray-800 dark:text-gray-200">{region.description}</p>
              </div>
              
              {regionPeriods.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Historical Periods:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {regionPeriods.map((period) => (
                      <NavLink
                        key={period.slug}
                        href={`/periods/${period.slug}`}
                        className={`px-3 py-1 rounded-full text-sm hover:opacity-80 transition-all ${getPeriodColors(period.colorIndex)} border-2 text-gray-800 dark:text-gray-100`}
                      >
                        {period.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
              
              {notablePeople.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Notable People:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {notablePeople.map(person => (
                      <NavLink
                        key={person.id}
                        href={`/people/${person.id}${fromTimeline && timelinePeriodSlug ? `?from=timeline&period=${timelinePeriodSlug}` : ''}`}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                      >
                        {person.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <a 
                  href={regionStudyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📖 Study this region in the Bible
                </a>
              </div>
            </div>
          </div>
          
          {/* Cross References */}
          {(relatedEvents.length > 0 || relatedRegions.length > 0 || notablePeople.length > 0) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">🔗 Related Content</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Notable People */}
                  {notablePeople.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">👥 Notable People</h3>
                      <div className="space-y-2">
                        {notablePeople.slice(0, 6).map(person => (
                          <NavLink
                            key={person.id}
                            href={`/people/${person.id}/`}
                            className="block p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {person.name}
                            </div>
                            {person.ethnicity && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {person.ethnicity}
                              </div>
                            )}
                          </NavLink>
                        ))}
                        {notablePeople.length > 6 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{notablePeople.length - 6} more people
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related Events */}
                  {relatedEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Events in this Region</h3>
                      <div className="space-y-3">
                        {relatedEvents.slice(0, 4).map(event => (
                          <EventCard
                            key={event.id}
                            event={event}
                            locationName={eventLocationNames[event.id]}
                            showDescription={false}
                          />
                        ))}
                        {relatedEvents.length > 4 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{relatedEvents.length - 4} more events
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related Regions */}
                  {relatedRegions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">🗺️ Related Regions</h3>
                      <div className="space-y-3">
                        {relatedRegions.slice(0, 3).map(relatedRegion => (
                          <RegionCard
                            key={relatedRegion.id}
                            region={relatedRegion}
                            showDescription={false}
                          />
                        ))}
                        {relatedRegions.length > 3 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{relatedRegions.length - 3} more regions
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}