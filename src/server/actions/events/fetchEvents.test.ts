import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Currency } from '@/types/currencies';
import type { Event } from '@/types/Event';
import { eventConverter } from '../../lib/converters/eventConverter';
import { db } from '../../lib/firebase-admin';
import type { EventDocument } from '../../types/EventDocument';
import { fetchEvents } from './fetchEvents';

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

describe('fetchEvents', () => {
  const mockGet = vi.fn();
  const mockOrderBy = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockUserId = 'user123';
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
    id: 'event456',
    name: 'Test Event',
    type: 'wedding',
    description: 'A test event',
    eventDate: new Date('2023-11-01'),
    totalBudgetedAmount: 1000,
    totalSpentAmount: 500,
    spentPercentage: 50,
    status: 'on-track',
    currency: Currency.AUD,
    _createdDate: new Date('2023-11-01'),
    _createdBy: 'user123',
    _updatedDate: new Date('2023-11-01'),
    _updatedBy: 'user123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Firebase mock chain
    mockOrderBy.mockReturnValue({
      get: mockGet,
    });

    mockCollection.mockReturnValue({
      orderBy: mockOrderBy,
    });

    mockDoc.mockReturnValue({
      collection: mockCollection,
    });

    vi.mocked(db.collection).mockReturnValue({
      doc: mockDoc,
    } as any);
  });

  it('should fetch events successfully', async () => {
    // Mock successful document fetch
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'event456',
          data: () => mockEventData,
        },
      ],
    });

    // Mock converter
    vi.mocked(eventConverter.fromFirestore).mockReturnValue(mockEvent);

    const result = await fetchEvents(mockUserId);

    expect(result).toEqual([mockEvent]);
    expect(db.collection).toHaveBeenCalledWith('workspaces');
    expect(mockDoc).toHaveBeenCalledWith(mockUserId);
    expect(mockCollection).toHaveBeenCalledWith('events');
    expect(mockOrderBy).toHaveBeenCalledWith('eventDate', 'asc');
    expect(eventConverter.fromFirestore).toHaveBeenCalledWith(
      'event456',
      mockEventData,
    );
  });

  it('should return empty array when no events found', async () => {
    // Mock empty collection
    mockGet.mockResolvedValue({
      empty: true,
      docs: [],
    });

    const result = await fetchEvents(mockUserId);

    expect(result).toEqual([]);
    expect(eventConverter.fromFirestore).not.toHaveBeenCalled();
  });

  it('should throw error when userId is missing', async () => {
    await expect(fetchEvents('')).rejects.toThrow('User ID is required');
  });

  it('should handle Firebase errors gracefully', async () => {
    const firebaseError = new Error('Firebase connection failed');
    mockGet.mockRejectedValue(firebaseError);

    await expect(fetchEvents(mockUserId)).rejects.toThrow(
      'Failed to fetch events: Firebase connection failed',
    );
  });

  it('should fetch multiple events and convert them all', async () => {
    const mockEventData2: EventDocument = {
      ...mockEventData,
      name: 'Second Event',
      type: 'birthday',
    };

    const mockEvent2: Event = {
      ...mockEvent,
      id: 'event789',
      name: 'Second Event',
      type: 'birthday',
    };

    // Mock successful document fetch with multiple docs
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'event456',
          data: () => mockEventData,
        },
        {
          id: 'event789',
          data: () => mockEventData2,
        },
      ],
    });

    // Mock converter for both calls
    vi.mocked(eventConverter.fromFirestore)
      .mockReturnValueOnce(mockEvent)
      .mockReturnValueOnce(mockEvent2);

    const result = await fetchEvents(mockUserId);

    expect(result).toEqual([mockEvent, mockEvent2]);
    expect(eventConverter.fromFirestore).toHaveBeenCalledTimes(2);
    expect(eventConverter.fromFirestore).toHaveBeenNthCalledWith(
      1,
      'event456',
      mockEventData,
    );
    expect(eventConverter.fromFirestore).toHaveBeenNthCalledWith(
      2,
      'event789',
      mockEventData2,
    );
  });
});
