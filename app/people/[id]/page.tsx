import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { loadTimelineData, getPersonById, getRegionById, getPersonFamilyGroup } from '../../utils/data-loader';
import { getPersonPeriod } from '../../utils/period-detection';
import { generateMetaTags } from '../../utils/meta-tags';
import { getPersonCrossReferences } from '../../utils/cross-references';
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

  // Get comprehensive cross-references
  const crossRefs = getPersonCrossReferences(person, data.persons, data.events, data.regions);

  // Get family group information
  const familyGroup = getPersonFamilyGroup(person.id);

  // Create location names mapping for events
  const eventLocationNames = Object.fromEntries(
    crossRefs.relatedEvents.map(event => [event.id, getRegionById(event.location)?.name || event.location])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>}>
      <PersonDetailClient
        person={person}
        relatedPersons={crossRefs.relatedPeople}
        relatedEvents={crossRefs.relatedEvents}
        relatedRegions={crossRefs.relatedRegions}
        eventLocationNames={eventLocationNames}
        personPeriod={personPeriod}
        familyGroup={familyGroup}
      />
    </Suspense>
  );
}