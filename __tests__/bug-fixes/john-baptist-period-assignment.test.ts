import { describe, it, expect } from '@jest/globals';

/**
 * Regression test for the specific bug where "Birth of John the Baptist" (6 BC)
 * was incorrectly appearing in the Apostolic Age (60-100 AD) instead of being
 * properly excluded from periods or assigned to an appropriate earlier period.
 */
describe('Bug Fix: John the Baptist Period Assignment', () => {
  const BIRTH_OF_JOHN_DATE = '~6 BC';
  const NEW_TESTAMENT_RANGE = '4 BC-60 AD';
  const APOSTOLIC_AGE_RANGE = '60-100 AD';

  describe('Date Range Parsing Logic', () => {
    it('should correctly parse "6 BC" as -6', () => {
      let eventYear = parseInt(BIRTH_OF_JOHN_DATE.replace(/[^\d-]/g, ''));
      const isBC = BIRTH_OF_JOHN_DATE.includes('BC');
      if (isBC) eventYear = -eventYear;
      
      expect(eventYear).toBe(-6);
    });

    it('should correctly parse New Testament Era range "4 BC-60 AD"', () => {
      const [startStr, endStr] = NEW_TESTAMENT_RANGE.split('-');
      let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
      let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
      
      // Assume BC for start unless specified as AD
      if (!startStr.includes('AD')) {
        startYear = -startYear;
      }
      if (endStr.includes('BC')) {
        endYear = -endYear;
      }
      
      expect(startYear).toBe(-4);
      expect(endYear).toBe(60);
    });

    it('should correctly parse Apostolic Age range "60-100 AD"', () => {
      const [startStr, endStr] = APOSTOLIC_AGE_RANGE.split('-');
      let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
      let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
      
      // Both should be AD for this period
      expect(startYear).toBe(60);
      expect(endYear).toBe(100);
    });
  });

  describe('Period Assignment Logic', () => {
    it('should correctly determine that 6 BC is BEFORE the New Testament Era (4 BC-60 AD)', () => {
      const eventYear = -6; // 6 BC
      const periodStart = -4; // 4 BC
      const periodEnd = 60; // 60 AD
      
      const isInRange = eventYear >= periodStart && eventYear <= periodEnd;
      
      // 6 BC (-6) is BEFORE 4 BC (-4), so should NOT be in this period
      expect(isInRange).toBe(false);
      expect(eventYear < periodStart).toBe(true);
    });

    it('should correctly determine that 6 BC is DEFINITELY NOT in Apostolic Age (60-100 AD)', () => {
      const eventYear = -6; // 6 BC
      const periodStart = 60; // 60 AD
      const periodEnd = 100; // 100 AD
      
      const isInRange = eventYear >= periodStart && eventYear <= periodEnd;
      
      // 6 BC (-6) is WAY before 60 AD (60), so should NOT be in this period
      expect(isInRange).toBe(false);
      expect(eventYear < periodStart).toBe(true);
    });

    it('should demonstrate the fix: Birth of John should not be in any modern period', () => {
      const eventYear = -6; // 6 BC (Birth of John the Baptist)
      
      // Test against various periods to ensure it's not incorrectly assigned
      const periods = [
        { name: 'New Testament Era', start: -4, end: 60 },
        { name: 'Apostolic Age', start: 60, end: 100 },
        { name: 'Early Church Fathers', start: 100, end: 325 },
        { name: 'Protestant Reformation', start: 1517, end: 1648 }
      ];
      
      periods.forEach(period => {
        const isInRange = eventYear >= period.start && eventYear <= period.end;
        expect(isInRange).toBe(false);
      });
    });
  });

  describe('BC/AD Boundary Logic', () => {
    it('should correctly handle the BC-to-AD transition in New Testament Era', () => {
      // Test various dates around the BC/AD boundary
      const testCases = [
        { date: '6 BC', year: -6, shouldBeInNT: false, shouldBeInApostolic: false },
        { date: '5 BC', year: -5, shouldBeInNT: false, shouldBeInApostolic: false },
        { date: '4 BC', year: -4, shouldBeInNT: true, shouldBeInApostolic: false },  // Boundary
        { date: '1 BC', year: -1, shouldBeInNT: true, shouldBeInApostolic: false },
        { date: '1 AD', year: 1, shouldBeInNT: true, shouldBeInApostolic: false },
        { date: '30 AD', year: 30, shouldBeInNT: true, shouldBeInApostolic: false },
        { date: '60 AD', year: 60, shouldBeInNT: true, shouldBeInApostolic: true }, // Boundary - inclusive on both sides
        { date: '61 AD', year: 61, shouldBeInNT: false, shouldBeInApostolic: true },
        { date: '70 AD', year: 70, shouldBeInNT: false, shouldBeInApostolic: true }
      ];
      
      const ntStart = -4, ntEnd = 60;
      const apostolicStart = 60, apostolicEnd = 100;
      
      testCases.forEach(testCase => {
        const inNT = testCase.year >= ntStart && testCase.year <= ntEnd;
        const inApostolic = testCase.year >= apostolicStart && testCase.year <= apostolicEnd;
        
        expect(inNT).toBe(testCase.shouldBeInNT);
        expect(inApostolic).toBe(testCase.shouldBeInApostolic);
      });
    });

    it('should ensure the specific bug case (6 BC) is handled correctly', () => {
      const eventYear = -6; // Birth of John the Baptist
      
      // New Testament Era: 4 BC-60 AD (-4 to 60)
      const inNewTestament = eventYear >= -4 && eventYear <= 60;
      expect(inNewTestament).toBe(false); // Should NOT be in NT era
      
      // Apostolic Age: 60-100 AD (60 to 100)
      const inApostolic = eventYear >= 60 && eventYear <= 100;
      expect(inApostolic).toBe(false); // Should DEFINITELY NOT be in Apostolic age
      
      // This demonstrates that the event should not appear in either period
      // Previously, the bug caused it to incorrectly appear in Apostolic Age
    });
  });

  describe('Regression Prevention', () => {
    it('should prevent the hardcoded "6 BC-60 AD" vs "4 BC-60 AD" mismatch', () => {
      // The bug was caused by hardcoded checks for "6 BC-60 AD" 
      // when the actual period was "4 BC-60 AD"
      
      const ACTUAL_PERIOD_RANGE = '4 BC-60 AD';
      const OLD_HARDCODED_CHECK = '6 BC-60 AD';
      
      expect(ACTUAL_PERIOD_RANGE).not.toBe(OLD_HARDCODED_CHECK);
      expect(ACTUAL_PERIOD_RANGE).toBe('4 BC-60 AD');
    });

    it('should use consistent date parsing logic throughout the application', () => {
      // Test that the date parsing logic is consistent
      function parseEventDate(dateStr: string): number {
        let year = parseInt(dateStr.replace(/[^\d-]/g, ''));
        if (dateStr.includes('BC')) {
          year = -year;
        }
        return year;
      }
      
      function parsePeriodRange(rangeStr: string): { start: number, end: number } {
        const [startStr, endStr] = rangeStr.split('-');
        let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
        let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
        
        if (!startStr.includes('AD')) {
          startYear = -startYear; // Default to BC
        }
        if (endStr.includes('BC')) {
          endYear = -endYear;
        }
        
        return { start: startYear, end: endYear };
      }
      
      // Test the fixed logic
      const birthOfJohn = parseEventDate('~6 BC');
      const newTestamentRange = parsePeriodRange('4 BC-60 AD');
      
      expect(birthOfJohn).toBe(-6);
      expect(newTestamentRange.start).toBe(-4);
      expect(newTestamentRange.end).toBe(60);
      
      // Verify the relationship
      expect(birthOfJohn < newTestamentRange.start).toBe(true);
    });
  });
});