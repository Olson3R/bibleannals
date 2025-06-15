import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTimelinePeriods, getPeriodEvents, getPeriodPeople, getPeriodRegions } from '../../utils/data-loader';
import { EventCard, PersonCard, RegionCard } from '../../components/ui';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{period.name}</h1>
              <p className="text-gray-600">{period.dateRange}</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Back to Timeline
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Period Overview */}
          <div className={`rounded-lg border-2 ${period.color} shadow-lg mb-8 overflow-hidden`}>
            <div className={`p-6 ${period.color}`}>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{period.name}</h2>
              <p className="text-gray-700">{period.description}</p>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href={`/periods/${period.slug}/events`}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">📅 Events</h3>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {events.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Explore all the major events that occurred during this period
              </p>
            </Link>

            <Link
              href={`/periods/${period.slug}/people`}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">👥 People</h3>
                <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {people.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Learn about the key figures who lived during this time
              </p>
            </Link>

            <Link
              href={`/periods/${period.slug}/regions`}
              className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">🗺️ Regions</h3>
                <span className="bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  {regions.length}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Discover the important places and locations of this era
              </p>
            </Link>
          </div>

          {/* Quick Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Events */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Events</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map(event => (
                  <EventCard key={event.id} event={event} showDescription={false} className="p-3" />
                ))}
                {events.length > 3 && (
                  <Link
                    href={`/periods/${period.slug}/events`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {events.length} events →
                  </Link>
                )}
              </div>
            </div>

            {/* Featured People */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured People</h3>
              <div className="space-y-3">
                {people.slice(0, 3).map(person => (
                  <PersonCard key={person.id} person={person} showDates={true} className="p-3" />
                ))}
                {people.length > 3 && (
                  <Link
                    href={`/periods/${period.slug}/people`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {people.length} people →
                  </Link>
                )}
              </div>
            </div>

            {/* Featured Regions */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Regions</h3>
              <div className="space-y-3">
                {regions.slice(0, 3).map(region => (
                  <RegionCard key={region.id} region={region} showDescription={false} className="p-3" />
                ))}
                {regions.length > 3 && (
                  <Link
                    href={`/periods/${period.slug}/regions`}
                    className="block text-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    View all {regions.length} regions →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}