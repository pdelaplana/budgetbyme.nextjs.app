import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePaymentFromExpense } from '@/server/actions/payments/deletePaymentFromExpense';

interface DeletePaymentVariables {
  userId: string;
  eventId: string;
  expenseId: string;
  paymentId: string;
}

interface UseDeletePaymentMutationOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export const useDeletePaymentMutation = (options?: UseDeletePaymentMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, eventId, expenseId, paymentId }: DeletePaymentVariables) =>
      deletePaymentFromExpense(userId, eventId, expenseId, paymentId),
    onSuccess: (_, variables) => {
      // Invalidate expenses query to update expense data with payment deleted
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      options?.onSuccess?.(variables.paymentId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};