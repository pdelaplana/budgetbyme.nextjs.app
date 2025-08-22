import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clearAllPayments } from '@/server/actions/payments/clearAllPayments';

interface ClearAllPaymentsVariables {
  userId: string;
  eventId: string;
  expenseId: string;
}

interface UseClearAllPaymentsMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useClearAllPaymentsMutation = (options?: UseClearAllPaymentsMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, eventId, expenseId }: ClearAllPaymentsVariables) =>
      clearAllPayments(userId, eventId, expenseId),
    onSuccess: (_, variables) => {
      // Invalidate expenses query to update expense data with payments cleared
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};