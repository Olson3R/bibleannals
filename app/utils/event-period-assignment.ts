// Utility to assign events to exactly one period each

import type { BiblicalEvent, TimelinePeriod } from '../types/biblical';

/**
 * Determines which single period an event belongs to based on its date
 * Returns null if the event doesn't fit in any period
 */
export function getEventPeriod(event: BiblicalEvent, periods: TimelinePeriod[]): TimelinePeriod | null {
  // Parse event date - convert to standardized format (negative for BC, positive for AD)
  let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
  if (event.date.includes('BC')) {
    eventYear = -Math.abs(eventYear); // BC dates are negative
  } else if (event.date.includes('AD')) {
    eventYear = Math.abs(eventYear); // AD dates are positive
  } else {
    // If no BC/AD specified, use the magnitude to determine era
    // Large numbers (> 1000) are likely BC, small numbers (< 1000) are likely AD
    if (Math.abs(eventYear) > 1000) {
      eventYear = -Math.abs(eventYear); // Assume BC for large years
    } else {
      eventYear = Math.abs(eventYear); // Assume AD for small years
    }
  }

  // Find the best matching period - choose the most specific (narrowest) period that contains the event
  let bestPeriod: TimelinePeriod | null = null;
  let bestPeriodRange = Infinity;
  
  for (const period of periods) {
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Convert period range to standardized format
    if (startStr.includes('BC')) {
      startYear = -Math.abs(startYear); // BC dates are negative
    } else if (startStr.includes('AD')) {
      startYear = Math.abs(startYear); // AD dates are positive
    } else {
      // Apply same heuristic as for events
      if (Math.abs(startYear) > 1000) {
        startYear = -Math.abs(startYear); // Assume BC for large years
      } else {
        startYear = Math.abs(startYear); // Assume AD for small years
      }
    }
    
    if (endStr.includes('BC')) {
      endYear = -Math.abs(endYear); // BC dates are negative  
    } else if (endStr.includes('AD')) {
      endYear = Math.abs(endYear); // AD dates are positive
    } else {
      // Apply same heuristic as for events
      if (Math.abs(endYear) > 1000) {
        endYear = -Math.abs(endYear); // Assume BC for large years
      } else {
        endYear = Math.abs(endYear); // Assume AD for small years
      }
    }
    
    // Ensure startYear is the earlier date and endYear is the later date
    const periodStart = Math.min(startYear, endYear);
    const periodEnd = Math.max(startYear, endYear);
    
    // Check if event falls within the period range (inclusive)
    if (eventYear >= periodStart && eventYear <= periodEnd) {
      const periodRange = periodEnd - periodStart;
      // Choose the period with the smallest range (most specific)
      if (periodRange < bestPeriodRange) {
        bestPeriod = period;
        bestPeriodRange = periodRange;
      }
    }
  }
  
  return bestPeriod;
}

/**
 * Groups events by their assigned period
 * Each event appears in exactly one period
 */
export function groupEventsByPeriod(
  events: BiblicalEvent[], 
  periods: TimelinePeriod[]
): Map<string, BiblicalEvent[]> {
  const eventsByPeriod = new Map<string, BiblicalEvent[]>();
  
  // Initialize all periods with empty arrays
  periods.forEach(period => {
    eventsByPeriod.set(period.slug, []);
  });
  
  // Assign each event to exactly one period
  events.forEach(event => {
    const period = getEventPeriod(event, periods);
    if (period) {
      const periodEvents = eventsByPeriod.get(period.slug) || [];
      periodEvents.push(event);
      eventsByPeriod.set(period.slug, periodEvents);
    }
  });
  
  return eventsByPeriod;
}