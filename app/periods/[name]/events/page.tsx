import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodEvents } from '../../../utils/data-loader';
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
  const period = getTimelinePeriods().find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const allEvents = getPeriodEvents(period.name);

  return (
    <PeriodEventsClient 
      period={period}
      allEvents={allEvents}
    />
  );
}