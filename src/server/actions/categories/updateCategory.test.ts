import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../lib/firebase-admin';
import { type UpdateCategoryDto, updateCategory } from './updateCategory';

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

describe('updateCategory', () => {
  const mockUpdate = vi.fn();
  const mockGet = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockUserId = 'user123';
  const mockEventId = 'event456';
  const mockCategoryId = 'category789';

  const validUpdateDto: UpdateCategoryDto = {
    userId: mockUserId,
    eventId: mockEventId,
    categoryId: mockCategoryId,
    name: 'Updated Category Name',
    description: 'Updated description',
    budgetedAmount: 6000,
    color: '#7C3AED',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockUpdate.mockResolvedValue(undefined);
    mockGet.mockResolvedValue({ exists: true });
    mockDoc.mockReturnValue({
      update: mockUpdate,
      get: mockGet,
    });
    mockCollection.mockReturnValue({
      doc: mockDoc,
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
      const dto = { ...validUpdateDto, userId: '' };

      await expect(updateCategory(dto)).rejects.toThrow('User ID is required');
    });

    it('should throw error if eventId is missing', async () => {
      const dto = { ...validUpdateDto, eventId: '' };

      await expect(updateCategory(dto)).rejects.toThrow('Event ID is required');
    });

    it('should throw error if categoryId is missing', async () => {
      const dto = { ...validUpdateDto, categoryId: '' };

      await expect(updateCategory(dto)).rejects.toThrow(
        'Category ID is required',
      );
    });

    it('should throw error if no fields are provided for update', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
      };

      await expect(updateCategory(dto)).rejects.toThrow(
        'At least one field must be provided for update',
      );
    });

    it('should throw error if budgetedAmount is negative', async () => {
      const dto = { ...validUpdateDto, budgetedAmount: -100 };

      await expect(updateCategory(dto)).rejects.toThrow(
        'Budget amount cannot be negative',
      );
    });

    it('should throw error if name is empty string', async () => {
      const dto = { ...validUpdateDto, name: '' };

      await expect(updateCategory(dto)).rejects.toThrow(
        'Category name cannot be empty',
      );
    });

    it('should throw error if name is only whitespace', async () => {
      const dto = { ...validUpdateDto, name: '   ' };

      await expect(updateCategory(dto)).rejects.toThrow(
        'Category name cannot be empty',
      );
    });

    it('should throw error if color is empty string', async () => {
      const dto = { ...validUpdateDto, color: '' };

      await expect(updateCategory(dto)).rejects.toThrow(
        'Category color cannot be empty',
      );
    });

    it('should throw error if color is only whitespace', async () => {
      const dto = { ...validUpdateDto, color: '   ' };

      await expect(updateCategory(dto)).rejects.toThrow(
        'Category color cannot be empty',
      );
    });

    it('should allow budgetedAmount of zero', async () => {
      const dto = { ...validUpdateDto, budgetedAmount: 0 };

      const result = await updateCategory(dto);
      expect(result).toBe(mockCategoryId);
    });

    it('should allow empty description', async () => {
      const dto = { ...validUpdateDto, description: '' };

      const result = await updateCategory(dto);
      expect(result).toBe(mockCategoryId);
    });
  });

  describe('category existence check', () => {
    it('should throw error if category does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });

      await expect(updateCategory(validUpdateDto)).rejects.toThrow(
        'Category not found. Please ensure the category exists.',
      );
    });
  });

  describe('successful updates', () => {
    it('should update all fields when provided', async () => {
      const result = await updateCategory(validUpdateDto);

      expect(result).toBe(mockCategoryId);
      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.name).toBe('Updated Category Name');
      expect(updateCall.description).toBe('Updated description');
      expect(updateCall.budgetedAmount).toBe(6000);
      expect(updateCall.color).toBe('#7C3AED');
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should update only name when provided', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        name: 'New Name Only',
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.name).toBe('New Name Only');
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should update only budgetedAmount when provided', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        budgetedAmount: 3000,
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.budgetedAmount).toBe(3000);
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should trim whitespace from name', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        name: '  Trimmed Name  ',
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.name).toBe('Trimmed Name');
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should trim whitespace from description', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        description: '  Trimmed Description  ',
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.description).toBe('Trimmed Description');
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should trim whitespace from color', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        color: '  #FF0000  ',
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.color).toBe('#FF0000');
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should handle empty string description', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        description: '',
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall.description).toBe('');
      expect(updateCall._updatedBy).toBe(mockUserId);
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
    });

    it('should always update timestamp fields', async () => {
      const dto = {
        userId: mockUserId,
        eventId: mockEventId,
        categoryId: mockCategoryId,
        name: 'Test Update',
      };

      await updateCategory(dto);

      const updateCall = mockUpdate.mock.calls[0][0];
      expect(updateCall._updatedDate).toBeDefined();
      expect(typeof updateCall._updatedDate.toDate).toBe('function');
      expect(updateCall._updatedBy).toBe(mockUserId);
    });
  });

  describe('error handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      const firestoreError = new Error('Firestore connection failed');
      mockUpdate.mockRejectedValue(firestoreError);

      await expect(updateCategory(validUpdateDto)).rejects.toThrow(
        'Failed to update category: Firestore connection failed',
      );
    });

    it('should handle unknown errors', async () => {
      mockUpdate.mockRejectedValue('Unknown error');

      await expect(updateCategory(validUpdateDto)).rejects.toThrow(
        'Failed to update category: Unknown error',
      );
    });
  });

  describe('Firestore path structure', () => {
    it('should use correct Firestore path structure', async () => {
      await updateCategory(validUpdateDto);

      expect(db.collection).toHaveBeenCalledWith('workspaces');
    });
  });
});
