'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '@/server/actions/categories';

export interface UseDeleteCategoryMutationOptions {
  onSuccess?: (
    variables: { userId: string; eventId: string; categoryId: string },
  ) => void;
  onError?: (
    error: Error,
    variables: { userId: string; eventId: string; categoryId: string },
  ) => void;
}

/**
 * React Query mutation hook for deleting budget categories
 *
 * This hook provides automatic error handling and query invalidation.
 * Note: This performs a hard delete - the category cannot be recovered.
 *
 * @example
 * ```tsx
 * const deleteCategoryMutation = useDeleteCategoryMutation({
 *   onSuccess: () => {
 *     toast.success('Category deleted successfully!');
 *     setIsDeleteModalOpen(false);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleDelete = () => {
 *   if (!categoryToDelete) return;
 *   
 *   deleteCategoryMutation.mutate({
 *     userId: user.id,
 *     eventId: currentEvent.id,
 *     categoryId: categoryToDelete.id,
 *   });
 * };
 * ```
 *
 * Features:
 * - ✅ Automatic query invalidation
 * - ✅ Built-in error handling for dependencies
 * - ✅ Loading states via isPending
 * - ✅ Server action integration
 * - ❌ No optimistic updates (hard delete requires confirmation)
 */
export function useDeleteCategoryMutation(options?: UseDeleteCategoryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      eventId,
      categoryId,
    }: {
      userId: string;
      eventId: string;
      categoryId: string;
    }): Promise<void> => {
      // Validation
      if (!userId) throw new Error('User ID is required');
      if (!eventId) throw new Error('Event ID is required');
      if (!categoryId) throw new Error('Category ID is required');

      // Call server action
      return deleteCategory(userId, eventId, categoryId);
    },
    onSuccess: (_, variables) => {
      // Invalidate categories query to update category list
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.eventId],
      });

      // Invalidate expenses query as they may reference this category
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      // Call custom success handler
      options?.onSuccess?.(variables);
    },
    onError: (error, variables) => {
      console.error('Failed to delete category:', error);
      
      // Call custom error handler
      options?.onError?.(error as Error, variables);
    },
  });
}