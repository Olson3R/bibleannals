import { describe, it, expect } from '@jest/globals';

describe('data-loader', () => {
  // Since the data-loader uses file system operations that are hard to mock properly,
  // we'll create simplified tests that focus on the public API behavior
  
  it('should expose the correct functions', async () => {
    const dataLoader = await import('../../app/utils/data-loader');
    
    expect(typeof dataLoader.loadTimelineData).toBe('function');
    expect(typeof dataLoader.getPersonById).toBe('function');
    expect(typeof dataLoader.getEventById).toBe('function');
    expect(typeof dataLoader.getRegionById).toBe('function');
    expect(typeof dataLoader.getTimelinePeriods).toBe('function');
    expect(typeof dataLoader.getPeriodBySlug).toBe('function');
    expect(typeof dataLoader.getPeriodEvents).toBe('function');
    expect(typeof dataLoader.getPeriodPeople).toBe('function');
    expect(typeof dataLoader.getPeriodRegions).toBe('function');
    expect(typeof dataLoader.getPersons).toBe('function');
    expect(typeof dataLoader.getEvents).toBe('function');
    expect(typeof dataLoader.getRegions).toBe('function');
    expect(typeof dataLoader.getFamilyGroups).toBe('function');
    expect(typeof dataLoader.getPersonFamilyGroup).toBe('function');
  });

  it('should return consistent data structure from loadTimelineData', async () => {
    const { loadTimelineData } = await import('../../app/utils/data-loader');
    const data = loadTimelineData();
    
    expect(data).toHaveProperty('persons');
    expect(data).toHaveProperty('events');
    expect(data).toHaveProperty('regions');
    expect(data).toHaveProperty('familyGroups');
    
    expect(Array.isArray(data.persons)).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
    expect(Array.isArray(data.regions)).toBe(true);
    expect(Array.isArray(data.familyGroups)).toBe(true);
  });

  it('should return the same data on subsequent calls (caching)', async () => {
    const { loadTimelineData } = await import('../../app/utils/data-loader');
    const data1 = loadTimelineData();
    const data2 = loadTimelineData();
    
    expect(data1).toBe(data2); // Should be the exact same object reference
  });

  it('should return timeline periods from getTimelinePeriods', async () => {
    const { getTimelinePeriods } = await import('../../app/utils/data-loader');
    const periods = getTimelinePeriods();
    
    expect(Array.isArray(periods)).toBe(true);
    expect(periods.length).toBeGreaterThan(0);
    
    // Check that periods have the expected structure
    if (periods.length > 0) {
      const period = periods[0];
      expect(period).toHaveProperty('name');
      expect(period).toHaveProperty('slug');
      expect(period).toHaveProperty('dateRange');
      expect(period).toHaveProperty('description');
    }
  });

  it('should handle non-existent IDs gracefully', async () => {
    const { getPersonById, getEventById, getRegionById } = await import('../../app/utils/data-loader');
    
    expect(getPersonById('non-existent-id')).toBeUndefined();
    expect(getEventById('non-existent-id')).toBeUndefined();
    expect(getRegionById('non-existent-id')).toBeUndefined();
  });
});