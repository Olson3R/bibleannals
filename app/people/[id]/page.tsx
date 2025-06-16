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

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PersonDetailClient
        person={person}
        allPersons={data.persons}
        allEvents={data.events}
        personPeriod={personPeriod}
      />
    </Suspense>
  );
}