import { Timestamp } from 'firebase-admin/firestore';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserWorkspaceDocument } from '@/server/types/UserWorkspaceDocument';
import type { UserWorkspace } from '@/types/UserWorkspace';
import { userWorkspaceConverter } from './userWorkspaceConverter';

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

describe('userWorkspaceConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toFirestore', () => {
    it('should convert UserWorkspace to Firestore format with all fields', () => {
      // Arrange
      const createdDate = new Date('2024-01-15T10:30:00Z');
      const updatedDate = new Date('2024-01-20T14:45:00Z');

      const userWorkspace: UserWorkspace = {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        preferences: {
          language: 'en',
          currency: 'USD',
        },
        _createdDate: createdDate,
        _createdBy: 'system',
        _updatedDate: updatedDate,
        _updatedBy: 'user123',
      };

      // Act
      const result = userWorkspaceConverter.toFirestore(userWorkspace);

      // Assert
      expect(result).toEqual({
        id: 'user123',
        document: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          preferences: {
            language: 'en',
            currency: 'USD',
          },
          _createdDate: expect.any(Object), // Timestamp object
          _createdBy: 'system',
          _updatedDate: expect.any(Object), // Timestamp object
          _updatedBy: 'user123',
        },
      });

      // Verify Timestamp.fromDate was called with correct dates
      expect(Timestamp.fromDate).toHaveBeenCalledWith(createdDate);
      expect(Timestamp.fromDate).toHaveBeenCalledWith(updatedDate);
      expect(Timestamp.fromDate).toHaveBeenCalledTimes(2);
    });

    it('should handle partial UserWorkspace data', () => {
      // Arrange
      const partialUserWorkspace: Partial<UserWorkspace> = {
        id: 'user456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        // Missing dates and other fields
      };

      // Act
      const result = userWorkspaceConverter.toFirestore(partialUserWorkspace);

      // Assert
      expect(result).toEqual({
        id: 'user456',
        document: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          _createdDate: expect.any(Object), // Timestamp.now()
          _updatedDate: expect.any(Object), // Timestamp.now()
        },
      });

      // Verify Timestamp.now was called for missing dates
      expect(Timestamp.now).toHaveBeenCalledTimes(2);
    });

    it('should use Timestamp.now() when dates are missing', () => {
      // Arrange
      const userWorkspaceWithoutDates: Partial<UserWorkspace> = {
        id: 'user789',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        preferences: {
          language: 'es',
          currency: 'EUR',
        },
        _createdBy: 'admin',
        _updatedBy: 'admin',
      };

      // Act
      const result = userWorkspaceConverter.toFirestore(
        userWorkspaceWithoutDates,
      );

      // Assert
      expect(result.document).toHaveProperty('_createdDate');
      expect(result.document).toHaveProperty('_updatedDate');
      expect(Timestamp.now).toHaveBeenCalledTimes(2);
    });

    it('should handle empty preferences object', () => {
      // Arrange
      const userWorkspace: Partial<UserWorkspace> = {
        id: 'user999',
        name: 'Test User',
        email: 'test@example.com',
        preferences: {
          language: '',
          currency: '',
        },
      };

      // Act
      const result = userWorkspaceConverter.toFirestore(userWorkspace);

      // Assert
      expect(result.document?.preferences).toEqual({
        language: '',
        currency: '',
      });
    });
  });

  describe('fromFirestore', () => {
    it('should convert Firestore document to UserWorkspace', () => {
      // Arrange
      const documentId = 'user123';
      const createdDate = new Date('2024-01-15T10:30:00Z');
      const updatedDate = new Date('2024-01-20T14:45:00Z');

      const mockTimestamp: MockTimestamp = {
        toDate: vi.fn(() => createdDate),
        seconds: Math.floor(createdDate.getTime() / 1000),
        nanoseconds: (createdDate.getTime() % 1000) * 1000000,
      };
      const mockUpdatedTimestamp: MockTimestamp = {
        toDate: vi.fn(() => updatedDate),
        seconds: Math.floor(updatedDate.getTime() / 1000),
        nanoseconds: (updatedDate.getTime() % 1000) * 1000000,
      };

      const firestoreDoc: UserWorkspaceDocument = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        preferences: {
          language: 'en',
          currency: 'USD',
        },
        _createdDate: mockTimestamp as unknown as Timestamp,
        _createdBy: 'system',
        _updatedDate: mockUpdatedTimestamp as unknown as Timestamp,
        _updatedBy: 'user123',
      };

      // Act
      const result = userWorkspaceConverter.fromFirestore(
        documentId,
        firestoreDoc,
      );

      // Assert
      expect(result).toEqual({
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        preferences: {
          language: 'en',
          currency: 'USD',
        },
        _createdDate: createdDate,
        _createdBy: 'system',
        _updatedDate: updatedDate,
        _updatedBy: 'user123',
      });

      // Verify toDate() was called on timestamps
      expect(mockTimestamp.toDate).toHaveBeenCalledTimes(1);
      expect(mockUpdatedTimestamp.toDate).toHaveBeenCalledTimes(1);
    });

    it('should handle missing timestamps gracefully', () => {
      // Arrange
      const documentId = 'user456';
      const firestoreDoc: UserWorkspaceDocument = {
        name: 'Jane Smith',
        email: 'jane@example.com',
        preferences: {
          language: 'es',
          currency: 'EUR',
        },
        _createdDate: null as unknown as Timestamp,
        _createdBy: 'system',
        _updatedDate: undefined as unknown as Timestamp,
        _updatedBy: 'user456',
      };

      // Act
      const result = userWorkspaceConverter.fromFirestore(
        documentId,
        firestoreDoc,
      );

      // Assert
      expect(result).toEqual({
        id: 'user456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        preferences: {
          language: 'es',
          currency: 'EUR',
        },
        _createdDate: expect.any(Date), // New Date() fallback
        _createdBy: 'system',
        _updatedDate: expect.any(Date), // New Date() fallback
        _updatedBy: 'user456',
      });

      // Verify the fallback dates are actual Date objects
      expect(result._createdDate).toBeInstanceOf(Date);
      expect(result._updatedDate).toBeInstanceOf(Date);
    });

    it('should preserve all document fields', () => {
      // Arrange
      const documentId = 'user789';
      const mockTimestamp: MockTimestamp = {
        toDate: vi.fn(() => new Date('2024-01-01T00:00:00Z')),
        seconds: 1704067200,
        nanoseconds: 0,
      };

      const firestoreDoc: UserWorkspaceDocument = {
        name: 'Complex User',
        email: 'complex@example.com',
        preferences: {
          language: 'fr',
          currency: 'CAD',
        },
        _createdDate: mockTimestamp as unknown as Timestamp,
        _createdBy: 'migration-script',
        _updatedDate: mockTimestamp as unknown as Timestamp,
        _updatedBy: 'admin-panel',
      };

      // Act
      const result = userWorkspaceConverter.fromFirestore(
        documentId,
        firestoreDoc,
      );

      // Assert
      expect(result.id).toBe(documentId);
      expect(result.name).toBe('Complex User');
      expect(result.email).toBe('complex@example.com');
      expect(result.preferences.language).toBe('fr');
      expect(result.preferences.currency).toBe('CAD');
      expect(result._createdBy).toBe('migration-script');
      expect(result._updatedBy).toBe('admin-panel');
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain data integrity through conversion cycle', () => {
      // Arrange
      const originalWorkspace: UserWorkspace = {
        id: 'roundtrip-test',
        name: 'Round Trip User',
        email: 'roundtrip@example.com',
        preferences: {
          language: 'de',
          currency: 'EUR',
        },
        _createdDate: new Date('2024-01-15T10:30:00Z'),
        _createdBy: 'test-system',
        _updatedDate: new Date('2024-01-20T14:45:00Z'),
        _updatedBy: 'test-user',
      };

      // Act - Convert to Firestore and back
      const firestoreResult =
        userWorkspaceConverter.toFirestore(originalWorkspace);

      // Mock the timestamp toDate behavior for the round trip
      const mockCreatedTimestamp = {
        toDate: vi.fn(() => originalWorkspace._createdDate),
      };
      const mockUpdatedTimestamp = {
        toDate: vi.fn(() => originalWorkspace._updatedDate),
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

      const backToClient = userWorkspaceConverter.fromFirestore(
        firestoreResult.id,
        mockFirestoreDoc,
      );

      // Assert
      expect(backToClient).toEqual(originalWorkspace);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      // Arrange
      const userWorkspace: Partial<UserWorkspace> = {
        id: '',
        name: '',
        email: '',
        preferences: {
          language: '',
          currency: '',
        },
      };

      // Act
      const result = userWorkspaceConverter.toFirestore(userWorkspace);

      // Assert
      expect(result.id).toBe('');
      expect(result.document?.name).toBe('');
      expect(result.document?.email).toBe('');
      expect(result.document?.preferences).toEqual({
        language: '',
        currency: '',
      });
    });

    it('should handle special characters in user data', () => {
      // Arrange
      const userWorkspace: Partial<UserWorkspace> = {
        id: 'special-chars-123',
        name: 'José María ñoño-test',
        email: 'josé.maría@example.com',
        preferences: {
          language: 'es-ES',
          currency: 'EUR',
        },
      };

      // Act
      const result = userWorkspaceConverter.toFirestore(userWorkspace);

      // Assert
      expect(result.document?.name).toBe('José María ñoño-test');
      expect(result.document?.email).toBe('josé.maría@example.com');
    });
  });
});
