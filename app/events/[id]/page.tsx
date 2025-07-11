import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { loadTimelineData, getEventById, getPersonById, getRegionById } from '../../utils/data-loader';
import { getEventPeriod } from '../../utils/period-detection';
import { generateMetaTags } from '../../utils/meta-tags';
import { getEventCrossReferences } from '../../utils/cross-references';
import { EventDetailClient } from './EventDetailClient';
import type { BiblicalPerson } from '../../types/biblical';

interface EventPageProps {
  params: {
    id: string;
  };
}

// Helper function to convert KJV references to bible.com URLs
function getBibleUrl(reference: string): string {
  if (!reference) return '';
  
  const cleanRef = reference.replace('.KJV', '');
  const parts = cleanRef.split('.');
  
  if (parts.length >= 3) {
    const book = parts[0];
    const chapter = parts[1];
    const verse = parts[2];
    
    return `https://www.bible.com/bible/1/${book}.${chapter}.${verse}`;
  }
  
  return '';
}

export async function generateStaticParams() {
  const data = loadTimelineData();
  return data.events.map((event) => ({
    id: event.id,
  }));
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const event = getEventById(params.id);
  
  if (!event) {
    return generateMetaTags({
      title: 'Event Not Found - Bible Annals',
      description: 'The requested biblical event could not be found.',
      url: `/events/${params.id}/`,
    });
  }

  const region = getRegionById(event.location);
  const locationName = region ? region.name : event.location;
  
  return generateMetaTags({
    title: `${event.name} - Bible Annals`,
    description: `${event.description} This biblical event occurred in ${event.date} at ${locationName}.`,
    url: `/events/${event.id}/`,
    type: 'article',
    keywords: ['biblical event', event.name, 'bible', 'history', locationName, event.date]
  });
}

export default function EventPage({ params }: EventPageProps) {
  const event = getEventById(params.id);
  
  if (!event) {
    notFound();
  }

  const eventPeriod = getEventPeriod(params.id);
  
  // Resolve participants on server side
  const participants = event.participants.map(id => getPersonById(id)).filter((person): person is BiblicalPerson => Boolean(person));
  
  // Resolve bible references on server side
  const bibleReferences = event.references.map(ref => ({
    reference: ref.replace('.KJV', ''),
    url: getBibleUrl(ref)
  }));

  // Resolve location name on server side
  const region = getRegionById(event.location);
  const locationName = region ? region.name : event.location;

  // Get comprehensive cross-references
  const data = loadTimelineData();
  const crossRefs = getEventCrossReferences(event, data.persons, data.events, data.regions);

  // Create location names mapping for related events
  const eventLocationNames = Object.fromEntries(
    crossRefs.relatedEvents.map(e => [e.id, getRegionById(e.location)?.name || e.location])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>}>
      <EventDetailClient
        event={event}
        eventPeriod={eventPeriod}
        participants={participants}
        relatedEvents={crossRefs.relatedEvents}
        relatedRegions={crossRefs.relatedRegions}
        bibleReferences={bibleReferences}
        locationName={locationName}
        eventLocationNames={eventLocationNames}
      />
    </Suspense>
  );
}