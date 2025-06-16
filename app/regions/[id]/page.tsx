import { notFound } from 'next/navigation';
import { loadTimelineData, getRegionById, getPersonById } from '../../utils/data-loader';
import { getRegionPeriod } from '../../utils/period-detection';
import { getRegionPeriods } from '../../utils/entity-periods';
import { RegionDetailClient } from './RegionDetailClient';
import type { BiblicalPerson } from '../../types/biblical';

interface RegionPageProps {
  params: {
    id: string;
  };
}

// Helper function to create Bible study links for regions
function getRegionStudyUrl(regionName: string): string {
  const searchTerm = encodeURIComponent(regionName);
  return `https://www.bible.com/search/bible?q=${searchTerm}`;
}

export async function generateStaticParams() {
  const data = loadTimelineData();
  return data.regions.map((region) => ({
    id: region.id,
  }));
}

export default function RegionPage({ params }: RegionPageProps) {
  const region = getRegionById(params.id);
  
  if (!region) {
    notFound();
  }

  const regionPeriod = getRegionPeriod(params.id);
  const regionPeriods = getRegionPeriods(region.estimated_dates);
  
  // Resolve notable people on server side
  const notablePeople = region.notable_people.map(id => getPersonById(id)).filter((person): person is BiblicalPerson => Boolean(person));
  
  // Resolve region study URL on server side
  const regionStudyUrl = getRegionStudyUrl(region.name);

  return (
    <RegionDetailClient
      region={region}
      regionPeriod={regionPeriod}
      regionPeriods={regionPeriods}
      notablePeople={notablePeople}
      regionStudyUrl={regionStudyUrl}
    />
  );
}