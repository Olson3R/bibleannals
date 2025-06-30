import { describe, it, expect } from '@jest/globals';
import { parseDateRange, isWithinDateRange, parseDate } from '../../app/utils/date-parsing';

describe('Date Parsing Utilities', () => {
  describe('parseDateRange', () => {
    it('should parse BC-only ranges correctly', () => {
      expect(parseDateRange('4004-2348 BC')).toEqual({
        startYear: -4004,
        endYear: -2348
      });
      
      expect(parseDateRange('~4004-2348 BC')).toEqual({
        startYear: -4004,
        endYear: -2348
      });
    });

    it('should parse AD-only ranges correctly', () => {
      expect(parseDateRange('30-60 AD')).toEqual({
        startYear: 30,
        endYear: 60
      });
      
      expect(parseDateRange('100-200')).toEqual({
        startYear: 100,
        endYear: 200
      });
    });

    it('should parse BC-to-AD ranges correctly', () => {
      expect(parseDateRange('4 BC-60 AD')).toEqual({
        startYear: -4,
        endYear: 60
      });
      
      expect(parseDateRange('6 BC-60 AD')).toEqual({
        startYear: -6,
        endYear: 60
      });
    });

    it('should parse single BC dates correctly', () => {
      expect(parseDateRange('2000 BC')).toEqual({
        startYear: -2000,
        endYear: -2000
      });
      
      expect(parseDateRange('~6 BC')).toEqual({
        startYear: -6,
        endYear: -6
      });
    });

    it('should parse single AD dates correctly', () => {
      expect(parseDateRange('30 AD')).toEqual({
        startYear: 30,
        endYear: 30
      });
      
      expect(parseDateRange('2025')).toEqual({
        startYear: 2025,
        endYear: 2025
      });
    });

    it('should handle empty or invalid dates', () => {
      expect(parseDateRange('')).toEqual({
        startYear: null,
        endYear: null
      });
      
      expect(parseDateRange('invalid')).toEqual({
        startYear: null,
        endYear: null
      });
    });
  });

  describe('parseDate', () => {
    it('should parse BC dates correctly', () => {
      expect(parseDate('6 BC')).toBe(-6);
      expect(parseDate('~6 BC')).toBe(-6);
      expect(parseDate('4004 BC')).toBe(-4004);
    });

    it('should parse AD dates correctly', () => {
      expect(parseDate('30 AD')).toBe(30);
      expect(parseDate('60 AD')).toBe(60);
      expect(parseDate('2025 AD')).toBe(2025);
    });

    it('should parse bare numbers correctly', () => {
      expect(parseDate('2025')).toBe(2025);
      expect(parseDate('-6')).toBe(-6);
    });

    it('should handle invalid dates', () => {
      expect(parseDate('')).toBe(null);
      expect(parseDate('invalid')).toBe(null);
    });
  });

  describe('isWithinDateRange', () => {
    it('should correctly identify dates within BC ranges', () => {
      expect(isWithinDateRange('3000 BC', -4000, -2000)).toBe(true);
      expect(isWithinDateRange('5000 BC', -4000, -2000)).toBe(false);
      expect(isWithinDateRange('1000 BC', -4000, -2000)).toBe(false);
    });

    it('should correctly identify dates within AD ranges', () => {
      expect(isWithinDateRange('50 AD', 30, 60)).toBe(true);
      expect(isWithinDateRange('20 AD', 30, 60)).toBe(false);
      expect(isWithinDateRange('70 AD', 30, 60)).toBe(false);
    });

    it('should correctly identify dates within BC-to-AD ranges', () => {
      expect(isWithinDateRange('2 BC', -4, 60)).toBe(true);
      expect(isWithinDateRange('30 AD', -4, 60)).toBe(true);
      expect(isWithinDateRange('6 BC', -4, 60)).toBe(false); // Before range
      expect(isWithinDateRange('70 AD', -4, 60)).toBe(false); // After range
    });

    it('should handle no filter (null boundaries)', () => {
      expect(isWithinDateRange('1000 BC', null, null)).toBe(true);
      expect(isWithinDateRange('2000 AD', null, null)).toBe(true);
    });

    it('should handle partial filters', () => {
      expect(isWithinDateRange('50 AD', 30, null)).toBe(true);
      expect(isWithinDateRange('20 AD', 30, null)).toBe(false);
      expect(isWithinDateRange('50 AD', null, 60)).toBe(true);
      expect(isWithinDateRange('70 AD', null, 60)).toBe(false);
    });

    it('should include unparseable dates', () => {
      expect(isWithinDateRange('invalid', -100, 100)).toBe(true);
      expect(isWithinDateRange('', -100, 100)).toBe(true);
    });
  });
});