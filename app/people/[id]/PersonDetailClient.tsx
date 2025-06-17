'use client';

import { useState, useEffect } from 'react';
import { NavLink, PersonDetails } from '../../components/ui';
import type { BiblicalPerson, BiblicalEvent } from '../../types/biblical';

interface PersonDetailClientProps {
  person: BiblicalPerson;
  relatedPersons: BiblicalPerson[];
  relatedEvents: BiblicalEvent[];
  eventLocationNames: Record<string, string>;
  personPeriod: string | null;
}

export function PersonDetailClient({ 
  person, 
  relatedPersons, 
  relatedEvents, 
  eventLocationNames,
  personPeriod
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
          />
        </div>
      </div>
    </div>
  );
}