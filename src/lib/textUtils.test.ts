import { describe, expect, it } from 'vitest';
import {
  truncateForBreadcrumb,
  truncateForMobile,
  truncateText,
} from './textUtils';

describe('textUtils', () => {
  describe('truncateText', () => {
    it('should return original text if shorter than maxLength', () => {
      const result = truncateText('Hello', { maxLength: 10 });
      expect(result).toBe('Hello');
    });

    it('should truncate text with default suffix', () => {
      const result = truncateText('Hello World', { maxLength: 8 });
      expect(result).toBe('Hello...');
    });

    it('should use custom suffix', () => {
      const result = truncateText('Hello World', { maxLength: 8, suffix: '…' });
      expect(result).toBe('Hello W…');
    });

    it('should preserve words when enabled', () => {
      const result = truncateText('Hello World Test', {
        maxLength: 15,
        preserveWords: true,
      });
      expect(result).toBe('Hello World...');
    });

    it('should fallback to character truncation if word preservation fails', () => {
      const result = truncateText('Supercalifragilisticexpialidocious', {
        maxLength: 10,
        preserveWords: true,
      });
      expect(result).toBe('Superca...');
    });

    it('should handle empty text', () => {
      const result = truncateText('', { maxLength: 10 });
      expect(result).toBe('');
    });

    it('should return suffix when maxLength is too small', () => {
      const result = truncateText('Hello', { maxLength: 2 });
      expect(result).toBe('...');
    });
  });

  describe('truncateForMobile', () => {
    it('should use default maxLength of 20', () => {
      const longText = 'This is a very long text that should be truncated';
      const result = truncateForMobile(longText);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should accept custom maxLength', () => {
      const result = truncateForMobile('Hello World Test', 10);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it('should preserve words by default', () => {
      const result = truncateForMobile('Hello World Test Extra', 15);
      expect(result).toBe('Hello World...');
    });
  });

  describe('truncateForBreadcrumb', () => {
    it('should use default maxLength of 15', () => {
      const longText = 'This is a very long breadcrumb';
      const result = truncateForBreadcrumb(longText);
      expect(result.length).toBeLessThanOrEqual(15);
      expect(result).toMatch(/\.\.\.$/);
    });

    it('should accept custom maxLength', () => {
      const result = truncateForBreadcrumb('Hello World', 8);
      expect(result.length).toBeLessThanOrEqual(8);
    });
  });
});
