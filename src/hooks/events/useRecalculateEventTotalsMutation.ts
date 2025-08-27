import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recalculateEventTotals } from '@/server/actions/events/recalculateEventTotals';
import type { RecalculateEventTotalsDto } from '@/server/actions/events/recalculateEventTotals';

interface UseRecalculateEventTotalsMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useRecalculateEventTotalsMutation = (
  options?: UseRecalculateEventTotalsMutationOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RecalculateEventTotalsDto) => recalculateEventTotals(dto),
    onSuccess: (result, variables) => {
      // Invalidate event queries to refresh UI with updated totals
      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: ['event', variables.eventId],
        });
      }
      
      // Always invalidate user's events list
      queryClient.invalidateQueries({
        queryKey: ['events', variables.userId],
      });

      // Invalidate categories for the event
      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: ['categories', variables.eventId],
        });
      }

      // Invalidate expenses for the event
      if (variables.eventId) {
        queryClient.invalidateQueries({
          queryKey: ['expenses', variables.userId, variables.eventId],
        });
      }

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};