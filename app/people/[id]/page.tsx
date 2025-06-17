import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { loadTimelineData, getPersonById } from '../../utils/data-loader';
import { getPersonPeriod } from '../../utils/period-detection';
import { generateMetaTags } from '../../utils/meta-tags';
import { PersonDetailClient } from './PersonDetailClient';

interface PersonPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const data = loadTimelineData();
  return data.persons.map((person) => ({
    id: person.id,
  }));
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const person = getPersonById(params.id);
  
  if (!person) {
    return generateMetaTags({
      title: 'Person Not Found - Bible Annals',
      description: 'The requested biblical person could not be found.',
      url: `/people/${params.id}/`,
    });
  }

  const dates = person.birth_date && person.death_date 
    ? `(${person.birth_date} - ${person.death_date})`
    : person.birth_date 
    ? `(born ${person.birth_date})`
    : '';
    
  const description = `Learn about ${person.name} ${dates}, a significant figure in biblical history. ${person.ethnicity ? `A member of the ${person.ethnicity} people.` : ''}`;
  
  return generateMetaTags({
    title: `${person.name} - Bible Annals`,
    description,
    url: `/people/${person.id}/`,
    type: 'article',
    keywords: ['biblical person', person.name, 'bible', 'biography', person.ethnicity || '', person.gender || ''].filter(Boolean)
  });
}

export default function PersonPage({ params }: PersonPageProps) {
  const person = getPersonById(params.id);
  const data = loadTimelineData();
  
  if (!person) {
    notFound();
  }

  const personPeriod = getPersonPeriod(params.id);

  // Pre-calculate related data to avoid passing entire datasets
  const relatedPersonIds = new Set([
    ...(person.parents || []),
    ...(person.spouses || []),
    ...data.persons.filter(p => p.parents?.includes(person.id)).map(p => p.id)
  ]);
  
  const relatedPersons = data.persons.filter(p => relatedPersonIds.has(p.id));
  
  // Find events this person participated in (limit to 10)
  const relatedEvents = data.events
    .filter(event => event.participants.includes(person.id))
    .slice(0, 10);

  // Create location names mapping for events
  const eventLocationNames = Object.fromEntries(
    relatedEvents.map(event => [event.id, data.regions.find(r => r.id === event.location)?.name || event.location])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>}>
      <PersonDetailClient
        person={person}
        relatedPersons={relatedPersons}
        relatedEvents={relatedEvents}
        eventLocationNames={eventLocationNames}
        personPeriod={personPeriod}
      />
    </Suspense>
  );
}