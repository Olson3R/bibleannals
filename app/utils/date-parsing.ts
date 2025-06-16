// Utility functions for parsing biblical dates and date ranges

import type { DateRange } from '../types/biblical';

/**
 * Parses biblical date ranges and extracts start/end years
 * @param dateStr - Date string like "4004-2348 BC" or "6 BC-60 AD"
 * @returns Object with startYear and endYear (BC as negative, AD as positive)
 */
export function parseDateRange(dateStr: string): DateRange {
  if (!dateStr) return { startYear: null, endYear: null };
  
  // Handle complex ranges like "6 BC-60 AD"
  const bcToAdMatch = dateStr.match(/(\d+)\s*BC\s*-\s*(\d+)\s*AD/i);
  if (bcToAdMatch) {
    return {
      startYear: -parseInt(bcToAdMatch[1]), // BC as negative
      endYear: parseInt(bcToAdMatch[2])     // AD as positive
    };
  }
  
  // Handle BC ranges like "4004-2348 BC" or "~4004-2348 BC"
  const bcRangeMatch = dateStr.match(/~?(\d+)\s*-\s*(\d+)\s*BC/i);
  if (bcRangeMatch) {
    return {
      startYear: -parseInt(bcRangeMatch[1]), // Earlier BC year (larger negative)
      endYear: -parseInt(bcRangeMatch[2])    // Later BC year (smaller negative)
    };
  }
  
  // Handle AD ranges like "30-60 AD" or "30-60"
  const adRangeMatch = dateStr.match(/(\d+)\s*-\s*(\d+)(?:\s*AD)?/i);
  if (adRangeMatch) {
    return {
      startYear: parseInt(adRangeMatch[1]),
      endYear: parseInt(adRangeMatch[2])
    };
  }
  
  // Handle single BC dates like "2000 BC" or "~2000 BC"
  const singleBcMatch = dateStr.match(/~?(\d+)\s*BC/i);
  if (singleBcMatch) {
    const year = -parseInt(singleBcMatch[1]);
    return { startYear: year, endYear: year };
  }
  
  // Handle single AD dates like "30 AD" or "30"
  const singleAdMatch = dateStr.match(/(\d+)(?:\s*AD)?/i);
  if (singleAdMatch) {
    const year = parseInt(singleAdMatch[1]);
    return { startYear: year, endYear: year };
  }
  
  return { startYear: null, endYear: null };
}

/**
 * Checks if a date range overlaps with a filter range
 * @param dateStr - Date string to check
 * @param minYear - Minimum year filter (null for no minimum)
 * @param maxYear - Maximum year filter (null for no maximum)
 * @returns true if the date range overlaps with the filter range
 */
export function isWithinDateRange(
  dateStr: string, 
  minYear: number | null, 
  maxYear: number | null
): boolean {
  if (minYear === null && maxYear === null) return true; // No filter applied
  
  const { startYear, endYear } = parseDateRange(dateStr);
  if (startYear === null || endYear === null) return true; // Include items with unparseable dates
  
  // Check if the date range overlaps with the filter range
  const filterMin = minYear !== null ? minYear : -Infinity;
  const filterMax = maxYear !== null ? maxYear : Infinity;
  
  // Ranges overlap if: max(start1, start2) <= min(end1, end2)
  const overlapStart = Math.max(startYear, filterMin);
  const overlapEnd = Math.min(endYear, filterMax);
  
  return overlapStart <= overlapEnd;
}