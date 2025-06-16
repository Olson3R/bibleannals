'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isWithinDateRange } from '../utils/date-parsing';
import { calculateDateRangeFromPeriods } from '../utils/date-range';
import { TimelinePeriodCard } from './timeline';
import { SearchResultsDisplay } from './search';
import { DateRangeSlider, NavLink } from './ui';
import { useDateFilter } from '../hooks/useDateFilter';
import type { TimelinePeriod } from '../types/biblical';

interface BiblicalPerson {
  id: string;
  name: string;
  names?: { name: string; reference: string }[];
  gender?: string;
  ethnicity?: string;
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
  const getPersonById = (id: string) => persons.find(p => p.id === id);
  
  // Get dynamic date range from timeline periods data
  const { minYear: dataMinYear, maxYear: dataMaxYear } = calculateDateRangeFromPeriods(timelinePeriods);
  
  // Use the date filter hook
  const {
    minYear,
    maxYear,
    minEra,
    maxEra,
    setMinYear,
    setMaxYear,
    setMinEra,
    setMaxEra,
    updateDateRange,
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
  

  // Handle search scroll - scroll to search results when new search is performed
  useEffect(() => {
    if (searchTerm && searchTerm !== prevSearchTerm) {
      setPrevSearchTerm(searchTerm);
      setTimeout(() => {
        const searchResultsElement = document.getElementById('search-results');
        if (searchResultsElement) {
          searchResultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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
    if (minEra !== 'BC') {
      params.set('minEra', minEra);
    }
    if (maxEra !== 'AD') {
      params.set('maxEra', maxEra);
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
    if (minEra !== 'BC') {
      params.set('minEra', minEra);
    }
    if (maxEra !== 'AD') {
      params.set('maxEra', maxEra);
    }
    router.push(`/regions/${region.id}?${params.toString()}`);
  };




  // timelinePeriods is now passed as a prop

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

  // Search across all content types with relevance scoring
  const searchResults = searchTerm ? (() => {
    const personsWithScore = persons.map(person => {
      let maxScore = calculateRelevance(person.name, searchTerm, true);
      
      // Check alternative names
      if (person.names) {
        for (const name of person.names) {
          const nameScore = calculateRelevance(name.name, searchTerm, true);
          maxScore = Math.max(maxScore, nameScore);
        }
      }
      
      return { item: person, score: maxScore };
    }).filter(result => result.score > 0 && isWithinDateRange(result.item.birth_date || '', minYear, maxYear))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(result => result.item);

    const eventsWithScore = events.map(event => {
      let maxScore = calculateRelevance(event.name, searchTerm, true);
      maxScore = Math.max(maxScore, calculateRelevance(event.description, searchTerm, false));
      maxScore = Math.max(maxScore, calculateRelevance(event.location, searchTerm, false));
      
      return { item: event, score: maxScore };
    }).filter(result => result.score > 0 && isWithinDateRange(result.item.date, minYear, maxYear))
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
    <div className="min-h-screen">
      {/* Sticky Main Header - Compact for Mobile */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-6">
          <div className="text-center mb-3 lg:mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-800 mb-1 lg:mb-2">Biblical Timeline</h1>
            <p className="text-sm lg:text-lg text-gray-600 hidden lg:block">
              A comprehensive journey through biblical history
            </p>
          </div>
          
          {/* Search and Controls in Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-2 lg:gap-4">
            <div className="w-full max-w-md relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Date Range Filter */}
            <DateRangeSlider
              minYear={minYear}
              maxYear={maxYear}
              minEra={minEra}
              maxEra={maxEra}
              onDateRangeChange={updateDateRange}
              onMinYearChange={setMinYear}
              onMaxYearChange={setMaxYear}
              onMinEraChange={setMinEra}
              onMaxEraChange={setMaxEra}
              onReset={resetFilter}
              dataMinYear={dataMinYear}
              dataMaxYear={dataMaxYear}
            />
            
            {/* Content Toggles in Header - Compact for Mobile */}
            <div className="flex gap-2 lg:gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showEvents}
                  onChange={(e) => setShowEvents(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700">📅 <span className="hidden lg:inline">Events</span></span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showPeople}
                  onChange={(e) => setShowPeople(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700">👥 <span className="hidden lg:inline">People</span></span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showRegions}
                  onChange={(e) => setShowRegions(e.target.checked)}
                  className="mr-1"
                />
                <span className="text-xs lg:text-sm font-medium text-gray-700">🗺️ <span className="hidden lg:inline">Regions</span></span>
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">

      {/* Search Results */}
      <SearchResultsDisplay
        searchTerm={searchTerm}
        searchResults={searchResults}
        totalResults={totalResults}
        eventLocationNames={searchEventLocationNames}
      />

      {/* Timeline Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Timeline Overview</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {timelinePeriods
            .filter(period => isWithinDateRange(period.dateRange, minYear, maxYear))
            .map((period, index) => {
            return (
            <div key={index} className="relative group">
              <NavLink
                href={`/periods/${period.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                className={`block px-4 py-2 rounded-full border-2 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${period.color}`}
              >
                <div className="text-center">
                  <div className="font-semibold text-sm text-gray-800">{period.name}</div>
                  <div className="text-xs text-gray-600">{period.dateRange}</div>
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
                  button.classList.add('bg-green-100', 'text-green-600');
                  setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('bg-green-100', 'text-green-600');
                  }, 1000);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-gray-600 hover:text-gray-800"
                title="Copy link to this period on timeline"
              >
                🔗
              </button>
            </div>
          );
          })}
        </div>
      </div>

      {/* Main Timeline Content */}
      <div className="relative">
        {/* Vertical Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        {timelinePeriods
          .filter(period => isWithinDateRange(period.dateRange, minYear, maxYear))
          .map((period, index) => (
          <div key={index} id={`period-${period.slug}`} className="relative mb-16">
            {/* Timeline dot */}
            <div className="absolute left-6 w-5 h-5 bg-white border-4 border-gray-600 rounded-full z-10 shadow-lg"></div>
            
            {/* Content */}
            <div className="ml-20">
              <TimelinePeriodCard
                period={period}
                events={events}
                regions={regions}
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
              />
            </div>
          </div>
        ))}
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
            <span className="text-sm text-gray-700">Royalty</span>
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
            <span className="text-sm text-gray-700">Others</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}