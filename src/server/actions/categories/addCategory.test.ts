import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '../../lib/firebase-admin';
import { type AddCategoryDto, addCategory } from './addCategory';

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

describe('addCategory', () => {
  const mockSet = vi.fn();
  const mockGet = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn();

  const mockUserId = 'user123';
  const mockEventId = 'event456';
  const mockCategoryId = 'category789';

  const validAddCategoryDto: AddCategoryDto = {
    userId: mockUserId,
    eventId: mockEventId,
    name: 'Venue & Reception',
    description: 'Wedding venue and reception costs',
    budgetedAmount: 5000,
    color: '#059669',
    icon: 'home',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the mock chain for Firestore operations
    mockSet.mockResolvedValue(undefined);
    mockGet.mockResolvedValue({ exists: true });
    mockDoc.mockReturnValue({
      id: mockCategoryId,
      set: mockSet,
      get: mockGet,
    });
    mockCollection.mockReturnValue({
      doc: mockDoc,
    });

    // Setup the full chain: db.collection().doc().collection().doc().collection().doc()
    (db.collection as any).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          doc: vi.fn().mockReturnValue({
            get: mockGet, // for event existence check
            collection: mockCollection,
          }),
        }),
      }),
    });
  });

  describe('validation', () => {
    it('should throw error if userId is missing', async () => {
      const dto = { ...validAddCategoryDto, userId: '' };

      await expect(addCategory(dto)).rejects.toThrow('User ID is required');
    });

    it('should throw error if eventId is missing', async () => {
      const dto = { ...validAddCategoryDto, eventId: '' };

      await expect(addCategory(dto)).rejects.toThrow('Event ID is required');
    });

    it('should throw error if name is missing', async () => {
      const dto = { ...validAddCategoryDto, name: '' };

      await expect(addCategory(dto)).rejects.toThrow(
        'Category name is required',
      );
    });

    it('should throw error if name is only whitespace', async () => {
      const dto = { ...validAddCategoryDto, name: '   ' };

      await expect(addCategory(dto)).rejects.toThrow(
        'Category name is required',
      );
    });

    it('should throw error if budgetedAmount is negative', async () => {
      const dto = { ...validAddCategoryDto, budgetedAmount: -100 };

      await expect(addCategory(dto)).rejects.toThrow(
        'Budget amount cannot be negative',
      );
    });

    it('should throw error if color is missing', async () => {
      const dto = { ...validAddCategoryDto, color: '' };

      await expect(addCategory(dto)).rejects.toThrow(
        'Category color is required',
      );
    });

    it('should throw error if color is only whitespace', async () => {
      const dto = { ...validAddCategoryDto, color: '   ' };

      await expect(addCategory(dto)).rejects.toThrow(
        'Category color is required',
      );
    });

    it('should allow budgetedAmount of zero', async () => {
      const dto = { ...validAddCategoryDto, budgetedAmount: 0 };

      const result = await addCategory(dto);
      expect(result).toBe(mockCategoryId);
    });
  });

  describe('event verification', () => {
    it('should throw error if event does not exist', async () => {
      mockGet.mockResolvedValue({ exists: false });

      await expect(addCategory(validAddCategoryDto)).rejects.toThrow(
        'Event not found. Please ensure the event exists.',
      );
    });
  });

  describe('successful creation', () => {
    it('should create category with valid data', async () => {
      const result = await addCategory(validAddCategoryDto);

      expect(result).toBe(mockCategoryId);
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          name: validAddCategoryDto.name,
          description: validAddCategoryDto.description,
          budgetedAmount: validAddCategoryDto.budgetedAmount,
          spentAmount: 0,
          color: validAddCategoryDto.color,
          _createdBy: mockUserId,
          _updatedBy: mockUserId,
        }),
      );

      // Verify timestamps are Timestamp objects
      const setCall = mockSet.mock.calls[0][0];
      expect(setCall._createdDate).toBeInstanceOf(Timestamp);
      expect(setCall._updatedDate).toBeInstanceOf(Timestamp);
    });

    it('should trim whitespace from name and description', async () => {
      const dto = {
        ...validAddCategoryDto,
        name: '  Venue & Reception  ',
        description: '  Wedding venue costs  ',
      };

      await addCategory(dto);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Venue & Reception',
          description: 'Wedding venue costs',
        }),
      );
    });

    it('should handle empty description', async () => {
      const dto = { ...validAddCategoryDto, description: undefined };

      await addCategory(dto);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          description: '',
        }),
      );
    });

    it('should trim whitespace from color', async () => {
      const dto = { ...validAddCategoryDto, color: '  #059669  ' };

      await addCategory(dto);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          color: '#059669',
        }),
      );
    });

    it('should initialize spentAmount to zero', async () => {
      await addCategory(validAddCategoryDto);

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          spentAmount: 0,
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should handle Firestore errors gracefully', async () => {
      const firestoreError = new Error('Firestore connection failed');
      mockSet.mockRejectedValue(firestoreError);

      await expect(addCategory(validAddCategoryDto)).rejects.toThrow(
        'Failed to create category: Firestore connection failed',
      );
    });

    it('should handle unknown errors', async () => {
      mockSet.mockRejectedValue('Unknown error');

      await expect(addCategory(validAddCategoryDto)).rejects.toThrow(
        'Failed to create category: Unknown error',
      );
    });
  });

  describe('Firestore path structure', () => {
    it('should use correct Firestore path structure', async () => {
      await addCategory(validAddCategoryDto);

      expect(db.collection).toHaveBeenCalledWith('workspaces');
      expect(mockCollection).toHaveBeenCalledWith('categories');
    });
  });
});
