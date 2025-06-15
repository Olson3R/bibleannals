// PersonDetails component for displaying detailed person information

import Link from 'next/link';
import type { BiblicalPerson, BiblicalEvent } from '../../types/biblical';
import { getBibleUrl } from '../../utils/bible-urls';

interface PersonDetailsProps {
  person: BiblicalPerson;
  allPersons: BiblicalPerson[];
  allEvents: BiblicalEvent[];
  onBackClick?: () => void;
}

export function PersonDetails({ 
  person, 
  allPersons, 
  allEvents, 
  onBackClick 
}: PersonDetailsProps) {
  const parents = person.parents?.map(id => 
    allPersons.find(p => p.id === id)
  ).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  const children = allPersons.filter(p => p.parents?.includes(person.id));
  const spouses = person.spouses?.map(id => 
    allPersons.find(p => p.id === id)
  ).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  // Find events this person participated in
  const personEvents = allEvents.filter(event => 
    event.participants.includes(person.id)
  ).slice(0, 10); // Limit to 10 most relevant events

  // Color scheme function for family relations
  const getPersonColorScheme = (person: BiblicalPerson) => {
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
    return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' };
  };

  const colorScheme = getPersonColorScheme(person);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg border-2 ${colorScheme.bg} ${colorScheme.border}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl font-bold ${colorScheme.text}`}>{person.name}</h2>
          {onBackClick && (
            <button
              onClick={onBackClick}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back
            </button>
          )}
        </div>
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {person.birth_date && (
            <div>
              <span className="font-medium text-gray-700">Born:</span> {person.birth_date}
            </div>
          )}
          {person.death_date && (
            <div>
              <span className="font-medium text-gray-700">Died:</span> {person.death_date}
            </div>
          )}
          {person.gender && (
            <div>
              <span className="font-medium text-gray-700">Gender:</span> {person.gender}
            </div>
          )}
          {person.ethnicity && (
            <div>
              <span className="font-medium text-gray-700">Ethnicity:</span> {person.ethnicity}
            </div>
          )}
        </div>

        {/* Special Status */}
        <div className="mt-4 flex flex-wrap gap-2">
          {person.created && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Created by God</span>
          )}
          {person.translated && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">Translated</span>
          )}
        </div>
      </div>

      {/* Family Relationships */}
      {(parents.length > 0 || children.length > 0 || spouses.length > 0) && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👨‍👩‍👧‍👦 Family</h3>
          
          {parents.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Parents:</h4>
              <div className="flex flex-wrap gap-2">
                {parents.map(parent => {
                  const parentColors = getPersonColorScheme(parent);
                  return (
                    <Link
                      key={parent.id}
                      href={`/people/${parent.id}`}
                      className={`px-3 py-1 rounded-full border ${parentColors.bg} ${parentColors.border} ${parentColors.text} hover:shadow-md transition-shadow text-sm`}
                    >
                      {parent.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {spouses.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Spouses:</h4>
              <div className="flex flex-wrap gap-2">
                {spouses.map(spouse => {
                  const spouseColors = getPersonColorScheme(spouse);
                  return (
                    <Link
                      key={spouse.id}
                      href={`/people/${spouse.id}`}
                      className={`px-3 py-1 rounded-full border ${spouseColors.bg} ${spouseColors.border} ${spouseColors.text} hover:shadow-md transition-shadow text-sm`}
                    >
                      {spouse.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Children:</h4>
              <div className="flex flex-wrap gap-2">
                {children.map(child => {
                  const childColors = getPersonColorScheme(child);
                  return (
                    <Link
                      key={child.id}
                      href={`/people/${child.id}`}
                      className={`px-3 py-1 rounded-full border ${childColors.bg} ${childColors.border} ${childColors.text} hover:shadow-md transition-shadow text-sm`}
                    >
                      {child.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Names */}
      {person.names && person.names.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Other Names</h3>
          <div className="space-y-2">
            {person.names.map((nameEntry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium">{nameEntry.name}</span>
                {nameEntry.reference && (
                  <a
                    href={getBibleUrl(nameEntry.reference)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm hover:underline"
                  >
                    {nameEntry.reference.replace('.KJV', '')}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Participated In */}
      {personEvents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📅 Events Participated In</h3>
          <div className="space-y-3">
            {personEvents.map(event => (
              <Link key={event.id} href={`/events/${event.id}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="font-medium text-gray-800 hover:text-blue-600">{event.name}</div>
                <div className="text-sm text-gray-600 mt-1">{event.date} • {event.location}</div>
                <div className="text-sm text-gray-700 mt-2">{event.description}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Biblical References */}
      {person.references && person.references.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📖 Biblical References</h3>
          <div className="flex flex-wrap gap-2">
            {person.references.map((ref, index) => (
              <a
                key={index}
                href={getBibleUrl(ref)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors text-sm hover:underline"
              >
                {ref.replace('.KJV', '')}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}