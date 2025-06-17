import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodRegions, getEvents, getPersons } from '../../../utils/data-loader';
import { getLocationName } from '../../../utils/location-resolver';
import { calculateDateRangeFromPeriods } from '../../../utils/date-range';
import { PeriodRegionsClient } from './PeriodRegionsClient';

interface PeriodRegionsPageProps {
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

export default function PeriodRegionsPage({ params }: PeriodRegionsPageProps) {
  const allPeriods = getTimelinePeriods();
  const period = allPeriods.find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const allRegions = getPeriodRegions(period.name);
  const allEvents = getEvents();
  const allPeople = getPersons();
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(allPeriods);

  // Create a map of event IDs to resolved location names
  const eventLocationNames = Object.fromEntries(
    allEvents.map(event => [event.id, getLocationName(event.location)])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>}>
      <PeriodRegionsClient 
        period={period}
        allRegions={allRegions}
        allEvents={allEvents}
        allPeople={allPeople}
        timelinePeriods={allPeriods}
        eventLocationNames={eventLocationNames}
        dataMinYear={dataMinYear}
        dataMaxYear={dataMaxYear}
      />
    </Suspense>
  );
}