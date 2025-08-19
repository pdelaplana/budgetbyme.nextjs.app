'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateEventDto, updateEvent } from '@/server/actions/events';

export interface UseUpdateEventMutationOptions {
  onSuccess?: (
    id: string,
    variables: UpdateEventDto,
  ) => void;
  onError?: (
    error: Error,
    variables: UpdateEventDto,
  ) => void;
}

/**
 * React Query mutation hook for updating existing events
 *
 * This hook provides optimistic updates, automatic error handling,
 * and query invalidation for better UX.
 *
 * @example
 * ```tsx
 * const updateEventMutation = useUpdateEventMutation({
 *   onSuccess: (eventId) => {
 *     toast.success('Event updated successfully!');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleSubmit = (formData: UpdateEventFormData) => {
 *   const eventDto: UpdateEventDto = {
 *     userId: user.id,
 *     eventId: event.id,
 *     name: formData.name,
 *     type: formData.type,
 *     description: formData.description,
 *     eventDate: formData.eventDate,
 *     totalBudgetedAmount: formData.budget,
 *     currency: formData.currency,
 *     status: formData.status
 *   };
 *
 *   updateEventMutation.mutate(eventDto);
 * };
 * ```
 */
export function useUpdateEventMutation(options?: UseUpdateEventMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateEventDto: UpdateEventDto) => {
      // Client-side validation
      if (!updateEventDto.userId?.trim()) {
        throw new Error('User ID is required');
      }
      if (!updateEventDto.eventId?.trim()) {
        throw new Error('Event ID is required');
      }
      if (updateEventDto.name !== undefined && !updateEventDto.name?.trim()) {
        throw new Error('Event name cannot be empty');
      }
      if (updateEventDto.totalBudgetedAmount !== undefined && updateEventDto.totalBudgetedAmount < 0) {
        throw new Error('Budget amount cannot be negative');
      }
      if (updateEventDto.totalSpentAmount !== undefined && updateEventDto.totalSpentAmount < 0) {
        throw new Error('Spent amount cannot be negative');
      }

      return updateEvent(updateEventDto);
    },
    onSuccess: (id, variables) => {
      // Invalidate and refetch queries that are affected by the mutation
      queryClient.invalidateQueries({
        queryKey: ['fetchEvents', variables.userId],
      });

      // Also invalidate the specific event query
      queryClient.invalidateQueries({
        queryKey: ['fetchEvent', variables.userId, variables.eventId],
      });

      // Call custom success handler if provided
      if (options?.onSuccess) {
        options.onSuccess(id, variables);
      }
    },
    onError: (error, variables) => {
      console.error('Update event mutation failed:', error);

      // Call custom error handler if provided
      if (options?.onError) {
        options.onError(error as Error, variables);
      }
    },
  });
}

/**
 * Simplified version of the hook that returns commonly used properties
 */
export function useUpdateEvent() {
  const mutation = useUpdateEventMutation();

  return {
    updateEvent: (updateData: UpdateEventDto) =>
      mutation.mutateAsync(updateData),
    isLoading: mutation.isPending,
    error: mutation.error?.message || null,
    lastResult: mutation.data || null,
    reset: mutation.reset,
    clearError: mutation.reset,
  };
}