'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserWorkspace } from '@/server/actions/fetchUserWorkspace';
import type { UserWorkspace } from '@/types/UserWorkspace';

export const useFetchUserWorkspace = (userId: string) => {
  return useQuery<UserWorkspace | null>({
    queryKey: ['useFetchUserWorkspace', userId],
    queryFn: async () => {
      if (!userId) return Promise.resolve(null);
      return await fetchUserWorkspace(userId);
    },
    enabled: !!userId,
  });
};
