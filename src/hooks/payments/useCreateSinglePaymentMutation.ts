import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSinglePayment } from '@/server/actions/payments/createSinglePayment';
import type { PaymentMethod } from '@/types/Payment';

interface CreateSinglePaymentMutationData {
  userId: string;
  eventId: string;
  expenseId: string;
  name: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidDate: Date;
  notes?: string;
  attachments?: string[];
}

interface UseCreateSinglePaymentMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreateSinglePaymentMutation(options: UseCreateSinglePaymentMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSinglePaymentMutationData) => createSinglePayment(data),
    onSuccess: () => {
      // Invalidate expenses query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });
}