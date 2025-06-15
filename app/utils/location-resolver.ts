import { loadTimelineData } from './data-loader';

/**
 * Resolves a location ID to its readable name
 */
export function getLocationName(locationId: string): string {
  const data = loadTimelineData();
  const region = data.regions.find(r => r.id === locationId);
  return region ? region.name : locationId;
}

/**
 * Resolves multiple location IDs to readable names
 */
export function getLocationNames(locationIds: string[]): string[] {
  return locationIds.map(id => getLocationName(id));
}