import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodEvents, getPeriodPeople, getPeriodRegions } from '../../utils/data-loader';
import { getLocationName } from '../../utils/location-resolver';
import { PeriodClient } from './PeriodClient';

interface PeriodPageProps {
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

export default function PeriodPage({ params }: PeriodPageProps) {
  const period = getTimelinePeriods().find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const events = getPeriodEvents(period.name);
  const people = getPeriodPeople(period.name);
  const regions = getPeriodRegions(period.name);
  const allPeriods = getTimelinePeriods();

  // Create a map of event IDs to resolved location names
  const eventLocationNames = Object.fromEntries(
    events.map(event => [event.id, getLocationName(event.location)])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>}>
      <PeriodClient 
        period={period}
        events={events}
        people={people}
        regions={regions}
        allPeriods={allPeriods}
        eventLocationNames={eventLocationNames}
      />
    </Suspense>
  );
}