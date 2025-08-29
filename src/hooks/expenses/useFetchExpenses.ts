import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '@/server/actions/expenses/fetchExpenses';
import type { Expense } from '@/types/Expense';

export const useFetchExpenses = (userId: string, eventId: string) => {
  return useQuery<Expense[], Error>({
    queryKey: ['expenses', userId, eventId],
    queryFn: () => fetchExpenses(userId, eventId),
    enabled: Boolean(userId && eventId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
