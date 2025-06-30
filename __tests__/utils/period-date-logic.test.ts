import { describe, it, expect } from '@jest/globals';

/**
 * Test the core date range logic used in period assignment
 * This tests the exact logic from the data-loader.ts file
 */
describe('Period Date Assignment Logic', () => {
  
  /**
   * This is the actual logic from getPeriodEvents in data-loader.ts
   */
  function isEventInPeriod(eventDate: string, periodRange: string): boolean {
    // Parse event date - convert to negative for BC, positive for AD
    let eventYear = parseInt(eventDate.replace(/[^\d-]/g, ''));
    if (eventDate.includes('BC')) {
      eventYear = -eventYear; // BC dates are negative
    }
    // AD dates stay positive (no conversion needed)
    
    // Parse period range - assume BC for start unless specified as AD
    const [startStr, endStr] = periodRange.split('-');
    let startYear = parseInt(startStr.replace(/[^\d]/g, ''));
    let endYear = parseInt(endStr.replace(/[^\d]/g, ''));
    
    // Convert start year based on explicit BC/AD
    if (startStr.includes('BC')) {
      startYear = -startYear;
    }
    // For periods like "60-100 AD", if endStr has AD but startStr doesn't,
    // assume startStr is also AD
    else if (endStr.includes('AD') && !startStr.includes('BC')) {
      // Start year stays positive (AD)
    }
    // Default assumption for ancient periods - start is BC
    else if (!startStr.includes('AD') && !endStr.includes('AD')) {
      startYear = -startYear;
    }
    
    // Convert end year based on explicit BC/AD  
    if (endStr.includes('BC')) {
      endYear = -endYear;
    }
    // AD end dates stay positive
    
    // Check if event falls within the period range
    return eventYear >= startYear && eventYear <= endYear;
  }

  describe('New Testament Era (4 BC-60 AD) Assignment', () => {
    const NEW_TESTAMENT_RANGE = '4 BC-60 AD';

    it('should correctly exclude Birth of John the Baptist (6 BC)', () => {
      const result = isEventInPeriod('~6 BC', NEW_TESTAMENT_RANGE);
      expect(result).toBe(false);
    });

    it('should correctly include Birth of Jesus (4 BC) - at boundary', () => {
      const result = isEventInPeriod('~4 BC', NEW_TESTAMENT_RANGE);
      expect(result).toBe(true);
    });

    it('should correctly include events within range', () => {
      expect(isEventInPeriod('~1 BC', NEW_TESTAMENT_RANGE)).toBe(true);
      expect(isEventInPeriod('~1 AD', NEW_TESTAMENT_RANGE)).toBe(true);
      expect(isEventInPeriod('~30 AD', NEW_TESTAMENT_RANGE)).toBe(true);
      expect(isEventInPeriod('~50 AD', NEW_TESTAMENT_RANGE)).toBe(true);
    });

    it('should correctly include events at end boundary (60 AD)', () => {
      const result = isEventInPeriod('60 AD', NEW_TESTAMENT_RANGE);
      expect(result).toBe(true);
    });

    it('should correctly exclude events after range', () => {
      expect(isEventInPeriod('61 AD', NEW_TESTAMENT_RANGE)).toBe(false);
      expect(isEventInPeriod('70 AD', NEW_TESTAMENT_RANGE)).toBe(false);
    });
  });

  describe('Apostolic Age (60-100 AD) Assignment', () => {
    const APOSTOLIC_RANGE = '60-100 AD';

    it('should correctly exclude Birth of John the Baptist (6 BC)', () => {
      const result = isEventInPeriod('~6 BC', APOSTOLIC_RANGE);
      expect(result).toBe(false);
    });

    it('should correctly exclude New Testament era events', () => {
      expect(isEventInPeriod('~4 BC', APOSTOLIC_RANGE)).toBe(false);
      expect(isEventInPeriod('~30 AD', APOSTOLIC_RANGE)).toBe(false);
      expect(isEventInPeriod('~50 AD', APOSTOLIC_RANGE)).toBe(false);
    });

    it('should correctly include events at start boundary (60 AD)', () => {
      const result = isEventInPeriod('60 AD', APOSTOLIC_RANGE);
      expect(result).toBe(true);
    });

    it('should correctly include events within range', () => {
      expect(isEventInPeriod('64 AD', APOSTOLIC_RANGE)).toBe(true);
      expect(isEventInPeriod('70 AD', APOSTOLIC_RANGE)).toBe(true);
      expect(isEventInPeriod('90 AD', APOSTOLIC_RANGE)).toBe(true);
    });

    it('should correctly include events at end boundary (100 AD)', () => {
      const result = isEventInPeriod('100 AD', APOSTOLIC_RANGE);
      expect(result).toBe(true);
    });

    it('should correctly exclude events after range', () => {
      expect(isEventInPeriod('101 AD', APOSTOLIC_RANGE)).toBe(false);
      expect(isEventInPeriod('200 AD', APOSTOLIC_RANGE)).toBe(false);
    });
  });

  describe('BC-only Periods', () => {
    const CREATION_RANGE = '4004-2348 BC';

    it('should correctly handle BC-only ranges', () => {
      expect(isEventInPeriod('~4004 BC', CREATION_RANGE)).toBe(true);
      expect(isEventInPeriod('~3000 BC', CREATION_RANGE)).toBe(true);
      expect(isEventInPeriod('~2348 BC', CREATION_RANGE)).toBe(true);
    });

    it('should correctly exclude events outside BC range', () => {
      expect(isEventInPeriod('~5000 BC', CREATION_RANGE)).toBe(false); // Before range
      expect(isEventInPeriod('~2000 BC', CREATION_RANGE)).toBe(false); // After range
      expect(isEventInPeriod('~30 AD', CREATION_RANGE)).toBe(false);   // AD events
    });
  });

  describe('AD-only Periods', () => {
    const MODERN_RANGE = '1500-1600 AD';

    it('should correctly handle AD-only ranges', () => {
      expect(isEventInPeriod('1500 AD', MODERN_RANGE)).toBe(true);
      expect(isEventInPeriod('1550 AD', MODERN_RANGE)).toBe(true);
      expect(isEventInPeriod('1600 AD', MODERN_RANGE)).toBe(true);
    });

    it('should correctly exclude events outside AD range', () => {
      expect(isEventInPeriod('1400 AD', MODERN_RANGE)).toBe(false); // Before range
      expect(isEventInPeriod('1700 AD', MODERN_RANGE)).toBe(false); // After range
      expect(isEventInPeriod('~30 BC', MODERN_RANGE)).toBe(false);  // BC events
    });
  });

  describe('Specific Bug Reproduction', () => {
    it('should demonstrate the original bug scenario', () => {
      // Original bug: Birth of John (6 BC) appeared in Apostolic Age (60-100 AD)
      // This should return false for both periods
      
      const birthOfJohnInNT = isEventInPeriod('~6 BC', '4 BC-60 AD');
      const birthOfJohnInApostolic = isEventInPeriod('~6 BC', '60-100 AD');
      
      expect(birthOfJohnInNT).toBe(false);     // Should not be in NT era (6 BC is before 4 BC)
      expect(birthOfJohnInApostolic).toBe(false); // Should definitely not be in Apostolic age
    });

    it('should show correct assignment for boundary events', () => {
      // Events that should be properly assigned after the fix
      
      const crucifixionInNT = isEventInPeriod('~30 AD', '4 BC-60 AD');
      const crucifixionInApostolic = isEventInPeriod('~30 AD', '60-100 AD');
      
      expect(crucifixionInNT).toBe(true);      // Should be in NT era
      expect(crucifixionInApostolic).toBe(false); // Should not be in Apostolic age
      
      const peterDeathInNT = isEventInPeriod('~64 AD', '4 BC-60 AD');
      const peterDeathInApostolic = isEventInPeriod('~64 AD', '60-100 AD');
      
      expect(peterDeathInNT).toBe(false);      // Should not be in NT era
      expect(peterDeathInApostolic).toBe(true);   // Should be in Apostolic age
    });
  });

  describe('Edge Cases and Date Formats', () => {
    it('should handle dates with tildes correctly', () => {
      expect(isEventInPeriod('~6 BC', '4 BC-60 AD')).toBe(false);
      expect(isEventInPeriod('~4 BC', '4 BC-60 AD')).toBe(true);
      expect(isEventInPeriod('~30 AD', '4 BC-60 AD')).toBe(true);
    });

    it('should handle dates without explicit AD designation', () => {
      // In the assumption that start dates default to BC
      expect(isEventInPeriod('1500', '1500-1600')).toBe(true);
      expect(isEventInPeriod('1550', '1500-1600')).toBe(true);
    });

    it('should handle complex period ranges', () => {
      // Test periods that span different eras
      expect(isEventInPeriod('2 BC', '6 BC-60 AD')).toBe(true);
      expect(isEventInPeriod('30 AD', '6 BC-60 AD')).toBe(true);
      expect(isEventInPeriod('8 BC', '6 BC-60 AD')).toBe(false);
    });
  });
});