// Timeline period card component showing events, people, and regions for each period

'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavLink } from '../ui';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod } from '../../types/biblical';
import { getBibleUrl, getRegionStudyUrl, isElementVisible, scrollToElementWithOffset } from '../../utils';
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
  const displayTags = person.tags?.filter(tag => tag !== 'biblical').slice(0, 2) || [];
  
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
    <div className="inline-block mb-2">
      <NavLink 
        href={`/people/${person.id}?from=timeline&period=${periodSlug || ''}`}
        className={`block px-2 py-1 rounded border cursor-pointer transition-all duration-200 hover:shadow-md text-xs ${colors.bg} ${colors.border} ${colors.text}`}
        data-person-id={person.id}
      >
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="font-medium">{person.name}</span>
            {person.created && <span className="ml-1 text-orange-600 dark:text-orange-400" title="Created by God">⭐</span>}
            {person.translated && <span className="ml-1 text-cyan-600 dark:text-cyan-400" title="Translated (taken up without death)">↗️</span>}
            {getRelevanceIndicator() && (
              <span 
                className="ml-1" 
                title={relevanceInfo ? `${relevanceInfo.reason.replace('-', ' ')} (${Math.round(relevanceInfo.relevance * 100)}% relevance)` : ''}
              >
                {getRelevanceIndicator()}
              </span>
            )}
          </div>
          {displayTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {displayTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-1 py-0.5 text-xs bg-white bg-opacity-60 dark:bg-black dark:bg-opacity-30 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </NavLink>
    </div>
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
    <div className={`rounded-lg border-2 ${getPeriodColors(period.colorIndex)} shadow-lg mb-8`} data-period-id={periodSlug} id={`period-${periodSlug}`}>
      {/* Sticky Period Header */}
      <div className="sticky top-[120px] lg:top-[180px] z-20 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 rounded-t-lg">
        <div className={`p-4 ${getPeriodColors(period.colorIndex)} rounded-t-lg relative group`}>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            <NavLink
              href={`/periods/${periodSlug}`}
              className="text-left hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer"
            >
              {period.name}
            </NavLink>
          </h3>
          <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">{period.dateRange}</p>
          
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
            className="absolute top-2 right-2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            title="Copy link to this period on timeline"
          >
            🔗
          </button>
        </div>
      </div>
      
      {/* Period Content */}
      <div className="p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-4">{period.description}</p>

        <div className={`grid grid-cols-1 gap-6 ${
          [showEvents, showPeople, showRegions].filter(Boolean).length === 3 ? 'lg:grid-cols-3' :
          [showEvents, showPeople, showRegions].filter(Boolean).length === 2 ? 'lg:grid-cols-2' :
          'lg:grid-cols-1'
        }`}>
          {/* Events Column */}
          {showEvents && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">📅 Key Events</h4>
                {allPeriodEvents.length > MAX_EVENTS_DISPLAY && (
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
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 shadow-lg ring-2 ring-green-300 dark:ring-green-600' 
                        : 'bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-90 border-gray-200 dark:border-gray-600'
                    }`} data-event-id={event.id}>
                      <h5 className={`font-semibold text-sm mb-1 ${
                        isEventSelected ? 'text-green-900 dark:text-green-100' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        <button
                          className={`text-left hover:underline cursor-pointer ${
                            isEventSelected ? 'text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-200' : 'hover:text-blue-600'
                          }`}
                          onClick={() => onEventClick(event, periodSlug)}
                        >
                          {event.name}
                        </button>
                      </h5>
                      <p className={`text-xs mb-2 ${
                        isEventSelected ? 'text-green-700 dark:text-green-200' : 'text-gray-600 dark:text-gray-400'
                      }`}>{event.date}</p>
                      <p className={`text-xs mb-2 ${
                        isEventSelected ? 'text-green-800 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'
                      }`}>{event.description}</p>
                      {event.references && event.references.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">References: </span>
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
                            <span className="text-xs text-gray-500 dark:text-gray-400"> +{event.references.length - 2} more</span>
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
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">+{event.participants.length - 3} more</span>
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
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">👥 Key Figures</h4>
                {allParticipants.size > MAX_PEOPLE_DISPLAY && (
                  <button
                    onClick={() => showPeriodPeople(period.name)}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    View all {allParticipants.size} people →
                  </button>
                )}
              </div>
              <div className="bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-90 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                <div className="space-y-2">
                  {displayedParticipants.map(participantId => {
                    const person = getPersonById(participantId);
                    return person ? (
                      <PersonCard key={participantId} person={person} periodSlug={periodSlug} allPeriods={allPeriods} />
                    ) : null;
                  })}
                  {!hasAdvancedFilters && allParticipants.size > MAX_PEOPLE_DISPLAY && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">+{allParticipants.size - MAX_PEOPLE_DISPLAY} more people</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Regions Column */}
          {showRegions && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">🗺️ Regions</h4>
                {allRelevantRegions.length > MAX_REGIONS_DISPLAY && (
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
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400 shadow-lg ring-2 ring-purple-300 dark:ring-purple-600' 
                        : 'bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-90 border-gray-200 dark:border-gray-600'
                    }`} data-region-id={region.id}>
                      <h5 className={`font-semibold text-sm mb-1 flex items-center gap-2 ${
                        isRegionSelected ? 'text-purple-900 dark:text-purple-100' : 'text-gray-800 dark:text-gray-200'
                      }`}>
                        <button
                          className={`text-left hover:underline cursor-pointer ${
                            isRegionSelected ? 'text-purple-900 dark:text-purple-100 hover:text-purple-700 dark:hover:text-purple-200' : 'hover:text-blue-600'
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
                        isRegionSelected ? 'text-purple-700 dark:text-purple-200' : 'text-gray-600 dark:text-gray-400'
                      }`}>{region.location}</p>
                      <p className={`text-xs mb-2 ${
                        isRegionSelected ? 'text-purple-800 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'
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