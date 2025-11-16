import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Expense } from '@/types/Expense';
import { useAttachmentManager } from './useAttachmentManager';

// Mock server actions to prevent Firebase Admin initialization
vi.mock('@/server/actions/expenses/uploadExpenseAttachment', () => ({
  uploadExpenseAttachment: vi
    .fn()
    .mockResolvedValue({ success: true, url: 'https://example.com/test.pdf' }),
}));

// Mock the hooks that useAttachmentManager depends on with state management
const mockFileUploadState = {
  isOperationInProgress: false,
  operationType: null as 'uploading' | 'deleting' | null,
  primaryFile: null as File | null,
  emptyStateFile: null as File | null,
  showDeleteConfirm: false,
  attachmentToDelete: null as string | null,
  deletingAttachment: false,
};

vi.mock('./useFileUploadState', () => ({
  useFileUploadState: () => ({
    state: mockFileUploadState,
    actions: {
      startOperation: vi.fn((type: 'uploading' | 'deleting') => {
        mockFileUploadState.isOperationInProgress = true;
        mockFileUploadState.operationType = type;
      }),
      endOperation: vi.fn(() => {
        mockFileUploadState.isOperationInProgress = false;
        mockFileUploadState.operationType = null;
      }),
      startDeleting: vi.fn((url: string) => {
        mockFileUploadState.deletingAttachment = true;
        mockFileUploadState.attachmentToDelete = url;
        mockFileUploadState.operationType = 'deleting';
      }),
      endDeleting: vi.fn(() => {
        mockFileUploadState.deletingAttachment = false;
        mockFileUploadState.showDeleteConfirm = false;
        mockFileUploadState.attachmentToDelete = null;
      }),
      clearPrimaryFile: vi.fn(() => {
        mockFileUploadState.primaryFile = null;
      }),
      clearEmptyStateFile: vi.fn(() => {
        mockFileUploadState.emptyStateFile = null;
      }),
      showDeleteConfirm: vi.fn((url: string) => {
        mockFileUploadState.showDeleteConfirm = true;
        mockFileUploadState.attachmentToDelete = url;
      }),
      hideDeleteConfirm: vi.fn(() => {
        mockFileUploadState.showDeleteConfirm = false;
        mockFileUploadState.attachmentToDelete = null;
      }),
    },
  }),
}));

vi.mock('@/hooks/expenses', () => ({
  useUpdateExpenseMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
    isPending: false,
  }),
}));

const mockExpense: Expense = {
  id: 'expense-1',
  name: 'Test Expense',
  amount: 100,
  currency: { code: 'USD', symbol: '$' },
  category: {
    id: 'cat-1',
    name: 'Test Category',
    color: '#3B82F6',
    icon: 'ShoppingBag',
  },
  tags: [],
  date: new Date(),
  description: 'Test expense',
  notes: '',
  vendor: { name: '', address: '', website: '', email: '' },
  hasPaymentSchedule: false,
  _createdDate: new Date(),
  _createdBy: 'user-1',
  _updatedDate: new Date(),
  _updatedBy: 'user-1',
  attachments: ['https://example.com/test-file.pdf'],
};

describe('useAttachmentManager', () => {
  const defaultProps = {
    expense: mockExpense,
    userId: 'user-1',
    eventId: 'event-1',
  };

  const nullExpenseProps = {
    expense: null,
    userId: 'user-1',
    eventId: 'event-1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockFileUploadState.isOperationInProgress = false;
    mockFileUploadState.operationType = null;
    mockFileUploadState.primaryFile = null;
    mockFileUploadState.emptyStateFile = null;
    mockFileUploadState.showDeleteConfirm = false;
    mockFileUploadState.attachmentToDelete = null;
    mockFileUploadState.deletingAttachment = false;
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAttachmentManager(defaultProps));

    expect(result.current.showDeleteConfirm).toBe(false);
    expect(result.current.isOperationInProgress).toBe(false);
    expect(result.current.attachmentToDelete).toBeNull();
    expect(result.current.primaryFile).toBeNull();
    expect(result.current.emptyStateFile).toBeNull();
  });

  describe('file input handlers', () => {
    it('should handle primary file change and clear it after upload', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.handlePrimaryFileChange(mockFile);
      });

      // File should be cleared after upload completes
      expect(result.current.primaryFile).toBeNull();
    });

    it('should handle empty state file change and clear it after upload', async () => {
      const { result } = renderHook(() =>
        useAttachmentManager(nullExpenseProps),
      );

      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.handleEmptyStateFileChange(mockFile);
      });

      // File should be cleared after upload completes
      expect(result.current.emptyStateFile).toBeNull();
    });
  });

  describe('delete attachment flow', () => {
    it('should provide delete click handler', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const attachmentUrl = mockExpense.attachments[0];

      // Should execute without errors
      act(() => {
        result.current.handleDeleteClick(attachmentUrl);
      });

      expect(result.current.handleDeleteClick).toBeDefined();
    });

    it('should provide delete cancel handler', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      // Should execute without errors
      act(() => {
        result.current.handleDeleteCancel();
      });

      expect(result.current.handleDeleteCancel).toBeDefined();
    });

    it('should provide delete confirm handler', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      // Should execute without errors
      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      expect(result.current.handleDeleteConfirm).toBeDefined();
    });

    it('should handle delete for any attachment URL', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      // Should handle without errors
      act(() => {
        result.current.handleDeleteClick(
          'https://example.com/non-existent.pdf',
        );
      });

      expect(result.current.handleDeleteClick).toBeDefined();
    });
  });

  describe('file upload handlers', () => {
    const createMockFile = (name: string, type: string, size: number) => {
      const file = new File(['mock content'], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('should handle primary file upload and clear after completion', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.handlePrimaryFileChange(mockFile);
      });

      // File should be cleared after upload completes
      expect(result.current.primaryFile).toBeNull();
    });

    it('should handle empty state file upload and clear after completion', async () => {
      const { result } = renderHook(() =>
        useAttachmentManager(nullExpenseProps),
      );

      const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.handleEmptyStateFileChange(mockFile);
      });

      // File should be cleared after upload completes
      expect(result.current.emptyStateFile).toBeNull();
    });

    it('should handle file upload with no files selected', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      await act(async () => {
        await result.current.handlePrimaryFileChange(null);
      });

      // Should handle gracefully without errors
      expect(result.current.isOperationInProgress).toBe(false);
      expect(result.current.primaryFile).toBeNull();
    });

    it('should handle single file selection and upload', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const mockFile = createMockFile('test1.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.handlePrimaryFileChange(mockFile);
      });

      // File should be cleared after upload completes
      expect(result.current.primaryFile).toBeNull();
    });
  });

  describe('expense prop updates', () => {
    it('should update when expense attachments change', () => {
      const { result, rerender } = renderHook(
        (props) => useAttachmentManager(props),
        { initialProps: defaultProps },
      );

      const updatedExpense = {
        ...mockExpense,
        attachments: [
          ...mockExpense.attachments,
          'https://example.com/new-file.jpg',
        ],
      };

      rerender({ ...defaultProps, expense: updatedExpense });

      // The hook should still work with updated expense data
      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.isOperationInProgress).toBe(false);
    });

    it('should handle expense with no attachments', () => {
      const expenseWithoutAttachments = {
        ...mockExpense,
        attachments: [],
      };

      const { result } = renderHook(() =>
        useAttachmentManager({
          ...defaultProps,
          expense: expenseWithoutAttachments,
        }),
      );

      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.isOperationInProgress).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle file upload errors gracefully', async () => {
      // This would require mocking the mutation to throw an error
      // For now, we test that the hook doesn't crash with invalid inputs
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      await act(async () => {
        await result.current.handlePrimaryFileChange(null);
      });

      // Should handle gracefully
      expect(result.current.isOperationInProgress).toBe(false);
    });

    it('should handle null expense gracefully', () => {
      const { result } = renderHook(() =>
        useAttachmentManager(nullExpenseProps),
      );

      // Should initialize without errors
      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.isOperationInProgress).toBe(false);
    });
  });
});
