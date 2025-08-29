import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addPaymentToExpense } from '@/server/actions/payments/addPaymentToExpense';
import type { AddPaymentDto } from '@/types/Payment';

interface UseAddPaymentMutationOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export const useAddPaymentMutation = (
  options?: UseAddPaymentMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addPaymentDto: AddPaymentDto) =>
      addPaymentToExpense(addPaymentDto),
    onSuccess: (paymentId, variables) => {
      // Invalidate expenses query to update expense data with new payment
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      options?.onSuccess?.(paymentId);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
