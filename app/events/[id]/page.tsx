import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadTimelineData, getEventById, getPersonById } from '../../utils/data-loader';

interface EventPageProps {
  params: {
    id: string;
  };
}

// Helper function to convert KJV references to bible.com URLs
function getBibleUrl(reference: string): string {
  if (!reference) return '';
  
  const cleanRef = reference.replace('.KJV', '');
  const parts = cleanRef.split('.');
  
  if (parts.length >= 3) {
    const book = parts[0];
    const chapter = parts[1];
    const verse = parts[2];
    
    return `https://www.bible.com/bible/1/${book}.${chapter}.${verse}`;
  }
  
  return '';
}

export async function generateStaticParams() {
  const data = loadTimelineData();
  return data.events.map((event) => ({
    id: event.id,
  }));
}

export default function EventPage({ params }: EventPageProps) {
  const event = getEventById(params.id);
  
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{event.name}</h1>
              <p className="text-gray-600">Event Details</p>
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
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{event.name}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-600">Date:</span>
                  <span className="ml-2 text-gray-800">{event.date}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-800">{event.location}</span>
                </div>
              </div>
              
              <div>
                <span className="font-semibold text-gray-600">Description:</span>
                <p className="mt-2 text-gray-800">{event.description}</p>
              </div>
              
              {event.participants.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Participants:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.participants.map(participantId => {
                      const person = getPersonById(participantId);
                      return person ? (
                        <Link
                          key={participantId}
                          href={`/people/${person.id}`}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                        >
                          {person.name}
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
              
              {event.references.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-600">Biblical References:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {event.references.map((ref, index) => (
                      <a
                        key={index}
                        href={getBibleUrl(ref)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
                      >
                        {ref.replace('.KJV', '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}