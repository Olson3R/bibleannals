import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTimelinePeriods, getPeriodPeople } from '../../../utils/data-loader';
import type { BiblicalPerson } from '../../../types/biblical';

interface PeriodPeoplePageProps {
  params: {
    name: string;
  };
}

function getPersonColorScheme(person: BiblicalPerson) {
  if (['GOD_FATHER', 'JESUS'].includes(person.id)) {
    return { bg: 'bg-yellow-200', border: 'border-yellow-400', text: 'text-yellow-800' };
  }
  if (['ABRAHAM', 'ISAAC', 'JACOB'].includes(person.id)) {
    return { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-800' };
  }
  if (['DAVID', 'SOLOMON'].includes(person.id) || person.name.includes('King')) {
    return { bg: 'bg-red-200', border: 'border-red-400', text: 'text-red-800' };
  }
  if (['MOSES', 'ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL'].includes(person.id)) {
    return { bg: 'bg-green-200', border: 'border-green-400', text: 'text-green-800' };
  }
  if (person.id.includes('APOSTLE') || ['PETER', 'PAUL', 'JOHN_THE_APOSTLE'].includes(person.id)) {
    return { bg: 'bg-indigo-200', border: 'border-indigo-400', text: 'text-indigo-800' };
  }
  if (person.gender === 'female') {
    return { bg: 'bg-pink-200', border: 'border-pink-400', text: 'text-pink-800' };
  }
  return { bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-blue-800' };
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

  const people = getPeriodPeople(period.name);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">People in {period.name}</h1>
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
              <h2 className="text-xl font-semibold text-gray-800 mb-2">All People ({people.length})</h2>
              <p className="text-gray-600">{period.description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {people.map(person => {
                const colors = getPersonColorScheme(person);
                return (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md block ${colors.bg} ${colors.border}`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-sm text-gray-800 mb-1">
                        {person.name}
                        {person.created && <span className="ml-1 text-orange-600" title="Created by God">⭐</span>}
                        {person.translated && <span className="ml-1 text-cyan-600" title="Translated">↗️</span>}
                      </div>
                      {person.birth_date && (
                        <div className="text-xs text-gray-600">Born: {person.birth_date}</div>
                      )}
                      {person.age && (
                        <div className="text-xs text-gray-600">Age: {person.age}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {people.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No people found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}