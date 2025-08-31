'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useDeleteCategoryMutation } from '@/hooks/categories';
import {
  validateCategoryDeletion,
  validateDeletionRequirements,
} from '@/lib/categoryValidation';

export interface CategoryDeletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    name: string;
  };
  expenses: Array<{ id: string }>;
  isDeleting: boolean;
  onDeletingChange: (isDeleting: boolean) => void;
}

export default function CategoryDeletionModal({
  isOpen,
  onClose,
  category,
  expenses,
  isDeleting,
  onDeletingChange,
}: CategoryDeletionModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { event: currentEvent } = useEventDetails();

  // Delete category mutation
  const deleteCategoryMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      onDeletingChange(false);
      onClose();
      toast.success('Category deleted successfully!');
      router.push(`/events/${currentEvent?.id}/dashboard`);
    },
    onError: (error) => {
      onDeletingChange(false);
      console.error('Failed to delete category:', error);
      toast.error(
        error.message || 'Failed to delete category. Please try again.',
      );
      // Don't close modal on error - allow retry
    },
  });

  const confirmDeleteCategory = async () => {
    const validation = validateDeletionRequirements(
      user?.uid,
      currentEvent?.id,
      category.id,
    );

    if (!validation.isValid) {
      toast.error(validation.errorMessage || 'Missing required information');
      return;
    }

    onDeletingChange(true);

    try {
      await deleteCategoryMutation.mutateAsync({
        userId: user!.uid,
        eventId: currentEvent!.id,
        categoryId: category.id,
      });
      // Success/error handling is done in mutation callbacks
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error deleting category:', error);
    }
  };

  const deletionResult = validateCategoryDeletion(category, expenses);
  const { canDelete, message, confirmButtonText } = deletionResult;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={canDelete ? confirmDeleteCategory : undefined}
      title='Delete Category'
      message={message}
      confirmText={confirmButtonText}
      type='danger'
      isLoading={isDeleting}
    />
  );
}
