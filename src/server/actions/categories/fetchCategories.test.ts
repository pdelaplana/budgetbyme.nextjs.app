import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BudgetCategory } from '@/types/BudgetCategory';
import { db } from '../../lib/firebase-admin';
import type { BudgetCategoryDocument } from '../../types/BudgetCategoryDocument';
import { fetchCategories } from './fetchCategories';

// Mock Firebase Admin
vi.mock('../../lib/firebase-admin', () => ({
  db: {
    collection: vi.fn(),
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

describe('fetchCategories', () => {
  const mockGet = vi.fn();
  const mockOrderBy = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockUserId = 'user123';
  const mockEventId = 'event456';
  const mockTimestamp = Timestamp.fromDate(new Date('2023-11-01'));

  const mockCategoryData: BudgetCategoryDocument = {
    name: 'Venue & Reception',
    description: 'Wedding venue and reception costs',
    budgettedAmount: 5000,
    spentAmount: 1200,
    color: '#059669',
    _createdDate: mockTimestamp,
    _createdBy: 'user123',
    _updatedDate: mockTimestamp,
    _updatedBy: 'user123',
  };

  const mockCategoryDoc = {
    id: 'category789',
    data: () => mockCategoryData,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Firebase mock chain for: workspaces/{userId}/events/{eventId}/categories
    mockOrderBy.mockReturnValue({
      get: mockGet,
    });

    mockCollection.mockReturnValue({
      orderBy: mockOrderBy,
    });

    mockDoc.mockReturnValue({
      get: mockGet, // for event existence check
      collection: mockCollection,
    });

    vi.mocked(db.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          doc: mockDoc,
        }),
      }),
    } as any);
  });

  describe('validation', () => {
    it('should throw error if userId is missing', async () => {
      await expect(fetchCategories('', mockEventId)).rejects.toThrow(
        'User ID is required',
      );
    });

    it('should throw error if eventId is missing', async () => {
      await expect(fetchCategories(mockUserId, '')).rejects.toThrow(
        'Event ID is required',
      );
    });
  });

  describe('event verification', () => {
    it('should throw error if event does not exist', async () => {
      mockGet.mockResolvedValueOnce({ exists: false }); // First call for event existence check

      await expect(fetchCategories(mockUserId, mockEventId)).rejects.toThrow(
        'Event not found. Please ensure the event exists.',
      );
    });
  });

  describe('successful fetch', () => {
    it('should return empty array when no categories exist', async () => {
      mockGet.mockResolvedValueOnce({ exists: true }); // Event exists
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] }); // No categories

      const result = await fetchCategories(mockUserId, mockEventId);

      expect(result).toEqual([]);
    });

    it('should return categories when they exist', async () => {
      mockGet.mockResolvedValueOnce({ exists: true }); // Event exists
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [mockCategoryDoc],
      }); // Categories exist

      const result = await fetchCategories(mockUserId, mockEventId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'category789',
        name: 'Venue & Reception',
        budgettedAmount: 5000,
        spentAmount: 1200,
        color: '#059669',
        _createdDate: new Date('2023-11-01'),
        _createdBy: 'user123',
        _updatedDate: new Date('2023-11-01'),
        _updatedBy: 'user123',
      });
    });

    it('should return multiple categories ordered by creation date', async () => {
      const category2Data: BudgetCategoryDocument = {
        name: 'Photography',
        description: 'Professional photography services',
        budgettedAmount: 2000,
        spentAmount: 0,
        color: '#7C3AED',
        _createdDate: Timestamp.fromDate(new Date('2023-11-02')),
        _createdBy: 'user123',
        _updatedDate: Timestamp.fromDate(new Date('2023-11-02')),
        _updatedBy: 'user123',
      };

      const mockCategory2Doc = {
        id: 'category790',
        data: () => category2Data,
      };

      mockGet.mockResolvedValueOnce({ exists: true }); // Event exists
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [mockCategoryDoc, mockCategory2Doc],
      }); // Multiple categories

      const result = await fetchCategories(mockUserId, mockEventId);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Venue & Reception');
      expect(result[1].name).toBe('Photography');
    });

    it('should handle categories without description', async () => {
      const categoryWithoutDescription: BudgetCategoryDocument = {
        ...mockCategoryData,
        description: '',
      };

      const mockDocWithoutDesc = {
        id: 'category789',
        data: () => categoryWithoutDescription,
      };

      mockGet.mockResolvedValueOnce({ exists: true }); // Event exists
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [mockDocWithoutDesc],
      });

      const result = await fetchCategories(mockUserId, mockEventId);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Venue & Reception');
    });
  });

  describe('error handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      const firestoreError = new Error('Firestore connection failed');
      mockGet.mockRejectedValue(firestoreError);

      await expect(fetchCategories(mockUserId, mockEventId)).rejects.toThrow(
        'Failed to fetch categories: Firestore connection failed',
      );
    });

    it('should handle unknown errors', async () => {
      mockGet.mockRejectedValue('Unknown error');

      await expect(fetchCategories(mockUserId, mockEventId)).rejects.toThrow(
        'Failed to fetch categories: Unknown error',
      );
    });
  });

  describe('Firestore operations', () => {
    it('should use correct Firestore path structure', async () => {
      mockGet.mockResolvedValueOnce({ exists: true }); // Event exists
      mockGet.mockResolvedValueOnce({ empty: true, docs: [] }); // No categories

      await fetchCategories(mockUserId, mockEventId);

      expect(db.collection).toHaveBeenCalledWith('workspaces');
      expect(mockDoc).toHaveBeenCalledWith(mockUserId);
      expect(mockCollection).toHaveBeenCalledWith('categories');
      expect(mockOrderBy).toHaveBeenCalledWith('_createdDate', 'asc');
    });
  });
});
