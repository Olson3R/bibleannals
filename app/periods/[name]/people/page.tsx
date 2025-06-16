import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodPeople } from '../../../utils/data-loader';
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
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(allPeriods);

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PeriodPeopleClient 
        period={period}
        allPeople={allPeople}
        dataMinYear={dataMinYear}
        dataMaxYear={dataMaxYear}
      />
    </Suspense>
  );
}