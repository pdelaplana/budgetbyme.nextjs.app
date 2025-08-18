import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EventDocument } from '@/server/types/EventDocument';
import { CurrencyImplementation } from '@/types/currencies';
import type { Event } from '@/types/Event';
import { eventConverter } from './eventConverter';

// Create a proper mock Timestamp type
interface MockTimestamp {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
  toMillis?: () => number;
  isEqual?: (other: MockTimestamp) => boolean;
}

// Mock Firebase Admin Timestamp
vi.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    fromDate: vi.fn(
      (date: Date): MockTimestamp => ({
        toDate: vi.fn(() => date),
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
      }),
    ),
    now: vi.fn((): MockTimestamp => {
      const now = new Date();
      return {
        toDate: vi.fn(() => now),
        seconds: Math.floor(now.getTime() / 1000),
        nanoseconds: (now.getTime() % 1000) * 1000000,
      };
    }),
  },
}));

describe('eventConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toFirestore', () => {
    it('should convert Event to Firestore format with all fields', () => {
      // Arrange
      const createdDate = new Date('2024-01-15T10:30:00Z');
      const updatedDate = new Date('2024-01-20T14:45:00Z');
      const eventDate = new Date('2024-06-15T00:00:00Z');

      const event: Event = {
        id: 'event123',
        name: 'Wedding Celebration',
        type: 'wedding',
        description: 'A beautiful wedding celebration',
        eventDate: eventDate,
        totalBudgetedAmount: 50000,
        totalSpentAmount: 35000,
        spentPercentage: 70,
        status: 'on-track',
        currency: CurrencyImplementation.USD,
        _createdDate: createdDate,
        _createdBy: 'user123',
        _updatedDate: updatedDate,
        _updatedBy: 'user123',
      };

      // Act
      const result = eventConverter.toFirestore(event);

      // Assert
      expect(result).toEqual({
        id: 'event123',
        document: {
          name: 'Wedding Celebration',
          type: 'wedding',
          description: 'A beautiful wedding celebration',
          eventDate: expect.any(Object), // Timestamp object
          totalBudgetedAmount: 50000, // Note the correct spelling
          totalSpentAmount: 35000,
          status: 'on-track',
          currency: 'USD',
          _createdDate: expect.any(Object), // Timestamp object
          _createdBy: 'user123',
          _updatedDate: expect.any(Object), // Timestamp object
          _updatedBy: 'user123',
        },
      });

      // Verify Timestamp.fromDate was called with correct dates
      expect(Timestamp.fromDate).toHaveBeenCalledWith(createdDate);
      expect(Timestamp.fromDate).toHaveBeenCalledWith(updatedDate);
      expect(Timestamp.fromDate).toHaveBeenCalledWith(eventDate);
      expect(Timestamp.fromDate).toHaveBeenCalledTimes(3);
    });

    it('should handle partial Event data', () => {
      // Arrange
      const partialEvent: Partial<Event> = {
        id: 'event456',
        name: 'Birthday Party',
        type: 'birthday',
        eventDate: new Date('2024-12-25T00:00:00Z'),
        totalBudgetedAmount: 2000,
        totalSpentAmount: 500,
        status: 'under-budget',
        currency: CurrencyImplementation.AUD,
        // Missing dates and other fields
      };

      // Act
      const result = eventConverter.toFirestore(partialEvent);

      // Assert
      expect(result).toEqual({
        id: 'event456',
        document: {
          name: 'Birthday Party',
          type: 'birthday',
          eventDate: expect.any(Object), // Timestamp object
          totalBudgetedAmount: 2000,
          totalSpentAmount: 500,
          status: 'under-budget',
          currency: 'AUD',
          _createdDate: expect.any(Object), // Timestamp.now()
          _updatedDate: expect.any(Object), // Timestamp.now()
        },
      });

      // Verify Timestamp.now was called for missing dates
      expect(Timestamp.now).toHaveBeenCalledTimes(2);
    });

    it('should handle zero budget amount', () => {
      // Arrange
      const eventWithZeroBudget: Partial<Event> = {
        id: 'event789',
        name: 'Free Event',
        type: 'other',
        eventDate: new Date('2024-03-15T00:00:00Z'),
        totalBudgetedAmount: 0,
        totalSpentAmount: 0,
        status: 'completed',
        currency: CurrencyImplementation.USD,
      };

      // Act
      const result = eventConverter.toFirestore(eventWithZeroBudget);

      // Assert
      expect(result.document?.totalBudgetedAmount).toBe(0);
      expect(result.document?.totalSpentAmount).toBe(0);
    });

    it('should use default budget amount when undefined', () => {
      // Arrange
      const eventWithoutBudget: Partial<Event> = {
        id: 'event999',
        name: 'Unknown Budget Event',
        type: 'other',
        eventDate: new Date('2024-08-15T00:00:00Z'),
        status: 'on-track',
        currency: CurrencyImplementation.PHP,
      };

      // Act
      const result = eventConverter.toFirestore(eventWithoutBudget);

      // Assert
      expect(result.document?.totalBudgetedAmount).toBeUndefined();
    });
  });

  describe('fromFirestore', () => {
    it('should convert Firestore document to Event', () => {
      // Arrange
      const documentId = 'event123';
      const createdDate = new Date('2024-01-15T10:30:00Z');
      const updatedDate = new Date('2024-01-20T14:45:00Z');
      const eventDate = new Date('2024-06-15T00:00:00Z');

      const mockEventTimestamp: MockTimestamp = {
        toDate: vi.fn(() => eventDate),
        seconds: Math.floor(eventDate.getTime() / 1000),
        nanoseconds: (eventDate.getTime() % 1000) * 1000000,
      };
      const mockCreatedTimestamp: MockTimestamp = {
        toDate: vi.fn(() => createdDate),
        seconds: Math.floor(createdDate.getTime() / 1000),
        nanoseconds: (createdDate.getTime() % 1000) * 1000000,
      };
      const mockUpdatedTimestamp: MockTimestamp = {
        toDate: vi.fn(() => updatedDate),
        seconds: Math.floor(updatedDate.getTime() / 1000),
        nanoseconds: (updatedDate.getTime() % 1000) * 1000000,
      };

      const firestoreDoc: EventDocument = {
        name: 'Wedding Celebration',
        type: 'wedding',
        description: 'A beautiful wedding celebration',
        eventDate: mockEventTimestamp as unknown as Timestamp,
        totalBudgetedAmount: 50000,
        totalSpentAmount: 35000,
        status: 'on-track',
        currency: 'USD',
        _createdDate: mockCreatedTimestamp as unknown as Timestamp,
        _createdBy: 'user123',
        _updatedDate: mockUpdatedTimestamp as unknown as Timestamp,
        _updatedBy: 'user123',
      };

      // Act
      const result = eventConverter.fromFirestore(documentId, firestoreDoc);

      // Assert
      expect(result).toEqual({
        id: 'event123',
        name: 'Wedding Celebration',
        type: 'wedding',
        description: 'A beautiful wedding celebration',
        eventDate: eventDate, // Converted from Timestamp
        totalBudgetedAmount: 50000, // Note the correct spelling
        totalSpentAmount: 35000,
        spentPercentage: 70, // Calculated: (35000 / 50000) * 100
        status: 'on-track',
        currency: CurrencyImplementation.USD, // Converted from string
        _createdDate: createdDate,
        _createdBy: 'user123',
        _updatedDate: updatedDate,
        _updatedBy: 'user123',
      });

      // Verify toDate() was called on timestamps
      expect(mockEventTimestamp.toDate).toHaveBeenCalledTimes(1);
      expect(mockCreatedTimestamp.toDate).toHaveBeenCalledTimes(1);
      expect(mockUpdatedTimestamp.toDate).toHaveBeenCalledTimes(1);
    });

    it('should calculate spent percentage correctly', () => {
      // Arrange
      const mockTimestamp: MockTimestamp = {
        toDate: vi.fn(() => new Date()),
        seconds: 1640995200,
        nanoseconds: 0,
      };

      const firestoreDoc: EventDocument = {
        name: 'Test Event',
        type: 'birthday',
        eventDate: mockTimestamp as unknown as Timestamp,
        totalBudgetedAmount: 1000,
        totalSpentAmount: 750,
        status: 'on-track',
        currency: 'USD',
        _createdDate: mockTimestamp as unknown as Timestamp,
        _createdBy: 'user123',
        _updatedDate: mockTimestamp as unknown as Timestamp,
        _updatedBy: 'user123',
      };

      // Act
      const result = eventConverter.fromFirestore('test-event', firestoreDoc);

      // Assert
      expect(result.spentPercentage).toBe(75); // (750 / 1000) * 100 = 75
    });

    it('should handle zero budget when calculating percentage', () => {
      // Arrange
      const mockTimestamp: MockTimestamp = {
        toDate: vi.fn(() => new Date()),
        seconds: 1640995200,
        nanoseconds: 0,
      };

      const firestoreDoc: EventDocument = {
        name: 'Free Event',
        type: 'other',
        eventDate: mockTimestamp as unknown as Timestamp,
        totalBudgetedAmount: 0,
        totalSpentAmount: 100,
        status: 'over-budget',
        currency: 'USD',
        _createdDate: mockTimestamp as unknown as Timestamp,
        _createdBy: 'user123',
        _updatedDate: mockTimestamp as unknown as Timestamp,
        _updatedBy: 'user123',
      };

      // Act
      const result = eventConverter.fromFirestore('free-event', firestoreDoc);

      // Assert
      expect(result.spentPercentage).toBe(0); // Avoid division by zero
    });

    it('should handle missing timestamps gracefully', () => {
      // Arrange
      const firestoreDoc: EventDocument = {
        name: 'Emergency Event',
        type: 'other',
        eventDate: null as unknown as Timestamp,
        totalBudgetedAmount: 5000,
        totalSpentAmount: 2500,
        status: 'on-track',
        currency: 'USD',
        _createdDate: null as unknown as Timestamp,
        _createdBy: 'system',
        _updatedDate: undefined as unknown as Timestamp,
        _updatedBy: 'system',
      };

      // Act
      const result = eventConverter.fromFirestore(
        'emergency-event',
        firestoreDoc,
      );

      // Assert
      expect(result._createdDate).toBeInstanceOf(Date);
      expect(result._updatedDate).toBeInstanceOf(Date);
      expect(result.eventDate).toBeInstanceOf(Date); // Should have fallback Date
      expect(result.spentPercentage).toBe(50); // (2500 / 5000) * 100 = 50
    });

    it('should preserve event type and status correctly', () => {
      // Arrange
      const mockTimestamp: MockTimestamp = {
        toDate: vi.fn(() => new Date()),
        seconds: 1640995200,
        nanoseconds: 0,
      };

      const firestoreDoc: EventDocument = {
        name: 'Graduation Party',
        type: 'graduation',
        eventDate: mockTimestamp as unknown as Timestamp,
        totalBudgetedAmount: 8000,
        totalSpentAmount: 8500,
        status: 'over-budget',
        currency: 'EUR',
        _createdDate: mockTimestamp as unknown as Timestamp,
        _createdBy: 'user456',
        _updatedDate: mockTimestamp as unknown as Timestamp,
        _updatedBy: 'user456',
      };

      // Act
      const result = eventConverter.fromFirestore(
        'graduation-event',
        firestoreDoc,
      );

      // Assert
      expect(result.type).toBe('graduation');
      expect(result.status).toBe('over-budget');
      expect(result.spentPercentage).toBe(106); // (8500 / 8000) * 100 = 106.25, rounded = 106
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through conversion cycle', () => {
      // Arrange
      const originalEvent: Event = {
        id: 'roundtrip-test',
        name: 'Anniversary Dinner',
        type: 'anniversary',
        description: 'Romantic dinner celebration',
        eventDate: new Date('2024-09-20T00:00:00Z'),
        totalBudgetedAmount: 3000,
        totalSpentAmount: 2800,
        spentPercentage: 93,
        status: 'on-track',
        currency: CurrencyImplementation.USD,
        _createdDate: new Date('2024-01-15T10:30:00Z'),
        _createdBy: 'test-user',
        _updatedDate: new Date('2024-01-20T14:45:00Z'),
        _updatedBy: 'test-user',
      };

      // Act - Convert to Firestore and back
      const firestoreResult = eventConverter.toFirestore(originalEvent);

      // Mock the timestamp toDate behavior for the round trip
      const mockCreatedTimestamp = {
        toDate: vi.fn(() => originalEvent._createdDate),
      };
      const mockUpdatedTimestamp = {
        toDate: vi.fn(() => originalEvent._updatedDate),
      };

      // Safely access document and id
      expect(firestoreResult.document).toBeDefined();
      expect(firestoreResult.id).toBeDefined();

      if (!firestoreResult.document || !firestoreResult.id) {
        throw new Error('Firestore conversion failed');
      }

      const mockFirestoreDoc = {
        ...firestoreResult.document,
        _createdDate: mockCreatedTimestamp as unknown as Timestamp,
        _updatedDate: mockUpdatedTimestamp as unknown as Timestamp,
      };

      const backToClient = eventConverter.fromFirestore(
        firestoreResult.id,
        mockFirestoreDoc,
      );

      // Assert - Note: spentPercentage is recalculated, so we check other fields
      expect(backToClient.id).toBe(originalEvent.id);
      expect(backToClient.name).toBe(originalEvent.name);
      expect(backToClient.type).toBe(originalEvent.type);
      expect(backToClient.totalBudgetedAmount).toBe(
        originalEvent.totalBudgetedAmount,
      );
      expect(backToClient.totalSpentAmount).toBe(
        originalEvent.totalSpentAmount,
      );
      expect(backToClient.spentPercentage).toBe(93); // Recalculated: (2800 / 3000) * 100 = 93.33, rounded = 93
      expect(backToClient._createdDate).toEqual(originalEvent._createdDate);
      expect(backToClient._updatedDate).toEqual(originalEvent._updatedDate);
    });
  });

  describe('edge cases', () => {
    it('should handle very large budget amounts', () => {
      // Arrange
      const eventWithLargeBudget: Partial<Event> = {
        id: 'large-budget-event',
        name: 'Corporate Event',
        type: 'other',
        eventDate: new Date('2024-12-31T00:00:00Z'),
        totalBudgetedAmount: 1000000,
        totalSpentAmount: 999999,
        status: 'on-track',
        currency: CurrencyImplementation.USD,
      };

      // Act
      const result = eventConverter.toFirestore(eventWithLargeBudget);

      // Assert
      expect(result.document?.totalBudgetedAmount).toBe(1000000);
      expect(result.document?.totalSpentAmount).toBe(999999);
    });

    it('should handle special characters in event names and descriptions', () => {
      // Arrange
      const eventWithSpecialChars: Partial<Event> = {
        id: 'special-chars-event',
        name: 'Fiesta de Quinceañera - María José',
        type: 'birthday',
        description: 'Una celebración especial con música & baile 🎉',
        eventDate: new Date('2024-07-15T00:00:00Z'),
        totalBudgetedAmount: 15000,
        totalSpentAmount: 12000,
        status: 'under-budget',
        currency: CurrencyImplementation.PHP,
      };

      // Act
      const result = eventConverter.toFirestore(eventWithSpecialChars);

      // Assert
      expect(result.document?.name).toBe('Fiesta de Quinceañera - María José');
      expect(result.document?.description).toBe(
        'Una celebración especial con música & baile 🎉',
      );
    });

    it('should handle decimal amounts correctly', () => {
      // Arrange
      const mockTimestamp: MockTimestamp = {
        toDate: vi.fn(() => new Date()),
        seconds: 1640995200,
        nanoseconds: 0,
      };

      const firestoreDoc: EventDocument = {
        name: 'Precise Budget Event',
        type: 'other',
        eventDate: mockTimestamp as unknown as Timestamp,
        totalBudgetedAmount: 333.33,
        totalSpentAmount: 111.11,
        status: 'under-budget',
        currency: 'USD',
        _createdDate: mockTimestamp as unknown as Timestamp,
        _createdBy: 'user123',
        _updatedDate: mockTimestamp as unknown as Timestamp,
        _updatedBy: 'user123',
      };

      // Act
      const result = eventConverter.fromFirestore(
        'precise-event',
        firestoreDoc,
      );

      // Assert
      expect(result.spentPercentage).toBe(33); // (111.11 / 333.33) * 100 = 33.33, rounded = 33
    });
  });
});
