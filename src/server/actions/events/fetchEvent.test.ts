import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Currency, CurrencyImplementation } from '@/types/currencies';
import type { Event } from '@/types/Event';
import { eventConverter } from '../../lib/converters/eventConverter';
import { db } from '../../lib/firebase-admin';
import type { EventDocument } from '../../types/EventDocument';
import { fetchEvent } from './fetchEvent';

// Mock Firebase Admin
vi.mock('../../lib/firebase-admin', () => ({
  db: {
    collection: vi.fn(),
  },
}));

// Mock eventConverter
vi.mock('../../lib/converters/eventConverter', () => ({
  eventConverter: {
    fromFirestore: vi.fn(),
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
}));

// Mock withSentryServerAction to pass through the function
vi.mock('../../lib/sentryServerAction', () => ({
  withSentryServerAction: vi.fn((_name, fn) => fn),
}));

describe('fetchEvent', () => {
  const mockGet = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockUserId = 'user123';
  const mockEventId = 'event456';

  const mockTimestamp = Timestamp.fromDate(new Date('2023-11-01'));

  const mockEventData: EventDocument = {
    name: 'Test Event',
    type: 'wedding',
    description: 'A test event',
    eventDate: mockTimestamp,
    totalBudgetedAmount: 1000,
    totalSpentAmount: 500,
    status: 'on-track',
    currency: 'AUD',
    _createdDate: mockTimestamp,
    _createdBy: 'user123',
    _updatedDate: mockTimestamp,
    _updatedBy: 'user123',
  };

  const mockEvent: Event = {
    id: mockEventId,
    name: 'Test Event',
    type: 'wedding',
    description: 'A test event',
    eventDate: new Date('2023-11-01'),
    totalBudgetedAmount: 1000,
    totalSpentAmount: 500,
    spentPercentage: 50,
    status: 'on-track',
    currency: CurrencyImplementation.AUD,
    _createdDate: new Date('2023-11-01'),
    _createdBy: 'user123',
    _updatedDate: new Date('2023-11-01'),
    _updatedBy: 'user123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Firebase mock chain - simplified
    const mockFirestoreChain = {
      get: mockGet,
    };

    mockCollection.mockReturnValue({
      doc: vi.fn().mockReturnValue(mockFirestoreChain),
    });

    mockDoc.mockReturnValue({
      collection: mockCollection,
    });

    vi.mocked(db.collection).mockReturnValue({
      doc: mockDoc,
    } as any);
  });

  it('should fetch an event successfully', async () => {
    // Mock successful document fetch
    mockGet.mockResolvedValue({
      exists: true,
      id: mockEventId,
      data: () => mockEventData,
    });

    const result = await fetchEvent(mockUserId, mockEventId);

    expect(result).toEqual({
      id: mockEventId,
      document: mockEventData,
    });
    expect(db.collection).toHaveBeenCalledWith('workspaces');
    expect(mockDoc).toHaveBeenCalledWith(mockUserId);
    expect(mockCollection).toHaveBeenCalledWith('events');
  });

  it('should return null when event does not exist', async () => {
    // Mock non-existent document
    mockGet.mockResolvedValue({
      exists: false,
    });

    await expect(fetchEvent(mockUserId, mockEventId)).rejects.toThrow(
      'Event not found',
    );
  });

  it('should throw error when userId is missing', async () => {
    await expect(fetchEvent('', mockEventId)).rejects.toThrow(
      'User ID is required',
    );
  });

  it('should throw error when eventId is missing', async () => {
    await expect(fetchEvent(mockUserId, '')).rejects.toThrow(
      'Event ID is required',
    );
  });

  it('should handle Firebase errors gracefully', async () => {
    const firebaseError = new Error('Firebase connection failed');
    mockGet.mockRejectedValue(firebaseError);

    await expect(fetchEvent(mockUserId, mockEventId)).rejects.toThrow(
      'Failed to fetch event: Firebase connection failed',
    );
  });
});
