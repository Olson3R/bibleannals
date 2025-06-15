import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadTimelineData, getPersonById } from '../../utils/data-loader';
import { PersonDetails } from '../../components/ui';

interface PersonPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const data = loadTimelineData();
  return data.persons.map((person) => ({
    id: person.id,
  }));
}

export default function PersonPage({ params }: PersonPageProps) {
  const person = getPersonById(params.id);
  const data = loadTimelineData();
  
  if (!person) {
    notFound();
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{person.name}</h1>
              <p className="text-gray-600">Person Details</p>
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
          <PersonDetails
            person={person}
            allPersons={data.persons}
            allEvents={data.events}
          />
        </div>
      </div>
    </div>
  );
}