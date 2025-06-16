'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { BiblicalEvent, BiblicalPerson } from '../../types/biblical';

interface EventDetailClientProps {
  event: BiblicalEvent;
  eventPeriod: string | null;
  participants: BiblicalPerson[];
  bibleReferences: { reference: string; url: string }[];
}

export function EventDetailClient({ 
  event, 
  eventPeriod, 
  participants,
  bibleReferences
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{event.name}</h1>
              <p className="text-gray-600">Event Details</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={backUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {backButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{event.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-600">Date:</span>
                  <span className="ml-2 text-gray-800">{event.date}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-800">{event.location}</span>
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Description:</span>
                <p className="mt-2 text-gray-800">{event.description}</p>
              </div>
              
              {participants.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Participants:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {participants.map(person => (
                      <a
                        key={person.id}
                        href={`/people/${person.id}${fromTimeline && timelinePeriodSlug ? `?from=timeline&period=${timelinePeriodSlug}` : ''}`}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {person.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {bibleReferences.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Biblical References:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {bibleReferences.map((ref, index) => (
                      <a
                        key={index}
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {ref.reference}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}