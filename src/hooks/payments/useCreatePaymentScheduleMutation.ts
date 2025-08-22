import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPaymentSchedule } from '@/server/actions/payments/createPaymentSchedule';
import type { PaymentMethod } from '@/types/Payment';

interface CreatePaymentScheduleMutationData {
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

interface UseCreatePaymentScheduleMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreatePaymentScheduleMutation(options: UseCreatePaymentScheduleMutationOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentScheduleMutationData) => createPaymentSchedule(data),
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