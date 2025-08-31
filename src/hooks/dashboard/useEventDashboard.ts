import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useDeleteEventMutation } from '@/hooks/events';
import { useRecalculateEventTotalsMutation } from '@/hooks/events/useRecalculateEventTotalsMutation';
import type { UseEventDashboardReturn } from '@/types/dashboard';
import { useDashboardActions } from './useDashboardActions';
import { useDashboardState } from './useDashboardState';
import { useModalControls } from './useModalControls';

export function useEventDashboard(): UseEventDashboardReturn {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { user } = useAuth();

  const { events, isLoading, selectEventById } = useEvents();
  const {
    event: currentEvent,
    isEventLoading,
    eventError,
    categories,
  } = useEventDetails();

  const { state, dispatch } = useDashboardState();
  const modalControls = useModalControls({ state, dispatch });
  const actions = useDashboardActions({ state, dispatch, eventId });

  // Recalculate totals mutation
  const recalculateEventTotalsMutation = useRecalculateEventTotalsMutation({
    onSuccess: () => {
      toast.success(
        'Event totals recalculated successfully! All budget data has been refreshed.',
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to recalculate event totals');
    },
  });

  // Delete event mutation
  const deleteEventMutation = useDeleteEventMutation({
    onSuccess: (result) => {
      modalControls.setDeletingEvent(false);
      modalControls.closeDeleteEventModal();
      toast.success(result.message);
      router.push('/events'); // Navigate back to events list
    },
    onError: (error) => {
      modalControls.setDeletingEvent(false);
      console.error('Delete event failed:', error);
      toast.error('Failed to delete event. Please try again.');
    },
  });

  // Set the selected event when events are loaded and we have an eventId
  useEffect(() => {
    if (eventId && events.length > 0 && !isLoading) {
      selectEventById(eventId);
    }
  }, [eventId, events.length, isLoading, selectEventById]);

  const handleRecalculateTotals = async () => {
    if (!user?.uid || !eventId) {
      toast.error(
        'Unable to recalculate totals: missing user or event information',
      );
      return;
    }

    try {
      await recalculateEventTotalsMutation.mutateAsync({
        userId: user.uid,
        eventId: eventId,
      });
      modalControls.closeRecalculateModal();
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Recalculate totals error:', error);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!user?.uid || !eventId) return;

    modalControls.setDeletingEvent(true);
    try {
      await deleteEventMutation.mutateAsync({
        userId: user.uid,
        eventId: eventId,
      });
    } catch (_error) {
      // Error handling is managed in the mutation callbacks
    }
  };

  return {
    // Data
    user,
    eventId,
    currentEvent,
    categories,
    events,

    // Loading states
    isLoading,
    isEventLoading,
    eventError,

    // State
    dashboardState: state,

    // Modal controls
    modals: modalControls,

    // Actions
    actions,

    // Mutations
    recalculateEventTotalsMutation,
    isRecalculatingTotals: recalculateEventTotalsMutation.isPending,

    // Handlers
    handleRecalculateTotals,
    confirmDeleteEvent,

    // Navigation
    router,
  };
}
