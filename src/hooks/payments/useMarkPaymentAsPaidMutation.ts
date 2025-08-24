import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markPaymentAsPaidInExpense } from '@/server/actions/payments/markPaymentAsPaidInExpense';
import type { MarkPaymentAsPaidDto } from '@/types/Payment';

interface MarkPaymentAsPaidVariables {
  userId: string;
  eventId: string;
  expenseId: string;
  paymentId: string;
  markAsPaidData: MarkPaymentAsPaidDto;
}

interface UseMarkPaymentAsPaidMutationOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export const useMarkPaymentAsPaidMutation = (options?: UseMarkPaymentAsPaidMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, eventId, expenseId, paymentId, markAsPaidData }: MarkPaymentAsPaidVariables) =>
      markPaymentAsPaidInExpense(userId, eventId, expenseId, paymentId, markAsPaidData),
    onSuccess: (_, variables) => {
      // Invalidate expenses query to update expense data with payment marked as paid
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      // Invalidate categories query to update category spent amounts
      queryClient.invalidateQueries({
        queryKey: ['categories', variables.eventId],
      });

      options?.onSuccess?.(variables.paymentId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};