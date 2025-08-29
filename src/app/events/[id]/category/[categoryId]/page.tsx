'use client';

import {
  HomeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddOrEditCategoryModal from '@/components/modals/AddOrEditCategoryModal';
import AddOrEditExpenseModal from '@/components/modals/AddOrEditExpenseModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ActionDropdown from '@/components/ui/ActionDropdown';
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
import { useDeleteCategoryMutation } from '@/hooks/categories';
import { useCategoryPageState } from '@/hooks/category/useCategoryPageState';
import { truncateForBreadcrumb } from '@/lib/textUtils';

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

  // Consolidated state management
  const { state, actions } = useCategoryPageState();

  // Delete category mutation
  const deleteCategoryMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      actions.setDeletingCategory(false);
      actions.hideDeleteCategoryConfirm();
      toast.success('Category deleted successfully!');
      router.push(`/events/${eventId}/dashboard`);
    },
    onError: (error) => {
      actions.setDeletingCategory(false);
      console.error('Failed to delete category:', error);
      toast.error(
        error.message || 'Failed to delete category. Please try again.',
      );
      // Don't close modal on error - allow retry
    },
  });

  // Find the current category from EventDetailsContext (memoized for performance)
  const category = useMemo(
    () => categories.find((cat) => cat.id === categoryId),
    [categories, categoryId],
  );

  // Filter expenses by current category (memoized for performance)
  const categoryExpenses = useMemo(
    () => expenses.filter((expense) => expense.category.id === categoryId),
    [expenses, categoryId],
  );

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
  if (!category) {
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

  const handleExpenseClick = (expense: any) => {
    router.push(`/events/${eventId}/expense/${expense.id}`);
  };

  const handleEditCategory = () => {
    actions.setEditCategoryMode(true);
  };

  const handleDeleteCategory = () => {
    actions.showDeleteCategoryConfirm();
  };

  const confirmDeleteCategory = async () => {
    if (!user?.uid || !currentEvent?.id) {
      toast.error('Missing required information');
      return;
    }

    actions.setDeletingCategory(true);

    try {
      await deleteCategoryMutation.mutateAsync({
        userId: user.uid,
        eventId: currentEvent.id,
        categoryId: categoryId,
      });
      // Success/error handling is done in mutation callbacks
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error deleting category:', error);
    }
  };

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
  const breadcrumbItems: BreadcrumbItem[] = useMemo(
    () => [
      {
        label: truncateForBreadcrumb(currentEvent.name, 15),
        href: `/events/${eventId}/dashboard`,
        icon: HomeIcon,
      },
      {
        label: truncateForBreadcrumb(category?.name || '', 18),
        current: true,
      },
    ],
    [currentEvent.name, eventId, category?.name],
  );

  return (
    <DashboardLayout>
      {/* Breadcrumbs */}
      <div className='mb-3 sm:mb-4'>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Category Header */}
      <div className='mb-4 sm:mb-6'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0'>
            <span className='text-3xl sm:text-4xl flex-shrink-0'>
              {category.icon || '🎉'}
            </span>
            <div className='flex-1 min-w-0'>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
                {category.name}
              </h1>
              <p className='text-sm sm:text-base text-gray-600 mt-1'>
                {category.description ||
                  'Track and manage expenses for this budget category'}
              </p>
            </div>
          </div>

          {/* Action Dropdown - Aligned with title, anchored right */}
          <div className='flex-shrink-0 ml-4'>
            <ActionDropdown
              variant='mobile-only'
              primaryAction={{
                label: 'Add Expense',
                icon: PlusIcon,
                onClick: actions.showAddExpense,
              }}
              options={[
                {
                  id: 'edit-category',
                  label: 'Edit Category',
                  icon: PencilIcon,
                  onClick: handleEditCategory,
                },
                {
                  id: 'delete-category',
                  label: 'Delete Category',
                  icon: TrashIcon,
                  onClick: handleDeleteCategory,
                  variant: 'danger',
                },
              ]}
            />

            {/* Desktop Action Dropdown */}
            <div className='hidden sm:block'>
              <ActionDropdown
                variant='desktop-split'
                primaryAction={{
                  label: 'Add Expense',
                  icon: PlusIcon,
                  onClick: actions.showAddExpense,
                }}
                options={[
                  {
                    id: 'edit-category',
                    label: 'Edit Category',
                    icon: PencilIcon,
                    onClick: handleEditCategory,
                  },
                  {
                    id: 'delete-category',
                    label: 'Delete Category',
                    icon: TrashIcon,
                    onClick: handleDeleteCategory,
                    variant: 'danger',
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Overview Card */}
      <BudgetOverviewCard
        data={budgetData}
        title='Budget Overview'
        className='mb-4 sm:mb-6'
      />

      {/* Expenses List */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-base sm:text-lg lg:text-heading font-semibold text-gray-900'>
            Expenses ({categoryExpenses.length})
          </h2>
        </div>

        {categoryExpenses.length === 0 ? (
          <div className='text-center py-8 sm:py-12'>
            <div className='text-gray-400 mb-4'>
              <div className='text-4xl sm:text-6xl mb-3 sm:mb-4'>💸</div>
              <h3 className='text-lg sm:text-xl font-medium text-gray-600 mb-2'>
                No expenses yet
              </h3>
              <p className='text-sm sm:text-base text-gray-500 px-4'>
                Start by adding your first expense to this category
              </p>
            </div>
            <div className='flex justify-center'>
              <button
                type='button'
                onClick={actions.showAddExpense}
                className='btn-primary w-full sm:w-auto sm:min-w-[180px] flex items-center justify-center'
              >
                <PlusIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                <span>Add First Expense</span>
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-2 sm:space-y-3'>
            {categoryExpenses.map((expense) => (
              <ExpenseListItem
                key={expense.id}
                expense={expense}
                onClick={handleExpenseClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddOrEditExpenseModal
        isOpen={state.modals.showAddExpense}
        onClose={actions.hideAddExpense}
        categories={[
          {
            id: category.id,
            name: category.name,
            description: category.description || '',
            budgetedAmount: category.budgetedAmount ?? 0,
            scheduledAmount: category.scheduledAmount ?? 0,
            spentAmount: category.spentAmount ?? 0,
            color: category.color,
            icon: category.icon || '🎉',
            _createdDate: new Date(),
            _createdBy: '',
            _updatedDate: new Date(),
            _updatedBy: '',
          },
        ]}
      />

      {/* Add/Edit Category Modal */}
      <AddOrEditCategoryModal
        isOpen={state.modals.showAddCategoryModal}
        onClose={actions.hideAddCategoryModal}
        editingCategory={
          state.modals.isEditCategoryMode && category
            ? {
                id: category.id || '',
                name: category.name || '',
                budgetedAmount: category.budgetedAmount ?? 0,
                description: category.description || '',
                color: category.color || '#059669',
                icon: category.icon || '🎉',
              }
            : null
        }
        isEditMode={state.modals.isEditCategoryMode}
      />

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={state.modals.showDeleteCategoryConfirm}
        onClose={actions.hideDeleteCategoryConfirm}
        onConfirm={
          categoryExpenses.length > 0 ? undefined : confirmDeleteCategory
        }
        title='Delete Category'
        message={
          categoryExpenses.length > 0
            ? `Cannot delete this category because it contains ${categoryExpenses.length} expense${categoryExpenses.length === 1 ? '' : 's'}. Please delete or reassign the expenses first before deleting this category.`
            : `Are you sure you want to delete "${category?.name}"? This action cannot be undone.`
        }
        confirmText={categoryExpenses.length > 0 ? undefined : 'Delete'}
        type='danger'
        isLoading={state.operations.isDeletingCategory}
      />
    </DashboardLayout>
  );
}
