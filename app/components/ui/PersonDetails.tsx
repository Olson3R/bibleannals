// PersonDetails component for displaying detailed person information

import type { BiblicalPerson, BiblicalEvent } from '../../types/biblical';
import { getBibleUrl } from '../../utils/bible-urls';
import { PersonCard, getPersonColorScheme } from './PersonCard';
import { EventCard } from './EventCard';

// Generate biographical summary based on person data and events
function generateBiographicalSummary(person: BiblicalPerson, events: BiblicalEvent[]): JSX.Element {
  const summaryParts: JSX.Element[] = [];

  // Basic introduction
  let intro = `${person.name} `;
  if (person.ethnicity) {
    intro += `was a ${person.ethnicity} `;
  }
  if (person.gender) {
    intro += person.gender === 'male' ? 'man' : 'woman';
  } else {
    intro += 'person';
  }
  
  // Add birth/death info
  if (person.birth_date || person.death_date) {
    intro += ' who lived ';
    if (person.birth_date && person.death_date) {
      intro += `from ${person.birth_date} to ${person.death_date}`;
    } else if (person.birth_date) {
      intro += `from ${person.birth_date}`;
    } else if (person.death_date) {
      intro += `until ${person.death_date}`;
    }
  }
  
  if (person.age) {
    intro += ` and lived to be ${person.age} years old`;
  }
  
  intro += '.';
  
  summaryParts.push(<p key="intro" className="mb-3">{intro}</p>);

  // Special status
  if (person.created || person.translated) {
    let specialInfo = '';
    if (person.created) {
      specialInfo += `${person.name} was specially created by God. `;
    }
    if (person.translated) {
      specialInfo += `${person.name} was translated (taken up to heaven without experiencing death). `;
    }
    summaryParts.push(<p key="special" className="mb-3 text-blue-800 dark:text-blue-200">{specialInfo}</p>);
  }

  // Events summary
  if (events.length > 0) {
    const eventTypes = new Set<string>();
    events.forEach(event => {
      const name = event.name.toLowerCase();
      if (name.includes('birth')) eventTypes.add('birth');
      if (name.includes('death')) eventTypes.add('death');
      if (name.includes('marriage') || name.includes('marries')) eventTypes.add('marriage');
      if (name.includes('covenant')) eventTypes.add('covenant');
      if (name.includes('miracle')) eventTypes.add('miracle');
      if (name.includes('prophecy') || name.includes('vision')) eventTypes.add('prophecy');
      if (name.includes('battle') || name.includes('war')) eventTypes.add('battle');
    });

    let eventSummary = `${person.name} participated in ${events.length} recorded biblical event${events.length > 1 ? 's' : ''}`;
    
    if (eventTypes.size > 0) {
      const types = Array.from(eventTypes);
      eventSummary += `, including ${types.slice(0, -1).join(', ')}${types.length > 1 ? ` and ${types[types.length - 1]}` : types[0]} events`;
    }
    
    eventSummary += '.';
    summaryParts.push(<p key="events" className="mb-3">{eventSummary}</p>);
  }

  // Role/significance
  const significance = getPersonSignificance(person);
  if (significance) {
    summaryParts.push(<p key="significance" className="mb-3 font-medium text-gray-800 dark:text-gray-200">{significance}</p>);
  }

  return <div>{summaryParts}</div>;
}

// Determine person's biblical significance
function getPersonSignificance(person: BiblicalPerson): string | null {
  const name = person.name.toLowerCase();
  const id = person.id;

  if (id === 'GOD_FATHER') return 'The Creator and sovereign ruler of the universe, revealing Himself throughout biblical history.';
  if (id === 'JESUS') return 'The Son of God, Messiah, and Savior of mankind who died for the sins of the world and rose again.';
  if (id === 'ADAM') return 'The first man created by God, father of all humanity, whose disobedience brought sin into the world.';
  if (id === 'EVE') return 'The first woman, created by God as a companion for Adam and mother of all living.';
  if (id === 'NOAH') return 'A righteous man chosen by God to preserve humanity and animal life through the great flood.';
  if (id === 'ABRAHAM') return 'The father of faith, called by God to be the father of many nations and recipient of God\'s covenant promises.';
  if (id === 'MOSES') return 'The great prophet and lawgiver who led Israel out of Egyptian bondage and received the Ten Commandments.';
  if (id === 'DAVID') return 'The shepherd boy who became Israel\'s greatest king, a man after God\'s own heart and ancestor of Christ.';
  if (id === 'SOLOMON') return 'The wisest king in Israel\'s history, builder of the first temple and author of much biblical wisdom literature.';
  
  // Role-based significance
  if (name.includes('king') || person.name.includes('King')) return 'A ruler in biblical history who played a significant role in God\'s plan for His people.';
  if (id.includes('APOSTLE') || ['PETER', 'PAUL', 'JOHN_THE_APOSTLE'].includes(id)) return 'An apostle of Jesus Christ, chosen to spread the Gospel and establish the early church.';
  if (['ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL', 'EZEKIEL'].includes(id)) return 'A prophet of God who spoke His word to the people and revealed His will for Israel.';
  
  return null;
}

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
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
            >
              ← Back
            </button>
          )}
        </div>
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {person.birth_date && (
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400">🎂</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Born:</span>
                <div className="text-gray-600 dark:text-gray-400">{person.birth_date}</div>
              </div>
            </div>
          )}
          {person.death_date && (
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400">⚰️</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Died:</span>
                <div className="text-gray-600 dark:text-gray-400">{person.death_date}</div>
              </div>
            </div>
          )}
          {person.age && (
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400">⏳</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Age:</span>
                <div className="text-gray-600 dark:text-gray-400">{person.age}</div>
              </div>
            </div>
          )}
          {person.gender && (
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400">{person.gender === 'male' ? '♂️' : '♀️'}</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Gender:</span>
                <div className="text-gray-600 dark:text-gray-400 capitalize">{person.gender}</div>
              </div>
            </div>
          )}
          {person.ethnicity && (
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400">🌍</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Ethnicity:</span>
                <div className="text-gray-600 dark:text-gray-400">{person.ethnicity}</div>
              </div>
            </div>
          )}
          {person.foster_father && (
            <div className="flex items-start space-x-2">
              <span className="text-gray-500 dark:text-gray-400">👨‍👧</span>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Foster Father:</span>
                <div className="text-gray-600 dark:text-gray-400">{person.foster_father}</div>
              </div>
            </div>
          )}
        </div>

        {/* Special Status */}
        <div className="mt-4 flex flex-wrap gap-2">
          {person.created && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-medium flex items-center">
              ⭐ Created by God
            </span>
          )}
          {person.translated && (
            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-800 text-cyan-800 dark:text-cyan-200 rounded-full text-sm font-medium flex items-center">
              ↗️ Translated (taken up without death)
            </span>
          )}
        </div>
      </div>

      {/* Biographical Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg border border-blue-200 dark:border-blue-700 p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
          📚 Biographical Summary
        </h3>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {generateBiographicalSummary(person, personEvents)}
        </div>
      </div>

      {/* Family Relationships */}
      {(parents.length > 0 || children.length > 0 || spouses.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">👨‍👩‍👧‍👦 Family</h3>
          
          {parents.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Parents:</h4>
              <div className="flex flex-wrap gap-2">
                {parents.map(parent => (
                  <PersonCard key={parent.id} person={parent} className="text-sm" />
                ))}
              </div>
            </div>
          )}

          {spouses.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Spouses:</h4>
              <div className="flex flex-wrap gap-2">
                {spouses.map(spouse => (
                  <PersonCard key={spouse.id} person={spouse} className="text-sm" />
                ))}
              </div>
            </div>
          )}

          {children.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Children:</h4>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📝 Other Names</h3>
          <div className="space-y-2">
            {person.names.map((nameEntry, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="font-medium">{nameEntry.name}</span>
                {nameEntry.reference && (
                  <a
                    href={getBibleUrl(nameEntry.reference)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm hover:underline"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📅 Events Participated In</h3>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📖 Biblical References</h3>
          <div className="flex flex-wrap gap-2">
            {person.references.map((ref, index) => (
              <a
                key={index}
                href={getBibleUrl(ref)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors text-sm hover:underline"
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