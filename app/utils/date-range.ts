/**
 * Utility functions for calculating date ranges from timeline data
 */

import type { TimelinePeriod } from '../types/biblical';

export function calculateDateRangeFromPeriods(periods: TimelinePeriod[]): { minYear: number; maxYear: number } {
  let minYear = Infinity;
  let maxYear = -Infinity;
  
  periods.forEach(period => {
    const dateRange = period.dateRange;
    
    // Handle different formats:
    // "4004-2348 BC" -> both are BC
    // "6 BC-60 AD" -> first is BC, second is AD
    
    // Check if the entire range is BC (ends with BC and doesn't contain AD)
    const isEntirelyBC = dateRange.endsWith(' BC') && !dateRange.includes(' AD');
    
    if (isEntirelyBC) {
      // Remove the " BC" suffix and split
      const cleanRange = dateRange.replace(' BC', '');
      const [startStr, endStr] = cleanRange.split('-');
      
      const startYear = -parseInt(startStr); // 4004 BC -> -4004
      const endYear = -parseInt(endStr);     // 2348 BC -> -2348
      
      minYear = Math.min(minYear, startYear, endYear);
      maxYear = Math.max(maxYear, startYear, endYear);
    } else {
      // Handle mixed BC/AD or other formats
      const [startStr, endStr] = dateRange.split('-');
      
      // Parse start year
      let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
      if (startStr.includes('BC')) {
        startYear = -startYear;
      }
      
      // Parse end year
      let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
      if (endStr.includes('BC')) {
        endYear = -endYear;
      }
      
      minYear = Math.min(minYear, startYear, endYear);
      maxYear = Math.max(maxYear, startYear, endYear);
    }
  });
  
  // Handle case where no periods were processed
  if (minYear === Infinity) minYear = -4004;
  if (maxYear === -Infinity) maxYear = 60;
  
  return { minYear, maxYear };
}

// Default date range based on known biblical timeline (4004 BC to 60 AD)
export const DEFAULT_DATE_RANGE = {
  minYear: -4004,
  maxYear: 60
};