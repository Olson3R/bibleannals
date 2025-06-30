'use client';

import { useState, useEffect } from 'react';
import { NavLink, EventCard, RegionCard } from '../../components/ui';
import type { BiblicalEvent, BiblicalPerson, BiblicalRegion } from '../../types/biblical';

interface EventDetailClientProps {
  event: BiblicalEvent;
  eventPeriod: string | null;
  participants: BiblicalPerson[];
  relatedEvents: BiblicalEvent[];
  relatedRegions: BiblicalRegion[];
  bibleReferences: { reference: string; url: string }[];
  locationName: string;
  eventLocationNames: Record<string, string>;
}

export function EventDetailClient({ 
  event, 
  eventPeriod, 
  participants,
  relatedEvents,
  relatedRegions,
  bibleReferences,
  locationName,
  eventLocationNames
}: EventDetailClientProps) {
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
    const periodToUse = timelinePeriodSlug || eventPeriod;
    backUrl = periodToUse ? getPeriodTimelineUrl(periodToUse) : '/';
    backButtonText = '← Back to Timeline';
  } else if (fromPeriod && timelinePeriodSlug) {
    // User came from a specific period page
    backUrl = `/periods/${timelinePeriodSlug}`;
    backButtonText = '← Back to Period';
  } else if (eventPeriod) {
    // Default to earliest period this event belongs to
    backUrl = `/periods/${eventPeriod}`;
    backButtonText = '← Back to Period';
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{event.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">Event Details</p>
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
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">{event.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">{event.date}</span>
                  {event.date_source && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">
                      Source: {event.date_source}
                    </div>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="ml-2 text-gray-800 dark:text-gray-200">{locationName}</span>
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600 dark:text-gray-400">Description:</span>
                <p className="mt-2 text-gray-800 dark:text-gray-200">{event.description}</p>
              </div>
              
              {participants.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Participants:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {participants.map(person => (
                      <NavLink
                        key={person.id}
                        href={`/people/${person.id}${fromTimeline && timelinePeriodSlug ? `?from=timeline&period=${timelinePeriodSlug}` : ''}`}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-colors"
                      >
                        {person.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}

              {event.tags && event.tags.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Tags:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {bibleReferences.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">Biblical References:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bibleReferences.map((ref, index) => (
                      <a
                        key={index}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-200 dark:hover:bg-blue-700 transition-colors"
                      >
                        {ref.reference}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Cross References */}
          {(relatedEvents.length > 0 || relatedRegions.length > 0 || participants.length > 0) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">🔗 Related Content</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Participants */}
                  {participants.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">👥 Participants</h3>
                      <div className="space-y-2">
                        {participants.map(person => (
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
                      </div>
                    </div>
                  )}

                  {/* Related Events */}
                  {relatedEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Related Events</h3>
                      <div className="space-y-3">
                        {relatedEvents.slice(0, 4).map(relatedEvent => (
                          <EventCard
                            key={relatedEvent.id}
                            event={relatedEvent}
                            locationName={eventLocationNames[relatedEvent.id]}
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