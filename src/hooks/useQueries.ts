'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Example query hook for testing
export function useExampleQuery() {
  return useQuery({
    queryKey: ['example'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { message: 'Hello from React Query!', timestamp: Date.now() };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Example mutation hook
export function useExampleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { message: string }) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ...data, id: Math.random() };
    },
    onSuccess: () => {
      // Invalidate and refetch example query
      queryClient.invalidateQueries({ queryKey: ['example'] });
    },
  });
}

// Hook for user workspace (improved version)
export function useUserWorkspace() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userWorkspace', user?.uid],
    queryFn: async () => {
      if (!user) throw new Error('No authenticated user');

      const token = await user.getIdToken();
      const response = await fetch('/api/user-workspace', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch workspace');
      }

      return response.json();
    },
    enabled: !!user, // Only run query if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Hook for setting up workspace
export function useSetupWorkspace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (workspaceData: {
      userId: string;
      email: string;
      name: string;
      preferences: {
        language: string;
        currency: string;
      };
    }) => {
      if (!user) throw new Error('No authenticated user');

      const token = await user.getIdToken();
      const response = await fetch('/api/setup-workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(workspaceData),
      });

      if (!response.ok) {
        throw new Error('Failed to setup workspace');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate workspace queries after successful setup
      queryClient.invalidateQueries({ queryKey: ['userWorkspace'] });
    },
  });
}
