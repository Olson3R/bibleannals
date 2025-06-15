import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodEvents, getPeriodPeople, getPeriodRegions } from '../../utils/data-loader';
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

  return (
    <PeriodClient 
      period={period}
      events={events}
      people={people}
      regions={regions}
    />
  );
}