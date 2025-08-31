'use client';

import {
  HomeIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
// Dynamic imports for modal components to reduce initial bundle size
const AddOrEditCategoryModal = dynamic(() => import('@/components/modals/AddOrEditCategoryModal'), {
  loading: () => <div className="animate-pulse">Loading modal...</div>
});
const AddOrEditExpenseModal = dynamic(() => import('@/components/modals/AddOrEditExpenseModal'), {
  loading: () => <div className="animate-pulse">Loading modal...</div>
});
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import BudgetOverviewCard, {
  createBudgetData,
} from '@/components/ui/BudgetOverviewCard';
import ExpenseListItem from '@/components/ui/ExpenseListItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotFoundState from '@/components/ui/NotFoundState';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useCategoryPageState } from '@/hooks/category/useCategoryPageState';
import { useCategoryData } from '@/hooks/category/useCategoryData';
import { useCategoryRetryOperations } from '@/hooks/category/useCategoryRetryOperations';
import CategoryErrorBoundary from '@/components/category/CategoryErrorBoundary';
import CategoryErrorStates from '@/components/category/CategoryErrorStates';
import type { ExpenseWithPayments } from '@/lib/paymentCalculations';
import { transformCategoryForModal, transformCategoryForExpenseModal } from '@/lib/categoryUtils';
import { buildCategoryBreadcrumbs } from '@/lib/breadcrumbUtils';
import CategoryHeader from '@/components/category/CategoryHeader';
import EmptyExpensesState from '@/components/category/EmptyExpensesState';
const CategoryDeletionModal = dynamic(() => import('@/components/category/CategoryDeletionModal'), {
  loading: () => <div className="animate-pulse">Loading deletion modal...</div>
});

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const categoryId = params?.categoryId as string;
  const { user } = useAuth();
  const { events, isLoading, selectEventById } = useEvents();
  const {
    event: currentEvent,
    categories,
    isCategoriesLoading,
    isEventLoading,
    expenses,
    isExpensesLoading,
  } = useEventDetails();

  // Auto-select event when accessing directly via URL
  useEffect(() => {
    if (eventId && events.length > 0 && !isLoading) {
      selectEventById(eventId);
    }
  }, [eventId, events.length, isLoading, selectEventById]);

  // Consolidated state management with error handling and retry operations
  const retryOperations = useCategoryRetryOperations();
  const { state, actions, selectors } = retryOperations;

  // Optimized category data management with custom hook
  const { category, categoryExpenses, isFound } = useCategoryData(
    categories,
    expenses,
    categoryId
  );

  // Event handlers (must be before any early returns to follow Rules of Hooks)
  const handleExpenseClick = useCallback((expense: ExpenseWithPayments & { id: string; name: string; description?: string; date: string | Date }) => {
    router.push(`/events/${eventId}/expense/${expense.id}`);
  }, [router, eventId]);

  const handleEditCategory = useCallback(() => {
    actions.setEditCategoryMode(true);
  }, [actions]);

  const handleDeleteCategory = useCallback(() => {
    actions.showDeleteCategoryConfirm();
  }, [actions]);

  // Create budget data for the overview card (memoized for performance)
  const budgetData = useMemo(
    () =>
      createBudgetData({
        budgetedAmount: category?.budgetedAmount ?? 0,
        scheduledAmount: category?.scheduledAmount ?? 0,
        spentAmount: category?.spentAmount ?? 0,
        color: category?.color,
      }),
    [category],
  );

  // Breadcrumb items (memoized for performance)
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (!currentEvent || !category) return [];
    return buildCategoryBreadcrumbs(currentEvent, category, eventId);
  }, [currentEvent, category, eventId]);

  // Loading state - show while event, categories, or expenses are being fetched
  if (
    isLoading ||
    isEventLoading ||
    isCategoriesLoading ||
    isExpensesLoading ||
    !currentEvent
  ) {
    return (
      <DashboardLayout>
        <LoadingSpinner
          title='Loading Category...'
          message='Please wait while we load your category details'
        />
      </DashboardLayout>
    );
  }

  // Not found state - only check for category since currentEvent is already verified above
  if (!isFound) {
    return (
      <DashboardLayout>
        <NotFoundState
          title='Category Not Found'
          message='The requested budget category could not be found.'
          buttonText='Return to Dashboard'
          onButtonClick={() => router.push(`/events/${eventId}/dashboard`)}
          icon='📊'
        />
      </DashboardLayout>
    );
  }

  // If there are critical errors, show error state instead of the main content
  if (selectors.getError('categoryLoad').hasError) {
    return (
      <DashboardLayout>
        <CategoryErrorStates
          eventId={eventId}
          categoryName={category?.name}
          errors={state.errors}
          isRetrying={retryOperations.isRetrying}
          onRetryLoad={() => {
            // This would typically be handled by the data fetching logic
            // For now, we'll just refresh the page
            window.location.reload();
          }}
          onClearError={actions.clearError}
          showInline={false}
        />
      </DashboardLayout>
    );
  }

  return (
    <CategoryErrorBoundary 
      eventId={eventId} 
      categoryId={categoryId}
      fallbackLevel="page"
    >
      <DashboardLayout>
        {/* Error States - Inline Errors */}
        <CategoryErrorStates
          eventId={eventId}
          categoryName={category?.name}
          errors={state.errors}
          isRetrying={retryOperations.isRetrying}
          onRetryUpdate={() => {
            // Retry update operations
            console.log('Retry update operation');
          }}
          onRetryDelete={() => {
            // Retry delete operations
            console.log('Retry delete operation');
          }}
          onRetryExpenses={() => {
            // Retry expenses loading
            console.log('Retry expenses operation');
          }}
          onClearError={actions.clearError}
          showInline={true}
        />

        {/* Main Content wrapped in section-level error boundary */}
        <CategoryErrorBoundary 
          eventId={eventId} 
          categoryId={categoryId}
          fallbackLevel="section"
        >
          {/* Breadcrumbs */}
          <div className='mb-3 sm:mb-4'>
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          {/* Category Header */}
          <CategoryHeader
            category={category}
            onAddExpense={actions.showAddExpense}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />

          {/* Budget Overview Card */}
          <CategoryErrorBoundary 
            eventId={eventId} 
            categoryId={categoryId}
            fallbackLevel="component"
          >
            <BudgetOverviewCard
              data={budgetData}
              title='Budget Overview'
              className='mb-4 sm:mb-6'
            />
          </CategoryErrorBoundary>

          {/* Expenses List */}
          <CategoryErrorBoundary 
            eventId={eventId} 
            categoryId={categoryId}
            fallbackLevel="section"
          >
            <div className='card'>
              <div className='card-header'>
                <h2 className='text-base sm:text-lg lg:text-heading font-semibold text-gray-900'>
                  Expenses ({categoryExpenses.length})
                </h2>
              </div>

              {categoryExpenses.length === 0 ? (
                <EmptyExpensesState
                  onAddExpense={actions.showAddExpense}
                  categoryName={category.name}
                />
              ) : (
                <div className='space-y-2 sm:space-y-3'>
                  {categoryExpenses.map((expense) => (
                    <CategoryErrorBoundary 
                      key={expense.id}
                      eventId={eventId} 
                      categoryId={categoryId}
                      fallbackLevel="component"
                    >
                      <ExpenseListItem
                        expense={expense}
                        onClick={handleExpenseClick}
                      />
                    </CategoryErrorBoundary>
                  ))}
                </div>
              )}
            </div>
          </CategoryErrorBoundary>
        </CategoryErrorBoundary>

        {/* Modals - Each wrapped in component-level error boundary */}
        <CategoryErrorBoundary 
          eventId={eventId} 
          categoryId={categoryId}
          fallbackLevel="component"
        >
          <AddOrEditExpenseModal
            isOpen={state.modals.showAddExpense}
            onClose={actions.hideAddExpense}
            categories={[transformCategoryForExpenseModal(category)]}
          />
        </CategoryErrorBoundary>

        <CategoryErrorBoundary 
          eventId={eventId} 
          categoryId={categoryId}
          fallbackLevel="component"
        >
          <AddOrEditCategoryModal
            isOpen={state.modals.showAddCategoryModal}
            onClose={actions.hideAddCategoryModal}
            editingCategory={
              state.modals.isEditCategoryMode && category
                ? transformCategoryForModal(category)
                : null
            }
            isEditMode={state.modals.isEditCategoryMode}
          />
        </CategoryErrorBoundary>

        <CategoryErrorBoundary 
          eventId={eventId} 
          categoryId={categoryId}
          fallbackLevel="component"
        >
          <CategoryDeletionModal
            isOpen={state.modals.showDeleteCategoryConfirm}
            onClose={actions.hideDeleteCategoryConfirm}
            category={category}
            expenses={categoryExpenses}
            isDeleting={state.operations.isDeletingCategory}
            onDeletingChange={actions.setDeletingCategory}
          />
        </CategoryErrorBoundary>
      </DashboardLayout>
    </CategoryErrorBoundary>
  );
}
