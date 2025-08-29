'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  DeleteEventDto,
  DeleteEventResult,
} from '@/server/actions/events';
import { deleteEvent } from '@/server/actions/events';

export interface UseDeleteEventMutationOptions {
  onSuccess?: (result: DeleteEventResult, variables: DeleteEventDto) => void;
  onError?: (error: Error, variables: DeleteEventDto) => void;
}

/**
 * React Query mutation hook for deleting events
 *
 * This hook provides automatic error handling and query invalidation.
 * Note: This performs a hard delete - the event and all related data cannot be recovered.
 *
 * @example
 * ```tsx
 * const deleteEventMutation = useDeleteEventMutation({
 *   onSuccess: (result) => {
 *     toast.success(result.message);
 *     router.push('/events');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * const handleDelete = () => {
 *   if (!eventToDelete) return;
 *
 *   deleteEventMutation.mutate({
 *     userId: user.uid,
 *     eventId: eventToDelete.id,
 *   });
 * };
 * ```
 *
 * Features:
 * - ✅ Automatic query invalidation for events list
 * - ✅ Built-in error handling with Sentry logging
 * - ✅ Loading states via isPending
 * - ✅ Server action integration with cascade deletion
 * - ✅ Cleans up related data (expenses, categories, payments)
 * - ❌ No optimistic updates (hard delete requires confirmation)
 */
export function useDeleteEventMutation(
  options?: UseDeleteEventMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      deleteEventDto: DeleteEventDto,
    ): Promise<DeleteEventResult> => {
      // Validation
      if (!deleteEventDto.userId) throw new Error('User ID is required');
      if (!deleteEventDto.eventId) throw new Error('Event ID is required');

      // Call server action
      return deleteEvent(deleteEventDto);
    },
    onSuccess: (result, variables) => {
      // Invalidate events query to update events list
      queryClient.invalidateQueries({
        queryKey: ['fetchEvents', variables.userId],
      });

      // Invalidate all queries related to this specific event
      queryClient.invalidateQueries({
        queryKey: ['event', variables.eventId],
      });

      // Invalidate categories for this event
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.eventId],
      });

      // Invalidate expenses for this event
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      // Invalidate payments for this event
      queryClient.invalidateQueries({
        queryKey: ['payments', variables.userId, variables.eventId],
      });

      // Call custom success handler
      options?.onSuccess?.(result, variables);
    },
    onError: (error, variables) => {
      console.error('Failed to delete event:', error);

      // Call custom error handler
      options?.onError?.(error as Error, variables);
    },
  });
}
