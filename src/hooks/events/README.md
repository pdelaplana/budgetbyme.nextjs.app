# Event Management with React Query

This directory contains React Query implementations for event management operations.

## Hooks Available

### `useAddEventMutation()`
React Query mutation hook for adding new events with automatic cache invalidation.

```tsx
import { useAddEventMutation } from '@/hooks/events';

function CreateEventForm() {
  const addEventMutation = useAddEventMutation({
    onSuccess: (event) => {
      toast.success('Event created successfully!');
      router.push(`/events/${event.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (formData) => {
    const eventDto = {
      userId: user.id,
      name: formData.name,
      type: formData.type,
      description: formData.description,
      eventDate: formData.eventDate,
      totalBudgetedAmount: formData.budget,
      currency: formData.currency,
      status: 'on-track'
    };

    addEventMutation.mutate({ userId: user.id, addEventDTO: eventDto });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={addEventMutation.isPending}
      >
        {addEventMutation.isPending ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
```

### `useFetchEvents(userId)`
React Query hook for fetching all events for a user.

```tsx
import { useFetchEvents } from '@/hooks/events';

function EventsList({ userId }) {
  const { data: events, isLoading, error } = useFetchEvents(userId);

  if (isLoading) return <div>Loading events...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {events?.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### `useFetchEvent(userId, eventId)`
React Query hook for fetching a single event.

```tsx
import { useFetchEvent } from '@/hooks/events';

function EventDetails({ userId, eventId }) {
  const { data: event, isLoading, error } = useFetchEvent(userId, eventId);

  if (isLoading) return <div>Loading event...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div>
      <h1>{event.name}</h1>
      <p>{event.description}</p>
      {/* event details */}
    </div>
  );
}
```

## Simplified Compatibility Hooks

For easy migration from the previous `useServerAction` pattern:

### `useAddEvent()`
Simplified interface that mimics the previous hook API.

```tsx
import { useAddEvent } from '@/hooks/events';

function QuickAddEvent() {
  const { addEvent, isLoading, error, lastResult, reset } = useAddEvent();

  const handleAdd = async (eventData) => {
    try {
      const result = await addEvent(eventData);
      console.log('Event created:', result);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  return (
    <div>
      <button onClick={() => handleAdd(eventData)} disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add Event'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### `useAddEventWithCallback()`
With success/error callbacks for backward compatibility.

```tsx
import { useAddEventWithCallback } from '@/hooks/events';

function EventFormWithCallbacks() {
  const { addEvent, isLoading } = useAddEventWithCallback(
    (event) => {
      toast.success('Event created!');
      router.push(`/events/${event.id}`);
    },
    (error) => {
      toast.error(error);
    }
  );

  // Use addEvent same as before...
}
```

## Benefits of React Query Implementation

1. **Automatic Caching**: Events are cached and reused across components
2. **Cache Invalidation**: Adding an event automatically refreshes event lists
3. **Background Refetching**: Data stays fresh with automatic background updates
4. **Optimistic Updates**: UI can update immediately with proper rollback on errors
5. **Loading States**: Built-in loading, error, and success states
6. **Request Deduplication**: Identical requests are automatically deduplicated
7. **Offline Support**: Mutations are retried when connection is restored

## Query Keys Used

- `['fetchEvents', userId]` - All events for a user
- `['fetchEvent', userId, eventId]` - Single event data

When adding an event, both query keys are invalidated to ensure all related data is refreshed.
