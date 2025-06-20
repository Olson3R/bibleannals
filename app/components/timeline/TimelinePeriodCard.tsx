// Timeline period card component showing events, people, and regions for each period

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLink } from '../ui';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod } from '../../types/biblical';
import { getRegionStudyUrl, isElementVisible, scrollToElementWithOffset } from '../../utils';
import { getPeriodColors } from '../../utils/color-palette';
import { isWithinDateRange, parseDate } from '../../utils/date-parsing';
import { isRelevantToPeriod, getCombinedRelevance } from '../../utils/period-relevance';


function PersonCard({ person, periodSlug, allPeriods }: { person: BiblicalPerson; periodSlug?: string; allPeriods?: TimelinePeriod[] }) {
  const getColorScheme = (person: BiblicalPerson) => {
    if (['GOD_FATHER', 'JESUS'].includes(person.id)) {
      return { bg: 'bg-yellow-200 dark:bg-yellow-900/30', border: 'border-yellow-400 dark:border-yellow-600', text: 'text-yellow-800 dark:text-yellow-200' };
    }
    if (['ABRAHAM', 'ISAAC', 'JACOB'].includes(person.id)) {
      return { bg: 'bg-purple-200 dark:bg-purple-900/30', border: 'border-purple-400 dark:border-purple-600', text: 'text-purple-800 dark:text-purple-200' };
    }
    if (['DAVID', 'SOLOMON'].includes(person.id) || person.name.includes('King')) {
      return { bg: 'bg-red-200 dark:bg-red-900/30', border: 'border-red-400 dark:border-red-600', text: 'text-red-800 dark:text-red-200' };
    }
    if (['MOSES', 'ELIJAH', 'ELISHA', 'ISAIAH', 'JEREMIAH', 'DANIEL'].includes(person.id)) {
      return { bg: 'bg-green-200 dark:bg-green-900/30', border: 'border-green-400 dark:border-green-600', text: 'text-green-800 dark:text-green-200' };
    }
    if (person.id.includes('APOSTLE') || ['PETER', 'PAUL', 'JOHN_THE_APOSTLE'].includes(person.id)) {
      return { bg: 'bg-indigo-200 dark:bg-indigo-900/30', border: 'border-indigo-400 dark:border-indigo-600', text: 'text-indigo-800 dark:text-indigo-200' };
    }
    if (person.gender === 'female') {
      return { bg: 'bg-pink-200 dark:bg-pink-900/30', border: 'border-pink-400 dark:border-pink-600', text: 'text-pink-800 dark:text-pink-200' };
    }
    return { bg: 'bg-blue-200 dark:bg-blue-900/30', border: 'border-blue-400 dark:border-blue-600', text: 'text-blue-800 dark:text-blue-200' };
  };
  
  const colors = getColorScheme(person);
  
  // Get relevance info for this person in current period
  const relevanceInfo = allPeriods && periodSlug ? 
    getCombinedRelevance(person, allPeriods).find(rel => rel.period === periodSlug) : null;
  
  const getRelevanceIndicator = () => {
    if (!relevanceInfo) return null;
    
    if (relevanceInfo.relevance >= 0.8) return '🔥'; // High relevance
    if (relevanceInfo.relevance >= 0.6) return '⭐'; // Medium relevance
    if (relevanceInfo.relevance >= 0.4) return '🔸'; // Lower relevance
    return '▫️'; // Minimal relevance
  };
  
  return (
    <NavLink 
      href={`/people/${person.id}?from=timeline&period=${periodSlug || ''}`}
      className={`inline-block px-2 py-1 rounded border cursor-pointer transition-all duration-200 hover:shadow-sm text-xs ${colors.bg} ${colors.border} ${colors.text}`}
      data-person-id={person.id}
    >
      <div className="flex items-center gap-1">
        <span className="font-medium">{person.name}</span>
        {person.created && <span className="text-orange-600 dark:text-orange-400" title="Created by God">⭐</span>}
        {person.translated && <span className="text-cyan-600 dark:text-cyan-400" title="Translated (taken up without death)">↗️</span>}
        {getRelevanceIndicator() && (
          <span 
            title={relevanceInfo ? `${relevanceInfo.reason.replace('-', ' ')} (${Math.round(relevanceInfo.relevance * 100)}% relevance)` : ''}
          >
            {getRelevanceIndicator()}
          </span>
        )}
      </div>
    </NavLink>
  );
}

interface TimelinePeriodCardProps {
  period: TimelinePeriod;
  events: BiblicalEvent[];
  regions: BiblicalRegion[];
  allPeriods: TimelinePeriod[];
  persons: BiblicalPerson[];
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
  matchesPersonTypeFilter?: (person: BiblicalPerson) => boolean;
  matchesEventTypeFilter?: (event: BiblicalEvent) => boolean;
  matchesLocationFilter?: (event: BiblicalEvent) => boolean;
  matchesTagFilter?: (item: BiblicalPerson | BiblicalEvent) => boolean;
  advancedFilters?: {
    personTypes: string[];
    eventTypes: string[];
    locations: string[];
    tags: string[];
  };
}

// Helper function to check if a period has any displayable content after filtering
export function hasDisplayableContent(
  period: TimelinePeriod,
  events: BiblicalEvent[],
  regions: BiblicalRegion[],
  allPeriods: TimelinePeriod[],
  persons: BiblicalPerson[],
  getPersonById: (id: string) => BiblicalPerson | undefined,
  showEvents: boolean,
  showPeople: boolean,
  showRegions: boolean,
  minYear?: number | null,
  maxYear?: number | null,
  matchesPersonTypeFilter?: (person: BiblicalPerson) => boolean,
  matchesEventTypeFilter?: (event: BiblicalEvent) => boolean,
  matchesLocationFilter?: (event: BiblicalEvent) => boolean,
  matchesTagFilter?: (item: BiblicalPerson | BiblicalEvent) => boolean
): boolean {
  // Apply the same filtering logic as in TimelinePeriodCard
  const periodEvents = events.filter(event => {
    // Check if event is relevant to this specific period using period relevance
    if (!isRelevantToPeriod(event, period.slug, allPeriods, 0.3)) {
      return false;
    }
    
    // Apply date range filter
    if (minYear !== null || maxYear !== null) {
      if (!isWithinDateRange(event.date, minYear ?? null, maxYear ?? null)) {
        return false;
      }
    }
    
    // Apply advanced filters
    if (matchesEventTypeFilter && !matchesEventTypeFilter(event)) {
      return false;
    }
    
    if (matchesLocationFilter && !matchesLocationFilter(event)) {
      return false;
    }
    
    if (matchesTagFilter && !matchesTagFilter(event)) {
      return false;
    }
    
    return true;
  });

  // Check if we have events to show
  if (showEvents && periodEvents.length > 0) {
    return true;
  }

  // Check if we have people to show (check ALL people relevant to period, not just event participants)
  if (showPeople) {
    // Check if any people are directly relevant to this period (primary check)
    const hasRelevantPeople = persons.some(person => {
      const hasDateInfo = person.birth_date || person.death_date;
      
      let isRelevant = false;
      if (hasDateInfo) {
        isRelevant = isRelevantToPeriod(person, period.slug, allPeriods, 0.05); // Very low threshold
      } else {
        // For undated people, include them more broadly
        isRelevant = periodEvents.some(event => event.participants.includes(person.id)) ||
                    (person.additional_relevance && person.additional_relevance.some(rel => rel.period === period.slug)) ||
                    ['GOD_FATHER', 'JESUS', 'HOLY_SPIRIT', 'ADAM', 'EVE', 'NOAH', 'ABRAHAM', 'ISAAC', 'JACOB', 'MOSES', 'DAVID', 'SOLOMON'].includes(person.id);
      }
      
      if (!isRelevant) {
        return false;
      }
      
      // Apply date range filter (only for people with dates)
      if (hasDateInfo && (minYear !== null || maxYear !== null)) {
        if (!isWithinDateRange(person.birth_date || person.death_date || '', minYear ?? null, maxYear ?? null)) {
          return false;
        }
      }
      
      // Apply person type and tag filters
      return (matchesPersonTypeFilter ? matchesPersonTypeFilter(person) : true) && 
             (matchesTagFilter ? matchesTagFilter(person) : true);
    });
    
    if (hasRelevantPeople) {
      return true;
    }
  }

  // Check if we have regions to show
  if (showRegions) {
    const hasRelevantRegions = regions.some(region => {
      const regionDates = region.estimated_dates.toLowerCase();
      
      if (period.dateRange === "6 BC-60 AD") {
        return regionDates.includes('ad') || 
               regionDates.includes('testament') ||
               region.time_period.toLowerCase().includes('testament') ||
               region.notable_people.some(personId => 
                 ['JESUS', 'PETER', 'PAUL', 'JOHN_THE_APOSTLE', 'MARY_MOTHER_OF_JESUS'].includes(personId)
               );
      }
      
      return periodEvents.some(event => 
        region.notable_people.some(personId => event.participants.includes(personId)) ||
        event.location === region.id
      );
    });
    
    if (hasRelevantRegions) {
      return true;
    }
  }

  return false;
}

export function TimelinePeriodCard({
  period,
  events,
  regions,
  allPeriods,
  persons,
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
  maxYear,
  matchesPersonTypeFilter,
  matchesEventTypeFilter,
  matchesLocationFilter,
  matchesTagFilter,
  advancedFilters
}: TimelinePeriodCardProps) {
  const searchParams = useSearchParams();
  const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const filteredPeriodEvents = events.filter(event => {
    // Check if event is relevant to this specific period using period relevance
    if (!isRelevantToPeriod(event, period.slug, allPeriods, 0.3)) {
      return false;
    }
    
    // Then, apply the date range filter if specified
    if (minYear !== null || maxYear !== null) {
      if (!isWithinDateRange(event.date, minYear ?? null, maxYear ?? null)) {
        return false;
      }
    }
    
    // Apply advanced filters
    if (matchesEventTypeFilter && !matchesEventTypeFilter(event)) {
      return false;
    }
    
    if (matchesLocationFilter && !matchesLocationFilter(event)) {
      return false;
    }
    
    if (matchesTagFilter && !matchesTagFilter(event)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort events in ascending chronological order (oldest to newest)
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    
    // Handle null dates by putting them at the end
    if (dateA === null && dateB === null) return 0;
    if (dateA === null) return 1;
    if (dateB === null) return -1;
    
    // Sort by date (ascending: earlier dates first)
    // Note: BC dates are negative, so -4000 BC comes before -3000 BC
    return dateA - dateB;
  });

  // Configuration for entity limits
  const MAX_EVENTS_DISPLAY = 6;
  const MAX_PEOPLE_DISPLAY = 8;
  const MAX_REGIONS_DISPLAY = 3;
  
  // Apply limit only when no advanced filters are active
  // Check if any advanced filters are being applied
  const hasAdvancedFilters = (advancedFilters?.personTypes.length ?? 0) > 0 ||
                            (advancedFilters?.eventTypes.length ?? 0) > 0 ||
                            (advancedFilters?.locations.length ?? 0) > 0 ||
                            (advancedFilters?.tags.length ?? 0) > 0 ||
                            minYear !== null || maxYear !== null;
  
  const periodEvents = hasAdvancedFilters ? filteredPeriodEvents : filteredPeriodEvents.slice(0, MAX_EVENTS_DISPLAY);

  // Get ALL participants from all events in this period (for filtering and counting)
  const allPeriodEvents = events.filter(event => {
    // Check if event is relevant to this specific period using period relevance
    if (!isRelevantToPeriod(event, period.slug, allPeriods, 0.3)) {
      return false;
    }
    
    // Apply date range filter
    if (minYear !== null || maxYear !== null) {
      if (!isWithinDateRange(event.date, minYear ?? null, maxYear ?? null)) {
        return false;
      }
    }
    
    // Apply advanced filters
    if (matchesEventTypeFilter && !matchesEventTypeFilter(event)) {
      return false;
    }
    
    if (matchesLocationFilter && !matchesLocationFilter(event)) {
      return false;
    }
    
    if (matchesTagFilter && !matchesTagFilter(event)) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sort events in ascending chronological order (oldest to newest)
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    
    // Handle null dates by putting them at the end
    if (dateA === null && dateB === null) return 0;
    if (dateA === null) return 1;
    if (dateB === null) return -1;
    
    // Sort by date (ascending: earlier dates first)
    return dateA - dateB;
  });
  
  // Get ALL relevant people with relevance scoring for sorting
  const allRelevantPeople: Array<{id: string, relevance: number, date: number | null}> = [];
  
  // Add event participants
  allPeriodEvents.forEach(event => {
    event.participants.forEach(p => {
      const person = getPersonById(p);
      if (person && (matchesPersonTypeFilter ? matchesPersonTypeFilter(person) : true) && (matchesTagFilter ? matchesTagFilter(person) : true)) {
        // Check if already added
        const existing = allRelevantPeople.find(rp => rp.id === p);
        if (!existing) {
          const relevanceInfo = getCombinedRelevance(person, allPeriods).find(rel => rel.period === period.slug);
          const relevanceScore = relevanceInfo?.relevance || 0.5; // Default relevance for event participants
          const dateValue = parseDate(person.birth_date || person.death_date || '');
          allRelevantPeople.push({ id: p, relevance: relevanceScore, date: dateValue });
        }
      }
    });
  });
  
  // Also add people who are directly relevant to this period (not just event participants)
  persons.forEach(person => {
    // Check if already added as event participant
    if (allRelevantPeople.some(rp => rp.id === person.id)) {
      return;
    }
    
    // Check if person has any date information
    const hasDateInfo = person.birth_date || person.death_date;
    
    // For people with dates, use period relevance with very low threshold
    // For people without dates, include them more broadly
    let isRelevant = false;
    if (hasDateInfo) {
      isRelevant = isRelevantToPeriod(person, period.slug, allPeriods, 0.05); // Very low threshold
    } else {
      // For undated people, include them if they:
      // 1. Participate in any events in this period, OR
      // 2. Have any manual period relevance defined, OR
      // 3. Are key biblical figures (God, Jesus, major prophets, etc.)
      isRelevant = allPeriodEvents.some(event => event.participants.includes(person.id)) ||
                   (person.additional_relevance && person.additional_relevance.some(rel => rel.period === period.slug)) ||
                   ['GOD_FATHER', 'JESUS', 'HOLY_SPIRIT', 'ADAM', 'EVE', 'NOAH', 'ABRAHAM', 'ISAAC', 'JACOB', 'MOSES', 'DAVID', 'SOLOMON'].includes(person.id);
    }
    
    if (!isRelevant) {
      return;
    }
    
    // Apply date range filter (only for people with dates)
    if (hasDateInfo && (minYear !== null || maxYear !== null)) {
      if (!isWithinDateRange(person.birth_date || person.death_date || '', minYear ?? null, maxYear ?? null)) {
        return;
      }
    }
    
    // Apply person type and tag filters
    if ((matchesPersonTypeFilter ? matchesPersonTypeFilter(person) : true) && 
        (matchesTagFilter ? matchesTagFilter(person) : true)) {
      const relevanceInfo = getCombinedRelevance(person, allPeriods).find(rel => rel.period === period.slug);
      const relevanceScore = relevanceInfo?.relevance || 0.1; // Lower default for non-participants
      const dateValue = parseDate(person.birth_date || person.death_date || '');
      allRelevantPeople.push({ id: person.id, relevance: relevanceScore, date: dateValue });
    }
  });
  
  // Sort people by relevance (desc) then by date (asc)
  const sortedRelevantPeople = allRelevantPeople.sort((a, b) => {
    // First sort by relevance (higher relevance first)
    if (b.relevance !== a.relevance) {
      return b.relevance - a.relevance;
    }
    
    // Then sort by date (ascending: earlier dates first)
    if (a.date === null && b.date === null) return 0;
    if (a.date === null) return 1; // Undated people go last
    if (b.date === null) return -1;
    
    return a.date - b.date;
  });
  
  // Create sets for display and counting
  const allParticipants = new Set(allRelevantPeople.map(p => p.id));
  const displayedParticipants = hasAdvancedFilters ? 
    sortedRelevantPeople.map(p => p.id) : 
    sortedRelevantPeople.slice(0, MAX_PEOPLE_DISPLAY).map(p => p.id);

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

  // Sort regions by relevance and date, then slice for display
  const sortedRelevantRegions = allRelevantRegions.sort((a, b) => {
    // Sort by estimated date (ascending)
    const dateA = parseDate(a.estimated_dates);
    const dateB = parseDate(b.estimated_dates);
    
    if (dateA === null && dateB === null) return 0;
    if (dateA === null) return 1;
    if (dateB === null) return -1;
    
    return dateA - dateB;
  });
  
  const relevantRegions = hasAdvancedFilters ? sortedRelevantRegions : sortedRelevantRegions.slice(0, MAX_REGIONS_DISPLAY);

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
    <div className={`rounded-lg border ${getPeriodColors(period.colorIndex)} shadow-md mb-4`} data-period-id={periodSlug} id={`period-${periodSlug}`}>
      {/* Compact Period Header */}
      <div className="sticky top-[120px] lg:top-[180px] z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <div className={`px-4 py-2 ${getPeriodColors(period.colorIndex)} rounded-t-lg relative group`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                <NavLink
                  href={`/periods/${periodSlug}`}
                  className="text-left hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
                >
                  {period.name}
                </NavLink>
              </h3>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{period.dateRange}</p>
            </div>
            
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
              className="w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              title="Copy link to this period on timeline"
            >
              🔗
            </button>
          </div>
        </div>
      </div>
      
      {/* Compact Period Content */}
      <div className="px-4 py-3">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{period.description}</p>

        <div className="space-y-3">{/* Changed from grid to vertical stacking for more compact layout */}
          {/* Events Section - Compact Horizontal Layout */}
          {showEvents && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">📅 Events ({periodEvents.length})</h4>
                {allPeriodEvents.length > MAX_EVENTS_DISPLAY && (
                  <button
                    onClick={() => showPeriodEvents(period.name)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allPeriodEvents.length} →
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {periodEvents.map((event) => {
                  const selectedEventId = searchParams.get('selected')?.split(':')[1];
                  const isEventSelected = selectedEventId === event.id;
                  return (
                    <div key={event.id} className={`rounded-md p-2 border text-xs transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      isEventSelected 
                        ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-500 text-green-800 dark:text-green-200' 
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`} data-event-id={event.id} onClick={() => onEventClick(event, periodSlug)}>
                      <div className={`font-medium mb-1 ${
                        isEventSelected ? 'text-green-800 dark:text-green-200' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {event.name}
                      </div>
                      <div className={`text-xs opacity-75 ${
                        isEventSelected ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {event.date}
                      </div>
                      {event.participants.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {event.participants.slice(0, 2).map(participantId => {
                            const person = getPersonById(participantId);
                            return person ? (
                              <span key={participantId} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                                {person.name}
                              </span>
                            ) : null;
                          })}
                          {event.participants.length > 2 && (
                            <span className="text-xs opacity-75">+{event.participants.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* People Section - Compact */}
          {showPeople && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">👥 People ({allParticipants.size})</h4>
                {allParticipants.size > MAX_PEOPLE_DISPLAY && (
                  <button
                    onClick={() => showPeriodPeople(period.name)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allParticipants.size} →
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {displayedParticipants.map(participantId => {
                  const person = getPersonById(participantId);
                  return person ? (
                    <PersonCard key={participantId} person={person} periodSlug={periodSlug} allPeriods={allPeriods} />
                  ) : null;
                })}
                {!hasAdvancedFilters && allParticipants.size > MAX_PEOPLE_DISPLAY && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 self-center ml-1">+{allParticipants.size - MAX_PEOPLE_DISPLAY} more</span>
                )}
              </div>
            </div>
          )}

          {/* Regions Section - Compact */}
          {showRegions && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">🗺️ Regions ({allRelevantRegions.length})</h4>
                {allRelevantRegions.length > MAX_REGIONS_DISPLAY && (
                  <button
                    onClick={() => showPeriodRegions(period.name)}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allRelevantRegions.length} →
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {relevantRegions.map(region => {
                  const selectedRegionId = searchParams.get('selected')?.split(':')[1];
                  const isRegionSelected = selectedRegionId === region.id;
                  return (
                    <div key={region.id} className={`rounded-md p-2 border text-xs transition-all duration-200 cursor-pointer hover:shadow-sm ${
                      isRegionSelected 
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-400 dark:border-purple-500 text-purple-800 dark:text-purple-200' 
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`} data-region-id={region.id} onClick={() => onRegionClick(region, periodSlug)}>
                      <div className={`font-medium mb-1 flex items-center gap-1 ${
                        isRegionSelected ? 'text-purple-800 dark:text-purple-200' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        {region.name}
                        <a 
                          href={getRegionStudyUrl(region.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="Study this region in the Bible"
                          onClick={(e) => e.stopPropagation()}
                        >
                          📖
                        </a>
                      </div>
                      <div className={`text-xs opacity-75 ${
                        isRegionSelected ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {region.location}
                      </div>
                      {region.notable_people.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {region.notable_people.slice(0, 2).map(personId => {
                            const person = getPersonById(personId);
                            return person ? (
                              <span key={personId} className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">
                                {person.name}
                              </span>
                            ) : null;
                          })}
                          {region.notable_people.length > 2 && (
                            <span className="text-xs opacity-75">+{region.notable_people.length - 2}</span>
                          )}
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