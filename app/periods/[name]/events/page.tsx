import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTimelinePeriods, getPeriodEvents } from '../../../utils/data-loader';

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

  const events = getPeriodEvents(period.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Events in {period.name}</h1>
              <p className="text-gray-600">{period.dateRange}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/periods/${period.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                ← Back to Period
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Timeline
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">All Events ({events.length})</h2>
              <p className="text-gray-600">{period.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map(event => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow block"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{event.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.date}</p>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-3">{event.description}</p>
                  <p className="text-xs text-gray-500">{event.location}</p>
                </Link>
              ))}
            </div>

            {events.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No events found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}