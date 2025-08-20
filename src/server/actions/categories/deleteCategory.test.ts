import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../lib/firebase-admin';
import { deleteCategory } from './deleteCategory';

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

describe('deleteCategory', () => {
  const mockDelete = vi.fn();
  const mockGet = vi.fn();
  const mockWhere = vi.fn();
  const mockLimit = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockUserId = 'user123';
  const mockEventId = 'event456';
  const mockCategoryId = 'category789';

  const mockCategoryData = {
    name: 'Venue & Reception',
    description: 'Wedding venue costs',
    budgettedAmount: 5000,
    spentAmount: 1200,
    color: '#059669',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockDelete.mockResolvedValue(undefined);
    mockGet.mockResolvedValue({ exists: true, data: () => mockCategoryData });
    mockLimit.mockReturnValue({ get: mockGet });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockDoc.mockReturnValue({
      delete: mockDelete,
      get: mockGet,
    });
    mockCollection.mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
    });

    // Setup the full chain for Firestore operations
    (db.collection as any).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            collection: mockCollection,
          }),
        }),
      }),
    });
  });

  describe('validation', () => {
    it('should throw error if userId is missing', async () => {
      await expect(deleteCategory('', mockEventId, mockCategoryId)).rejects.toThrow(
        'User ID is required'
      );
    });

    it('should throw error if eventId is missing', async () => {
      await expect(deleteCategory(mockUserId, '', mockCategoryId)).rejects.toThrow(
        'Event ID is required'
      );
    });

    it('should throw error if categoryId is missing', async () => {
      await expect(deleteCategory(mockUserId, mockEventId, '')).rejects.toThrow(
        'Category ID is required'
      );
    });
  });

  describe('category existence check', () => {
    it('should throw error if category does not exist', async () => {
      mockGet.mockResolvedValueOnce({ exists: false }); // First call for category existence

      await expect(deleteCategory(mockUserId, mockEventId, mockCategoryId)).rejects.toThrow(
        'Category not found. It may have already been deleted.'
      );
    });
  });

  describe('expense dependency check', () => {
    it('should throw error if category is used by expenses', async () => {
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockCategoryData }); // Category exists
      mockGet.mockResolvedValueOnce({ empty: false }); // Expenses with this category exist

      await expect(deleteCategory(mockUserId, mockEventId, mockCategoryId)).rejects.toThrow(
        'Cannot delete category because it is used by existing expenses. Please reassign or delete the expenses first.'
      );
    });

    it('should proceed with deletion if no expenses use the category', async () => {
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockCategoryData }); // Category exists
      mockGet.mockResolvedValueOnce({ empty: true }); // No expenses with this category

      await deleteCategory(mockUserId, mockEventId, mockCategoryId);

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('successful deletion', () => {
    beforeEach(() => {
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockCategoryData }); // Category exists
      mockGet.mockResolvedValueOnce({ empty: true }); // No expenses with this category
    });

    it('should delete category when valid parameters provided', async () => {
      await deleteCategory(mockUserId, mockEventId, mockCategoryId);

      expect(mockDelete).toHaveBeenCalled();
    });

    it('should check for expenses using the category before deletion', async () => {
      await deleteCategory(mockUserId, mockEventId, mockCategoryId);

      expect(mockWhere).toHaveBeenCalledWith('category.id', '==', mockCategoryId);
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe('error handling', () => {
    beforeEach(() => {
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockCategoryData }); // Category exists
      mockGet.mockResolvedValueOnce({ empty: true }); // No expenses with this category
    });

    it('should handle Firestore errors gracefully', async () => {
      const firestoreError = new Error('Firestore connection failed');
      mockDelete.mockRejectedValue(firestoreError);

      await expect(deleteCategory(mockUserId, mockEventId, mockCategoryId)).rejects.toThrow(
        'Failed to delete category: Firestore connection failed'
      );
    });

    it('should handle unknown errors', async () => {
      mockDelete.mockRejectedValue('Unknown error');

      await expect(deleteCategory(mockUserId, mockEventId, mockCategoryId)).rejects.toThrow(
        'Failed to delete category: Unknown error'
      );
    });

    it('should handle errors during expense dependency check', async () => {
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockCategoryData }); // Category exists
      const expenseCheckError = new Error('Failed to check expenses');
      mockGet.mockRejectedValueOnce(expenseCheckError); // Expense check fails

      await expect(deleteCategory(mockUserId, mockEventId, mockCategoryId)).rejects.toThrow(
        'Failed to delete category: Failed to check expenses'
      );
    });
  });

  describe('Firestore operations', () => {
    beforeEach(() => {
      mockGet.mockResolvedValueOnce({ exists: true, data: () => mockCategoryData }); // Category exists
      mockGet.mockResolvedValueOnce({ empty: true }); // No expenses with this category
    });

    it('should use correct Firestore path structure for category deletion', async () => {
      await deleteCategory(mockUserId, mockEventId, mockCategoryId);

      expect(db.collection).toHaveBeenCalledWith('workspaces');
    });

    it('should use correct Firestore path structure for expense check', async () => {
      await deleteCategory(mockUserId, mockEventId, mockCategoryId);

      expect(mockCollection).toHaveBeenCalledWith('categories');
      expect(mockCollection).toHaveBeenCalledWith('expenses');
    });
  });
});