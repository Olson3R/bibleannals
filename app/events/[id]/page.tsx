import { notFound } from 'next/navigation';
import { loadTimelineData, getEventById, getPersonById } from '../../utils/data-loader';
import { getEventPeriod } from '../../utils/period-detection';
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

  return (
    <EventDetailClient
      event={event}
      eventPeriod={eventPeriod}
      participants={participants}
      bibleReferences={bibleReferences}
    />
  );
}