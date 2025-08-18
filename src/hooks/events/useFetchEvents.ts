'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '@/server/actions/events';

/**
 * React Query hook for fetching all events for a user
 *
 * @example
 * ```tsx
 * const { data: events, isLoading, error } = useFetchEvents(userId);
 * ```
 */
export function useFetchEvents(userId: string) {
  return useQuery({
    queryKey: ['fetchEvents', userId],
    queryFn: async () => {
      if (!userId) return Promise.resolve([]);
      return await fetchEvents(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
