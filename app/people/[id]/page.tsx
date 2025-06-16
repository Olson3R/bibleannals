import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { loadTimelineData, getPersonById } from '../../utils/data-loader';
import { getPersonPeriod } from '../../utils/period-detection';
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

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PersonDetailClient
        person={person}
        relatedPersons={relatedPersons}
        relatedEvents={relatedEvents}
        personPeriod={personPeriod}
      />
    </Suspense>
  );
}