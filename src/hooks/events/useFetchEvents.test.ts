import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';
import { fetchEvents } from '@/server/actions/events';
import type { Event } from '@/types/Event';
import { useFetchEvents } from './useFetchEvents';

// Mock the server action
vi.mock('@/server/actions/events', () => ({
  fetchEvents: vi.fn(),
}));

const mockFetchEvents = fetchEvents as MockedFunction<typeof fetchEvents>;

// Mock data
const mockEvents: Event[] = [
  {
    id: 'event1',
    name: 'Wedding 1',
    type: 'wedding',
    description: 'First wedding',
    eventDate: new Date('2024-12-25'),
    totalBudgetedAmount: 50000,
    totalSpentAmount: 10000,
    spentPercentage: 20,
    status: 'on-track',
    currency: { code: 'AUD', symbol: 'A$' } as Event['currency'],
    _createdDate: new Date(),
    _createdBy: 'user123',
    _updatedDate: new Date(),
    _updatedBy: 'user123',
  },
  {
    id: 'event2',
    name: 'Birthday Party',
    type: 'birthday',
    description: 'Birthday celebration',
    eventDate: new Date('2024-11-15'),
    totalBudgetedAmount: 5000,
    totalSpentAmount: 2000,
    spentPercentage: 40,
    status: 'on-track',
    currency: { code: 'AUD', symbol: 'A$' } as Event['currency'],
    _createdDate: new Date(),
    _createdBy: 'user123',
    _updatedDate: new Date(),
    _updatedBy: 'user123',
  },
];

// Test wrapper component
function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useFetchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch events successfully', async () => {
    mockFetchEvents.mockResolvedValueOnce(mockEvents);

    const { result } = renderHook(() => useFetchEvents('user123'), {
      wrapper: TestWrapper,
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEvents);
    expect(result.current.error).toBe(null);
    expect(mockFetchEvents).toHaveBeenCalledWith('user123');
  });

  it('should return empty array when userId is empty', async () => {
    const { result } = renderHook(() => useFetchEvents(''), {
      wrapper: TestWrapper,
    });

    // Query should be disabled when userId is empty
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchEvents).not.toHaveBeenCalled();
  });

  it('should handle server errors', async () => {
    mockFetchEvents.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useFetchEvents('user123'), {
      wrapper: TestWrapper,
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for the query to fail after retries
    await vi.waitFor(
      () => {
        expect(result.current.isError).toBe(true);
      },
      { timeout: 5000 },
    );

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
    expect(mockFetchEvents).toHaveBeenCalledWith('user123');
  });

  it('should be disabled when userId is not provided', () => {
    const { result } = renderHook(() => useFetchEvents(''), {
      wrapper: TestWrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchEvents).not.toHaveBeenCalled();
  });

  it('should use correct query key', async () => {
    mockFetchEvents.mockResolvedValueOnce(mockEvents);

    const { result } = renderHook(() => useFetchEvents('user123'), {
      wrapper: TestWrapper,
    });

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The query key should be ['fetchEvents', 'user123']
    expect(mockFetchEvents).toHaveBeenCalledWith('user123');
  });
});
