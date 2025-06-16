// Timeline period card component showing events, people, and regions for each period

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLink } from '../ui';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod } from '../../types/biblical';
import { getBibleUrl, getRegionStudyUrl, isElementVisible, scrollToElementWithOffset } from '../../utils';
import { isWithinDateRange } from '../../utils/date-parsing';


function PersonCard({ person, periodSlug }: { person: BiblicalPerson; periodSlug?: string }) {
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
  
  return (
    <div className="inline-block mb-2">
      <NavLink 
        href={`/people/${person.id}?from=timeline&period=${periodSlug || ''}`}
        className={`block px-2 py-1 rounded border cursor-pointer transition-all duration-200 hover:shadow-md text-xs ${colors.bg} ${colors.border}`}
        data-person-id={person.id}
      >
        <div className="flex items-center">
          <span className="font-medium text-gray-800">{person.name}</span>
          {person.created && <span className="ml-1 text-orange-600" title="Created by God">⭐</span>}
          {person.translated && <span className="ml-1 text-cyan-600" title="Translated (taken up without death)">↗️</span>}
        </div>
      </NavLink>
    </div>
  );
}

interface TimelinePeriodCardProps {
  period: TimelinePeriod;
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  getPersonById: (id: string) => BiblicalPerson | undefined;
  showEvents: boolean;
  showPeople: boolean;
  showRegions: boolean;
  onEventClick: (event: BiblicalEvent, periodSlug?: string) => void;
  onRegionClick: (region: BiblicalRegion, periodSlug?: string) => void;
  showPeriodEvents: (periodName: string) => void;
  showPeriodPeople: (periodName: string) => void;
  showPeriodRegions: (periodName: string) => void;
  minYear?: number | null;
  maxYear?: number | null;
}

export function TimelinePeriodCard({
  period,
  events,
  regions,
  getPersonById,
  showEvents,
  showPeople,
  showRegions,
  onEventClick,
  onRegionClick,
  showPeriodEvents,
  showPeriodPeople,
  showPeriodRegions,
  minYear,
  maxYear
}: TimelinePeriodCardProps) {
  const searchParams = useSearchParams();
  const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const periodEvents = events.filter(event => {
    // First, check if event belongs to this period
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
    
    let belongsToPeriod = false;
    
    // For periods spanning BC to AD, we need special handling
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        belongsToPeriod = eventYearOriginal <= 6;
      } else if (event.date.includes('AD')) {
        belongsToPeriod = eventYearOriginal <= 60;
      }
    } else {
      // Normal filtering for other periods
      belongsToPeriod = eventYear >= endYear && eventYear <= startYear;
    }
    
    // If event doesn't belong to this period, exclude it
    if (!belongsToPeriod) return false;
    
    // Then, apply the date range filter if specified
    if (minYear !== null || maxYear !== null) {
      return isWithinDateRange(event.date, minYear ?? null, maxYear ?? null);
    }
    
    return true;
  }).slice(0, 8); // Limit to 8 events per period

  // Get ALL participants from all events in this period (not just the first 8 displayed)
  const allPeriodEvents = events.filter(event => {
    // Same filtering logic as above but for all events
    let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
    const isAD = event.date.includes('AD');
    if (isAD) eventYear = -eventYear;
    
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    if (startStr.includes('BC')) startYear = Math.abs(startYear);
    if (endStr.includes('BC')) endYear = Math.abs(endYear);
    if (startStr.includes('AD')) startYear = -Math.abs(startYear);
    if (endStr.includes('AD')) endYear = -Math.abs(endYear);
    
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        return eventYearOriginal <= 6;
      } else if (event.date.includes('AD')) {
        return eventYearOriginal <= 60;
      }
    }
    
    return eventYear >= endYear && eventYear <= startYear;
  });
  
  const allParticipants = new Set<string>();
  allPeriodEvents.forEach(event => {
    event.participants.forEach(p => allParticipants.add(p));
  });

  // Calculate ALL relevant regions first (for accurate count)
  const allRelevantRegions = regions.filter(region => {
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
  });

  // Then slice only for display (first 3)
  const relevantRegions = allRelevantRegions.slice(0, 3);

  // Handle scrolling for linked periods, events, and regions
  useEffect(() => {
    const selected = searchParams.get('selected');
    const targetEvent = searchParams.get('event');
    const targetRegion = searchParams.get('region');

    // Check if this period is selected and scroll to it if not visible
    if (selected && selected.startsWith('period:') && selected === `period:${periodSlug}`) {
      setTimeout(() => {
        const element = document.querySelector(`[data-period-id="${periodSlug}"]`);
        if (element && !isElementVisible(element)) {
          scrollToElementWithOffset(element, 180, 0);
        }
      }, 300);
    }

    // Scroll to event only if not visible
    if (targetEvent && periodEvents.some(event => event.id === targetEvent)) {
      setTimeout(() => {
        const element = document.querySelector(`[data-event-id="${targetEvent}"]`);
        if (element && !isElementVisible(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }

    // Scroll to region only if not visible
    if (targetRegion && relevantRegions.some(region => region.id === targetRegion)) {
      setTimeout(() => {
        const element = document.querySelector(`[data-region-id="${targetRegion}"]`);
        if (element && !isElementVisible(element)) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [searchParams, periodSlug, periodEvents, relevantRegions]);

  return (
    <div className={`rounded-lg border-2 ${period.color} shadow-lg mb-8`} data-period-id={periodSlug} id={`period-${periodSlug}`}>
      {/* Sticky Period Header */}
      <div className="sticky top-[120px] lg:top-[180px] z-20 bg-white border-b-2 border-gray-200 rounded-t-lg">
        <div className={`p-4 ${period.color} rounded-t-lg relative group`}>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            <NavLink
              href={`/periods/${periodSlug}`}
              className="text-left hover:text-blue-600 hover:underline cursor-pointer"
            >
              {period.name}
            </NavLink>
          </h3>
          <p className="text-lg font-semibold text-gray-700">{period.dateRange}</p>
          
          {/* Copy Link Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              const url = `${window.location.origin}/#period-${periodSlug}`;
              navigator.clipboard.writeText(url);
              
              // Show temporary feedback
              const button = e.currentTarget as HTMLButtonElement;
              const originalText = button.innerHTML;
              button.innerHTML = '✓';
              button.classList.add('bg-green-100', 'text-green-600');
              setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('bg-green-100', 'text-green-600');
              }, 1000);
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800"
            title="Copy link to this period on timeline"
          >
            🔗
          </button>
        </div>
      </div>
      
      {/* Period Content */}
      <div className="p-6">
        <p className="text-gray-600 mb-4">{period.description}</p>

        <div className={`grid grid-cols-1 gap-6 ${
          [showEvents, showPeople, showRegions].filter(Boolean).length === 3 ? 'lg:grid-cols-3' :
          [showEvents, showPeople, showRegions].filter(Boolean).length === 2 ? 'lg:grid-cols-2' :
          'lg:grid-cols-1'
        }`}>
          {/* Events Column */}
          {showEvents && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 text-lg">📅 Key Events</h4>
                {allPeriodEvents.length > 3 && (
                  <button
                    onClick={() => showPeriodEvents(period.name)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allPeriodEvents.length} events →
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {periodEvents.map((event) => {
                  const selectedEventId = searchParams.get('selected')?.split(':')[1];
                  const isEventSelected = selectedEventId === event.id;
                  return (
                    <div key={event.id} className={`rounded-lg p-3 border transition-all duration-200 ${
                      isEventSelected 
                        ? 'bg-green-50 border-green-500 shadow-lg ring-2 ring-green-300' 
                        : 'bg-white bg-opacity-80 border-gray-200'
                    }`} data-event-id={event.id}>
                      <h5 className={`font-semibold text-sm mb-1 ${
                        isEventSelected ? 'text-green-900' : 'text-gray-800'
                      }`}>
                        <button
                          className={`text-left hover:underline cursor-pointer ${
                            isEventSelected ? 'text-green-900 hover:text-green-700' : 'hover:text-blue-600'
                          }`}
                          onClick={() => onEventClick(event, periodSlug)}
                        >
                          {event.name}
                        </button>
                      </h5>
                      <p className={`text-xs mb-2 ${
                        isEventSelected ? 'text-green-700' : 'text-gray-600'
                      }`}>{event.date}</p>
                      <p className={`text-xs mb-2 ${
                        isEventSelected ? 'text-green-800' : 'text-gray-700'
                      }`}>{event.description}</p>
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
                      {showPeople && event.participants.length > 0 && (
                        <div className="flex flex-wrap">
                          {event.participants.slice(0, 3).map(participantId => {
                            const person = getPersonById(participantId);
                            return person ? (
                              <NavLink
                                key={participantId}
                                href={`/people/${person.id}?from=timeline&period=${periodSlug}`}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 hover:bg-blue-200 inline-block"
                              >
                                {person.name}
                              </NavLink>
                            ) : null;
                          })}
                          {event.participants.length > 3 && (
                            <span className="text-xs text-gray-500 ml-1">+{event.participants.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* People Column */}
          {showPeople && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 text-lg">👥 Key Figures</h4>
                {allParticipants.size > 6 && (
                  <button
                    onClick={() => showPeriodPeople(period.name)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allParticipants.size} people →
                  </button>
                )}
              </div>
              <div className="bg-white bg-opacity-80 rounded-lg p-3 border border-gray-200">
                <div className="space-y-2">
                  {Array.from(allParticipants).slice(0, 12).map(participantId => {
                    const person = getPersonById(participantId);
                    return person ? (
                      <PersonCard key={participantId} person={person} periodSlug={periodSlug} />
                    ) : null;
                  })}
                  {allParticipants.size > 12 && (
                    <p className="text-xs text-gray-500 mt-2">+{allParticipants.size - 12} more people</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Regions Column */}
          {showRegions && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 text-lg">🗺️ Regions</h4>
                {allRelevantRegions.length > 3 && (
                  <button
                    onClick={() => showPeriodRegions(period.name)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allRelevantRegions.length} regions →
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {relevantRegions.map(region => {
                  const selectedRegionId = searchParams.get('selected')?.split(':')[1];
                  const isRegionSelected = selectedRegionId === region.id;
                  return (
                    <div key={region.id} className={`rounded-lg p-3 border transition-all duration-200 ${
                      isRegionSelected 
                        ? 'bg-purple-50 border-purple-500 shadow-lg ring-2 ring-purple-300' 
                        : 'bg-white bg-opacity-80 border-gray-200'
                    }`} data-region-id={region.id}>
                      <h5 className={`font-semibold text-sm mb-1 flex items-center gap-2 ${
                        isRegionSelected ? 'text-purple-900' : 'text-gray-800'
                      }`}>
                        <button
                          className={`text-left hover:underline cursor-pointer ${
                            isRegionSelected ? 'text-purple-900 hover:text-purple-700' : 'hover:text-blue-600'
                          }`}
                          onClick={() => onRegionClick(region, periodSlug)}
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
                      <p className={`text-xs mb-1 ${
                        isRegionSelected ? 'text-purple-700' : 'text-gray-600'
                      }`}>{region.location}</p>
                      <p className={`text-xs mb-2 ${
                        isRegionSelected ? 'text-purple-800' : 'text-gray-700'
                      }`}>{region.description}</p>
                      {showPeople && region.notable_people.length > 0 && (
                        <div className="flex flex-wrap">
                          {region.notable_people.slice(0, 3).map(personId => {
                            const person = getPersonById(personId);
                            return person ? (
                              <NavLink
                                key={personId}
                                href={`/people/${person.id}?from=timeline&period=${periodSlug}`}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 hover:bg-blue-200 inline-block"
                              >
                                {person.name}
                              </NavLink>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}