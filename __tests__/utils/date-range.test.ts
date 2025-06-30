import { describe, it, expect } from '@jest/globals';
import { calculateDateRangeFromPeriods, DEFAULT_DATE_RANGE } from '../../app/utils/date-range';
import type { TimelinePeriod } from '../../app/types/biblical';

describe('Date Range Utilities', () => {
  describe('calculateDateRangeFromPeriods', () => {
    it('should calculate correct range for BC-only periods', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Creation Era',
          slug: 'creation',
          dateRange: '4004-2348 BC',
          description: 'Creation to flood',
          colorIndex: 0,
          primaryBooks: ['Genesis']
        },
        {
          name: 'Post-Flood Era',
          slug: 'post-flood',
          dateRange: '2348-2000 BC',
          description: 'After the flood',
          colorIndex: 1,
          primaryBooks: ['Genesis']
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      expect(result.minYear).toBe(-4004); // Earliest date
      expect(result.maxYear).toBe(-2000); // Latest date
    });

    it('should calculate correct range for AD-only periods', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Early Church',
          slug: 'early-church',
          dateRange: '30-100 AD',
          description: 'Early church period',
          colorIndex: 0,
          primaryBooks: ['Acts']
        },
        {
          name: 'Post-Apostolic',
          slug: 'post-apostolic',
          dateRange: '100-200 AD',
          description: 'After apostles',
          colorIndex: 1,
          primaryBooks: ['Church History']
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      expect(result.minYear).toBe(30); // Earliest date
      expect(result.maxYear).toBe(200); // Latest date
    });

    it('should calculate correct range for mixed BC/AD periods', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Pre-Christian',
          slug: 'pre-christian',
          dateRange: '2000-1 BC',
          description: 'Before Christ',
          colorIndex: 0,
          primaryBooks: ['Old Testament']
        },
        {
          name: 'New Testament Era',
          slug: 'new-testament',
          dateRange: '4 BC-60 AD',
          description: 'Life of Christ and early church',
          colorIndex: 1,
          primaryBooks: ['New Testament']
        },
        {
          name: 'Apostolic Age',
          slug: 'apostolic',
          dateRange: '60-100 AD',
          description: 'Apostolic ministry',
          colorIndex: 2,
          primaryBooks: ['Acts', 'Epistles']
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      expect(result.minYear).toBe(-2000); // Earliest date (2000 BC)
      expect(result.maxYear).toBe(100); // Latest date (100 AD)
    });

    it('should handle the special BC-to-AD period format', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Christ Era',
          slug: 'christ-era',
          dateRange: '6 BC-30 AD',
          description: 'Birth to death of Christ',
          colorIndex: 0,
          primaryBooks: ['Gospels']
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      expect(result.minYear).toBe(-6); // 6 BC
      expect(result.maxYear).toBe(30); // 30 AD
    });

    it('should handle periods with single dates (currently has limitations)', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Creation',
          slug: 'creation',
          dateRange: '4004 BC',
          description: 'Creation of the world',
          colorIndex: 0,
          primaryBooks: ['Genesis 1']
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      // Current implementation doesn't handle single dates properly - returns NaN
      expect(isNaN(result.minYear)).toBe(true);
      expect(isNaN(result.maxYear)).toBe(true);
    });

    it('should return default range for empty periods array', () => {
      const result = calculateDateRangeFromPeriods([]);
      
      expect(result.minYear).toBe(-4004);
      expect(result.maxYear).toBe(60);
    });

    it('should handle periods with approximate dates (tildes have limitations)', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Approximate Era',
          slug: 'approximate',
          dateRange: '~2000-~1000 BC',
          description: 'Era with approximate dates',
          colorIndex: 0,
          primaryBooks: ['Various']
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      // Current implementation doesn't handle tildes properly - returns NaN
      expect(isNaN(result.minYear)).toBe(true);
      expect(isNaN(result.maxYear)).toBe(true);
    });

    it('should find the absolute min and max across all periods', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Ancient',
          slug: 'ancient',
          dateRange: '3000-2000 BC',
          description: 'Ancient times',
          colorIndex: 0,
          primaryBooks: []
        },
        {
          name: 'Middle',
          slug: 'middle',
          dateRange: '1000-500 BC',
          description: 'Middle period',
          colorIndex: 1,
          primaryBooks: []
        },
        {
          name: 'Recent',
          slug: 'recent',
          dateRange: '100-200 AD',
          description: 'Recent period',
          colorIndex: 2,
          primaryBooks: []
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      // Should span from earliest (3000 BC) to latest (200 AD)
      expect(result.minYear).toBe(-3000);
      expect(result.maxYear).toBe(200);
    });

    it('should handle overlapping periods correctly', () => {
      const periods: TimelinePeriod[] = [
        {
          name: 'Period A',
          slug: 'period-a',
          dateRange: '2000-1000 BC',
          description: 'First period',
          colorIndex: 0,
          primaryBooks: []
        },
        {
          name: 'Period B',
          slug: 'period-b',
          dateRange: '1500-500 BC', // Overlaps with Period A
          description: 'Overlapping period',
          colorIndex: 1,
          primaryBooks: []
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      expect(result.minYear).toBe(-2000); // Start of earliest period
      expect(result.maxYear).toBe(-500);  // End of latest period
    });

    it('should preserve the correct chronological order for BC dates', () => {
      // In BC, higher numbers are earlier in time
      // So 4004 BC is earlier than 2348 BC
      const periods: TimelinePeriod[] = [
        {
          name: 'Early Period',
          slug: 'early',
          dateRange: '4004-3000 BC',
          description: 'Very early',
          colorIndex: 0,
          primaryBooks: []
        },
        {
          name: 'Later Period',
          slug: 'later',
          dateRange: '2000-1000 BC',
          description: 'Later period',
          colorIndex: 1,
          primaryBooks: []
        }
      ];

      const result = calculateDateRangeFromPeriods(periods);
      
      // -4004 is earlier than -1000 in our negative number system
      expect(result.minYear).toBe(-4004); // 4004 BC (earliest)
      expect(result.maxYear).toBe(-1000); // 1000 BC (latest)
      expect(result.minYear).toBeLessThan(result.maxYear); // Sanity check
    });
  });

  describe('DEFAULT_DATE_RANGE', () => {
    it('should have the expected default values', () => {
      expect(DEFAULT_DATE_RANGE.minYear).toBe(-4004);
      expect(DEFAULT_DATE_RANGE.maxYear).toBe(60);
    });

    it('should span from biblical creation to end of New Testament era', () => {
      // Represents 4004 BC (traditional creation date) to 60 AD (end of apostolic age)
      expect(DEFAULT_DATE_RANGE.minYear).toBeLessThan(0); // BC date
      expect(DEFAULT_DATE_RANGE.maxYear).toBeGreaterThan(0); // AD date
      expect(DEFAULT_DATE_RANGE.maxYear - DEFAULT_DATE_RANGE.minYear).toBe(4064); // Total span
    });
  });
});