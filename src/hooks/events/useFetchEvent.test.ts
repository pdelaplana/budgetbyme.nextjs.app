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
import { fetchEvent } from '@/server/actions/events';
import type { Event } from '@/types/Event';
import { useFetchEvent } from './useFetchEvent';

// Mock the server action
vi.mock('@/server/actions/events', () => ({
  fetchEvent: vi.fn(),
}));

const mockFetchEvent = fetchEvent as MockedFunction<typeof fetchEvent>;

// Mock data
const mockEvent: Event = {
  id: 'event123',
  name: 'Test Wedding',
  type: 'wedding',
  description: 'A beautiful wedding celebration',
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
};

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

describe('useFetchEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch single event successfully', async () => {
    mockFetchEvent.mockResolvedValueOnce(mockEvent);

    const { result } = renderHook(() => useFetchEvent('user123', 'event123'), {
      wrapper: TestWrapper,
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockEvent);
    expect(result.current.error).toBe(null);
    expect(mockFetchEvent).toHaveBeenCalledWith('user123', 'event123');
  });

  it('should return null when event not found', async () => {
    mockFetchEvent.mockResolvedValueOnce(null);

    const { result } = renderHook(
      () => useFetchEvent('user123', 'nonexistent'),
      {
        wrapper: TestWrapper,
      },
    );

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(mockFetchEvent).toHaveBeenCalledWith('user123', 'nonexistent');
  });

  it('should be disabled when userId is empty', () => {
    const { result } = renderHook(() => useFetchEvent('', 'event123'), {
      wrapper: TestWrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchEvent).not.toHaveBeenCalled();
  });

  it('should be disabled when eventId is empty', () => {
    const { result } = renderHook(() => useFetchEvent('user123', ''), {
      wrapper: TestWrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchEvent).not.toHaveBeenCalled();
  });

  it('should be disabled when both userId and eventId are empty', () => {
    const { result } = renderHook(() => useFetchEvent('', ''), {
      wrapper: TestWrapper,
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(mockFetchEvent).not.toHaveBeenCalled();
  });

  it('should handle server errors', async () => {
    mockFetchEvent.mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useFetchEvent('user123', 'event123'), {
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
    expect(mockFetchEvent).toHaveBeenCalledWith('user123', 'event123');
  });

  it('should use correct query key', async () => {
    mockFetchEvent.mockResolvedValueOnce(mockEvent);

    const { result } = renderHook(() => useFetchEvent('user123', 'event123'), {
      wrapper: TestWrapper,
    });

    // Wait for the query to resolve
    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // The query key should be ['fetchEvent', 'user123', 'event123']
    expect(mockFetchEvent).toHaveBeenCalledWith('user123', 'event123');
  });
});
