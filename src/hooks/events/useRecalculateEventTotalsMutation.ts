import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { RecalculateEventTotalsDto } from '@/server/actions/events/recalculateEventTotals';
import { recalculateEventTotals } from '@/server/actions/events/recalculateEventTotals';

interface UseRecalculateEventTotalsMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRecalculateEventTotalsMutation = (
  options?: UseRecalculateEventTotalsMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RecalculateEventTotalsDto) => recalculateEventTotals(dto),
    onSuccess: async (_result, variables) => {
      // Invalidate event queries to refresh UI with updated totals
      const invalidationPromises = [];

      if (variables.eventId) {
        invalidationPromises.push(
          queryClient.invalidateQueries({
            queryKey: ['event', variables.eventId],
          }),
        );
      }

      // Always invalidate user's events list
      invalidationPromises.push(
        queryClient.invalidateQueries({
          queryKey: ['events', variables.userId],
        }),
      );

      // Invalidate categories for the event
      if (variables.eventId) {
        invalidationPromises.push(
          queryClient.invalidateQueries({
            queryKey: ['categories', variables.eventId],
          }),
        );
      }

      // Invalidate expenses for the event
      if (variables.eventId) {
        invalidationPromises.push(
          queryClient.invalidateQueries({
            queryKey: ['expenses', variables.userId, variables.eventId],
          }),
        );
      }

      // Wait for all invalidations to complete
      await Promise.all(invalidationPromises);

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
