import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatCurrencyWithCents,
  formatDate,
  formatDateLong,
  formatDateTime,
  sanitizeCurrencyInput,
} from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as currency without cents', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(0)).toBe('$0');
      expect(formatCurrency(100)).toBe('$100');
      expect(formatCurrency(1000000)).toBe('$1,000,000');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-100)).toBe('-$100');
      expect(formatCurrency(-1234.56)).toBe('-$1,235');
    });

    it('should handle edge cases and invalid inputs', () => {
      expect(formatCurrency(NaN)).toBe('$0');
      expect(formatCurrency(null as any)).toBe('$0');
      expect(formatCurrency(undefined as any)).toBe('$0');
      expect(formatCurrency(Infinity)).toBe('$∞');
      expect(formatCurrency(-Infinity)).toBe('-$∞');
    });

    it('should round to nearest dollar', () => {
      expect(formatCurrency(99.4)).toBe('$99');
      expect(formatCurrency(99.5)).toBe('$100');
      expect(formatCurrency(99.9)).toBe('$100');
    });
  });

  describe('formatCurrencyWithCents', () => {
    it('should format positive numbers as currency with cents', () => {
      expect(formatCurrencyWithCents(1234.56)).toBe('$1,234.56');
      expect(formatCurrencyWithCents(0)).toBe('$0.00');
      expect(formatCurrencyWithCents(100)).toBe('$100.00');
      expect(formatCurrencyWithCents(1000000.99)).toBe('$1,000,000.99');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrencyWithCents(-100.50)).toBe('-$100.50');
      expect(formatCurrencyWithCents(-1234.56)).toBe('-$1,234.56');
    });

    it('should handle edge cases and invalid inputs', () => {
      expect(formatCurrencyWithCents(NaN)).toBe('$0.00');
      expect(formatCurrencyWithCents(null as any)).toBe('$0.00');
      expect(formatCurrencyWithCents(undefined as any)).toBe('$0.00');
    });

    it('should preserve decimal places', () => {
      expect(formatCurrencyWithCents(99.1)).toBe('$99.10');
      expect(formatCurrencyWithCents(99.01)).toBe('$99.01');
      expect(formatCurrencyWithCents(99)).toBe('$99.00');
    });
  });

  describe('formatDate', () => {
    it('should format dates in short format', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = formatDate(date);
      expect(result).toBe('Mar 15, 2024');
    });

    it('should handle different months correctly', () => {
      expect(formatDate(new Date('2024-01-01'))).toBe('Jan 1, 2024');
      expect(formatDate(new Date('2024-12-31'))).toBe('Dec 31, 2024');
      expect(formatDate(new Date('2024-06-15'))).toBe('Jun 15, 2024');
    });

    it('should handle different years', () => {
      expect(formatDate(new Date('2023-05-10'))).toBe('May 10, 2023');
      expect(formatDate(new Date('2025-08-20'))).toBe('Aug 20, 2025');
    });

    it('should handle leap year dates', () => {
      expect(formatDate(new Date('2024-02-29'))).toBe('Feb 29, 2024');
    });
  });

  describe('formatDateLong', () => {
    it('should format dates in long format', () => {
      const date = new Date('2024-03-15T10:30:00Z');
      const result = formatDateLong(date);
      expect(result).toBe('Friday, March 15, 2024');
    });

    it('should handle different days of week', () => {
      expect(formatDateLong(new Date('2024-01-01'))).toBe('Monday, January 1, 2024');
      expect(formatDateLong(new Date('2024-12-25'))).toBe('Wednesday, December 25, 2024');
    });

    it('should handle all months in long format', () => {
      expect(formatDateLong(new Date('2024-02-14'))).toBe('Wednesday, February 14, 2024');
      expect(formatDateLong(new Date('2024-11-28'))).toBe('Thursday, November 28, 2024');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2024-03-15T14:30:00');
      const result = formatDateTime(date);
      // Result will depend on system locale, but should include date and time
      expect(result).toMatch(/Mar 15, 2024.*2:30/);
    });

    it('should handle different times', () => {
      const morningDate = new Date('2024-03-15T09:00:00');
      const eveningDate = new Date('2024-03-15T21:45:00');
      
      const morningResult = formatDateTime(morningDate);
      const eveningResult = formatDateTime(eveningDate);
      
      expect(morningResult).toMatch(/9:00/);
      expect(eveningResult).toMatch(/9:45/);
    });

    it('should include year, month, day and time', () => {
      const date = new Date('2023-12-31T23:59:00');
      const result = formatDateTime(date);
      
      expect(result).toContain('2023');
      expect(result).toMatch(/Dec 31/);
      expect(result).toMatch(/11:59/);
    });
  });

  describe('sanitizeCurrencyInput', () => {
    it('should extract numeric values from currency strings', () => {
      expect(sanitizeCurrencyInput('$123.45')).toBe(123.45);
      expect(sanitizeCurrencyInput('$1,234.56')).toBe(1234.56);
      expect(sanitizeCurrencyInput('USD 500.00')).toBe(500);
      expect(sanitizeCurrencyInput('€1000')).toBe(1000);
    });

    it('should handle strings with only numbers', () => {
      expect(sanitizeCurrencyInput('123.45')).toBe(123.45);
      expect(sanitizeCurrencyInput('1000')).toBe(1000);
      expect(sanitizeCurrencyInput('0')).toBe(0);
    });

    it('should handle decimals correctly', () => {
      expect(sanitizeCurrencyInput('123.456')).toBe(123.456);
      expect(sanitizeCurrencyInput('.50')).toBe(0.5);
      expect(sanitizeCurrencyInput('100.')).toBe(100);
    });

    it('should handle invalid inputs gracefully', () => {
      expect(sanitizeCurrencyInput('')).toBe(0);
      expect(sanitizeCurrencyInput('abc')).toBe(0);
      expect(sanitizeCurrencyInput('$')).toBe(0);
      expect(sanitizeCurrencyInput('no numbers here!')).toBe(0);
    });

    it('should remove all non-numeric characters except decimal point', () => {
      expect(sanitizeCurrencyInput('$1,234.56 USD')).toBe(1234.56);
      expect(sanitizeCurrencyInput('Price: $999.99')).toBe(999.99);
      expect(sanitizeCurrencyInput('(100.50)')).toBe(100.5);
      expect(sanitizeCurrencyInput('Amount: 1,500.75')).toBe(1500.75);
    });

    it('should handle multiple decimal points by taking first valid number', () => {
      expect(sanitizeCurrencyInput('123.45.67')).toBe(123.45);
      expect(sanitizeCurrencyInput('1.2.3')).toBe(1.2);
    });
  });

  describe('integration tests', () => {
    it('should work together for a complete currency workflow', () => {
      // Simulate user input -> sanitize -> format -> display
      const userInput = '$1,234.56';
      const sanitized = sanitizeCurrencyInput(userInput);
      const formatted = formatCurrency(sanitized);
      
      expect(sanitized).toBe(1234.56);
      expect(formatted).toBe('$1,235');
    });

    it('should handle edge case workflow', () => {
      const userInput = 'invalid input';
      const sanitized = sanitizeCurrencyInput(userInput);
      const formatted = formatCurrency(sanitized);
      
      expect(sanitized).toBe(0);
      expect(formatted).toBe('$0');
    });
  });
});