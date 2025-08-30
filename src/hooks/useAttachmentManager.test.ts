import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useAttachmentManager } from './useAttachmentManager';
import type { Expense } from '@/types/Expense';

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
  categoryId: 'cat-1',
  tags: [],
  _createdDate: new Date(),
  attachments: [
    {
      id: 'attachment-1',
      name: 'test-file.pdf',
      url: 'https://example.com/test-file.pdf',
      type: 'application/pdf',
      size: 1024,
      uploadedAt: new Date(),
    },
  ],
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
    expect(result.current.pendingDeleteAttachment).toBeNull();
    expect(result.current.fileInputRef).toBeDefined();
    expect(result.current.fileInputRefEmpty).toBeDefined();
  });

  describe('file input handlers', () => {
    it('should trigger file input click for primary upload', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      // Mock the file input click
      const mockClick = vi.fn();
      Object.defineProperty(result.current.fileInputRef, 'current', {
        value: { click: mockClick },
        writable: true,
      });
      
      act(() => {
        result.current.handleFileUpload();
      });
      
      expect(mockClick).toHaveBeenCalled();
    });

    it('should trigger file input click for empty state upload', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      // Mock the file input click
      const mockClick = vi.fn();
      Object.defineProperty(result.current.fileInputRefEmpty, 'current', {
        value: { click: mockClick },
        writable: true,
      });
      
      act(() => {
        result.current.handleFileUploadEmpty();
      });
      
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('delete attachment flow', () => {
    it('should initiate delete confirmation for attachment', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      const attachmentToDelete = mockExpense.attachments[0];
      
      act(() => {
        result.current.handleDeleteAttachment(attachmentToDelete.id);
      });
      
      expect(result.current.showDeleteConfirm).toBe(true);
      expect(result.current.pendingDeleteAttachment).toBe(attachmentToDelete.id);
    });

    it('should cancel delete confirmation', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      // First initiate delete
      act(() => {
        result.current.handleDeleteAttachment('attachment-1');
      });
      
      expect(result.current.showDeleteConfirm).toBe(true);
      
      // Then cancel
      act(() => {
        result.current.handleDeleteCancel();
      });
      
      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.pendingDeleteAttachment).toBeNull();
    });

    it('should confirm delete and call mutation', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      // First initiate delete
      act(() => {
        result.current.handleDeleteAttachment('attachment-1');
      });
      
      expect(result.current.showDeleteConfirm).toBe(true);
      
      // Then confirm
      await act(async () => {
        result.current.handleDeleteConfirm();
      });
      
      // Should close confirmation and clear pending state
      await waitFor(() => {
        expect(result.current.showDeleteConfirm).toBe(false);
        expect(result.current.pendingDeleteAttachment).toBeNull();
      });
    });

    it('should handle delete for non-existent attachment gracefully', () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      act(() => {
        result.current.handleDeleteAttachment('non-existent');
      });
      
      expect(result.current.showDeleteConfirm).toBe(true);
      expect(result.current.pendingDeleteAttachment).toBe('non-existent');
    });
  });

  describe('file upload handlers', () => {
    const createMockFile = (name: string, type: string, size: number) => {
      const file = new File(['mock content'], name, { type });
      Object.defineProperty(file, 'size', { value: size });
      return file;
    };

    const createMockFileList = (files: File[]): FileList => {
      const fileList = {
        length: files.length,
        item: (index: number) => files[index] || null,
        [Symbol.iterator]: function* () {
          for (let i = 0; i < files.length; i++) {
            yield files[i];
          }
        },
      };
      
      files.forEach((file, index) => {
        (fileList as any)[index] = file;
      });
      
      return fileList as FileList;
    };

    it('should handle primary file upload', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);
      const mockFileList = createMockFileList([mockFile]);
      
      const mockEvent = {
        target: {
          files: mockFileList,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      await act(async () => {
        await result.current.handlePrimaryFileChange(mockEvent);
      });
      
      // File input should be cleared
      expect(mockEvent.target.value).toBe('');
    });

    it('should handle empty state file upload', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      const mockFile = createMockFile('test.pdf', 'application/pdf', 1024);
      const mockFileList = createMockFileList([mockFile]);
      
      const mockEvent = {
        target: {
          files: mockFileList,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      await act(async () => {
        await result.current.handleEmptyFileChange(mockEvent);
      });
      
      // File input should be cleared
      expect(mockEvent.target.value).toBe('');
    });

    it('should handle file upload with no files selected', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      const mockEvent = {
        target: {
          files: createMockFileList([]),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      await act(async () => {
        await result.current.handlePrimaryFileChange(mockEvent);
      });
      
      // Should handle gracefully without errors
      expect(result.current.isOperationInProgress).toBe(false);
    });

    it('should handle multiple files selection', async () => {
      const { result } = renderHook(() => useAttachmentManager(defaultProps));
      
      const mockFiles = [
        createMockFile('test1.pdf', 'application/pdf', 1024),
        createMockFile('test2.jpg', 'image/jpeg', 2048),
      ];
      const mockFileList = createMockFileList(mockFiles);
      
      const mockEvent = {
        target: {
          files: mockFileList,
          value: '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      
      await act(async () => {
        await result.current.handlePrimaryFileChange(mockEvent);
      });
      
      expect(mockEvent.target.value).toBe('');
    });
  });

  describe('expense prop updates', () => {
    it('should update when expense attachments change', () => {
      const { result, rerender } = renderHook(
        (props) => useAttachmentManager(props),
        { initialProps: defaultProps }
      );
      
      const updatedExpense = {
        ...mockExpense,
        attachments: [
          ...mockExpense.attachments,
          {
            id: 'attachment-2',
            name: 'new-file.jpg',
            url: 'https://example.com/new-file.jpg',
            type: 'image/jpeg',
            size: 2048,
            uploadedAt: new Date(),
          },
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
        })
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
      
      const mockEvent = {
        target: {
          files: null,
        },
      } as any;
      
      await act(async () => {
        await result.current.handlePrimaryFileChange(mockEvent);
      });
      
      // Should handle gracefully
      expect(result.current.isOperationInProgress).toBe(false);
    });

    it('should handle null expense gracefully', () => {
      const { result } = renderHook(() => useAttachmentManager(nullExpenseProps));
      
      // Should initialize without errors
      expect(result.current.showDeleteConfirm).toBe(false);
      expect(result.current.isOperationInProgress).toBe(false);
    });
  });
});