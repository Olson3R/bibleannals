'use client';

import { useState, useEffect } from 'react';
import { NavLink, PersonDetails, EventCard, RegionCard } from '../../components/ui';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, FamilyGroup } from '../../types/biblical';

interface PersonDetailClientProps {
  person: BiblicalPerson;
  relatedPersons: BiblicalPerson[];
  relatedEvents: BiblicalEvent[];
  relatedRegions: BiblicalRegion[];
  eventLocationNames: Record<string, string>;
  personPeriod: string | null;
  familyGroup?: FamilyGroup;
}

export function PersonDetailClient({ 
  person, 
  relatedPersons, 
  relatedEvents, 
  relatedRegions,
  eventLocationNames,
  personPeriod,
  familyGroup
}: PersonDetailClientProps) {
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
    const periodToUse = timelinePeriodSlug || personPeriod;
    backUrl = periodToUse ? getPeriodTimelineUrl(periodToUse) : '/';
    backButtonText = '← Back to Timeline';
  } else if (fromPeriod && timelinePeriodSlug) {
    // User came from a specific period page
    backUrl = `/periods/${timelinePeriodSlug}`;
    backButtonText = '← Back to Period';
  } else if (personPeriod) {
    // Default to earliest period this person belongs to
    backUrl = `/periods/${personPeriod}`;
    backButtonText = '← Back to Period';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{person.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Person Details</p>
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
          <PersonDetails
            person={person}
            relatedPersons={relatedPersons}
            relatedEvents={relatedEvents}
            eventLocationNames={eventLocationNames}
            familyGroup={familyGroup}
          />
          
          {/* Cross References */}
          {(relatedEvents.length > 0 || relatedRegions.length > 0 || relatedPersons.length > 0) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">🔗 Related Content</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Related Events */}
                  {relatedEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Events</h3>
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

                  {/* Related People */}
                  {relatedPersons.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">👥 Related People</h3>
                      <div className="space-y-2">
                        {relatedPersons.slice(0, 6).map(relatedPerson => (
                          <NavLink
                            key={relatedPerson.id}
                            href={`/people/${relatedPerson.id}/`}
                            className="block p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {relatedPerson.name}
                            </div>
                            {relatedPerson.ethnicity && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {relatedPerson.ethnicity}
                              </div>
                            )}
                          </NavLink>
                        ))}
                        {relatedPersons.length > 6 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            +{relatedPersons.length - 6} more people
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Related Regions */}
                  {relatedRegions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">🗺️ Regions</h3>
                      <div className="space-y-3">
                        {relatedRegions.slice(0, 3).map(region => (
                          <RegionCard
                            key={region.id}
                            region={region}
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