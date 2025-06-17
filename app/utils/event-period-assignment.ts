// Utility to assign events to exactly one period each

import type { BiblicalEvent, TimelinePeriod } from '../types/biblical';

/**
 * Determines which single period an event belongs to based on its date
 * Returns null if the event doesn't fit in any period
 */
export function getEventPeriod(event: BiblicalEvent, periods: TimelinePeriod[]): TimelinePeriod | null {
  // Parse event date
  let eventYear = parseInt(event.date.replace(/[^\d-]/g, ''));
  const isAD = event.date.includes('AD');
  if (isAD) eventYear = -eventYear; // Convert to our internal format (negative for BC)

  // Find the best matching period
  for (const period of periods) {
    const [startStr, endStr] = period.dateRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Handle BC/AD in period range
    if (startStr.includes('BC')) startYear = Math.abs(startYear);
    if (endStr.includes('BC')) endYear = Math.abs(endYear);
    if (startStr.includes('AD')) startYear = -Math.abs(startYear);
    if (endStr.includes('AD')) endYear = -Math.abs(endYear);
    
    // Special handling for NT period that spans BC to AD
    if (period.dateRange === "6 BC-60 AD") {
      const eventYearOriginal = parseInt(event.date.replace(/[^\d-]/g, ''));
      if (event.date.includes('BC')) {
        if (eventYearOriginal <= 6) return period;
      } else if (event.date.includes('AD')) {
        if (eventYearOriginal <= 60) return period;
      }
    } else {
      // Normal period check - event year should be within the period range
      if (eventYear >= endYear && eventYear <= startYear) {
        return period;
      }
    }
  }

  return null; // Event doesn't fit in any period
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