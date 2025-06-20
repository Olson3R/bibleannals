'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isWithinDateRange } from '../utils/date-parsing';
import { calculateDateRangeFromPeriods } from '../utils/date-range';
import { scrollToElementWithOffset } from '../utils/scroll';
import { TimelinePeriodCard, hasDisplayableContent } from './timeline';
import { SearchResultsDisplay } from './search';
import { DateRangeSlider, NavLink, AdvancedFilters, OverlapChart, SearchAutocomplete, type AdvancedFiltersType } from './ui';
import { useDateFilter } from '../hooks/useDateFilter';
import { getPeriodColors } from '../utils/color-palette';
import { downloadYaml, generateYamlFilename, extractUniqueValues } from '../utils/yaml-export';
// Period relevance utilities are now used in TimelinePeriodCard
import type { TimelinePeriod, BiblicalPerson, BiblicalEvent, BiblicalRegion } from '../types/biblical';

export function BiblicalTimeline({ 
  events, 
  persons, 
  regions,
  timelinePeriods
}: { 
  events: BiblicalEvent[];
  persons: BiblicalPerson[];
  regions: BiblicalRegion[];
  timelinePeriods: TimelinePeriod[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getPersonById = (id: string) => persons.find(p => p.id === id);
  
  // Get dynamic date range from timeline periods data
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(timelinePeriods);
  
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    setMinYear,
    setMaxYear,
    resetFilter
  } = useDateFilter();
  
  
  // Client-side location name resolver
  const getLocationName = (locationId: string): string => {
    const region = regions.find(r => r.id === locationId);
    return region ? region.name : locationId;
  };
  
  // State for timeline features
  const [showEvents, setShowEvents] = useState(true);
  const [showPeople, setShowPeople] = useState(true);
  const [showRegions, setShowRegions] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [prevSearchTerm, setPrevSearchTerm] = useState('');
  // Initialize view mode from query params (client-side only)
  const [viewMode, setViewMode] = useState<'timeline' | 'chart'>('timeline');
  const [isMobile, setIsMobile] = useState(false);
  
  // Set view mode from URL params after hydration and check mobile
  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const view = searchParams.get('view');
    if (view === 'chart' && window.innerWidth >= 768) {
      setViewMode('chart');
    } else {
      setViewMode('timeline');
    }
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [searchParams]);
  
  // Advanced filters state with localStorage persistence
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFiltersType>({
    personTypes: [],
    eventTypes: [],
    locations: [],
    tags: []
  });

  // Load advanced filters from localStorage on mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem('timelineAdvancedFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        setAdvancedFilters(parsedFilters);
      }
    } catch (error) {
      console.warn('Failed to load advanced filters from localStorage:', error);
    }
  }, []);

  // Save advanced filters to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('timelineAdvancedFilters', JSON.stringify(advancedFilters));
    } catch (error) {
      console.warn('Failed to save advanced filters to localStorage:', error);
    }
  }, [advancedFilters]);

  // Handle view mode changes with URL updates
  const handleViewModeChange = (newViewMode: 'timeline' | 'chart') => {
    setViewMode(newViewMode);
    const params = new URLSearchParams(searchParams);
    if (newViewMode === 'chart') {
      params.set('view', 'chart');
    } else {
      params.delete('view');
    }
    router.replace(`/?${params.toString()}`);
  };
  
  // Generate filter options from data
  const personTypeOptions = Array.from(new Set(
    persons.map(p => p.ethnicity).filter((ethnicity): ethnicity is string => Boolean(ethnicity))
  )).sort();
  
  const eventTypeOptions = Array.from(new Set(
    events.map(e => {
      const name = e.name.toLowerCase();
      if (name.includes('birth')) return 'Birth';
      if (name.includes('death')) return 'Death';
      if (name.includes('marriage') || name.includes('marries')) return 'Marriage';
      if (name.includes('covenant')) return 'Covenant';
      if (name.includes('plague')) return 'Plague';
      if (name.includes('miracle') || name.includes('healing')) return 'Miracle';
      if (name.includes('prophecy') || name.includes('vision')) return 'Prophecy';
      if (name.includes('battle') || name.includes('war')) return 'Battle';
      if (name.includes('temple') || name.includes('tabernacle')) return 'Temple/Worship';
      if (name.includes('exile') || name.includes('captivity')) return 'Exile';
      return 'Other';
    })
  )).sort();
  
  const locationOptions = Array.from(new Set(
    events.map(e => getLocationName(e.location))
  )).sort(); // All available locations

  // Generate tag options from all persons and events
  const tagOptions = Array.from(new Set([
    ...persons.flatMap(p => p.tags || []),
    ...events.flatMap(e => e.tags || [])
  ])).filter(tag => tag !== 'biblical').sort(); // All available tags

  // Handle search scroll - scroll to search results when new search is performed
  useEffect(() => {
    if (searchTerm && searchTerm !== prevSearchTerm) {
      setPrevSearchTerm(searchTerm);
      const searchResultsElement = document.getElementById('search-results');
      if (searchResultsElement) {
        scrollToElementWithOffset(searchResultsElement, 120, 100); // 120px offset for header
      }
    } else if (!searchTerm) {
      setPrevSearchTerm('');
    }
  }, [searchTerm, prevSearchTerm]);

  // Handle period anchor scrolling on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#period-')) {
      // Wait for timeline to render, then scroll to the period
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Increased timeout to ensure timeline is fully rendered
    }
  }, []);



  // Navigation functions
  const showPeriodEvents = (periodName: string) => {
    const slug = periodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    router.push(`/periods/${slug}/events?from=timeline`);
  };

  const showPeriodPeople = (periodName: string) => {
    const slug = periodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    router.push(`/periods/${slug}/people?from=timeline`);
  };

  const showPeriodRegions = (periodName: string) => {
    const slug = periodName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    router.push(`/periods/${slug}/regions?from=timeline`);
  };

  const showEventDetail = (event: BiblicalEvent, periodSlug?: string) => {
    const params = new URLSearchParams({ from: 'timeline' });
    if (periodSlug) {
      params.set('period', periodSlug);
    }
    // Include current date filter parameters
    if (minYear !== null) {
      params.set('minYear', minYear.toString());
    }
    if (maxYear !== null) {
      params.set('maxYear', maxYear.toString());
    }
    router.push(`/events/${event.id}?${params.toString()}`);
  };

  const showRegionDetail = (region: BiblicalRegion, periodSlug?: string) => {
    const params = new URLSearchParams({ from: 'timeline' });
    if (periodSlug) {
      params.set('period', periodSlug);
    }
    // Include current date filter parameters
    if (minYear !== null) {
      params.set('minYear', minYear.toString());
    }
    if (maxYear !== null) {
      params.set('maxYear', maxYear.toString());
    }
    router.push(`/regions/${region.id}?${params.toString()}`);
  };




  // timelinePeriods is now passed as a prop

  // Advanced filter helper functions
  const matchesPersonTypeFilter = (person: BiblicalPerson): boolean => {
    if (advancedFilters.personTypes.length === 0) return true;
    return person.ethnicity ? advancedFilters.personTypes.includes(person.ethnicity) : false;
  };

  const matchesEventTypeFilter = (event: BiblicalEvent): boolean => {
    if (advancedFilters.eventTypes.length === 0) return true;
    const name = event.name.toLowerCase();
    let eventType = 'Other';
    if (name.includes('birth')) eventType = 'Birth';
    else if (name.includes('death')) eventType = 'Death';
    else if (name.includes('marriage') || name.includes('marries')) eventType = 'Marriage';
    else if (name.includes('covenant')) eventType = 'Covenant';
    else if (name.includes('plague')) eventType = 'Plague';
    else if (name.includes('miracle') || name.includes('healing')) eventType = 'Miracle';
    else if (name.includes('prophecy') || name.includes('vision')) eventType = 'Prophecy';
    else if (name.includes('battle') || name.includes('war')) eventType = 'Battle';
    else if (name.includes('temple') || name.includes('tabernacle')) eventType = 'Temple/Worship';
    else if (name.includes('exile') || name.includes('captivity')) eventType = 'Exile';
    
    return advancedFilters.eventTypes.includes(eventType);
  };

  const matchesLocationFilter = (event: BiblicalEvent): boolean => {
    if (advancedFilters.locations.length === 0) return true;
    const locationName = getLocationName(event.location);
    return advancedFilters.locations.includes(locationName);
  };

  const matchesTagFilter = (item: BiblicalPerson | BiblicalEvent): boolean => {
    if (advancedFilters.tags.length === 0) return true;
    const itemTags = item.tags || [];
    return advancedFilters.tags.some(tag => itemTags.includes(tag));
  };

  // Filter data for chart view based on date range and advanced filters
  const filteredEvents = events.filter(event => {
    const withinDateRange = !minYear && !maxYear ? true : isWithinDateRange(event.date, minYear, maxYear);
    return withinDateRange && matchesEventTypeFilter(event) && matchesLocationFilter(event) && matchesTagFilter(event);
  });

  const filteredPersons = persons.filter(person => {
    const withinDateRange = !minYear && !maxYear ? true : isWithinDateRange(person.birth_date || '', minYear, maxYear);
    return withinDateRange && matchesPersonTypeFilter(person) && matchesTagFilter(person);
  });

  // Download timeline data as YAML
  const handleDownloadYaml = () => {
    const exportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        page_type: 'timeline',
        page_title: 'Biblical Timeline',
        date_range: minYear && maxYear ? `${Math.abs(minYear)} ${minYear < 0 ? 'BC' : 'AD'} - ${Math.abs(maxYear)} ${maxYear < 0 ? 'BC' : 'AD'}` : 'All periods',
        filters_applied: {
          date_range: minYear || maxYear ? { 
            min_year: minYear ?? undefined, 
            max_year: maxYear ?? undefined 
          } : undefined,
          advanced_filters: {
            person_types: advancedFilters.personTypes,
            event_types: advancedFilters.eventTypes,
            locations: advancedFilters.locations
          }
        }
      },
      timeline_periods: timelinePeriods,
      events: filteredEvents,
      people: filteredPersons,
      regions: regions,
      ethnicities: extractUniqueValues(filteredPersons, p => p.ethnicity),
      event_types: extractUniqueValues(filteredEvents, e => {
        const name = e.name.toLowerCase();
        if (name.includes('birth')) return 'Birth';
        if (name.includes('death')) return 'Death';
        if (name.includes('marriage')) return 'Marriage';
        if (name.includes('covenant')) return 'Covenant';
        return 'Other';
      }),
      locations: extractUniqueValues(filteredEvents, e => getLocationName(e.location))
    };

    const filename = generateYamlFilename('timeline', 'biblical-timeline');
    downloadYaml(exportData, filename);
  };

  // Relevance scoring function
  const calculateRelevance = (text: string, search: string, isMainField = false): number => {
    const searchLower = search.toLowerCase();
    const textLower = text.toLowerCase();
    let score = 0;
    
    // Exact match gets highest score
    if (textLower === searchLower) {
      score += isMainField ? 100 : 50;
    }
    // Starts with search term
    else if (textLower.startsWith(searchLower)) {
      score += isMainField ? 80 : 40;
    }
    // Contains search term
    else if (textLower.includes(searchLower)) {
      score += isMainField ? 60 : 30;
    }
    // Fuzzy match - each matching character in sequence
    else {
      let searchIndex = 0;
      for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
        if (textLower[i] === searchLower[searchIndex]) {
          searchIndex++;
        }
      }
      if (searchIndex === searchLower.length) {
        score += isMainField ? 20 : 10;
      }
    }
    
    // Bonus for shorter text (more specific matches)
    if (score > 0 && textLower.length < searchLower.length * 3) {
      score += 10;
    }
    
    return score;
  };

  // Check if search is a tag search
  const isTagSearch = searchTerm.startsWith('tag:');
  const actualSearchTerm = isTagSearch ? searchTerm.substring(4).trim() : searchTerm;

  // Search across all content types with relevance scoring
  const searchResults = searchTerm ? (() => {
    const personsWithScore = persons.map(person => {
      let maxScore = 0;
      
      if (isTagSearch) {
        // For tag searches, check if person has the tag
        const personTags = person.tags || [];
        if (personTags.some(tag => tag.toLowerCase().includes(actualSearchTerm.toLowerCase()))) {
          maxScore = 100; // High score for exact tag matches
        }
      } else {
        // Normal search
        maxScore = calculateRelevance(person.name, searchTerm, true);
        
        // Check alternative names
        if (person.names) {
          for (const name of person.names) {
            const nameScore = calculateRelevance(name.name, searchTerm, true);
            maxScore = Math.max(maxScore, nameScore);
          }
        }
      }
      
      return { item: person, score: maxScore };
    }).filter(result => result.score > 0 && isWithinDateRange(result.item.birth_date || '', minYear, maxYear) && matchesPersonTypeFilter(result.item) && matchesTagFilter(result.item))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const eventsWithScore = events.map(event => {
      let maxScore = 0;
      
      if (isTagSearch) {
        // For tag searches, check if event has the tag
        const eventTags = event.tags || [];
        if (eventTags.some(tag => tag.toLowerCase().includes(actualSearchTerm.toLowerCase()))) {
          maxScore = 100; // High score for exact tag matches
        }
      } else {
        // Normal search
        maxScore = calculateRelevance(event.name, searchTerm, true);
        maxScore = Math.max(maxScore, calculateRelevance(event.description, searchTerm, false));
        maxScore = Math.max(maxScore, calculateRelevance(event.location, searchTerm, false));
      }
      
      return { item: event, score: maxScore };
    }).filter(result => result.score > 0 && isWithinDateRange(result.item.date, minYear, maxYear) && matchesEventTypeFilter(result.item) && matchesLocationFilter(result.item) && matchesTagFilter(result.item))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const regionsWithScore = regions.map(region => {
      let maxScore = calculateRelevance(region.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateRelevance(region.description, searchTerm, false));
      maxScore = Math.max(maxScore, calculateRelevance(region.location, searchTerm, false));
      
      return { item: region, score: maxScore };
    }).filter(result => result.score > 0 && isWithinDateRange(result.item.estimated_dates || '', minYear, maxYear))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const periodsWithScore = timelinePeriods.map(period => {
      let maxScore = calculateRelevance(period.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateRelevance(period.description, searchTerm, false));
      
      return { item: period, score: maxScore };
    }).filter(result => result.score > 0 && isWithinDateRange(result.item.dateRange, minYear, maxYear))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    return {
      persons: personsWithScore,
      events: eventsWithScore,
      regions: regionsWithScore,
      periods: periodsWithScore
    };
  })() : { persons: [], events: [], regions: [], periods: [] };

  const totalResults = searchResults.persons.length + searchResults.events.length + searchResults.regions.length + searchResults.periods.length;

  // Create location names mapping for search results
  const searchEventLocationNames = Object.fromEntries(
    searchResults.events.map(event => [event.id, getLocationName(event.location)])
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Sticky Main Header - Compact for Mobile */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-6">
          <div className="text-center mb-3 lg:mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 dark:text-gray-200 mb-1 lg:mb-2">Bible Annals</h1>
            <p className="text-sm lg:text-lg text-gray-600 dark:text-gray-400 hidden lg:block">
              A comprehensive journey through biblical history
            </p>
          </div>
          
          {/* Search and Controls in Header */}
          <div className="space-y-3 lg:space-y-0">
            {/* Top row: Search */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="timeline-search" className="sr-only">
                  Search biblical events, people, regions, and periods
                </label>
                <SearchAutocomplete
                  value={searchTerm}
                  onChange={setSearchTerm}
                  persons={persons}
                  events={events}
                  regions={regions}
                  periods={timelinePeriods}
                  placeholder={`Search across ${events.length} events, ${persons.length} people, ${regions.length} regions, and ${timelinePeriods.length} periods...`}
                />
              </div>
              
              {/* Download Button - More prominent on mobile */}
              <button
                onClick={handleDownloadYaml}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Download timeline data as YAML"
              >
                📥
              </button>
            </div>

            {/* Bottom row: Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Date Range Filter */}
              <div className="w-full sm:w-auto">
                <DateRangeSlider
                  minYear={minYear}
                  maxYear={maxYear}
                  onMinYearChange={setMinYear}
                  onMaxYearChange={setMaxYear}
                  onReset={resetFilter}
                  dataMinYear={dataMinYear}
                  dataMaxYear={dataMaxYear}
                />
              </div>
              
              <div className="flex items-center gap-3">
                {/* View Mode Toggle - Hidden on mobile */}
                <div className="hidden md:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => handleViewModeChange('timeline')}
                    className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${
                      viewMode === 'timeline'
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                    title="Timeline view"
                  >
                    📜 <span className="hidden lg:inline">Timeline</span>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('chart')}
                    className={`px-3 py-1 rounded text-xs lg:text-sm font-medium transition-colors ${
                      viewMode === 'chart'
                        ? 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                    title="Chart view"
                  >
                    📊 <span className="hidden lg:inline">Chart</span>
                  </button>
                </div>

                {/* Content Toggles - Better mobile layout */}
                <fieldset className="flex flex-wrap gap-2 lg:gap-3">
                  <legend className="sr-only">Content type visibility controls</legend>
                  <label className="flex items-center min-w-0">
                    <input
                      type="checkbox"
                      checked={showEvents}
                      onChange={(e) => setShowEvents(e.target.checked)}
                      className="mr-1 min-w-0"
                      aria-describedby="events-toggle-desc"
                    />
                    <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">📅 <span className="hidden sm:inline">Events</span></span>
                    <span id="events-toggle-desc" className="sr-only">Toggle visibility of biblical events</span>
                  </label>
                  <label className="flex items-center min-w-0">
                    <input
                      type="checkbox"
                      checked={showPeople}
                      onChange={(e) => setShowPeople(e.target.checked)}
                      className="mr-1 min-w-0"
                      aria-describedby="people-toggle-desc"
                    />
                    <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">👥 <span className="hidden sm:inline">People</span></span>
                    <span id="people-toggle-desc" className="sr-only">Toggle visibility of biblical people</span>
                  </label>
                  <label className="flex items-center min-w-0">
                    <input
                      type="checkbox"
                      checked={showRegions}
                      onChange={(e) => setShowRegions(e.target.checked)}
                      className="mr-1 min-w-0"
                      aria-describedby="regions-toggle-desc"
                    />
                    <span className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">🗺️ <span className="hidden sm:inline">Regions</span></span>
                    <span id="regions-toggle-desc" className="sr-only">Toggle visibility of biblical regions</span>
                  </label>
                </fieldset>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
      
      {/* Advanced Filters */}
      <AdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        personTypeOptions={personTypeOptions}
        eventTypeOptions={eventTypeOptions}
        locationOptions={locationOptions}
        tagOptions={tagOptions}
      />

      {/* Search Results */}
      <SearchResultsDisplay
        searchTerm={searchTerm}
        searchResults={searchResults}
        totalResults={totalResults}
        eventLocationNames={searchEventLocationNames}
      />

      {/* Chart View */}
      {viewMode === 'chart' && !isMobile && (
        <OverlapChart
          events={filteredEvents}
          persons={filteredPersons}
          timelinePeriods={timelinePeriods}
          showEvents={showEvents}
          showPeople={showPeople}
          minYear={minYear}
          maxYear={maxYear}
          onEventClick={(event) => showEventDetail(event)}
          onPersonClick={(person) => {
            const params = new URLSearchParams({ from: 'timeline' });
            if (minYear !== null) {
              params.set('minYear', minYear.toString());
            }
            if (maxYear !== null) {
              params.set('maxYear', maxYear.toString());
            }
            router.push(`/people/${person.id}?${params.toString()}`);
          }}
        />
      )}

      {/* Timeline Overview */}
      {viewMode === 'timeline' && (
        <>
          <section 
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-xl p-8 mb-12 border border-gray-200 dark:border-gray-700"
            aria-labelledby="timeline-overview-heading"
          >
            <h2 id="timeline-overview-heading" className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">Timeline Overview</h2>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {timelinePeriods
                .filter(period => 
                  isWithinDateRange(period.dateRange, minYear, maxYear) &&
                  hasDisplayableContent(
                    period, events, regions, timelinePeriods, persons, getPersonById, 
                    showEvents, showPeople, showRegions,
                    minYear, maxYear,
                    matchesPersonTypeFilter, matchesEventTypeFilter, matchesLocationFilter, matchesTagFilter
                  )
                )
                .map((period, index) => {
                return (
                <div key={index} className="relative group">
                  <NavLink
                    href={`/periods/${period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                    className={`block px-3 py-3 sm:px-4 sm:py-2 rounded-full border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center ${getPeriodColors(period.colorIndex)}`}
                  >
                    <div className="text-center">
                      <div className="font-semibold text-sm text-gray-800 dark:text-gray-200">{period.name}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{period.dateRange}</div>
                    </div>
                  </NavLink>
                  
                  {/* Copy Link Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const periodSlug = period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                      const url = `${window.location.origin}/#period-${periodSlug}`;
                      navigator.clipboard.writeText(url);
                      
                      // Show temporary feedback
                      const button = e.currentTarget as HTMLButtonElement;
                      const originalText = button.innerHTML;
                      button.innerHTML = '✓';
                      button.classList.add('bg-green-100', 'dark:bg-green-800', 'text-green-600', 'dark:text-green-300');
                      setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('bg-green-100', 'dark:bg-green-800', 'text-green-600', 'dark:text-green-300');
                      }, 1000);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                    title="Copy link to this period on timeline"
                  >
                    🔗
                  </button>
                </div>
              );
              })}
            </div>
          </section>

          {/* Main Timeline Content */}
        <main className="relative" role="main" aria-labelledby="main-timeline-heading">
        <h2 id="main-timeline-heading" className="sr-only">Detailed Biblical Timeline</h2>
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600" aria-hidden="true"></div>
        
        {timelinePeriods
          .filter(period => 
            isWithinDateRange(period.dateRange, minYear, maxYear) &&
            hasDisplayableContent(
              period, events, regions, timelinePeriods, persons, getPersonById, 
              showEvents, showPeople, showRegions,
              minYear, maxYear,
              matchesPersonTypeFilter, matchesEventTypeFilter, matchesLocationFilter, matchesTagFilter
            )
          )
          .map((period, index) => (
          <article key={index} id={`period-${period.slug}`} className="relative mb-6" aria-labelledby={`period-${period.slug}-heading`}>
            {/* Timeline dot */}
            <div className="absolute left-6 w-5 h-5 bg-white dark:bg-gray-800 border-4 border-gray-600 dark:border-gray-400 rounded-full z-10 shadow-lg" aria-hidden="true"></div>
            
            {/* Content */}
            <div className="ml-20">
              <TimelinePeriodCard
                period={period}
                events={events}
                regions={regions}
                allPeriods={timelinePeriods}
                persons={persons}
                getPersonById={getPersonById}
                showEvents={showEvents}
                showPeople={showPeople}
                showRegions={showRegions}
                onEventClick={showEventDetail}
                onRegionClick={showRegionDetail}
                showPeriodEvents={showPeriodEvents}
                showPeriodPeople={showPeriodPeople}
                showPeriodRegions={showPeriodRegions}
                minYear={minYear}
                maxYear={maxYear}
                matchesPersonTypeFilter={matchesPersonTypeFilter}
                matchesEventTypeFilter={matchesEventTypeFilter}
                matchesLocationFilter={matchesLocationFilter}
                matchesTagFilter={matchesTagFilter}
                advancedFilters={advancedFilters}
              />
            </div>
          </article>
        ))}
          </main>

          {/* Color Legend */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-12 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">Person Color Guide</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-200 border border-yellow-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Divine</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-200 border border-purple-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Patriarchs</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-200 border border-red-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Royalty</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-200 border border-green-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Prophets</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-indigo-200 border border-indigo-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Apostles</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-pink-200 border border-pink-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Women</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-200 border border-blue-400 rounded mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">Others</span>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}