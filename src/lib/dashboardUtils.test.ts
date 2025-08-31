import { describe, expect, it } from 'vitest';
import {
  shouldShowError,
  shouldShowLoading,
  shouldShowNotFound,
} from './dashboardUtils';

describe('dashboardUtils', () => {
  describe('shouldShowLoading', () => {
    it('should return true when events are loading', () => {
      expect(shouldShowLoading(true, false, null)).toBe(true);
    });

    it('should return true when event is loading', () => {
      expect(shouldShowLoading(false, true, null)).toBe(true);
    });

    it('should return true when no current event', () => {
      expect(shouldShowLoading(false, false, null)).toBe(true);
    });

    it('should return false when not loading and has current event', () => {
      const mockEvent = { id: '1', name: 'Test Event' } as any;
      expect(shouldShowLoading(false, false, mockEvent)).toBe(false);
    });

    it('should return true when all loading states are true', () => {
      expect(shouldShowLoading(true, true, null)).toBe(true);
    });
  });

  describe('shouldShowError', () => {
    it('should return true when there is an error and not loading', () => {
      expect(shouldShowError('Error message', false)).toBe(true);
    });

    it('should return false when there is an error but still loading', () => {
      expect(shouldShowError('Error message', true)).toBe(false);
    });

    it('should return false when no error', () => {
      expect(shouldShowError(null, false)).toBe(false);
      expect(shouldShowError('', false)).toBe(false);
    });

    it('should return false when no error and loading', () => {
      expect(shouldShowError(null, true)).toBe(false);
    });
  });

  describe('shouldShowNotFound', () => {
    it('should return true when not loading, no event, and events loaded', () => {
      expect(shouldShowNotFound(null, false, 0)).toBe(true);
      expect(shouldShowNotFound(null, false, 5)).toBe(true);
    });

    it('should return false when loading', () => {
      expect(shouldShowNotFound(null, true, 0)).toBe(false);
    });

    it('should return false when has current event', () => {
      const mockEvent = { id: '1', name: 'Test Event' } as any;
      expect(shouldShowNotFound(mockEvent, false, 0)).toBe(false);
    });

    it('should return false when events not loaded yet (negative length)', () => {
      expect(shouldShowNotFound(null, false, -1)).toBe(false);
    });

    it('should handle edge cases correctly', () => {
      const mockEvent = { id: '1', name: 'Test Event' } as any;

      // Has event, not loading, events loaded = false
      expect(shouldShowNotFound(mockEvent, false, 3)).toBe(false);

      // No event, loading, events loaded = false
      expect(shouldShowNotFound(null, true, 3)).toBe(false);

      // No event, not loading, no events loaded yet = false
      expect(shouldShowNotFound(null, false, -1)).toBe(false);
    });
  });
});
