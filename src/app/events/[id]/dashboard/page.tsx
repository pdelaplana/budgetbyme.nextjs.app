'use client';

import { lazy, Suspense, useMemo } from 'react';
import BudgetCategoriesSection from '@/components/dashboard/BudgetCategoriesSection';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import DashboardErrorState from '@/components/dashboard/DashboardErrorState';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardNotFound from '@/components/dashboard/DashboardNotFound';
import PaymentsSection from '@/components/dashboard/PaymentsSection';
import { DASHBOARD_ACTIONS } from '@/constants/dashboardActions';
import { useEventDashboard } from '@/hooks/dashboard';

// Lazy load ModalManager to reduce initial bundle size
const ModalManager = lazy(() => import('@/components/dashboard/ModalManager'));

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

  // Stabilize props to prevent unnecessary re-renders
  const stableDropdownItems = useMemo(() => DASHBOARD_ACTIONS, []);

  const stableHandlers = useMemo(
    () => ({
      onCategoryClick: actions.handleCategoryClick,
      onCreateFirstCategory: modals.openAddCategoryModal,
      onGetStarted: modals.openAddCategoryModal,
    }),
    [actions.handleCategoryClick, modals.openAddCategoryModal],
  );

  // Show loading state while events list or individual event is being loaded
  if (isLoading || isEventLoading) {
    return <DashboardLoadingState />;
  }

  // Show error state if there's an error
  if (eventError) {
    return (
      <DashboardErrorState
        error={eventError}
        onBack={() => router.push('/events')}
      />
    );
  }

  // Show 404 state if event not found after events are loaded
  if (!currentEvent && !isLoading && events.length >= 0) {
    return (
      <DashboardNotFound
        entityType='Event'
        onBack={() => router.push('/events')}
      />
    );
  }

  // Safety check - shouldn't happen but ensures currentEvent exists for TypeScript
  if (!currentEvent) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardLayout>
      <DashboardHeader
        dropdownItems={stableDropdownItems}
        isDropdownOpen={actions.isDropdownOpen}
        onDropdownToggle={actions.toggleDropdown}
        onDropdownClose={actions.closeDropdown}
        onDropdownAction={actions.handleDropdownAction}
        isRecalculatingTotals={isRecalculatingTotals}
      />

      {/* Charts Section - Responsive */}
      <BudgetOverview event={currentEvent} categories={categories} />

      {/* Upcoming Payments Widget - Compact */}
      <PaymentsSection onGetStarted={stableHandlers.onGetStarted} />

      {/* Budget Categories List */}
      <BudgetCategoriesSection
        categories={categories}
        onCategoryClick={stableHandlers.onCategoryClick}
        onCreateFirstCategory={stableHandlers.onCreateFirstCategory}
      />

      {/* All Modals - Lazy loaded */}
      <Suspense fallback={null}>
        <ModalManager
          currentEvent={currentEvent}
          categories={categories}
          modals={modals}
          actions={actions}
          isRecalculatingTotals={isRecalculatingTotals}
          handleRecalculateTotals={handleRecalculateTotals}
          confirmDeleteEvent={confirmDeleteEvent}
        />
      </Suspense>
    </DashboardLayout>
  );
}
