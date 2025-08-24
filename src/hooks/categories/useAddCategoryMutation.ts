'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type AddCategoryDto, addCategory } from '@/server/actions/categories';
import type { BudgetCategory } from '@/types/BudgetCategory';

export interface UseAddCategoryMutationOptions {
  onSuccess?: (
    id: string,
    variables: { userId: string; eventId: string; addCategoryDto: AddCategoryDto },
  ) => void;
  onError?: (
    error: Error,
    variables: { userId: string; eventId: string; addCategoryDto: AddCategoryDto },
  ) => void;
}

/**
 * React Query mutation hook for adding new budget categories
 *
 * This hook provides optimistic updates, automatic error handling,
 * and query invalidation for better UX.
 *
 * @example
 * ```tsx
 * const addCategoryMutation = useAddCategoryMutation({
 *   onSuccess: (categoryId) => {
 *     toast.success('Category created successfully!');
 *     setIsModalOpen(false);
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleSubmit = (formData: CategoryFormData) => {
 *   const categoryDto: AddCategoryDto = {
 *     userId: user.id,
 *     eventId: currentEvent.id,
 *     name: formData.name,
 *     description: formData.description,
 *     budgettedAmount: parseFloat(formData.budget),
 *     color: formData.color,
 *   };
 *
 *   addCategoryMutation.mutate({ 
 *     userId: user.id, 
 *     eventId: currentEvent.id, 
 *     addCategoryDto: categoryDto 
 *   });
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
export function useAddCategoryMutation(options?: UseAddCategoryMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      eventId,
      addCategoryDto,
    }: {
      userId: string;
      eventId: string;
      addCategoryDto: AddCategoryDto;
    }): Promise<string> => {
      // Validation
      if (!userId) throw new Error('User ID is required');
      if (!eventId) throw new Error('Event ID is required');
      if (!addCategoryDto.name?.trim()) throw new Error('Category name is required');
      if (addCategoryDto.budgetedAmount < 0) throw new Error('Budget amount cannot be negative');
      if (!addCategoryDto.color?.trim()) throw new Error('Category color is required');

      // Call server action
      return addCategory(addCategoryDto);
    },
    onSuccess: (id, variables) => {
      // Optimistically update the cache with the new category
      queryClient.setQueryData(['categories', variables.eventId], (oldData: BudgetCategory[] = []) => {
        const newCategory: BudgetCategory = {
          id,
          name: variables.addCategoryDto.name,
          description: variables.addCategoryDto.description || '',
          budgetedAmount: variables.addCategoryDto.budgetedAmount,
          scheduledAmount: 0,
          spentAmount: 0,
          color: variables.addCategoryDto.color,
          icon: variables.addCategoryDto.icon || '🎉',
          _createdDate: new Date(),
          _createdBy: variables.userId,
          _updatedDate: new Date(),
          _updatedBy: variables.userId,
        };
        return [...oldData, newCategory];
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
      options?.onSuccess?.(id, variables);
    },
    onError: (error, variables) => {
      console.error('Failed to add category:', error);
      
      // Call custom error handler
      options?.onError?.(error as Error, variables);
    },
  });
}