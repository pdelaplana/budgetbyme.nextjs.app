import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AddEventDto } from '@/server/actions/events';
import { addEvent } from '@/server/actions/events';
import { CurrencyImplementation } from '@/types/currencies';
import type { Event } from '@/types/Event';
import { useAddEvent, useAddEventWithCallback } from './useAddEvent';

// Mock the server action
vi.mock('@/server/actions/events', () => ({
  addEvent: vi.fn(),
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('useAddEvent', () => {
  const mockAddEvent = vi.mocked(addEvent);

  const validEventDto: AddEventDto = {
    userId: 'user123',
    name: 'Test Wedding',
    type: 'wedding',
    description: 'A beautiful wedding celebration',
    eventDate: new Date('2024-12-25'),
    totalBudgetedAmount: 50000,
    currency: 'AUD',
    status: 'on-track',
  };

  const mockEvent: Event = {
    id: 'event123',
    name: 'Test Wedding',
    type: 'wedding',
    description: 'A beautiful wedding celebration',
    eventDate: new Date('2024-12-25'),
    totalBudgetedAmount: 50000,
    totalSpentAmount: 0,
    spentPercentage: 0,
    status: 'on-track',
    currency: CurrencyImplementation.AUD,
    _createdDate: new Date(),
    _createdBy: 'user123',
    _updatedDate: new Date(),
    _updatedBy: 'user123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAddEvent', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAddEvent());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastResult).toBeNull();
      expect(typeof result.current.addEvent).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('should successfully add an event', async () => {
      mockAddEvent.mockResolvedValue(mockEvent);

      const { result } = renderHook(() => useAddEvent());

      const addEventResult = await result.current.addEvent(validEventDto);

      expect(addEventResult).toEqual(mockEvent);
      expect(mockAddEvent).toHaveBeenCalledWith(validEventDto);
      await waitFor(() => {
        expect(result.current.lastResult).toEqual(mockEvent);
      });
      expect(result.current.error).toBeNull();
    });

    it('should handle loading state correctly', async () => {
      let resolvePromise: ((value: Event) => void) | undefined;
      const promise = new Promise<Event>((resolve) => {
        resolvePromise = resolve;
      });
      mockAddEvent.mockReturnValue(promise);

      const { result } = renderHook(() => useAddEvent());

      // Start the async operation
      const addEventPromise = result.current.addEvent(validEventDto);

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve the promise
      if (resolvePromise) {
        resolvePromise(mockEvent);
      }
      await addEventPromise;

      // Should no longer be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle server action errors', async () => {
      const errorMessage = 'Server error occurred';
      mockAddEvent.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAddEvent());

      const addEventResult = await result.current.addEvent(validEventDto);

      expect(addEventResult).toBeNull();
      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
      expect(result.current.lastResult).toBeNull();
    });

    it('should validate required userId', async () => {
      const { result } = renderHook(() => useAddEvent());

      await expect(
        result.current.addEvent({ ...validEventDto, userId: '' }),
      ).rejects.toThrow('User ID is required');
    });

    it('should validate required event name', async () => {
      const { result } = renderHook(() => useAddEvent());

      await expect(
        result.current.addEvent({ ...validEventDto, name: '' }),
      ).rejects.toThrow('Event name is required');
    });

    it('should validate event date', async () => {
      const { result } = renderHook(() => useAddEvent());

      await expect(
        result.current.addEvent({
          ...validEventDto,
          eventDate: undefined as unknown as Date,
        }),
      ).rejects.toThrow('Event date is required');
    });

    it('should validate budget amount is not negative', async () => {
      const { result } = renderHook(() => useAddEvent());

      await expect(
        result.current.addEvent({
          ...validEventDto,
          totalBudgetedAmount: -100,
        }),
      ).rejects.toThrow('Budget amount cannot be negative');
    });

    it('should validate required currency', async () => {
      const { result } = renderHook(() => useAddEvent());

      await expect(
        result.current.addEvent({ ...validEventDto, currency: '' }),
      ).rejects.toThrow('Currency is required');
    });

    it('should validate required event type', async () => {
      const { result } = renderHook(() => useAddEvent());

      await expect(
        result.current.addEvent({ ...validEventDto, type: '' }),
      ).rejects.toThrow('Event type is required');
    });

    it('should clear error when clearError is called', async () => {
      const errorMessage = 'Server error occurred';
      mockAddEvent.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAddEvent());

      // Trigger an error
      await result.current.addEvent(validEventDto);
      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      // Clear the error
      result.current.clearError();
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should reset state when reset is called', async () => {
      const errorMessage = 'Server error occurred';
      mockAddEvent.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAddEvent());

      // Trigger an error
      await result.current.addEvent(validEventDto);
      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      // Reset
      result.current.reset();
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('useAddEventWithCallback', () => {
    it('should call onSuccess callback when event is added successfully', async () => {
      mockAddEvent.mockResolvedValue(mockEvent);
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useAddEventWithCallback(onSuccess, onError),
      );

      await result.current.addEvent(validEventDto);

      expect(onSuccess).toHaveBeenCalledWith(mockEvent);
      expect(onError).not.toHaveBeenCalled();
    });

    it('should call onError callback when event addition fails', async () => {
      const errorMessage = 'Server error occurred';
      mockAddEvent.mockRejectedValue(new Error(errorMessage));
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useAddEventWithCallback(onSuccess, onError),
      );

      const addEventResult = await result.current.addEvent(validEventDto);

      expect(addEventResult).toBeNull();
      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });
      expect(onSuccess).not.toHaveBeenCalled();
      // onError won't be called for server errors, only validation errors
    });

    it('should call onError callback for validation errors', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(() =>
        useAddEventWithCallback(onSuccess, onError),
      );

      await expect(
        result.current.addEvent({ ...validEventDto, name: '' }),
      ).rejects.toThrow('Event name is required');

      expect(onError).toHaveBeenCalledWith('Event name is required');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should not call callbacks if they are not provided', async () => {
      mockAddEvent.mockResolvedValue(mockEvent);

      const { result } = renderHook(() => useAddEventWithCallback());

      // Should not throw error even without callbacks
      const addEventResult = await result.current.addEvent(validEventDto);
      expect(addEventResult).toEqual(mockEvent);
    });
  });
});
