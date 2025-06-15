import { getTimelinePeriods, getPeriodEvents, getPeriodPeople, getPeriodRegions } from './data-loader';

/**
 * Determines which period a person belongs to based on events they participated in
 */
export function getPersonPeriod(personId: string): string | null {
  const periods = getTimelinePeriods();
  
  for (const period of periods) {
    const periodPeople = getPeriodPeople(period.name);
    if (periodPeople.some(person => person.id === personId)) {
      return period.slug;
    }
  }
  
  return null;
}

/**
 * Determines which period an event belongs to based on its date
 */
export function getEventPeriod(eventId: string): string | null {
  const periods = getTimelinePeriods();
  
  for (const period of periods) {
    const periodEvents = getPeriodEvents(period.name);
    if (periodEvents.some(event => event.id === eventId)) {
      return period.slug;
    }
  }
  
  return null;
}

/**
 * Determines which period a region belongs to based on its time period
 */
export function getRegionPeriod(regionId: string): string | null {
  const periods = getTimelinePeriods();
  
  for (const period of periods) {
    const periodRegions = getPeriodRegions(period.name);
    if (periodRegions.some(region => region.id === regionId)) {
      return period.slug;
    }
  }
  
  return null;
}

/**
 * Gets the URL fragment to scroll to a specific period on the timeline
 */
export function getPeriodTimelineUrl(periodSlug: string): string {
  return `/#period-${periodSlug}`;
}