import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodPeople } from '../../../utils/data-loader';
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
  const period = getTimelinePeriods().find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const allPeople = getPeriodPeople(period.name);

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PeriodPeopleClient 
        period={period}
        allPeople={allPeople}
      />
    </Suspense>
  );
}