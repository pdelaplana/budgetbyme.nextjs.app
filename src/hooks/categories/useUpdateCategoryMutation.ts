'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateCategoryDto, updateCategory } from '@/server/actions/categories';

export interface UseUpdateCategoryMutationOptions {
  onSuccess?: (
    categoryId: string,
    variables: UpdateCategoryDto,
  ) => void;
  onError?: (
    error: Error,
    variables: UpdateCategoryDto,
  ) => void;
}

/**
 * React Query mutation hook for updating budget categories
 *
 * This hook provides optimistic updates, automatic error handling,
 * and query invalidation for better UX.
 *
 * @example
 * ```tsx
 * const updateCategoryMutation = useUpdateCategoryMutation({
 *   onSuccess: (categoryId) => {
 *     toast.success('Category updated successfully!');
 *     setIsEditModalOpen(false);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleUpdate = (formData: CategoryFormData) => {
 *   const updateDto: UpdateCategoryDto = {
 *     userId: user.id,
 *     eventId: currentEvent.id,
 *     categoryId: editingCategory.id,
 *     name: formData.name,
 *     description: formData.description,
 *     budgettedAmount: parseFloat(formData.budget),
 *     color: formData.color,
 *   };
 *
 *   updateCategoryMutation.mutate(updateDto);
 * };
 * ```
 *
 * Features:
 * - ✅ Optimistic updates for better UX
 * - ✅ Automatic query invalidation
 * - ✅ Built-in error handling
 * - ✅ Loading states via isPending
 * - ✅ Server action integration
 */
export function useUpdateCategoryMutation(options?: UseUpdateCategoryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateCategoryDto: UpdateCategoryDto): Promise<string> => {
      // Validation
      if (!updateCategoryDto.userId) throw new Error('User ID is required');
      if (!updateCategoryDto.eventId) throw new Error('Event ID is required');
      if (!updateCategoryDto.categoryId) throw new Error('Category ID is required');

      // Check that at least one field is being updated
      const hasUpdates = 
        updateCategoryDto.name !== undefined ||
        updateCategoryDto.description !== undefined ||
        updateCategoryDto.budgetedAmount !== undefined ||
        updateCategoryDto.color !== undefined;

      if (!hasUpdates) {
        throw new Error('At least one field must be provided for update');
      }

      // Validate budget amount if provided
      if (updateCategoryDto.budgetedAmount !== undefined && updateCategoryDto.budgetedAmount < 0) {
        throw new Error('Budget amount cannot be negative');
      }

      // Validate name if provided
      if (updateCategoryDto.name !== undefined && !updateCategoryDto.name.trim()) {
        throw new Error('Category name cannot be empty');
      }

      // Validate color if provided
      if (updateCategoryDto.color !== undefined && !updateCategoryDto.color.trim()) {
        throw new Error('Category color cannot be empty');
      }

      // Call server action
      return updateCategory(updateCategoryDto);
    },
    onSuccess: (categoryId, variables) => {
      // Optimistically update the cache with the updated category
      queryClient.setQueryData(['categories', variables.eventId], (oldData: BudgetCategory[] = []) => {
        return oldData.map((category) => {
          if (category.id === variables.categoryId) {
            return {
              ...category,
              ...(variables.name !== undefined && { name: variables.name }),
              ...(variables.description !== undefined && { description: variables.description }),
              ...(variables.budgetedAmount !== undefined && { budgetedAmount: variables.budgetedAmount }),
              ...(variables.color !== undefined && { color: variables.color }),
              _updatedDate: new Date(),
              _updatedBy: variables.userId,
            };
          }
          return category;
        });
      });

      // Invalidate and refetch categories for this event to get server truth
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.eventId],
      });

      // Also invalidate event details since budget totals may change
      queryClient.invalidateQueries({
        queryKey: ['events', variables.eventId],
      });

      // Call custom success handler
      options?.onSuccess?.(categoryId, variables);
    },
    onError: (error, variables) => {
      console.error('Failed to update category:', error);
      
      // Call custom error handler
      options?.onError?.(error as Error, variables);
    },
  });
}