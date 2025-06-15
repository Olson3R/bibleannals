import { getTimelinePeriods } from './data-loader';
import { isWithinDateRange } from './date-parsing';

/**
 * Gets all periods that an event belongs to based on its date
 */
export function getEventPeriods(eventDate: string) {
  const periods = getTimelinePeriods();
  return periods.filter(period => {
    return isWithinDateRange(eventDate, null, null) && 
           isEventInPeriod(eventDate, period.dateRange);
  });
}

/**
 * Gets all periods that a person belongs to based on their birth/death dates
 */
export function getPersonPeriods(birthDate?: string, deathDate?: string) {
  const periods = getTimelinePeriods();
  return periods.filter(period => {
    if (birthDate && isEventInPeriod(birthDate, period.dateRange)) return true;
    if (deathDate && isEventInPeriod(deathDate, period.dateRange)) return true;
    
    // If person spans multiple periods (birth to death covers period)
    if (birthDate && deathDate) {
      return doesLifespanOverlapPeriod(birthDate, deathDate, period.dateRange);
    }
    
    return false;
  });
}

/**
 * Gets all periods that a region was significant in based on estimated dates
 */
export function getRegionPeriods(estimatedDates: string) {
  const periods = getTimelinePeriods();
  return periods.filter(period => {
    // Check if region dates overlap with period
    return doesDateRangeOverlapPeriod(estimatedDates, period.dateRange);
  });
}

/**
 * Helper function to check if an event date falls within a period range
 */
function isEventInPeriod(eventDate: string, periodRange: string): boolean {
  const eventYear = parseYear(eventDate);
  if (eventYear === null) return false;
  
  const [periodStart, periodEnd] = parsePeriodRange(periodRange);
  if (periodStart === null || periodEnd === null) return false;
  
  return eventYear >= periodEnd && eventYear <= periodStart;
}

/**
 * Helper function to check if a person's lifespan overlaps with a period
 */
function doesLifespanOverlapPeriod(birthDate: string, deathDate: string, periodRange: string): boolean {
  const birthYear = parseYear(birthDate);
  const deathYear = parseYear(deathDate);
  const [periodStart, periodEnd] = parsePeriodRange(periodRange);
  
  if (birthYear === null || deathYear === null || periodStart === null || periodEnd === null) {
    return false;
  }
  
  // Check if lifespan overlaps with period
  return !(deathYear < periodEnd || birthYear > periodStart);
}

/**
 * Helper function to check if a date range overlaps with a period
 */
function doesDateRangeOverlapPeriod(dateRange: string, periodRange: string): boolean {
  // Handle complex date ranges like "~4004 BC onwards"
  if (dateRange.includes('onwards') || dateRange.includes('present')) {
    const startYear = parseYear(dateRange);
    if (startYear === null) return false;
    
    const [periodStart] = parsePeriodRange(periodRange);
    if (periodStart === null) return false;
    
    return startYear <= periodStart;
  }
  
  // Handle simple date ranges
  const rangeYear = parseYear(dateRange);
  if (rangeYear !== null) {
    return isEventInPeriod(dateRange, periodRange);
  }
  
  return false;
}

/**
 * Parse a year from various date formats, converting to negative for BC
 */
function parseYear(dateStr: string): number | null {
  if (!dateStr) return null;
  
  const cleanDate = dateStr.replace(/[~\s]/g, '');
  const match = cleanDate.match(/(\d+)(\s*(BC|AD))?/i);
  
  if (!match) return null;
  
  const year = parseInt(match[1]);
  const era = match[3]?.toUpperCase();
  
  // Convert BC to negative for easier comparison
  return era === 'BC' ? -year : year;
}

/**
 * Parse a period date range like "4004-2348 BC" or "6 BC-60 AD"
 */
function parsePeriodRange(periodRange: string): [number | null, number | null] {
  const parts = periodRange.split('-');
  if (parts.length !== 2) return [null, null];
  
  const startStr = parts[0].trim();
  const endStr = parts[1].trim();
  
  // Handle cross-era periods like "6 BC-60 AD"
  if (startStr.includes('BC') && endStr.includes('AD')) {
    const start = parseYear(startStr);
    const end = parseYear(endStr);
    return [start, end];
  }
  
  // Handle same-era periods like "4004-2348 BC"
  if (endStr.includes('BC') || endStr.includes('AD')) {
    const era = endStr.includes('BC') ? 'BC' : 'AD';
    const start = parseYear(startStr + ' ' + era);
    const end = parseYear(endStr);
    return [start, end];
  }
  
  return [null, null];
}