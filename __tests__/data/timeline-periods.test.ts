import { describe, it, expect } from '@jest/globals';
import { timelinePeriods } from '../../app/data/timeline-periods';

describe('Timeline Periods Data', () => {
  it('should have all required periods', () => {
    const expectedPeriods = [
      'Creation & Pre-Flood Era',
      'Post-Flood & Patriarchs', 
      'Egyptian Bondage',
      'Wilderness & Conquest',
      'Judges Period',
      'United Kingdom',
      'Divided Kingdom',
      'Exile & Return',
      'Intertestamental Period',
      'New Testament Era',
      'Apostolic Age',
      'Early Church Fathers',
      'Imperial Christianity',
      'Medieval Period',
      'Great Schism Era',
      'Protestant Reformation',
      'Age of Exploration & Missions',
      'Modern Missions Movement',
      '20th Century Christianity',
      'Contemporary Era'
    ];

    const actualPeriods = timelinePeriods.map(p => p.name);
    expectedPeriods.forEach(expectedPeriod => {
      expect(actualPeriods).toContain(expectedPeriod);
    });
  });

  it('should have consistent data structure for all periods', () => {
    timelinePeriods.forEach(period => {
      expect(period).toHaveProperty('name');
      expect(period).toHaveProperty('slug');
      expect(period).toHaveProperty('dateRange');
      expect(period).toHaveProperty('description');
      expect(period).toHaveProperty('colorIndex');
      expect(period).toHaveProperty('primaryBooks');
      
      expect(typeof period.name).toBe('string');
      expect(typeof period.slug).toBe('string');
      expect(typeof period.dateRange).toBe('string');
      expect(typeof period.description).toBe('string');
      expect(typeof period.colorIndex).toBe('number');
      expect(Array.isArray(period.primaryBooks)).toBe(true);
    });
  });

  it('should have chronologically ordered date ranges', () => {
    // Check that periods generally progress from oldest to newest
    const earlyPeriods = [
      'Creation & Pre-Flood Era',
      'Post-Flood & Patriarchs',
      'Egyptian Bondage'
    ];
    
    const latePeriods = [
      'New Testament Era',
      'Apostolic Age', 
      'Contemporary Era'
    ];

    earlyPeriods.forEach(periodName => {
      const period = timelinePeriods.find(p => p.name === periodName);
      expect(period?.dateRange).toMatch(/BC/);
    });

    const newTestamentEra = timelinePeriods.find(p => p.name === 'New Testament Era');
    const apostolicAge = timelinePeriods.find(p => p.name === 'Apostolic Age');
    const contemporary = timelinePeriods.find(p => p.name === 'Contemporary Era');

    expect(newTestamentEra?.dateRange).toBe('4 BC-60 AD');
    expect(apostolicAge?.dateRange).toBe('60-100 AD');
    expect(contemporary?.dateRange).toBe('2000-2025 AD');
  });

  it('should have unique slugs', () => {
    const slugs = timelinePeriods.map(p => p.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  it('should have valid color indices', () => {
    timelinePeriods.forEach(period => {
      expect(period.colorIndex).toBeGreaterThanOrEqual(0);
      expect(period.colorIndex).toBeLessThanOrEqual(9); // Assuming 10 colors (0-9)
    });
  });

  it('should have meaningful descriptions', () => {
    timelinePeriods.forEach(period => {
      expect(period.description.length).toBeGreaterThan(10);
      expect(period.description).not.toBe(period.name);
    });
  });

  it('should have the correct New Testament Era date range (the bug fix)', () => {
    const newTestamentEra = timelinePeriods.find(p => p.name === 'New Testament Era');
    expect(newTestamentEra?.dateRange).toBe('4 BC-60 AD');
    expect(newTestamentEra?.dateRange).not.toBe('6 BC-60 AD'); // The old incorrect value
  });

  it('should have appropriate primary books for each period', () => {
    const newTestamentEra = timelinePeriods.find(p => p.name === 'New Testament Era');
    const apostolicAge = timelinePeriods.find(p => p.name === 'Apostolic Age');
    const creationEra = timelinePeriods.find(p => p.name === 'Creation & Pre-Flood Era');

    expect(newTestamentEra?.primaryBooks).toContain('Matthew');
    expect(newTestamentEra?.primaryBooks).toContain('John');
    expect(apostolicAge?.primaryBooks).toContain('Canonical completion of New Testament scriptures');
    expect(creationEra?.primaryBooks).toContain('Genesis 1-8');
  });
});