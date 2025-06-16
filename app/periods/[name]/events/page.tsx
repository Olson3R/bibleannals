import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodEvents } from '../../../utils/data-loader';
import { getLocationName } from '../../../utils/location-resolver';
import { calculateDateRangeFromPeriods } from '../../../utils/date-range';
import { PeriodEventsClient } from './PeriodEventsClient';

interface PeriodEventsPageProps {
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

export default function PeriodEventsPage({ params }: PeriodEventsPageProps) {
  const allPeriods = getTimelinePeriods();
  const period = allPeriods.find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const allEvents = getPeriodEvents(period.name);
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(allPeriods);

  // Create a map of event IDs to resolved location names
  const eventLocationNames = Object.fromEntries(
    allEvents.map(event => [event.id, getLocationName(event.location)])
  );

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PeriodEventsClient 
        period={period}
        allEvents={allEvents}
        eventLocationNames={eventLocationNames}
        dataMinYear={dataMinYear}
        dataMaxYear={dataMaxYear}
      />
    </Suspense>
  );
}