// Search utility functions for Bible Annals

import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod, SearchResults } from '../types/biblical';
import { isWithinDateRange } from './date-parsing';

/**
 * Calculates relevance score for search term matching
 * @param text - Text to search in
 * @param search - Search term
 * @param isMainField - Whether this is a primary field (gets higher scores)
 * @returns Relevance score (higher is better match)
 */
export function calculateRelevance(text: string, search: string, isMainField = false): number {
  if (!text || !search) return 0;
  
  const textLower = text.toLowerCase();
  const searchLower = search.toLowerCase();
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
}

/**
 * Searches across all content types with relevance scoring and date filtering
 * @param searchTerm - The search term to find
 * @param persons - Array of biblical persons
 * @param events - Array of biblical events
 * @param regions - Array of biblical regions
 * @param timelinePeriods - Array of timeline periods
 * @param minYear - Minimum year filter (optional)
 * @param maxYear - Maximum year filter (optional)
 * @returns Search results object with scored and filtered results
 */
export function performSearch(
  searchTerm: string,
  persons: BiblicalPerson[],
  events: BiblicalEvent[],
  regions: BiblicalRegion[],
  timelinePeriods: TimelinePeriod[],
  minYear?: number | null,
  maxYear?: number | null
): SearchResults {
  if (!searchTerm) {
    return { persons: [], events: [], regions: [], periods: [] };
  }


  // Search persons with scoring
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
  }).filter(result => 
    result.score > 0 && 
    (!minYear && !maxYear ? true : isWithinDateRange(result.item.birth_date || '', minYear || null, maxYear || null))
  ).sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(result => result.item);

  // Search events with scoring
  const eventsWithScore = events.map(event => {
    let maxScore = calculateRelevance(event.name, searchTerm, true);
    maxScore = Math.max(maxScore, calculateRelevance(event.description, searchTerm, false));
    maxScore = Math.max(maxScore, calculateRelevance(event.location, searchTerm, false));
    
    return { item: event, score: maxScore };
  }).filter(result => 
    result.score > 0 && 
    (!minYear && !maxYear ? true : isWithinDateRange(result.item.date, minYear || null, maxYear || null))
  ).sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(result => result.item);

  // Search regions with scoring
  const regionsWithScore = regions.map(region => {
    let maxScore = calculateRelevance(region.name, searchTerm, true);
    maxScore = Math.max(maxScore, calculateRelevance(region.description, searchTerm, false));
    maxScore = Math.max(maxScore, calculateRelevance(region.location, searchTerm, false));
    
    return { item: region, score: maxScore };
  }).filter(result => 
    result.score > 0 && 
    (!minYear && !maxYear ? true : isWithinDateRange(result.item.estimated_dates || '', minYear || null, maxYear || null))
  ).sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(result => result.item);

  // Search periods with scoring
  const periodsWithScore = timelinePeriods.map(period => {
    let maxScore = calculateRelevance(period.name, searchTerm, true);
    maxScore = Math.max(maxScore, calculateRelevance(period.description, searchTerm, false));
    
    return { item: period, score: maxScore };
  }).filter(result => 
    result.score > 0 && 
    (!minYear && !maxYear ? true : isWithinDateRange(result.item.dateRange, minYear || null, maxYear || null))
  ).sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(result => result.item);

  return {
    persons: personsWithScore,
    events: eventsWithScore,
    regions: regionsWithScore,
    periods: periodsWithScore,
  };
}