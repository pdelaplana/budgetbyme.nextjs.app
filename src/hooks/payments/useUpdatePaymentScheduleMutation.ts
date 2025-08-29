import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updatePaymentSchedule } from '@/server/actions/payments';
import type { PaymentMethod } from '@/types/Payment';

interface UpdatePaymentScheduleParams {
  userId: string;
  eventId: string;
  expenseId: string;
  payments: Array<{
    name: string;
    description: string;
    amount: number;
    paymentMethod: PaymentMethod;
    dueDate: Date;
    notes?: string;
    attachments?: string[];
  }>;
}

interface UseUpdatePaymentScheduleMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useUpdatePaymentScheduleMutation({
  onSuccess,
  onError,
}: UseUpdatePaymentScheduleMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdatePaymentScheduleParams) => {
      const result = await updatePaymentSchedule(params);

      if (!result.success) {
        throw new Error(result.error || 'Failed to update payment schedule');
      }

      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch expenses query to update the UI
      queryClient.invalidateQueries({
        queryKey: ['expenses', variables.userId, variables.eventId],
      });

      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}
