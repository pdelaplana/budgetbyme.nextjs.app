import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import {
  beforeEach,
  describe,
  expect,
  it,
  type MockedFunction,
  vi,
} from 'vitest';
import type { AddEventDto } from '@/server/actions/events';
import { addEvent } from '@/server/actions/events';
import type { Event } from '@/types/Event';
import {
  useAddEvent,
  useAddEventMutation,
  useAddEventWithCallback,
} from './useAddEventMutation';

// Mock the server action
vi.mock('@/server/actions/events', () => ({
  addEvent: vi.fn(),
}));

const mockAddEvent = addEvent as MockedFunction<typeof addEvent>;

// Mock data - Using a simple currency object
const mockEvent: Event = {
  id: 'event123',
  name: 'Test Wedding',
  type: 'wedding',
  description: 'A beautiful wedding celebration',
  eventDate: new Date('2024-12-25'),
  totalBudgetedAmount: 50000,
  totalScheduledAmount: 0,
  totalSpentAmount: 0,
  spentPercentage: 0,
  status: 'on-track',
  currency: { code: 'AUD', symbol: 'A$' } as Event['currency'],
  _createdDate: new Date(),
  _createdBy: 'user123',
  _updatedDate: new Date(),
  _updatedBy: 'user123',
};

const mockEventDto: AddEventDto = {
  userId: 'user123',
  name: 'Test Wedding',
  type: 'wedding',
  description: 'A beautiful wedding celebration',
  eventDate: new Date('2024-12-25'),
  totalBudgetedAmount: 50000,
  currency: 'AUD',
  status: 'on-track',
};

// Test wrapper component
function TestWrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAddEventMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddEventMutation', () => {
    it('should successfully add an event', async () => {
      mockAddEvent.mockResolvedValueOnce(mockEvent);

      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      const mutationResult = await result.current.mutateAsync({
        userId: 'user123',
        addEventDTO: mockEventDto,
      });

      expect(mockAddEvent).toHaveBeenCalledWith(mockEventDto);
      expect(mutationResult).toEqual(mockEvent);
    });

    it('should handle validation errors', async () => {
      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: '',
          addEventDTO: mockEventDto,
        }),
      ).rejects.toThrow('User ID is required');

      expect(mockAddEvent).not.toHaveBeenCalled();
    });

    it('should validate required event name', async () => {
      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: { ...mockEventDto, name: '' },
        }),
      ).rejects.toThrow('Event name is required');

      expect(mockAddEvent).not.toHaveBeenCalled();
    });

    it('should validate event date', async () => {
      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: {
            ...mockEventDto,
            eventDate: undefined as unknown as Date,
          },
        }),
      ).rejects.toThrow('Event date is required');

      expect(mockAddEvent).not.toHaveBeenCalled();
    });

    it('should validate budget amount is not negative', async () => {
      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: { ...mockEventDto, totalBudgetedAmount: -100 },
        }),
      ).rejects.toThrow('Budget amount cannot be negative');

      expect(mockAddEvent).not.toHaveBeenCalled();
    });

    it('should validate required currency', async () => {
      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: { ...mockEventDto, currency: '' },
        }),
      ).rejects.toThrow('Currency is required');

      expect(mockAddEvent).not.toHaveBeenCalled();
    });

    it('should validate required event type', async () => {
      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: { ...mockEventDto, type: '' },
        }),
      ).rejects.toThrow('Event type is required');

      expect(mockAddEvent).not.toHaveBeenCalled();
    });

    it('should handle server errors', async () => {
      mockAddEvent.mockRejectedValueOnce(new Error('Server error occurred'));

      const { result } = renderHook(() => useAddEventMutation(), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: mockEventDto,
        }),
      ).rejects.toThrow('Server error occurred');

      expect(mockAddEvent).toHaveBeenCalledWith(mockEventDto);
    });

    it('should call onSuccess callback when provided', async () => {
      mockAddEvent.mockResolvedValueOnce(mockEvent);
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useAddEventMutation({ onSuccess }), {
        wrapper: TestWrapper,
      });

      await result.current.mutateAsync({
        userId: 'user123',
        addEventDTO: mockEventDto,
      });

      expect(onSuccess).toHaveBeenCalledWith(mockEvent, {
        userId: 'user123',
        addEventDTO: mockEventDto,
      });
    });

    it('should call onError callback when provided', async () => {
      const error = new Error('Server error occurred');
      mockAddEvent.mockRejectedValueOnce(error);
      const onError = vi.fn();

      const { result } = renderHook(() => useAddEventMutation({ onError }), {
        wrapper: TestWrapper,
      });

      await expect(
        result.current.mutateAsync({
          userId: 'user123',
          addEventDTO: mockEventDto,
        }),
      ).rejects.toThrow('Server error occurred');

      expect(onError).toHaveBeenCalledWith(error, {
        userId: 'user123',
        addEventDTO: mockEventDto,
      });
    });
  });

  describe('useAddEvent (simplified version)', () => {
    it('should provide simplified interface', async () => {
      mockAddEvent.mockResolvedValueOnce(mockEvent);

      const { result } = renderHook(() => useAddEvent(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.lastResult).toBe(null);

      const eventResult = await result.current.addEvent(mockEventDto);

      expect(eventResult).toEqual(mockEvent);
      expect(mockAddEvent).toHaveBeenCalledWith(mockEventDto);
    });

    it('should handle loading state', async () => {
      let resolvePromise: ((value: Event) => void) | undefined;
      const promise = new Promise<Event>((resolve) => {
        resolvePromise = resolve;
      });
      mockAddEvent.mockReturnValueOnce(promise);

      const { result } = renderHook(() => useAddEvent(), {
        wrapper: TestWrapper,
      });

      // Start the mutation
      result.current.addEvent(mockEventDto);

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the promise
      if (resolvePromise) {
        resolvePromise(mockEvent);
      }

      // Check final state
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.lastResult).toEqual(mockEvent);
      });
    });

    it('should reset state when reset is called', async () => {
      mockAddEvent.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useAddEvent(), {
        wrapper: TestWrapper,
      });

      // Trigger an error
      try {
        await result.current.addEvent(mockEventDto);
      } catch {
        // Ignore error
      }

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Reset the state
      result.current.reset();

      await waitFor(() => {
        expect(result.current.error).toBe(null);
        expect(result.current.lastResult).toBe(null);
      });
    });
  });

  describe('useAddEventWithCallback', () => {
    it('should call onSuccess callback when event is added successfully', async () => {
      mockAddEvent.mockResolvedValueOnce(mockEvent);
      const onSuccess = vi.fn();

      const { result } = renderHook(() => useAddEventWithCallback(onSuccess), {
        wrapper: TestWrapper,
      });

      await result.current.addEvent(mockEventDto);

      expect(onSuccess).toHaveBeenCalledWith(mockEvent.id);
    });

    it('should call onError callback when event addition fails', async () => {
      mockAddEvent.mockRejectedValueOnce(new Error('Server error occurred'));
      const onError = vi.fn();

      const { result } = renderHook(
        () => useAddEventWithCallback(undefined, onError),
        {
          wrapper: TestWrapper,
        },
      );

      await expect(result.current.addEvent(mockEventDto)).rejects.toThrow(
        'Server error occurred',
      );

      expect(onError).toHaveBeenCalledWith('Server error occurred');
    });

    it('should call onError callback for validation errors', async () => {
      const onError = vi.fn();

      const { result } = renderHook(
        () => useAddEventWithCallback(undefined, onError),
        {
          wrapper: TestWrapper,
        },
      );

      await expect(
        result.current.addEvent({ ...mockEventDto, name: '' }),
      ).rejects.toThrow('Event name is required');

      expect(onError).toHaveBeenCalledWith('Event name is required');
    });

    it('should not call callbacks if they are not provided', async () => {
      mockAddEvent.mockResolvedValueOnce(mockEvent);

      const { result } = renderHook(() => useAddEventWithCallback(), {
        wrapper: TestWrapper,
      });

      // Should not throw error when callbacks are not provided
      await expect(result.current.addEvent(mockEventDto)).resolves.toEqual(
        mockEvent,
      );
    });
  });
});
