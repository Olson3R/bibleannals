import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadTimelineData, getRegionById, getPersonById, getTimelinePeriods } from '../../utils/data-loader';
import { getRegionPeriod, getPeriodTimelineUrl } from '../../utils/period-detection';
import { PersonCard } from '../../components/ui';

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
  const backUrl = regionPeriod ? getPeriodTimelineUrl(regionPeriod) : '/';
  const periodInfo = regionPeriod ? getTimelinePeriods().find(p => p.slug === regionPeriod) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{region.name}</h1>
              <p className="text-gray-600">Region Details</p>
            </div>
            <div className="flex gap-2">
              {periodInfo && (
                <Link
                  href={`/periods/${regionPeriod}`}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  ← Back to {periodInfo.name}
                </Link>
              )}
              <Link
                href={backUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ← Back to Timeline
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{region.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-800">{region.location}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Time Period:</span>
                  <span className="ml-2 text-gray-800">{region.time_period}</span>
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Estimated Dates:</span>
                <span className="ml-2 text-gray-800">{region.estimated_dates}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Description:</span>
                <p className="mt-2 text-gray-800">{region.description}</p>
              </div>
              
              {region.notable_people.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Notable People:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {region.notable_people.map(personId => {
                      const person = getPersonById(personId);
                      return person ? (
                        <PersonCard key={personId} person={person} className="text-sm" />
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              <div>
                <a 
                  href={getRegionStudyUrl(region.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  📖 Study this region in the Bible
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}