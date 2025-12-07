import { useCallback } from 'react';
import { toast } from 'sonner';
import { useUpdateExpenseMutation } from '@/hooks/expenses';
import { uploadExpenseAttachment } from '@/server/actions/expenses/uploadExpenseAttachment';
import type { Expense } from '@/types/Expense';
import { useFileUploadState } from './useFileUploadState';

interface UseAttachmentManagerProps {
  expense: Expense | null;
  userId: string;
  eventId: string;
}

export function useAttachmentManager({
  expense,
  userId,
  eventId,
}: UseAttachmentManagerProps) {
  const fileUploadState = useFileUploadState();

  // Update expense mutation for attachments
  const updateExpenseMutation = useUpdateExpenseMutation({
    onSuccess: () => {
      if (fileUploadState.state.operationType === 'uploading') {
        toast.success('Attachment uploaded successfully!');
      } else if (fileUploadState.state.operationType === 'deleting') {
        toast.success('Attachment deleted successfully!');
      } else {
        toast.success('Attachments updated successfully!');
      }
      fileUploadState.actions.endOperation();
    },
    onError: (error) => {
      console.error('Error updating attachments:', error);
      if (fileUploadState.state.operationType === 'uploading') {
        toast.error(error.message || 'Failed to upload attachment');
      } else if (fileUploadState.state.operationType === 'deleting') {
        toast.error(error.message || 'Failed to delete attachment');
      } else {
        toast.error(error.message || 'Failed to update attachments');
      }
      fileUploadState.actions.endOperation();
    },
  });

  // Upload attachment handler
  const uploadAttachment = useCallback(
    async (file: File) => {
      if (!userId || !eventId || !expense) {
        throw new Error(
          'User not authenticated, event not selected, or expense not loaded',
        );
      }

      fileUploadState.actions.startOperation('uploading');

      try {
        // Upload file to storage
        const formData = new FormData();
        formData.append('attachment', file);
        formData.append('userId', userId);
        formData.append('expenseId', expense.id);
        formData.append('type', 'document');

        const result = await uploadExpenseAttachment(formData);

        if (!result.success || !result.url) {
          throw new Error(result.error || 'Failed to upload attachment');
        }

        // Update expense with new attachment
        const currentAttachments = expense.attachments || [];
        const updatedAttachments = [...currentAttachments, result.url];

        await updateExpenseMutation.mutateAsync({
          userId,
          eventId,
          expenseId: expense.id,
          attachments: updatedAttachments,
        });

        return result.url;
      } catch (error) {
        console.error('Attachment upload error:', error);
        fileUploadState.actions.endOperation();
        throw error;
      }
    },
    [
      userId,
      eventId,
      expense?.id,
      expense?.attachments,
      updateExpenseMutation,
      fileUploadState.actions,
      expense,
    ],
  );

  // Delete attachment handler
  const deleteAttachment = useCallback(
    async (attachmentUrl: string) => {
      if (!userId || !eventId || !expense) {
        throw new Error(
          'User not authenticated, event not selected, or expense not loaded',
        );
      }

      fileUploadState.actions.startDeleting(attachmentUrl);

      try {
        // Update expense to remove attachment URL
        const currentAttachments = expense.attachments || [];
        const updatedAttachments = currentAttachments.filter(
          (url) => url !== attachmentUrl,
        );

        await updateExpenseMutation.mutateAsync({
          userId,
          eventId,
          expenseId: expense.id,
          attachments: updatedAttachments,
        });

        fileUploadState.actions.endDeleting();
        return true;
      } catch (error) {
        console.error('Attachment delete error:', error);
        fileUploadState.actions.endOperation();
        throw error;
      }
    },
    [
      userId,
      eventId,
      expense?.id,
      expense?.attachments,
      updateExpenseMutation,
      fileUploadState.actions,
      expense,
    ],
  );

  // Primary file upload handlers (when attachments exist)
  const handlePrimaryFileChange = useCallback(
    async (file: File | null) => {
      if (file) {
        try {
          await uploadAttachment(file);
          fileUploadState.actions.clearPrimaryFile();
        } catch (_error) {
          // Error handling is done in uploadAttachment
          fileUploadState.actions.clearPrimaryFile();
        }
      } else {
        fileUploadState.actions.clearPrimaryFile();
      }
    },
    [uploadAttachment, fileUploadState.actions],
  );

  const handlePrimaryFileRemove = useCallback(() => {
    fileUploadState.actions.clearPrimaryFile();
  }, [fileUploadState.actions]);

  // Empty state file upload handlers (when no attachments exist)
  const handleEmptyStateFileChange = useCallback(
    async (file: File | null) => {
      if (file) {
        try {
          await uploadAttachment(file);
          fileUploadState.actions.clearEmptyStateFile();
        } catch (_error) {
          // Error handling is done in uploadAttachment
          fileUploadState.actions.clearEmptyStateFile();
        }
      } else {
        fileUploadState.actions.clearEmptyStateFile();
      }
    },
    [uploadAttachment, fileUploadState.actions],
  );

  const handleEmptyStateFileRemove = useCallback(() => {
    fileUploadState.actions.clearEmptyStateFile();
  }, [fileUploadState.actions]);

  // Attachment deletion handlers
  const handleDeleteClick = useCallback(
    (attachmentUrl: string) => {
      fileUploadState.actions.showDeleteConfirm(attachmentUrl);
    },
    [fileUploadState.actions],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!fileUploadState.state.attachmentToDelete) {
      return;
    }

    try {
      await deleteAttachment(fileUploadState.state.attachmentToDelete);
      // Success handling is done in deleteAttachment
    } catch (_error) {
      // Error handling is done in deleteAttachment
    }
  }, [fileUploadState.state.attachmentToDelete, deleteAttachment]);

  const handleDeleteCancel = useCallback(() => {
    fileUploadState.actions.hideDeleteConfirm();
  }, [fileUploadState.actions]);

  // Extract filename from URL for display
  const getFileNameFromUrl = useCallback((url: string) => {
    const urlParts = url.split('/');
    const fullFilename = urlParts[urlParts.length - 1];
    const parts = fullFilename.split('_');
    const originalName =
      parts.length >= 3 ? parts.slice(2).join('_') : fullFilename;

    return {
      fullFilename,
      originalName,
    };
  }, []);

  return {
    // State
    fileUploadState: fileUploadState.state,
    isOperationInProgress: fileUploadState.state.isOperationInProgress,
    isPending: updateExpenseMutation.isPending,

    // Primary file handlers (when attachments exist)
    primaryFile: fileUploadState.state.primaryFile,
    handlePrimaryFileChange,
    handlePrimaryFileRemove,

    // Empty state file handlers (when no attachments exist)
    emptyStateFile: fileUploadState.state.emptyStateFile,
    handleEmptyStateFileChange,
    handleEmptyStateFileRemove,

    // Attachment deletion
    showDeleteConfirm: fileUploadState.state.showDeleteConfirm,
    attachmentToDelete: fileUploadState.state.attachmentToDelete,
    deletingAttachment: fileUploadState.state.deletingAttachment,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Utilities
    uploadAttachment,
    deleteAttachment,
    getFileNameFromUrl,

    // File upload actions (for direct access if needed)
    fileUploadActions: fileUploadState.actions,
  };
}

export type AttachmentManager = ReturnType<typeof useAttachmentManager>;
