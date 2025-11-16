'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { toast } from 'sonner';

// Layout and UI components
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AttachmentsSection from '@/components/expense/AttachmentsSection';
import ExpenseBasicInfo from '@/components/expense/ExpenseBasicInfo';

// Refactored components
import ExpenseHeader from '@/components/expense/ExpenseHeader';
// Lazy-loaded modals
import { LazyModalComponents } from '@/components/expense/LazyModalComponents';
import PaymentScheduleSection from '@/components/expense/PaymentScheduleSection';
import VendorInformation from '@/components/expense/VendorInformation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotFoundState from '@/components/ui/NotFoundState';

// Hooks and utilities
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useDeleteExpenseMutation } from '@/hooks/expenses';
import { useClearAllPaymentsMutation } from '@/hooks/payments';
import { useAttachmentManager } from '@/hooks/useAttachmentManager';
import { useModalState } from '@/hooks/useModalState';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import type {
  Payment as CalculatedPayment,
  ExpenseWithPayments,
} from '@/lib/paymentCalculations';
import { initialTagState, tagReducer } from '@/lib/tagUtils';
// Types
import type { Expense } from '@/types/Expense';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const expenseId = params?.expenseId as string;

  // Core context hooks
  const { events, isLoading, selectEventById } = useEvents();
  const {
    event: currentEvent,
    expenses,
    isExpensesLoading,
    categories,
  } = useEventDetails();
  const { user } = useAuth();

  // Current expense state
  const [expense, setExpense] = React.useState<Expense | null>(null);

  // Capture category ID early and keep it stable through deletion
  const [categoryIdForNavigation, setCategoryIdForNavigation] = React.useState<
    string | null
  >(null);

  // Tag management with reducer
  const [tagState, tagDispatch] = useReducer(tagReducer, initialTagState);

  // Modal state management
  const modalState = useModalState();

  // Attachment management
  const attachmentManager = useAttachmentManager({
    expense,
    userId: user?.uid || '',
    eventId,
  });

  // Mutations
  const clearAllPaymentsMutation = useClearAllPaymentsMutation({
    onSuccess: () => {
      modalState.actions.setDeletePaymentsLoading(false);
      modalState.actions.closeDeletePaymentsConfirm();
      toast.success('Payments removed successfully!');
    },
    onError: (error) => {
      modalState.actions.setDeletePaymentsLoading(false);
      console.error('Error clearing payments:', error);
      toast.error(
        error.message || 'Failed to remove payments. Please try again.',
      );
    },
  });

  const deleteExpenseMutation = useDeleteExpenseMutation({
    onSuccess: () => {
      modalState.actions.setDeleteExpenseLoading(false);
      modalState.actions.closeDeleteExpenseConfirm();
      toast.success('Expense deleted successfully!');

      // Navigate back to category page using captured category ID
      if (categoryIdForNavigation) {
        router.push(`/events/${eventId}/category/${categoryIdForNavigation}`);
      } else {
        router.push(`/events/${eventId}/dashboard`);
      }
    },
    onError: (error) => {
      modalState.actions.setDeleteExpenseLoading(false);
      console.error('Error deleting expense:', error);
      toast.error(
        error.message || 'Failed to delete expense. Please try again.',
      );
    },
  });

  // Auto-select event when accessing directly via URL
  useEffect(() => {
    if (eventId && events.length > 0 && !isLoading) {
      selectEventById(eventId);
    }
  }, [eventId, events.length, isLoading, selectEventById]);

  // Load expense when expenseId changes or expenses list updates
  useEffect(() => {
    if (expenseId && expenses.length > 0) {
      const foundExpense = expenses.find((exp) => exp.id === expenseId);
      setExpense(foundExpense || null);

      // Capture category ID when expense is first loaded
      if (foundExpense?.category?.id && !categoryIdForNavigation) {
        setCategoryIdForNavigation(foundExpense.category.id);
      }
    }
  }, [expenseId, expenses, categoryIdForNavigation]);

  // Initialize tags when expense is loaded
  useEffect(() => {
    if (expense?.tags) {
      tagDispatch({ type: 'SET_TAGS', tags: expense.tags });
    }
  }, [expense]);

  // Event handlers
  const handleEdit = useCallback(() => {
    modalState.actions.openEditExpense();
  }, [modalState.actions]);

  const handleDelete = useCallback(() => {
    modalState.actions.openDeleteExpenseConfirm();
  }, [modalState.actions]);

  const handleCreatePaymentSchedule = useCallback(() => {
    modalState.actions.openPaymentSchedule('create');
  }, [modalState.actions]);

  const handleEditSchedule = useCallback(() => {
    modalState.actions.openPaymentSchedule('edit');
  }, [modalState.actions]);

  const handleMarkAsPaid = useCallback(() => {
    modalState.actions.openMarkAsPaid();
  }, [modalState.actions]);

  const handleMarkPaymentAsPaid = useCallback(
    (payment: CalculatedPayment) => {
      modalState.actions.openMarkPaymentAsPaid(payment);
    },
    [modalState.actions],
  );

  const handleDeleteAllPayments = useCallback(() => {
    modalState.actions.openDeletePaymentsConfirm();
  }, [modalState.actions]);

  const handleConfirmDeleteAllPayments = useCallback(async () => {
    if (!user?.uid || !currentEvent?.id || !expense) return;

    modalState.actions.setDeletePaymentsLoading(true);
    try {
      await clearAllPaymentsMutation.mutateAsync({
        userId: user.uid,
        eventId: currentEvent.id,
        expenseId: expense.id,
      });
    } catch (error) {
      console.error('Error clearing payments:', error);
    }
  }, [
    user?.uid,
    currentEvent?.id,
    expense,
    clearAllPaymentsMutation,
    modalState.actions,
  ]);

  const handleConfirmDeleteExpense = useCallback(async () => {
    if (!user?.uid || !currentEvent?.id || !expense) return;

    modalState.actions.setDeleteExpenseLoading(true);
    try {
      await deleteExpenseMutation.mutateAsync({
        userId: user.uid,
        eventId: currentEvent.id,
        expenseId: expense.id,
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  }, [
    user?.uid,
    currentEvent?.id,
    expense,
    deleteExpenseMutation,
    modalState.actions,
  ]);

  // Tag management handlers
  const tagHandlers = useMemo(
    () => ({
      addTag: () => {
        if (tagState.newTag.trim()) {
          tagDispatch({ type: 'ADD_TAG', tag: tagState.newTag });
        }
      },
      deleteTag: (tag: string) => {
        tagDispatch({ type: 'REMOVE_TAG', tag });
      },
      setNewTag: (tag: string) => {
        tagDispatch({ type: 'SET_NEW_TAG', tag });
      },
      toggleEditing: () => {
        tagDispatch({ type: 'TOGGLE_EDITING' });
      },
      handleKeyPress: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          if (tagState.newTag.trim()) {
            tagDispatch({ type: 'ADD_TAG', tag: tagState.newTag });
          }
        }
        if (e.key === 'Escape') {
          tagDispatch({ type: 'STOP_EDITING' });
        }
      },
    }),
    [tagState.newTag],
  );

  // Show loading state while data is being fetched
  if (
    isLoading ||
    isExpensesLoading ||
    !currentEvent ||
    (expenses.length > 0 && !expense)
  ) {
    return (
      <DashboardLayout>
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  // Show not found state if expense doesn't exist after loading
  if (!expense) {
    return (
      <DashboardLayout>
        <NotFoundState
          title='Expense Not Found'
          message='The requested expense could not be found.'
          buttonText='Return to Dashboard'
          onButtonClick={() => router.push(`/events/${eventId}/dashboard`)}
          icon='💰'
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header with breadcrumbs and actions */}
      <ExpenseHeader
        expense={expense}
        currentEvent={currentEvent}
        eventId={eventId}
        showActionDropdown={modalState.state.actionDropdown.isOpen}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActionDropdown={modalState.actions.toggleActionDropdown}
        onCloseActionDropdown={modalState.actions.closeActionDropdown}
      />

      <div className='space-y-6'>
        {/* Amount Card */}
        <div className='bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 text-center'>
          <div className='flex items-center justify-center mb-2'>
            <span className='text-3xl sm:text-4xl font-bold text-primary-900'>
              {formatCurrency(expense.amount)}
            </span>
          </div>
          <p className='text-primary-700 font-medium'>Total Expense Amount</p>
        </div>

        {/* Basic Information */}
        <ExpenseBasicInfo
          expense={expense}
          tags={tagState.tags}
          isEditingTags={tagState.isEditing}
          newTag={tagState.newTag}
          onTagsChange={tagHandlers}
        />

        {/* Description */}
        {expense.description && (
          <div className='card'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
              Description
            </h3>
            <p className='text-gray-700 leading-relaxed'>
              {expense.description}
            </p>
          </div>
        )}

        {/* Vendor Information */}
        <VendorInformation vendor={expense.vendor} />

        {/* Payment Information */}
        <PaymentScheduleSection
          expense={expense as ExpenseWithPayments}
          onMarkPaymentAsPaid={handleMarkPaymentAsPaid}
          onDeleteAllPayments={handleDeleteAllPayments}
          onEditSchedule={handleEditSchedule}
          onCreateSchedule={handleCreatePaymentSchedule}
          onMarkAsPaid={handleMarkAsPaid}
        />

        {/* Attachments */}
        <AttachmentsSection
          attachments={expense.attachments}
          attachmentManager={attachmentManager}
        />

        {/* Metadata */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3'>
            Record Information
          </h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm'>
            <div>
              <div className='font-medium text-gray-500 uppercase tracking-wide'>
                Created
              </div>
              <p className='mt-1 text-gray-900'>
                {formatDateTime(expense._createdDate)}
              </p>
            </div>
            {expense._updatedDate && (
              <div>
                <div className='font-medium text-gray-500 uppercase tracking-wide'>
                  Last Updated
                </div>
                <p className='mt-1 text-gray-900'>
                  {formatDateTime(expense._updatedDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lazy-loaded Modals */}
      <LazyModalComponents.MarkAsPaidModal
        isOpen={modalState.state.markAsPaid.isOpen}
        onClose={modalState.actions.closeMarkAsPaid}
        expenseId={expenseId}
        expenseName={expense.name}
        expenseAmount={expense.amount}
      />

      <LazyModalComponents.MarkAsPaidModal
        isOpen={modalState.state.markPaymentAsPaid.isOpen}
        onClose={modalState.actions.closeMarkPaymentAsPaid}
        expenseId={expenseId}
        expenseName={
          modalState.state.markPaymentAsPaid.selectedPayment?.description ||
          'Payment'
        }
        expenseAmount={
          modalState.state.markPaymentAsPaid.selectedPayment?.amount || 0
        }
        paymentId={modalState.state.markPaymentAsPaid.paymentId || undefined}
      />

      <LazyModalComponents.PaymentScheduleModal
        isOpen={modalState.state.paymentSchedule.isOpen}
        onClose={modalState.actions.closePaymentSchedule}
        expenseId={expenseId}
        expenseName={expense.name}
        totalAmount={expense.amount}
        existingPayments={expense.paymentSchedule}
        mode={modalState.state.paymentSchedule.mode}
        onCreateSchedule={(payments) => {
          console.log('Create payment schedule:', payments);
          modalState.actions.closePaymentSchedule();
        }}
      />

      <LazyModalComponents.AddOrEditExpenseModal
        isOpen={modalState.state.editExpense.isOpen}
        onClose={modalState.actions.closeEditExpense}
        categories={categories}
        editingExpense={{
          ...expense,
          currency: expense.currency.code,
        }}
        isEditMode={true}
      />

      {/* Confirmation Dialogs */}
      <LazyModalComponents.ConfirmDialog
        isOpen={modalState.state.confirmDialogs.deletePayments.isOpen}
        onClose={modalState.actions.closeDeletePaymentsConfirm}
        onConfirm={handleConfirmDeleteAllPayments}
        title='Remove All Payments'
        message={
          (expense as ExpenseWithPayments).hasPaymentSchedule
            ? 'Are you sure you want to remove the entire payment schedule? This will clear all scheduled payments and cannot be undone.'
            : 'Are you sure you want to remove the payment? This will clear the payment record and cannot be undone.'
        }
        confirmText='Remove'
        type='danger'
        isLoading={modalState.state.confirmDialogs.deletePayments.isLoading}
      />

      <LazyModalComponents.ConfirmDialog
        isOpen={modalState.state.confirmDialogs.deleteExpense.isOpen}
        onClose={modalState.actions.closeDeleteExpenseConfirm}
        onConfirm={handleConfirmDeleteExpense}
        title='Delete Expense'
        message='Are you sure you want to delete this expense? This action cannot be undone. All payment schedules and associated data will be permanently removed.'
        confirmText='Delete'
        type='danger'
        isLoading={modalState.state.confirmDialogs.deleteExpense.isLoading}
      />

      <LazyModalComponents.ConfirmDialog
        isOpen={attachmentManager.showDeleteConfirm}
        onClose={attachmentManager.handleDeleteCancel}
        onConfirm={attachmentManager.handleDeleteConfirm}
        title='Delete Attachment'
        message='Are you sure you want to delete this attachment? This action cannot be undone.'
        confirmText='Delete'
        type='danger'
        isLoading={attachmentManager.isOperationInProgress}
      />
    </DashboardLayout>
  );
}
