'use client';

import BudgetCategoriesSection from '@/components/dashboard/BudgetCategoriesSection';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ModalManager from '@/components/dashboard/ModalManager';
import PaymentsSection from '@/components/dashboard/PaymentsSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotFoundState from '@/components/ui/NotFoundState';
import { DASHBOARD_ACTIONS } from '@/constants/dashboardActions';
import { useEventDashboard } from '@/hooks/dashboard';

export default function EventDashboardPage() {
  const {
    // Data
    currentEvent,
    categories,
    events,

    // Loading states
    isLoading,
    isEventLoading,
    eventError,

    // Modal controls
    modals,

    // Actions
    actions,

    // Mutations
    isRecalculatingTotals,

    // Handlers
    handleRecalculateTotals,
    confirmDeleteEvent,

    // Navigation
    router,
  } = useEventDashboard();

  // Safety check - don't render if currentEvent is null
  if (!currentEvent) {
    return (
      <DashboardLayout>
        <LoadingSpinner
          title='Loading Event...'
          message='Please wait while we load your event data'
        />
      </DashboardLayout>
    );
  }

  // Show loading state while events list or individual event is being loaded
  if (isLoading || isEventLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner
          title='Loading Event...'
          message='Please wait while we load your event data'
        />
      </DashboardLayout>
    );
  }

  // Show error state if there's an error
  if (eventError) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Error Loading Event
            </h2>
            <p className='text-gray-600 mb-4'>{eventError}</p>
            <button
              type='button'
              onClick={() => router.push('/events')}
              className='btn-primary'
            >
              Back to Events
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show 404 state if event not found after events are loaded
  if (!currentEvent && !isLoading && events.length >= 0) {
    return (
      <DashboardLayout>
        <NotFoundState
          title='Event Not Found'
          message="The event you're looking for doesn't exist or you don't have access to it."
          buttonText='Back to Events'
          onButtonClick={() => router.push('/events')}
          icon='📅'
          className='flex items-center justify-center'
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        dropdownItems={DASHBOARD_ACTIONS}
        isDropdownOpen={actions.isDropdownOpen}
        onDropdownToggle={actions.toggleDropdown}
        onDropdownClose={actions.closeDropdown}
        onDropdownAction={actions.handleDropdownAction}
        isRecalculatingTotals={isRecalculatingTotals}
      />

      {/* Charts Section - Responsive */}
      <BudgetOverview event={currentEvent} categories={categories} />

      {/* Upcoming Payments Widget - Compact */}
      <PaymentsSection onGetStarted={modals.openAddCategoryModal} />

      {/* Budget Categories List */}
      <BudgetCategoriesSection
        categories={categories}
        onCategoryClick={actions.handleCategoryClick}
        onCreateFirstCategory={modals.openAddCategoryModal}
      />

      {/* All Modals */}
      <ModalManager
        currentEvent={currentEvent}
        categories={categories}
        modals={modals}
        actions={actions}
        isRecalculatingTotals={isRecalculatingTotals}
        handleRecalculateTotals={handleRecalculateTotals}
        confirmDeleteEvent={confirmDeleteEvent}
      />
    </DashboardLayout>
  );
}
