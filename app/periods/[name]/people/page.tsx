import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodPeople, getEvents } from '../../../utils/data-loader';
import { getLocationName } from '../../../utils/location-resolver';
import { calculateDateRangeFromPeriods } from '../../../utils/date-range';
import { PeriodPeopleClient } from './PeriodPeopleClient';

interface PeriodPeoplePageProps {
  params: {
    name: string;
  };
}

export async function generateStaticParams() {
  const periods = getTimelinePeriods();
  return periods.map((period) => ({
    name: period.slug,
  }));
}

export default function PeriodPeoplePage({ params }: PeriodPeoplePageProps) {
  const allPeriods = getTimelinePeriods();
  const period = allPeriods.find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const allPeople = getPeriodPeople(period.name);
  const allEvents = getEvents();
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(allPeriods);

  // Create a map of event IDs to resolved location names
  const eventLocationNames = Object.fromEntries(
    allEvents.map(event => [event.id, getLocationName(event.location)])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>}>
      <PeriodPeopleClient 
        period={period}
        allPeople={allPeople}
        allEvents={allEvents}
        timelinePeriods={allPeriods}
        eventLocationNames={eventLocationNames}
        dataMinYear={dataMinYear}
        dataMaxYear={dataMaxYear}
      />
    </Suspense>
  );
}