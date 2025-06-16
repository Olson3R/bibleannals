// PersonDetails component for displaying detailed person information

import type { BiblicalPerson, BiblicalEvent } from '../../types/biblical';
import { getBibleUrl } from '../../utils/bible-urls';
import { PersonCard, getPersonColorScheme } from './PersonCard';
import { EventCard } from './EventCard';

interface PersonDetailsProps {
  person: BiblicalPerson;
  relatedPersons?: BiblicalPerson[];
  relatedEvents?: BiblicalEvent[];
  eventLocationNames?: Record<string, string>;
  // Legacy support for existing usage
  allPersons?: BiblicalPerson[];
  allEvents?: BiblicalEvent[];
  onBackClick?: () => void;
}

export function PersonDetails({ 
  person, 
  relatedPersons,
  relatedEvents,
  eventLocationNames,
  allPersons, 
  allEvents, 
  onBackClick 
}: PersonDetailsProps) {
  // Use optimized data if available, fall back to legacy approach
  const personsData = relatedPersons || allPersons || [];
  const eventsData = relatedEvents || (allEvents?.filter(event => 
    event.participants.includes(person.id)
  ).slice(0, 10)) || [];
  
  const parents = person.parents?.map(id => 
    personsData.find(p => p.id === id)
  ).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  const children = personsData.filter(p => p.parents?.includes(person.id));
  const spouses = person.spouses?.map(id => 
    personsData.find(p => p.id === id)
  ).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  // Use pre-calculated events or filter from all events
  const personEvents = eventsData;


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
                {parents.map(parent => (
                  <PersonCard key={parent.id} person={parent} className="text-sm" />
                ))}
              </div>
            </div>
          )}

          {spouses.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Spouses:</h4>
              <div className="flex flex-wrap gap-2">
                {spouses.map(spouse => (
                  <PersonCard key={spouse.id} person={spouse} className="text-sm" />
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Children:</h4>
              <div className="flex flex-wrap gap-2">
                {children.map(child => (
                  <PersonCard key={child.id} person={child} className="text-sm" />
                ))}
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
              <EventCard 
                key={event.id} 
                event={event} 
                locationName={eventLocationNames?.[event.id]} 
              />
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