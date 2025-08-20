'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/server/actions/categories';

/**
 * React Query hook for fetching all budget categories for an event
 *
 * @example
 * ```tsx
 * const { data: categories, isLoading, error } = useFetchCategories(userId, eventId);
 * ```
 *
 * Features:
 * - ✅ Automatic caching with 5 minute stale time
 * - ✅ Background refetching when data becomes stale
 * - ✅ Retry on failure (up to 2 attempts)
 * - ✅ Only runs when both userId and eventId are provided
 * - ✅ Returns empty array as fallback
 */
export function useFetchCategories(userId: string, eventId: string) {
  return useQuery({
    queryKey: ['categories', eventId],
    queryFn: async () => {
      if (!userId || !eventId) return Promise.resolve([]);
      return fetchCategories(userId, eventId);
    },
    enabled: !!userId && !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // Keep previous data while refetching for better UX
    placeholderData: (previousData) => previousData,
  });
}