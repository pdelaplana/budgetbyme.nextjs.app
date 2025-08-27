import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateEventStatus,
  calculateSpentPercentage,
  updateEventTotals,
  addToEventTotals,
  subtractFromEventTotals,
  updateEventTotalsComplex,
  type EventAggregationAmounts,
} from './eventAggregation';

// Mock Firebase Admin
vi.mock('./firebase-admin', () => ({
  db: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            collection: vi.fn(() => ({
              get: vi.fn(),
            })),
            get: vi.fn(),
            update: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

// Mock Timestamp
vi.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    now: vi.fn(() => ({ seconds: 1234567890, nanoseconds: 0 })),
  },
}));

describe('eventAggregation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateEventStatus', () => {
    it('should return "on-track" when totalBudgeted is 0', () => {
      const status = calculateEventStatus(0, 0);
      expect(status).toBe('on-track');
    });

    it('should return "under-budget" when spent percentage < 80%', () => {
      const status = calculateEventStatus(1000, 700); // 70%
      expect(status).toBe('under-budget');
    });

    it('should return "on-track" when spent percentage is between 80-100%', () => {
      const status = calculateEventStatus(1000, 850); // 85%
      expect(status).toBe('on-track');
    });

    it('should return "over-budget" when spent percentage > 100%', () => {
      const status = calculateEventStatus(1000, 1200); // 120%
      expect(status).toBe('over-budget');
    });

    it('should handle edge case of exactly 80%', () => {
      const status = calculateEventStatus(1000, 800); // 80%
      expect(status).toBe('on-track');
    });

    it('should handle edge case of exactly 100%', () => {
      const status = calculateEventStatus(1000, 1000); // 100%
      expect(status).toBe('on-track');
    });
  });

  describe('calculateSpentPercentage', () => {
    it('should return 0 when totalBudgeted is 0', () => {
      const percentage = calculateSpentPercentage(0, 500);
      expect(percentage).toBe(0);
    });

    it('should calculate percentage correctly and round to nearest integer', () => {
      const percentage = calculateSpentPercentage(1000, 756.78);
      expect(percentage).toBe(76); // Math.round(75.678) = 76
    });

    it('should handle exact percentages', () => {
      const percentage = calculateSpentPercentage(1000, 500);
      expect(percentage).toBe(50);
    });

    it('should handle over 100% spending', () => {
      const percentage = calculateSpentPercentage(1000, 1250);
      expect(percentage).toBe(125);
    });
  });

  describe('updateEventTotals', () => {
    it('should throw error when userId is missing', async () => {
      await expect(updateEventTotals('', 'event123')).rejects.toThrow('User ID is required');
    });

    it('should throw error when eventId is missing', async () => {
      await expect(updateEventTotals('user123', '')).rejects.toThrow('Event ID is required');
    });

    // Integration tests would require more complex Firebase mocking
    // These would be better suited for integration test files
  });

  describe('addToEventTotals', () => {
    it('should throw error when userId is missing', async () => {
      const amounts: EventAggregationAmounts = { budgeted: 100 };
      await expect(addToEventTotals('', 'event123', amounts)).rejects.toThrow('User ID is required');
    });

    it('should throw error when eventId is missing', async () => {
      const amounts: EventAggregationAmounts = { budgeted: 100 };
      await expect(addToEventTotals('user123', '', amounts)).rejects.toThrow('Event ID is required');
    });

    it('should throw error when no amounts are provided', async () => {
      const amounts: EventAggregationAmounts = {};
      await expect(addToEventTotals('user123', 'event123', amounts)).rejects.toThrow(
        'At least one amount must be provided'
      );
    });

    it('should accept single amount types', async () => {
      const budgetedOnly: EventAggregationAmounts = { budgeted: 100 };
      const scheduledOnly: EventAggregationAmounts = { scheduled: 200 };
      const spentOnly: EventAggregationAmounts = { spent: 50 };

      // These should not throw validation errors (though they'll fail on Firebase mocking)
      await expect(addToEventTotals('user123', 'event123', budgetedOnly)).rejects.not.toThrow(
        'At least one amount must be provided'
      );
      await expect(addToEventTotals('user123', 'event123', scheduledOnly)).rejects.not.toThrow(
        'At least one amount must be provided'
      );
      await expect(addToEventTotals('user123', 'event123', spentOnly)).rejects.not.toThrow(
        'At least one amount must be provided'
      );
    });
  });

  describe('subtractFromEventTotals', () => {
    it('should throw error when userId is missing', async () => {
      const amounts: EventAggregationAmounts = { budgeted: 100 };
      await expect(subtractFromEventTotals('', 'event123', amounts)).rejects.toThrow('User ID is required');
    });

    it('should throw error when eventId is missing', async () => {
      const amounts: EventAggregationAmounts = { budgeted: 100 };
      await expect(subtractFromEventTotals('user123', '', amounts)).rejects.toThrow('Event ID is required');
    });

    it('should throw error when no amounts are provided', async () => {
      const amounts: EventAggregationAmounts = {};
      await expect(subtractFromEventTotals('user123', 'event123', amounts)).rejects.toThrow(
        'At least one amount must be provided'
      );
    });
  });

  describe('updateEventTotalsComplex', () => {
    it('should throw error when userId is missing', async () => {
      const changes = { budgeted: { add: 100 } };
      await expect(updateEventTotalsComplex('', 'event123', changes)).rejects.toThrow('User ID is required');
    });

    it('should throw error when eventId is missing', async () => {
      const changes = { budgeted: { add: 100 } };
      await expect(updateEventTotalsComplex('user123', '', changes)).rejects.toThrow('Event ID is required');
    });

    it('should handle empty changes object', async () => {
      const changes = {};
      // Should not throw validation errors for empty changes (though will fail on Firebase mocking)
      await expect(updateEventTotalsComplex('user123', 'event123', changes)).rejects.not.toThrow(
        'At least one change must be provided'
      );
    });
  });

  describe('validation edge cases', () => {
    it('should handle zero amounts in addToEventTotals', async () => {
      const amounts: EventAggregationAmounts = { budgeted: 0, scheduled: 0, spent: 0 };
      // Zero amounts should be treated as valid (not throw validation error)
      await expect(addToEventTotals('user123', 'event123', amounts)).rejects.not.toThrow(
        'At least one amount must be provided'
      );
    });

    it('should handle undefined vs 0 amounts', async () => {
      const amountsWithZero: EventAggregationAmounts = { budgeted: 0 };
      const amountsWithUndefined: EventAggregationAmounts = { budgeted: undefined };

      // Zero should be treated as a valid amount
      await expect(addToEventTotals('user123', 'event123', amountsWithZero)).rejects.not.toThrow(
        'At least one amount must be provided'
      );

      // Undefined should be treated as no amount provided
      await expect(addToEventTotals('user123', 'event123', amountsWithUndefined)).rejects.toThrow(
        'At least one amount must be provided'
      );
    });
  });
});