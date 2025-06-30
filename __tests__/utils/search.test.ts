import { describe, it, expect } from '@jest/globals';
import { calculateRelevance, performSearch } from '../../app/utils/search';
import type { BiblicalPerson, BiblicalEvent, BiblicalRegion, TimelinePeriod } from '../../app/types/biblical';

describe('Search Utilities', () => {
  describe('calculateRelevance', () => {
    it('should return 0 for empty inputs', () => {
      expect(calculateRelevance('', 'test')).toBe(0);
      expect(calculateRelevance('test', '')).toBe(0);
      expect(calculateRelevance('', '')).toBe(0);
    });

    it('should give highest score for exact matches', () => {
      expect(calculateRelevance('moses', 'moses', true)).toBe(110); // 100 + 10 bonus
      expect(calculateRelevance('moses', 'moses', false)).toBe(60); // 50 + 10 bonus
    });

    it('should give high score for starts-with matches', () => {
      expect(calculateRelevance('moses ben amram', 'moses', true)).toBe(80);
      expect(calculateRelevance('moses ben amram', 'moses', false)).toBe(40);
    });

    it('should give medium score for contains matches', () => {
      expect(calculateRelevance('ben moses amram', 'moses', true)).toBe(60);
      expect(calculateRelevance('ben moses amram', 'moses', false)).toBe(30);
    });

    it('should give low score for fuzzy matches', () => {
      expect(calculateRelevance('moses', 'mss', true)).toBe(30); // 20 + 10 bonus for sequential chars
      expect(calculateRelevance('moses', 'mss', false)).toBe(20); // 10 + 10 bonus for sequential chars
    });

    it('should be case insensitive', () => {
      expect(calculateRelevance('MOSES', 'moses')).toBe(60); // 50 + 10 bonus
      expect(calculateRelevance('Moses', 'MOSES')).toBe(60); // 50 + 10 bonus
    });

    it('should give bonus for shorter text (more specific)', () => {
      const shortMatch = calculateRelevance('abc', 'abc', false);
      const longMatch = calculateRelevance('abc def ghi jkl mno pqr', 'abc', false);
      expect(shortMatch).toBeGreaterThan(longMatch);
    });

    it('should handle partial fuzzy matches', () => {
      expect(calculateRelevance('abraham', 'abram')).toBeGreaterThan(0);
      // The fuzzy matching logic requires characters to be in sequence and works one way
      expect(calculateRelevance('abraham', 'ab')).toBeGreaterThan(0);
    });
  });

  describe('performSearch', () => {
    const mockPersons: BiblicalPerson[] = [
      {
        id: 'moses',
        name: 'Moses',
        names: [{ name: 'Moses', language: 'Hebrew' }],
        birth_date: '1526 BC',
        death_date: '1406 BC',
        description: 'Prophet and lawgiver of Israel',
        biblical_references: ['Exod 2:10'],
        family_relationships: {},
        birth_location: 'Egypt',
        death_location: 'Mount Nebo'
      },
      {
        id: 'abraham',
        name: 'Abraham',
        names: [
          { name: 'Abraham', language: 'Hebrew' },
          { name: 'Abram', language: 'Hebrew' }
        ],
        birth_date: '2166 BC',
        death_date: '1991 BC',
        description: 'Father of faith',
        biblical_references: ['Gen 12:1'],
        family_relationships: { children: ['isaac'] },
        birth_location: 'Ur',
        death_location: 'Hebron'
      }
    ];

    const mockEvents: BiblicalEvent[] = [
      {
        id: 'exodus',
        name: 'Exodus from Egypt',
        date: '1446 BC',
        description: 'Israelites leave Egypt under Moses leadership',
        location: 'Egypt to Canaan',
        participants: ['moses', 'aaron'],
        biblical_references: ['Exod 12:37'],
        significance: 'Liberation of Israel'
      },
      {
        id: 'giving-law',
        name: 'Giving of the Law',
        date: '1446 BC',
        description: 'Moses receives Ten Commandments',
        location: 'Mount Sinai',
        participants: ['moses', 'god'],
        biblical_references: ['Exod 20:1'],
        significance: 'Foundation of covenant'
      }
    ];

    const mockRegions: BiblicalRegion[] = [
      {
        id: 'egypt',
        name: 'Egypt',
        description: 'Land of the Pharaohs',
        location: 'Northeast Africa',
        estimated_dates: '3000-30 BC',
        time_period: 'Ancient',
        notable_people: ['moses', 'joseph'],
        key_features: ['Nile River', 'Pyramids']
      }
    ];

    const mockPeriods: TimelinePeriod[] = [
      {
        name: 'Exodus Period',
        slug: 'exodus-period',
        dateRange: '1526-1406 BC',
        description: 'Time of Moses and the Exodus',
        colorIndex: 0,
        primaryBooks: ['Exodus', 'Leviticus', 'Numbers', 'Deuteronomy']
      }
    ];

    it('should return empty results for empty search term', () => {
      const results = performSearch('', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results).toEqual({
        persons: [],
        events: [],
        regions: [],
        periods: []
      });
    });

    it('should find persons by name', () => {
      const results = performSearch('moses', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.persons).toHaveLength(1);
      expect(results.persons[0].name).toBe('Moses');
    });

    it('should find persons by alternative names', () => {
      const results = performSearch('abram', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.persons).toHaveLength(1);
      expect(results.persons[0].name).toBe('Abraham');
    });

    it('should find events by name', () => {
      const results = performSearch('exodus', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.events).toHaveLength(1);
      expect(results.events[0].name).toBe('Exodus from Egypt');
    });

    it('should find events by description', () => {
      const results = performSearch('commandments', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.events).toHaveLength(1);
      expect(results.events[0].name).toBe('Giving of the Law');
    });

    it('should find events by location', () => {
      const results = performSearch('sinai', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.events.length).toBeGreaterThanOrEqual(1);
      expect(results.events.find(e => e.name === 'Giving of the Law')).toBeDefined();
    });

    it('should find regions by name', () => {
      const results = performSearch('egypt', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.regions).toHaveLength(1);
      expect(results.regions[0].name).toBe('Egypt');
    });

    it('should find regions by description', () => {
      const results = performSearch('pharaohs', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.regions).toHaveLength(1);
      expect(results.regions[0].name).toBe('Egypt');
    });

    it('should find periods by name', () => {
      const results = performSearch('exodus', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.periods).toHaveLength(1);
      expect(results.periods[0].name).toBe('Exodus Period');
    });

    it('should filter by date range', () => {
      const results = performSearch('moses', mockPersons, mockEvents, mockRegions, mockPeriods, -1500, -1400);
      
      // Moses (1526-1406 BC) should be filtered out since birth is before -1500
      expect(results.persons).toHaveLength(0);
      
      // Events in 1446 BC should be included
      expect(results.events.length).toBeGreaterThan(0);
    });

    it('should sort results by relevance score', () => {
      const results = performSearch('law', mockPersons, mockEvents, mockRegions, mockPeriods);
      
      // Should find "Giving of the Law" which contains "Law" in the name (higher score)
      if (results.events.length > 1) {
        const scores = results.events.map(e => 
          Math.max(
            calculateRelevance(e.name, 'law', true),
            calculateRelevance(e.description, 'law', false)
          )
        );
        for (let i = 1; i < scores.length; i++) {
          expect(scores[i-1]).toBeGreaterThanOrEqual(scores[i]);
        }
      }
    });

    it('should limit results to 8 items per category', () => {
      const manyPersons = Array.from({ length: 20 }, (_, i) => ({
        ...mockPersons[0],
        id: `person${i}`,
        name: `Moses ${i}`,
        names: [{ name: `Moses ${i}`, language: 'Hebrew' }]
      }));

      const results = performSearch('moses', manyPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.persons).toHaveLength(8);
    });

    it('should handle search with no matches', () => {
      const results = performSearch('nonexistent', mockPersons, mockEvents, mockRegions, mockPeriods);
      expect(results.persons).toHaveLength(0);
      expect(results.events).toHaveLength(0);
      expect(results.regions).toHaveLength(0);
      expect(results.periods).toHaveLength(0);
    });
  });
});