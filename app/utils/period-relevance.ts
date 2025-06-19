import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod, PeriodRelevance } from '../types/biblical';
import { parseDate } from './date-parsing';

/**
 * Calculate temporal distance between an entity date and a period
 */
const calculateTemporalDistance = (entityDate: string, period: TimelinePeriod): number => {
  if (!entityDate) return Infinity;
  
  const parsedEntityDate = parseDate(entityDate);
  if (parsedEntityDate === null) return Infinity;
  
  // Parse period date range
  const periodRange = period.dateRange;
  const rangeParts = periodRange.split('-').map(part => part.trim());
  
  let periodStart: number | null = null;
  let periodEnd: number | null = null;
  
  if (rangeParts.length >= 2) {
    periodStart = parseDate(rangeParts[0]);
    periodEnd = parseDate(rangeParts[1]);
  } else if (rangeParts.length === 1) {
    periodStart = parseDate(rangeParts[0]);
    periodEnd = periodStart;
  }
  
  if (periodStart === null || periodEnd === null) return Infinity;
  
  // Return 0 if within period, otherwise minimum distance to period boundaries
  if (parsedEntityDate >= periodStart && parsedEntityDate <= periodEnd) {
    return 0;
  }
  
  return Math.min(
    Math.abs(parsedEntityDate - periodStart),
    Math.abs(parsedEntityDate - periodEnd)
  );
};

/**
 * Calculate relevance score based on temporal distance
 */
const calculateRelevanceScore = (distance: number): number => {
  if (distance === 0) return 1.0; // Contemporary
  if (distance <= 50) return 0.8; // Very close
  if (distance <= 100) return 0.6; // Close
  if (distance <= 200) return 0.4; // Moderate
  if (distance <= 500) return 0.2; // Distant
  return 0.0; // Too far
};

/**
 * Get automatic temporal relevance for a person
 */
export const getPersonTemporalRelevance = (person: BiblicalPerson, allPeriods: TimelinePeriod[]): PeriodRelevance[] => {
  const relevanceList: PeriodRelevance[] = [];
  
  // Use birth_date as primary, fall back to death_date
  const primaryDate = person.birth_date || person.death_date;
  if (!primaryDate) return relevanceList;
  
  for (const period of allPeriods) {
    const distance = calculateTemporalDistance(primaryDate, period);
    const relevance = calculateRelevanceScore(distance);
    
    if (relevance > 0.1) { // Only include meaningful relevance
      relevanceList.push({
        period: period.slug,
        relevance: relevance,
        reason: distance === 0 ? 'contemporary' : 'temporal-proximity',
        notes: distance === 0 ? 'Lived during this period' : `Lived ${distance} years from this period`
      });
    }
  }
  
  return relevanceList.sort((a, b) => b.relevance - a.relevance);
};

/**
 * Get automatic temporal relevance for an event
 */
export const getEventTemporalRelevance = (event: BiblicalEvent, allPeriods: TimelinePeriod[]): PeriodRelevance[] => {
  const relevanceList: PeriodRelevance[] = [];
  
  if (!event.date) return relevanceList;
  
  for (const period of allPeriods) {
    const distance = calculateTemporalDistance(event.date, period);
    const relevance = calculateRelevanceScore(distance);
    
    if (relevance > 0.1) {
      relevanceList.push({
        period: period.slug,
        relevance: relevance,
        reason: distance === 0 ? 'contemporary' : 'temporal-proximity',
        notes: distance === 0 ? 'Occurred during this period' : `Occurred ${distance} years from this period`
      });
    }
  }
  
  return relevanceList.sort((a, b) => b.relevance - a.relevance);
};

/**
 * Get automatic temporal relevance for a region
 */
export const getRegionTemporalRelevance = (region: BiblicalRegion, allPeriods: TimelinePeriod[]): PeriodRelevance[] => {
  const relevanceList: PeriodRelevance[] = [];
  
  if (!region.estimated_dates) return relevanceList;
  
  for (const period of allPeriods) {
    const distance = calculateTemporalDistance(region.estimated_dates, period);
    const relevance = calculateRelevanceScore(distance);
    
    if (relevance > 0.1) {
      relevanceList.push({
        period: period.slug,
        relevance: relevance,
        reason: distance === 0 ? 'contemporary' : 'temporal-proximity',
        notes: distance === 0 ? 'Active during this period' : `Active ${distance} years from this period`
      });
    }
  }
  
  return relevanceList.sort((a, b) => b.relevance - a.relevance);
};

/**
 * Get combined relevance (automatic + manual) for any entity
 */
export const getCombinedRelevance = (
  entity: BiblicalPerson | BiblicalEvent | BiblicalRegion,
  allPeriods: TimelinePeriod[]
): PeriodRelevance[] => {
  let automaticRelevance: PeriodRelevance[] = [];
  
  // Calculate automatic relevance based on entity type
  if ('birth_date' in entity || 'death_date' in entity) {
    automaticRelevance = getPersonTemporalRelevance(entity as BiblicalPerson, allPeriods);
  } else if ('date' in entity) {
    automaticRelevance = getEventTemporalRelevance(entity as BiblicalEvent, allPeriods);
  } else if ('estimated_dates' in entity) {
    automaticRelevance = getRegionTemporalRelevance(entity as BiblicalRegion, allPeriods);
  }
  
  // Merge with manual additional relevance
  const combinedMap = new Map<string, PeriodRelevance>();
  
  // Add automatic relevance
  automaticRelevance.forEach(rel => {
    combinedMap.set(rel.period, rel);
  });
  
  // Add/override with manual relevance
  if (entity.additional_relevance) {
    entity.additional_relevance.forEach(rel => {
      const existing = combinedMap.get(rel.period);
      if (existing) {
        // Take the higher relevance score, but keep manual reason and references
        combinedMap.set(rel.period, {
          ...rel,
          relevance: Math.max(existing.relevance, rel.relevance)
        });
      } else {
        combinedMap.set(rel.period, rel);
      }
    });
  }
  
  return Array.from(combinedMap.values()).sort((a, b) => b.relevance - a.relevance);
};

/**
 * Check if entity is relevant to a specific period
 */
export const isRelevantToPeriod = (
  entity: BiblicalPerson | BiblicalEvent | BiblicalRegion,
  periodSlug: string,
  allPeriods: TimelinePeriod[],
  minRelevance: number = 0.3
): boolean => {
  const relevanceList = getCombinedRelevance(entity, allPeriods);
  const periodRelevance = relevanceList.find(rel => rel.period === periodSlug);
  return periodRelevance ? periodRelevance.relevance >= minRelevance : false;
};

/**
 * Get the primary period for an entity (highest relevance)
 */
export const getPrimaryPeriod = (
  entity: BiblicalPerson | BiblicalEvent | BiblicalRegion,
  allPeriods: TimelinePeriod[]
): string | null => {
  const relevanceList = getCombinedRelevance(entity, allPeriods);
  return relevanceList.length > 0 ? relevanceList[0].period : null;
};

/**
 * Filter entities by period relevance
 */
export const filterEntitiesByPeriodRelevance = <T extends BiblicalPerson | BiblicalEvent | BiblicalRegion>(
  entities: T[],
  periodSlug: string,
  allPeriods: TimelinePeriod[],
  minRelevance: number = 0.3
): T[] => {
  return entities.filter(entity => isRelevantToPeriod(entity, periodSlug, allPeriods, minRelevance));
};