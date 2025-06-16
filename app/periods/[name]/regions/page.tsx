import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTimelinePeriods, getPeriodRegions } from '../../../utils/data-loader';
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
  const period = getTimelinePeriods().find(p => p.slug === params.name);
  
  if (!period) {
    notFound();
  }

  const allRegions = getPeriodRegions(period.name);

  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <PeriodRegionsClient 
        period={period}
        allRegions={allRegions}
      />
    </Suspense>
  );
}