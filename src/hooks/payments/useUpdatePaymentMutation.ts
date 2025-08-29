import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePaymentInExpense } from '@/server/actions/payments/updatePaymentInExpense';
import type { UpdatePaymentDto } from '@/types/Payment';

interface UpdatePaymentVariables {
  userId: string;
  eventId: string;
  expenseId: string;
  paymentId: string;
  updateData: UpdatePaymentDto;
}

interface UseUpdatePaymentMutationOptions {
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
}

export const useUpdatePaymentMutation = (
  options?: UseUpdatePaymentMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      eventId,
      expenseId,
      paymentId,
      updateData,
    }: UpdatePaymentVariables) =>
      updatePaymentInExpense(userId, eventId, expenseId, paymentId, updateData),
    onSuccess: (_, variables) => {
      // Invalidate expenses query to update expense data with updated payment
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
