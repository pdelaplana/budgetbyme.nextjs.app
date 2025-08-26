'use client';

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddOrEditCategoryModal from '@/components/modals/AddOrEditCategoryModal';
import AddOrEditExpenseModal from '@/components/modals/AddOrEditExpenseModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ActionDropdown from '@/components/ui/ActionDropdown';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotFoundState from '@/components/ui/NotFoundState';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useDeleteCategoryMutation } from '@/hooks/categories';
import { formatCurrency, formatDate } from '@/lib/formatters';
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

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] =
    useState(false);

  // Delete category mutation
  const deleteCategoryMutation = useDeleteCategoryMutation({
    onSuccess: () => {
      toast.success('Category deleted successfully!');
      router.push(`/events/${eventId}/dashboard`);
    },
    onError: (error) => {
      console.error('Failed to delete category:', error);
      toast.error(
        error.message || 'Failed to delete category. Please try again.',
      );
    },
  });

  // Find the current category from EventDetailsContext
  const category = categories.find((cat) => cat.id === categoryId);

  // Filter expenses by current category
  const categoryExpenses = expenses.filter(
    (expense) => expense.category.id === categoryId,
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
    setIsEditCategoryMode(true);
    setShowAddCategoryModal(true);
  };

  const handleDeleteCategory = () => {
    setShowDeleteCategoryConfirm(true);
  };

  const confirmDeleteCategory = async () => {
    if (!user?.uid || !currentEvent?.id) {
      toast.error('Missing required information');
      return;
    }

    try {
      await deleteCategoryMutation.mutateAsync({
        userId: user.uid,
        eventId: currentEvent.id,
        categoryId: categoryId,
      });
    } catch (error) {
      // Error handling is done in mutation callbacks
      console.error('Error deleting category:', error);
    }
  };

  const remaining = category
    ? (category.budgetedAmount ?? 0) - (category.spentAmount ?? 0)
    : 0;
  const percentage =
    category && (category.budgetedAmount ?? 0) > 0
      ? Math.round(
          ((category.spentAmount ?? 0) / (category.budgetedAmount ?? 0)) * 100,
        )
      : 0;

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: truncateForBreadcrumb(currentEvent.name, 15),
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: truncateForBreadcrumb(category.name, 18),
      current: true,
    },
  ];

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
                onClick: () => setShowAddExpense(true),
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
                  onClick: () => setShowAddExpense(true),
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
      <div className='card mb-4 sm:mb-6'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6'>
          <div className='lg:col-span-2'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4'>
              Budget Overview
            </h3>
            <div className='space-y-2 sm:space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm sm:text-base text-gray-600'>
                  Budgeted:
                </span>
                <span className='font-semibold text-sm sm:text-base'>
                  {formatCurrency(category.budgetedAmount ?? 0)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm sm:text-base text-gray-600'>
                  Scheduled:
                </span>
                <span className='font-semibold text-sm sm:text-base text-primary-600'>
                  {formatCurrency(category.scheduledAmount ?? 0)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm sm:text-base text-gray-600'>
                  Spent:
                </span>
                <span className='font-semibold text-sm sm:text-base text-success-600'>
                  {formatCurrency(category.spentAmount ?? 0)}
                </span>
              </div>
              <div className='flex justify-between items-center border-t pt-2 sm:pt-3'>
                <span className='text-sm sm:text-base text-gray-600'>
                  {remaining >= 0 ? 'Remaining:' : 'Over budget:'}
                </span>
                <span
                  className={`font-semibold text-sm sm:text-base ${remaining >= 0 ? 'text-success-600' : 'text-red-600'}`}
                >
                  {formatCurrency(Math.abs(remaining))}
                </span>
              </div>
            </div>
          </div>

          <div className='lg:col-span-2 mt-4 lg:mt-0'>
            <h4 className='text-sm font-medium text-gray-500 mb-2'>Progress</h4>
            <div className='flex items-center justify-center lg:justify-center h-16 sm:h-20'>
              <div className='text-center'>
                <div className='text-2xl sm:text-3xl font-bold text-gray-900 mb-1'>
                  {percentage}%
                </div>
                <div className='w-24 sm:w-32 bg-gray-200 rounded-full h-2 sm:h-3'>
                  <div
                    className='h-2 sm:h-3 rounded-full transition-all duration-500'
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
                <div className='text-xs text-gray-500 mt-1'>of budget used</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                onClick={() => setShowAddExpense(true)}
                className='btn-primary w-full sm:w-auto sm:min-w-[180px] flex items-center justify-center'
              >
                <PlusIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                <span>Add First Expense</span>
              </button>
            </div>
          </div>
        ) : (
          <div className='space-y-2 sm:space-y-3'>
            {categoryExpenses.map((expense) => {
              // Calculate payment status and progress (matching expense detail page logic)
              const hasPayments =
                (expense.hasPaymentSchedule && expense.paymentSchedule) ||
                expense.oneOffPayment;

              let totalScheduled = 0;
              let totalPaid = 0;

              if (
                expense.hasPaymentSchedule &&
                expense.paymentSchedule &&
                expense.paymentSchedule.length > 0
              ) {
                // Multiple payments in schedule
                totalScheduled = expense.paymentSchedule.reduce(
                  (sum: number, payment: any) => sum + payment.amount,
                  0,
                );
                totalPaid = expense.paymentSchedule
                  .filter((payment: any) => payment.isPaid)
                  .reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0,
                  );
              } else if (expense.oneOffPayment) {
                // Single payment (hasPaymentSchedule can be true or false)
                totalScheduled = expense.oneOffPayment.amount;
                totalPaid = expense.oneOffPayment.isPaid
                  ? expense.oneOffPayment.amount
                  : 0;
              } else {
                // No payments at all
                totalScheduled = expense.amount;
                totalPaid = 0;
              }
              const remainingBalance = totalScheduled - totalPaid;
              const progressPercentage =
                totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;
              const isFullyPaid = remainingBalance === 0;

              // Find next due payment
              const nextDuePayment =
                expense.hasPaymentSchedule && expense.paymentSchedule
                  ? expense.paymentSchedule
                      .filter((p: any) => !p.isPaid)
                      .sort(
                        (a: any, b: any) =>
                          new Date(a.dueDate).getTime() -
                          new Date(b.dueDate).getTime(),
                      )[0]
                  : null;

              return (
                <button
                  type='button'
                  key={expense.id}
                  onClick={() => handleExpenseClick(expense)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleExpenseClick(expense);
                    }
                  }}
                  className='group p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md hover:bg-gray-50/50 transition-all duration-200 cursor-pointer w-full text-left'
                >
                  <div className='flex flex-col space-y-3'>
                    {/* Header with name and amount */}
                    <div className='flex items-start justify-between'>
                      <h3 className='text-sm sm:text-base font-semibold text-gray-900 leading-tight flex-1 min-w-0 pr-3 group-hover:text-primary-700 transition-colors duration-200'>
                        {expense.name}
                      </h3>
                      <span className='text-base sm:text-lg font-bold text-gray-900 flex-shrink-0'>
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>

                    {/* Description and date */}
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0'>
                      <p className='text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-1 flex-1 min-w-0 sm:pr-4'>
                        {expense.description}
                      </p>
                      <span className='text-xs sm:text-sm text-gray-500 flex-shrink-0'>
                        {formatDate(expense.date)}
                      </span>
                    </div>

                    {/* Payment Status and Progress */}
                    <div className='space-y-2'>
                      {/* Payment Status */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                          {isFullyPaid ? (
                            <>
                              <CheckCircleIcon className='h-4 w-4 text-success-600' />
                              <span className='text-xs font-medium text-success-700'>
                                Fully Paid
                              </span>
                            </>
                          ) : nextDuePayment ? (
                            <>
                              <ClockIcon className='h-4 w-4 text-warning-600' />
                              <span className='text-xs font-medium text-warning-700'>
                                Next due: {formatDate(nextDuePayment.dueDate)}
                              </span>
                            </>
                          ) : (
                            <>
                              <ExclamationTriangleIcon className='h-4 w-4 text-gray-500' />
                              <span className='text-xs font-medium text-gray-600'>
                                Payment Pending
                              </span>
                            </>
                          )}
                        </div>

                        {!isFullyPaid && (
                          <span className='text-xs font-medium text-gray-700'>
                            {formatCurrency(remainingBalance)} remaining
                          </span>
                        )}
                      </div>

                      {/* Progress Bar (only show if has payments) */}
                      {hasPayments && (
                        <div className='space-y-1'>
                          <div className='flex justify-between items-center'>
                            <span className='text-xs text-gray-500'>
                              Payment Progress
                            </span>
                            <span className='text-xs font-medium text-gray-700'>
                              {Math.round(progressPercentage)}%
                            </span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-1.5'>
                            <div
                              className='bg-primary-600 h-1.5 rounded-full transition-all duration-300'
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                          <div className='text-xs text-gray-500'>
                            {formatCurrency(totalPaid)} of{' '}
                            {formatCurrency(totalScheduled)} paid
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddOrEditExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
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
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setIsEditCategoryMode(false);
        }}
        editingCategory={
          isEditCategoryMode && category
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
        isEditMode={isEditCategoryMode}
      />

      {/* Delete Category Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteCategoryConfirm}
        onClose={() => setShowDeleteCategoryConfirm(false)}
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
      />
    </DashboardLayout>
  );
}
