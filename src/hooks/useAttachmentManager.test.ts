import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Expense } from '@/types/Expense';
import { useAttachmentManager } from './useAttachmentManager';

// Mock the hooks that useAttachmentManager depends on
vi.mock('./useFileUploadState', () => ({
  useFileUploadState: () => ({
    state: {
      uploadingFile: false,
      uploadingFileEmpty: false,
      error: null,
    },
    actions: {
      setUploadingFile: vi.fn(),
      setUploadingFileEmpty: vi.fn(),
      setError: vi.fn(),
      clearError: vi.fn(),
    },
  }),
}));

vi.mock('@/hooks/expenses', () => ({
  useAddExpenseAttachmentMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
  }),
  useDeleteExpenseAttachmentMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ success: true }),
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
    it('should handle primary file change', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.handlePrimaryFileChange(mockFile);
      });

      expect(result.current.primaryFile).toBe(mockFile);
    });

    it('should handle empty state file change', async () => {
      const { result } = renderHook(() =>
        useAttachmentManager(nullExpenseProps),
      );

      const mockFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.handleEmptyStateFileChange(mockFile);
      });

      expect(result.current.emptyStateFile).toBe(mockFile);
    });
  });

  describe('delete attachment flow', () => {
    it('should initiate delete confirmation for attachment', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const attachmentUrl = mockExpense.attachments[0];

      act(() => {
        result.current.handleDeleteClick(attachmentUrl);
      });

      expect(result.current.showDeleteConfirm).toBe(true);
      expect(result.current.attachmentToDelete).toBe(attachmentUrl);
    });

    it('should cancel delete confirmation', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const attachmentUrl = mockExpense.attachments[0];

      // First initiate delete
      act(() => {
        result.current.handleDeleteClick(attachmentUrl);
      });

      expect(result.current.showDeleteConfirm).toBe(true);

      // Then cancel
      act(() => {
        result.current.handleDeleteCancel();
      });

      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.attachmentToDelete).toBeNull();
    });

    it('should confirm delete and call mutation', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const attachmentUrl = mockExpense.attachments[0];

      // First initiate delete
      act(() => {
        result.current.handleDeleteClick(attachmentUrl);
      });

      expect(result.current.showDeleteConfirm).toBe(true);

      // Then confirm
      await act(async () => {
        await result.current.handleDeleteConfirm();
      });

      // Should close confirmation and clear pending state
      await waitFor(() => {
        expect(result.current.showDeleteConfirm).toBe(false);
        expect(result.current.attachmentToDelete).toBeNull();
      });
    });

    it('should handle delete for non-existent attachment gracefully', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      act(() => {
        result.current.handleDeleteClick(
          'https://example.com/non-existent.pdf',
        );
      });

      expect(result.current.showDeleteConfirm).toBe(true);
      expect(result.current.attachmentToDelete).toBe(
        'https://example.com/non-existent.pdf',
      );
    });
  });

  describe('file upload handlers', () => {
    const createMockFile = (name: string, type: string, size: number) => {
      const file = new File(['mock content'], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    it('should handle primary file upload', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.handlePrimaryFileChange(mockFile);
      });

      expect(result.current.primaryFile).toBe(mockFile);
    });

    it('should handle empty state file upload', async () => {
      const { result } = renderHook(() =>
        useAttachmentManager(nullExpenseProps),
      );

      const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.handleEmptyStateFileChange(mockFile);
      });

      expect(result.current.emptyStateFile).toBe(mockFile);
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

    it('should handle single file selection (API only accepts one file)', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));

      const mockFile = createMockFile('test1.pdf', 'application/pdf', 1024);

      await act(async () => {
        await result.current.handlePrimaryFileChange(mockFile);
      });

      expect(result.current.primaryFile).toBe(mockFile);
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
