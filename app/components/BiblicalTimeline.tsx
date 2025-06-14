'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface BiblicalPerson {
  id: string;
  name: string;
  names?: { name: string; reference: string }[];
  gender?: string;
  age?: string;
  birth_date?: string;
  death_date?: string;
  parents?: string[];
  spouses?: string[];
  references?: string[];
  created?: boolean;
  translated?: boolean;
  foster_father?: string;
}

interface BiblicalEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  description: string;
  participants: string[];
  references: string[];
}

interface BiblicalRegion {
  id: string;
  name: string;
  description: string;
  location: string;
  time_period: string;
  estimated_dates: string;
  notable_people: string[];
}

// Helper function to convert KJV references to bible.com URLs
function getBibleUrl(reference: string): string {
  if (!reference) return '';
  
  // Convert reference like "GEN.1.1.KJV" to bible.com format
  const cleanRef = reference.replace('.KJV', '');
  const parts = cleanRef.split('.');
  
  if (parts.length >= 3) {
    const book = parts[0];
    const chapter = parts[1];
    const verse = parts[2];
    
    // Use the abbreviation directly - bible.com can handle them
    return `https://www.bible.com/bible/1/${book}.${chapter}.${verse}`;
  }
  
  return '';
}

// Helper function to create Bible study links for regions
function getRegionStudyUrl(regionName: string): string {
  // Create a search URL for the region on bible.com
  const searchTerm = encodeURIComponent(regionName);
  return `https://www.bible.com/search/bible?q=${searchTerm}`;
}

// Helper function to get family relationships
function getPersonRelationships(person: BiblicalPerson, allPersons: BiblicalPerson[]) {
  const getPersonById = (id: string) => allPersons.find(p => p.id === id);
  
  // Parents
  const parents = person.parents?.map(id => getPersonById(id)).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  // Spouses
  const spouses = person.spouses?.map(id => getPersonById(id)).filter((p): p is BiblicalPerson => p !== undefined) || [];
  
  // Children (people who have this person as parent)
  const children = allPersons.filter(p => p.parents?.includes(person.id));
  
  // Siblings (people who share at least one parent)
  const siblings = person.parents ? allPersons.filter(p => 
    p.id !== person.id && 
    p.parents?.some(parentId => person.parents?.includes(parentId))
  ) : [];
  
  return { parents, spouses, children, siblings };
}

function PersonCard({ person, allPersons, searchParams, router }: { 
  person: BiblicalPerson; 
  allPersons: BiblicalPerson[];
  searchParams: URLSearchParams;
  router: AppRouterInstance;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const relationships = getPersonRelationships(person, allPersons);

  // Check if this person should be expanded based on URL
  useEffect(() => {
    const targetPerson = searchParams.get('person');
    if (targetPerson === person.id) {
      setIsExpanded(true);
      // Scroll to this person with a longer delay to ensure rendering
      setTimeout(() => {
        const element = document.querySelector(`[data-person-id="${person.id}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams, person.id]);
  
  const getColorScheme = (person: BiblicalPerson) => {
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
  };
  
  const colors = getColorScheme(person);
  
  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    // Update URL to reflect the state
    if (newExpanded) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('person', person.id);
      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
    } else {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('person');
      const newQuery = newSearchParams.toString();
      router.push(newQuery ? `/?${newQuery}` : '/', { scroll: false });
    }
  };
  
  return (
    <div className={`${isExpanded ? 'w-full' : 'inline-block'} mb-2`}>
      <div 
        className={`${isExpanded ? 'p-3 border rounded-lg shadow-md' : 'px-2 py-1 rounded border'} ${colors.bg} ${colors.border} cursor-pointer transition-all duration-200 text-xs`}
        onClick={toggleExpanded}
        data-person-id={person.id}
      >
        {/* Compact view */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium text-gray-800">{person.name}</span>
            {person.created && <span className="ml-1 text-orange-600" title="Created by God">⭐</span>}
            {person.translated && <span className="ml-1 text-cyan-600" title="Translated (taken up without death)">↗️</span>}
          </div>
          <span className="text-gray-500 ml-2">{isExpanded ? '−' : '+'}</span>
        </div>
        
        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-2 space-y-2">
            {/* Basic Info */}
            {(person.names || person.age || person.birth_date || person.death_date) && (
              <div className="border-t border-gray-300 pt-2">
                {person.names && person.names.length > 0 && (
                  <div className="text-xs text-gray-600 mb-1">
                    Also known as: {person.names.map(n => n.name).join(', ')}
                  </div>
                )}
                {person.age && (
                  <div className="text-xs text-gray-600">Age: {person.age}</div>
                )}
                {(person.birth_date || person.death_date) && (
                  <div className="text-xs text-gray-600">
                    {person.birth_date && <span>Born: {person.birth_date}</span>}
                    {person.birth_date && person.death_date && <span> • </span>}
                    {person.death_date && <span>Died: {person.death_date}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Family Relationships */}
            {(relationships.parents.length > 0 || relationships.spouses.length > 0 || relationships.children.length > 0 || relationships.siblings.length > 0) && (
              <div className="space-y-2">
                {relationships.parents.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Parents:</div>
                    <div className="flex flex-wrap gap-1">
                      {relationships.parents.map((p) => {
                        const pColors = getColorScheme(p);
                        return (
                          <button
                            key={p.id}
                            className={`px-2 py-1 rounded border text-xs font-medium cursor-pointer hover:shadow-md transition-all duration-200 ${pColors.bg} ${pColors.border} ${pColors.text}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('person', p.id);
                              router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                            }}
                          >
                            {p.name}
                            {p.created && <span className="ml-1 text-orange-600">⭐</span>}
                            {p.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {relationships.spouses.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Spouses:</div>
                    <div className="flex flex-wrap gap-1">
                      {relationships.spouses.map((p) => {
                        const pColors = getColorScheme(p);
                        return (
                          <button
                            key={p.id}
                            className={`px-2 py-1 rounded border text-xs font-medium cursor-pointer hover:shadow-md transition-all duration-200 ${pColors.bg} ${pColors.border} ${pColors.text}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('person', p.id);
                              router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                            }}
                          >
                            {p.name}
                            {p.created && <span className="ml-1 text-orange-600">⭐</span>}
                            {p.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {relationships.children.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Children:</div>
                    <div className="flex flex-wrap gap-1">
                      {relationships.children.slice(0, 6).map((p) => {
                        const pColors = getColorScheme(p);
                        return (
                          <button
                            key={p.id}
                            className={`px-2 py-1 rounded border text-xs font-medium cursor-pointer hover:shadow-md transition-all duration-200 ${pColors.bg} ${pColors.border} ${pColors.text}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('person', p.id);
                              router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                            }}
                          >
                            {p.name}
                            {p.created && <span className="ml-1 text-orange-600">⭐</span>}
                            {p.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                          </button>
                        );
                      })}
                      {relationships.children.length > 6 && (
                        <span className="px-2 py-1 text-xs text-gray-500 self-center">
                          +{relationships.children.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {relationships.siblings.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Siblings:</div>
                    <div className="flex flex-wrap gap-1">
                      {relationships.siblings.slice(0, 4).map((p) => {
                        const pColors = getColorScheme(p);
                        return (
                          <button
                            key={p.id}
                            className={`px-2 py-1 rounded border text-xs font-medium cursor-pointer hover:shadow-md transition-all duration-200 ${pColors.bg} ${pColors.border} ${pColors.text}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newSearchParams = new URLSearchParams(searchParams);
                              newSearchParams.set('person', p.id);
                              router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                            }}
                          >
                            {p.name}
                            {p.created && <span className="ml-1 text-orange-600">⭐</span>}
                            {p.translated && <span className="ml-1 text-cyan-600">↗️</span>}
                          </button>
                        );
                      })}
                      {relationships.siblings.length > 4 && (
                        <span className="px-2 py-1 text-xs text-gray-500 self-center">
                          +{relationships.siblings.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Biblical References */}
            {person.references && person.references.length > 0 && (
              <div className="border-t border-gray-300 pt-2">
                <div className="font-semibold text-gray-700 mb-1">Biblical References:</div>
                <div className="flex flex-wrap gap-1">
                  {person.references.slice(0, 4).map((ref, index) => (
                    <a
                      key={index}
                      href={getBibleUrl(ref)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {ref.replace('.KJV', '')}
                    </a>
                  ))}
                  {person.references.length > 4 && (
                    <span className="text-gray-500">+{person.references.length - 4} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TimelinePeriodCard({ 
  period, 
  events, 
  regions, 
  getPersonById, 
  allPersons,
  searchParams,
  router
}: { 
  period: { name: string; dateRange: string; color: string; description: string };
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  getPersonById: (id: string) => BiblicalPerson | undefined;
  allPersons: BiblicalPerson[];
  searchParams: URLSearchParams;
  router: AppRouterInstance;
}) {
  const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const periodEvents = events.filter(event => {
    // Parse event date
    let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
    const isAD = event.date.includes('AD');
    if (isAD) eventYear = -eventYear; // Convert AD to negative for comparison
    
    // Parse period range
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Handle BC/AD in period range
    if (startStr.includes('BC')) startYear = Math.abs(startYear);
    if (endStr.includes('BC')) endYear = Math.abs(endYear);
    if (startStr.includes('AD')) startYear = -Math.abs(startYear);
    if (endStr.includes('AD')) endYear = -Math.abs(endYear);
    
    // For periods spanning BC to AD, we need special handling
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        return eventYearOriginal <= 6;
      } else if (event.date.includes('AD')) {
        return eventYearOriginal <= 60;
      }
    }
    
    // Normal filtering for other periods
    return eventYear >= endYear && eventYear <= startYear;
  }).slice(0, 8); // Limit to 8 events per period

  const allParticipants = new Set<string>();
  periodEvents.forEach(event => {
    event.participants.forEach(p => allParticipants.add(p));
  });

  const relevantRegions = regions.filter(region => {
    // Check if region's date range overlaps with period
    const regionDates = region.estimated_dates.toLowerCase();
    
    // For New Testament period, specifically include NT regions
    if (period.dateRange === "6 BC-60 AD") {
      return regionDates.includes('ad') || 
             regionDates.includes('testament') ||
             region.time_period.toLowerCase().includes('testament') ||
             region.notable_people.some(personId => 
               ['JESUS', 'PETER', 'PAUL', 'JOHN_THE_APOSTLE', 'MARY_MOTHER_OF_JESUS'].includes(personId)
             );
    }
    
    // Check if any participants from period events are notable people in this region
    return periodEvents.some(event => 
      region.notable_people.some(personId => event.participants.includes(personId)) ||
      event.location === region.id
    );
  }).slice(0, 3);

  // Handle scrolling for linked periods, events, and regions
  useEffect(() => {
    const targetPeriod = searchParams.get('period');
    const targetEvent = searchParams.get('event');
    const targetRegion = searchParams.get('region');

    // Scroll to period
    if (targetPeriod === periodSlug) {
      setTimeout(() => {
        const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }

    // Scroll to event
    if (targetEvent && periodEvents.some(event => event.id === targetEvent)) {
      setTimeout(() => {
        const element = document.querySelector(`[data-event-id="${targetEvent}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

    // Scroll to region
    if (targetRegion && relevantRegions.some(region => region.id === targetRegion)) {
      setTimeout(() => {
        const element = document.querySelector(`[data-region-id="${targetRegion}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams, periodSlug, periodEvents, relevantRegions]);

  return (
    <div className={`p-6 rounded-lg border-2 ${period.color} shadow-lg mb-8`} data-period-id={periodSlug}>
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          <button
            className="text-left hover:text-blue-600 hover:underline cursor-pointer"
            onClick={() => {
              const newSearchParams = new URLSearchParams(searchParams);
              const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
              newSearchParams.set('period', periodSlug);
              router.push(`/?${newSearchParams.toString()}`, { scroll: false });
              
              // Scroll to top of this period
              setTimeout(() => {
                const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 100);
            }}
          >
            {period.name}
          </button>
        </h3>
        <p className="text-lg font-semibold text-gray-700 mb-2">{period.dateRange}</p>
        <p className="text-gray-600 mb-4">{period.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Column */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3 text-lg">📅 Key Events</h4>
          <div className="space-y-3">
            {periodEvents.map((event) => (
              <div key={event.id} className="bg-white bg-opacity-80 rounded-lg p-3 border border-gray-200" data-event-id={event.id}>
                <h5 className="font-semibold text-gray-800 text-sm mb-1">
                  <button
                    className="text-left hover:text-blue-600 hover:underline cursor-pointer"
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('event', event.id);
                      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                      
                      // Scroll to this event
                      setTimeout(() => {
                        const element = document.querySelector(`[data-event-id="${event.id}"]`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }}
                  >
                    {event.name}
                  </button>
                </h5>
                <p className="text-xs text-gray-600 mb-2">{event.date}</p>
                <p className="text-xs text-gray-700 mb-2">{event.description}</p>
                {event.references && event.references.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">References: </span>
                    {event.references.slice(0, 2).map((ref, refIndex) => (
                      <span key={refIndex}>
                        <a 
                          href={getBibleUrl(ref)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          {ref.replace('.KJV', '')}
                        </a>
                        {refIndex < event.references.slice(0, 2).length - 1 && ', '}
                      </span>
                    ))}
                    {event.references.length > 2 && (
                      <span className="text-xs text-gray-500"> +{event.references.length - 2} more</span>
                    )}
                  </div>
                )}
                {event.participants.length > 0 && (
                  <div className="flex flex-wrap">
                    {event.participants.slice(0, 3).map(participantId => {
                      const person = getPersonById(participantId);
                      return person ? (
                        <div key={participantId} className="transform scale-75 -ml-1">
                          <PersonCard person={person} allPersons={allPersons} searchParams={searchParams} router={router} />
                        </div>
                      ) : null;
                    })}
                    {event.participants.length > 3 && (
                      <span className="text-xs text-gray-500 ml-1">+{event.participants.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* People Column */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3 text-lg">👥 Key Figures</h4>
          <div className="bg-white bg-opacity-80 rounded-lg p-3 border border-gray-200">
            <div className="space-y-2">
              {Array.from(allParticipants).slice(0, 12).map(participantId => {
                const person = getPersonById(participantId);
                return person ? (
                  <PersonCard key={participantId} person={person} allPersons={allPersons} searchParams={searchParams} router={router} />
                ) : null;
              })}
              {allParticipants.size > 12 && (
                <p className="text-xs text-gray-500 mt-2">+{allParticipants.size - 12} more people</p>
              )}
            </div>
          </div>
        </div>

        {/* Regions Column */}
        <div>
          <h4 className="font-bold text-gray-800 mb-3 text-lg">🗺️ Regions</h4>
          <div className="space-y-3">
            {relevantRegions.map(region => (
              <div key={region.id} className="bg-white bg-opacity-80 rounded-lg p-3 border border-gray-200" data-region-id={region.id}>
                <h5 className="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
                  <button
                    className="text-left hover:text-blue-600 hover:underline cursor-pointer"
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('region', region.id);
                      router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                      
                      // Scroll to this region
                      setTimeout(() => {
                        const element = document.querySelector(`[data-region-id="${region.id}"]`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }, 100);
                    }}
                  >
                    {region.name}
                  </button>
                  <a 
                    href={getRegionStudyUrl(region.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs"
                    title="Study this region in the Bible"
                  >
                    📖
                  </a>
                </h5>
                <p className="text-xs text-gray-600 mb-1">{region.location}</p>
                <p className="text-xs text-gray-700 mb-2">{region.description}</p>
                {region.notable_people.length > 0 && (
                  <div className="flex flex-wrap">
                    {region.notable_people.slice(0, 3).map(personId => {
                      const person = getPersonById(personId);
                      return person ? (
                        <div key={personId} className="transform scale-75 -ml-1">
                          <PersonCard person={person} allPersons={allPersons} searchParams={searchParams} router={router} />
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BiblicalTimeline({ 
  events, 
  persons, 
  regions 
}: { 
  events: BiblicalEvent[];
  persons: BiblicalPerson[];
  regions: BiblicalRegion[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getPersonById = (id: string) => persons.find(p => p.id === id);

  const timelinePeriods = [
    {
      name: "Creation & Pre-Flood Era",
      dateRange: "4004-2348 BC",
      color: "bg-green-100 border-green-400",
      description: "From the creation of the world to Noah's flood, spanning approximately 1,656 years"
    },
    {
      name: "Post-Flood & Patriarchs",
      dateRange: "2348-1805 BC", 
      color: "bg-blue-100 border-blue-400",
      description: "From Noah's family repopulating the earth to the death of Joseph in Egypt"
    },
    {
      name: "Egyptian Bondage",
      dateRange: "1804-1491 BC",
      color: "bg-yellow-100 border-yellow-400", 
      description: "Israel's 400+ years of slavery in Egypt until the Exodus under Moses"
    },
    {
      name: "Wilderness & Conquest",
      dateRange: "1491-1427 BC",
      color: "bg-orange-100 border-orange-400",
      description: "40 years in wilderness and conquest of the Promised Land under Joshua"
    },
    {
      name: "Judges Period", 
      dateRange: "1427-1043 BC",
      color: "bg-purple-100 border-purple-400",
      description: "Cycles of sin, oppression, and deliverance through judges like Gideon and Samson"
    },
    {
      name: "United Kingdom",
      dateRange: "1043-930 BC", 
      color: "bg-red-100 border-red-400",
      description: "Israel united under kings Saul, David, and Solomon; temple built"
    },
    {
      name: "Divided Kingdom",
      dateRange: "930-586 BC",
      color: "bg-pink-100 border-pink-400", 
      description: "Kingdom splits into Israel and Judah; prophets warn of judgment"
    },
    {
      name: "Exile & Return",
      dateRange: "586-430 BC",
      color: "bg-indigo-100 border-indigo-400",
      description: "Babylonian exile, return under Cyrus, temple rebuilt, walls restored"
    },
    {
      name: "Intertestamental Period",
      dateRange: "430-6 BC", 
      color: "bg-gray-100 border-gray-400",
      description: "400 years of prophetic silence; Greek and Roman influence"
    },
    {
      name: "New Testament Era",
      dateRange: "6 BC-60 AD",
      color: "bg-emerald-100 border-emerald-400", 
      description: "Birth, life, death, and resurrection of Jesus; early church established"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Biblical Timeline</h1>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
          A comprehensive journey through biblical history, from Creation to the early church, 
          showcasing key events, influential people, and significant locations that shaped God&apos;s plan for humanity.
        </p>
      </div>

      {/* Timeline Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Timeline Overview</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {timelinePeriods.map((period, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full border-2 ${period.color} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => {
                const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('period', periodSlug);
                router.push(`/?${newSearchParams.toString()}`, { scroll: false });
                
                // Scroll to the period
                setTimeout(() => {
                  const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }, 100);
              }}
            >
              <div className="text-center">
                <div className="font-semibold text-sm text-gray-800">{period.name}</div>
                <div className="text-xs text-gray-600">{period.dateRange}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            <strong>Total Events:</strong> {events.length} | 
            <strong> People:</strong> {persons.length} | 
            <strong> Regions:</strong> {regions.length}
          </p>
        </div>
      </div>

      {/* Color Legend */}
      <div className="bg-white rounded-xl p-6 mb-12 border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">Person Color Guide</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Divine</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple-200 border border-purple-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Patriarchs</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-200 border border-red-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Kings</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-200 border border-green-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Prophets</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-indigo-200 border border-indigo-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Apostles</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-pink-200 border border-pink-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Women</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded mr-2"></div>
            <span className="text-sm text-gray-700">Other Men</span>
          </div>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs text-gray-600">
          <div className="flex items-center">
            <span className="text-orange-600 mr-1">⭐</span>
            <span>Created by God</span>
          </div>
          <div className="flex items-center">
            <span className="text-cyan-600 mr-1">↗️</span>
            <span>Translated (taken up)</span>
          </div>
        </div>
      </div>

      {/* Main Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-green-400 via-blue-400 via-yellow-400 via-purple-400 via-red-400 to-emerald-400"></div>
        
        {timelinePeriods.map((period, index) => (
          <div key={index} className="relative mb-16">
            {/* Timeline dot */}
            <div className="absolute left-6 w-5 h-5 bg-white border-4 border-gray-600 rounded-full z-10 shadow-lg"></div>
            
            {/* Content */}
            <div className="ml-20">
              <TimelinePeriodCard
                period={period}
                events={events}
                regions={regions}
                getPersonById={getPersonById}
                allPersons={persons}
                searchParams={searchParams}
                router={router}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary Statistics */}
      <div className="mt-16 bg-gray-50 rounded-xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Biblical History Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{events.length}</div>
            <div className="text-gray-700 font-medium">Major Events</div>
            <div className="text-sm text-gray-500 mt-1">From Creation to Early Church</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">{persons.length}</div>
            <div className="text-gray-700 font-medium">Biblical Figures</div>
            <div className="text-sm text-gray-500 mt-1">Patriarchs, Kings, Prophets, Apostles</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{regions.length}</div>
            <div className="text-gray-700 font-medium">Geographic Regions</div>
            <div className="text-sm text-gray-500 mt-1">From Eden to Roman Empire</div>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-gray-600 text-lg">
            <strong>Total Timespan:</strong> Approximately 4,000+ years of biblical history
          </p>
        </div>
      </div>
    </div>
  );
}