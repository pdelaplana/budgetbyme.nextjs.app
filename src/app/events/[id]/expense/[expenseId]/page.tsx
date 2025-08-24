'use client';

import {
  BuildingOfficeIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  HomeIcon,
  MapPinIcon,
  PencilIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddOrEditExpenseModal from '@/components/modals/AddOrEditExpenseModal';
import PaymentScheduleModal from '@/components/modals/AddPaymentScheduleModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import MarkAsPaidModal from '@/components/modals/MarkAsPaidModal';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useClearAllPaymentsMutation } from '@/hooks/payments';

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const expenseId = params?.expenseId as string;
  const { events, isLoading, selectEventById } = useEvents();
  const {
    event: currentEvent,
    expenses,
    isExpensesLoading,
    categories,
  } = useEventDetails();
  const { user } = useAuth();

  const [showAddPaymentSchedule, setShowAddPaymentSchedule] = useState(false);
  const [paymentScheduleMode, setPaymentScheduleMode] = useState<
    'create' | 'edit'
  >('create');
  const [showMarkAsPaid, setShowMarkAsPaid] = useState(false);
  const [showMarkPaymentAsPaid, setShowMarkPaymentAsPaid] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Payment deletion state
  const [showDeletePaymentsConfirm, setShowDeletePaymentsConfirm] =
    useState(false);

  // Clear all payments mutation
  const clearAllPaymentsMutation = useClearAllPaymentsMutation({
    onSuccess: () => {
      setShowDeletePaymentsConfirm(false);
    },
    onError: (error) => {
      console.error('Error clearing payments:', error);
    },
  });

  // Auto-select event when accessing directly via URL
  useEffect(() => {
    if (eventId && events.length > 0 && !isLoading) {
      selectEventById(eventId);
    }
  }, [eventId, events.length, isLoading, selectEventById]);

  // Find the current expense from EventDetailsContext
  const expense = expenses.find((exp) => exp.id === expenseId);

  // Initialize tags when expense is loaded
  React.useEffect(() => {
    if (expense?.tags) {
      setTags(expense.tags);
    }
  }, [expense]);

  // Show loading state while data is being fetched
  if (isLoading || isExpensesLoading || !currentEvent) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
          <h1 className='text-xl font-semibold text-gray-900 mb-2'>
            Loading Expense...
          </h1>
          <p className='text-sm text-gray-600'>
            Please wait while we load your expense details
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // Show not found state if expense doesn't exist after loading
  if (!expense) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            Expense Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            The requested expense could not be found.
          </p>
          <button
            type='button'
            onClick={() => router.push(`/events/${eventId}/dashboard`)}
            className='btn-primary'
          >
            Return to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPaymentStatus = (payment: any) => {
    if (payment.isPaid) {
      return {
        icon: CheckCircleIcon,
        text: payment.paidDate
          ? `Paid ${formatDate(payment.paidDate)}`
          : 'Paid',
        className: 'text-success-600',
        bgClassName: 'bg-success-50',
        borderClassName: 'border-success-200',
      };
    } else {
      const today = new Date();
      const dueDate =
        payment.dueDate instanceof Date
          ? payment.dueDate
          : new Date(payment.dueDate);
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysUntilDue < 0) {
        return {
          icon: ExclamationTriangleIcon,
          text: `${Math.abs(daysUntilDue)} days overdue`,
          className: 'text-red-600',
          bgClassName: 'bg-red-50',
          borderClassName: 'border-red-200',
        };
      } else if (daysUntilDue <= 7) {
        return {
          icon: ClockIcon,
          text: `Due in ${daysUntilDue} days`,
          className: 'text-warning-600',
          bgClassName: 'bg-warning-50',
          borderClassName: 'border-warning-200',
        };
      } else {
        return {
          icon: ClockIcon,
          text: `Due ${formatDate(dueDate)}`,
          className: 'text-gray-600',
          bgClassName: 'bg-gray-50',
          borderClassName: 'border-gray-200',
        };
      }
    }
  };

  const handleMarkPaymentAsPaid = (payment: any) => {
    setSelectedPayment(payment);
    setShowMarkPaymentAsPaid(true);
  };

  const handleDeleteAllPayments = () => {
    setShowDeletePaymentsConfirm(true);
  };

  const confirmDeleteAllPayments = async () => {
    if (!user?.uid || !currentEvent?.id) {
      return;
    }

    try {
      await clearAllPaymentsMutation.mutateAsync({
        userId: user.uid,
        eventId: currentEvent.id,
        expenseId: expense.id,
      });
    } catch (error) {
      console.error('Error clearing payments:', error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      console.log('Adding tag:', newTag.trim(), 'to expense:', expense.id);
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(updatedTags);
    console.log('Removing tag:', tagToDelete, 'from expense:', expense.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
    if (e.key === 'Escape') {
      setNewTag('');
      setIsEditingTags(false);
    }
  };

  const handleEdit = () => {
    setShowEditExpense(true);
  };

  const handleCreatePaymentSchedule = (payments: any[]) => {
    console.log('Create payment schedule:', payments);
    // In real app, this would convert the expense to have a payment schedule
    setShowAddPaymentSchedule(false);
  };

  const handleMarkAsPaid = (paymentData: any) => {
    console.log('Mark as paid:', paymentData);
    // In real app, this would update the expense as paid with the payment details
    setShowMarkAsPaid(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this expense? This action cannot be undone.',
      )
    ) {
      console.log('Delete expense:', expense.id);
      router.push(`/events/${eventId}/dashboard`);
    }
  };

  // Calculate payment totals based on embedded payment structure
  const hasPayments =
    (expense.hasPaymentSchedule && expense.paymentSchedule) ||
    expense.oneOffPayment;

  let totalScheduled = 0;
  let totalPaid = 0;
  let allPayments: any[] = [];

  if (
    expense.hasPaymentSchedule &&
    expense.paymentSchedule &&
    expense.paymentSchedule.length > 0
  ) {
    // Multiple payments in schedule
    allPayments = expense.paymentSchedule;
    totalScheduled = expense.paymentSchedule.reduce(
      (sum, payment) => sum + payment.amount,
      0,
    );
    totalPaid = expense.paymentSchedule
      .filter((payment) => payment.isPaid)
      .reduce((sum, payment) => sum + payment.amount, 0);
  } else if (expense.oneOffPayment) {
    // Single payment (hasPaymentSchedule can be true or false)
    allPayments = [expense.oneOffPayment];
    totalScheduled = expense.oneOffPayment.amount;
    totalPaid = expense.oneOffPayment.isPaid ? expense.oneOffPayment.amount : 0;
  } else {
    // No payments at all
    totalScheduled = expense.amount;
    totalPaid = 0;
    allPayments = [];
  }

  const remainingBalance = totalScheduled - totalPaid;

  // Helper function to truncate text for mobile breadcrumbs
  const truncateForMobile = (text: string, maxLength: number = 20) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength - 3)}...`;
  };

  // Breadcrumb items with mobile-friendly labels
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: truncateForMobile(currentEvent.name, 15),
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: truncateForMobile(expense.category.name, 12),
      href: `/events/${eventId}/category/${expense.category.id}`,
    },
    {
      label: truncateForMobile(expense.name, 18),
      current: true,
    },
  ];

  return (
    <DashboardLayout>
      {/* Breadcrumbs */}
      <div className='mb-3 sm:mb-4 overflow-hidden'>
        <div className='w-full' style={{ overflowX: 'hidden' }}>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <div className='flex items-start justify-between space-x-4'>
          <div className='flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0'>
            <span className='text-3xl sm:text-4xl flex-shrink-0'>
              {expense.category.icon}
            </span>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-3'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
                  {expense.name}
                </h1>
              </div>
              <p className='text-sm sm:text-base text-gray-600 mt-1'>
                {expense.category.name} • {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Mobile Action Dropdown - Inline with title, anchored right */}
          <div className='flex-shrink-0 sm:hidden'>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className='btn-secondary flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px]'
                aria-label='Open action menu'
              >
                <EllipsisVerticalIcon className='h-5 w-5' />
              </button>

              {/* Mobile Dropdown Menu */}
              {showActionDropdown && (
                <div className='absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right'>
                  <div className='py-1'>
                    <button
                      type='button'
                      onClick={() => {
                        handleEdit();
                        setShowActionDropdown(false);
                      }}
                      className='flex items-center gap-3 w-full px-4 py-4 text-base text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 min-h-[48px]'
                    >
                      <PencilIcon className='h-5 w-5 flex-shrink-0' />
                      <span>Edit Expense</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        handleDelete();
                        setShowActionDropdown(false);
                      }}
                      className='flex items-center gap-3 w-full px-4 py-4 text-base text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 min-h-[48px]'
                    >
                      <TrashIcon className='h-5 w-5 flex-shrink-0' />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Mobile Dropdown Backdrop */}
              {showActionDropdown && (
                <button
                  type='button'
                  className='fixed inset-0 z-40 cursor-default'
                  onClick={() => setShowActionDropdown(false)}
                  aria-label='Close menu'
                />
              )}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className='hidden sm:flex relative flex-shrink-0 overflow-visible'>
            <div className='flex'>
              <button
                type='button'
                onClick={handleEdit}
                className='btn-secondary flex items-center rounded-r-none border-r-0'
              >
                <PencilIcon className='h-4 w-4 mr-2' />
                Edit
              </button>
              <button
                type='button'
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className='btn-secondary px-2 rounded-l-none border-l border-gray-300 hover:border-gray-400'
                aria-label='More actions'
              >
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${showActionDropdown ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Desktop Dropdown Menu */}
            {showActionDropdown && (
              <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right transform'>
                <div className='py-1'>
                  <button
                    type='button'
                    onClick={() => {
                      handleDelete();
                      setShowActionDropdown(false);
                    }}
                    className='flex items-center gap-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200'
                  >
                    <TrashIcon className='h-4 w-4 flex-shrink-0' />
                    <span>Delete Expense</span>
                  </button>
                </div>
              </div>
            )}

            {/* Desktop Dropdown Backdrop */}
            {showActionDropdown && (
              <div
                className='fixed inset-0 z-40'
                onClick={() => setShowActionDropdown(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        {/* Amount Card */}
        <div className='bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 text-center'>
          <div className='flex items-center justify-center mb-2'>
            <CurrencyDollarIcon className='h-8 w-8 text-primary-600 mr-2' />
            <span className='text-3xl sm:text-4xl font-bold text-primary-900'>
              {formatCurrency(expense.amount)}
            </span>
          </div>
          <p className='text-primary-700 font-medium'>Total Expense Amount</p>
        </div>

        {/* Basic Information */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <DocumentTextIcon className='h-5 w-5 mr-2' />
            Basic Information
          </h3>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Expense Name
              </div>
              <p className='mt-1 text-base font-medium text-gray-900'>
                {expense.name}
              </p>
            </div>

            <div>
              <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Category
              </div>
              <div className='mt-1 flex items-center'>
                <div
                  className='w-3 h-3 rounded-full mr-2'
                  style={{ backgroundColor: expense.category.color }}
                />
                <p className='text-base font-medium text-gray-900'>
                  {expense.category.name}
                </p>
              </div>
            </div>

            <div>
              <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Date
              </div>
              <div className='mt-1 flex items-center'>
                <CalendarIcon className='h-4 w-4 text-gray-400 mr-2' />
                <p className='text-base text-gray-900'>
                  {formatDate(expense.date)}
                </p>
              </div>
            </div>

            <div>
              <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Amount
              </div>
              <p className='mt-1 text-base font-semibold text-gray-900'>
                {formatCurrency(expense.amount)}
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className='text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center mb-2'>
                Tags
                <button
                  onClick={() => setIsEditingTags(!isEditingTags)}
                  className='ml-2 text-xs text-primary-600 hover:text-primary-700 font-medium normal-case'
                >
                  ({isEditingTags ? 'Cancel' : 'Edit'})
                </button>
              </label>

              {/* Add Tag Input */}
              {isEditingTags && (
                <div className='mb-2'>
                  <div className='flex gap-1'>
                    <input
                      type='text'
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder='Add tag...'
                      className='flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500'
                      maxLength={15}
                    />
                    <button
                      type='button'
                      onClick={handleAddTag}
                      disabled={!newTag.trim() || tags.includes(newTag.trim())}
                      className='text-xs px-2 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Tags Display */}
              {tags.length > 0 ? (
                <div className='flex flex-wrap gap-1 items-center'>
                  <TagIcon className='h-3 w-3 text-gray-400 mr-1 flex-shrink-0' />
                  {tags.map((tag, index) => (
                    <div
                      key={index}
                      className={`inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded transition-colors duration-200 ${
                        isEditingTags ? 'hover:bg-gray-200' : ''
                      }`}
                    >
                      <span className='truncate max-w-[80px]'>{tag}</span>
                      {isEditingTags && (
                        <button
                          type='button'
                          onClick={() => handleDeleteTag(tag)}
                          className='ml-1 text-red-600 hover:text-red-700'
                          aria-label={`Remove ${tag} tag`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-2 border border-dashed border-gray-200 rounded'>
                  <p className='text-gray-500 text-xs'>No tags</p>
                  {!isEditingTags && (
                    <button
                      onClick={() => setIsEditingTags(true)}
                      className='text-primary-600 hover:text-primary-700 text-xs font-medium'
                    >
                      Add
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Notes - if needed for future */}
            <div>
              <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Notes
              </label>
              <p className='mt-1 text-sm text-gray-700'>
                {expense.notes || 'No notes added'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        {expense.description && (
          <div className='card'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
              <DocumentTextIcon className='h-5 w-5 mr-2' />
              Description
            </h3>
            <p className='text-gray-700 leading-relaxed'>
              {expense.description}
            </p>
          </div>
        )}

        {/* Vendor Information */}
        {(expense as any).vendor && (
          <div className='card'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <BuildingOfficeIcon className='h-5 w-5 mr-2' />
              Vendor Information
            </h3>

            <div className='space-y-4'>
              <div>
                <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                  Vendor Name
                </div>
                <p className='mt-1 text-base font-semibold text-gray-900'>
                  {(expense as any).vendor.name}
                </p>
              </div>

              {(expense as any).vendor.address && (
                <div>
                  <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                    Address
                  </div>
                  <div className='mt-1 flex items-start'>
                    <MapPinIcon className='h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0' />
                    <p className='text-base text-gray-900'>
                      {(expense as any).vendor.address}
                    </p>
                  </div>
                </div>
              )}

              {(expense as any).vendor.website && (
                <div>
                  <div className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                    Website
                  </div>
                  <div className='mt-1 flex items-center'>
                    <GlobeAltIcon className='h-4 w-4 text-gray-400 mr-2 flex-shrink-0' />
                    <a
                      href={(expense as any).vendor.website}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-base text-primary-600 hover:text-primary-700 hover:underline transition-colors duration-200'
                    >
                      {(expense as any).vendor.website.replace(
                        /^https?:\/\//,
                        '',
                      )}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
            <CreditCardIcon className='h-5 w-5 mr-2' />
            Payment Information
          </h3>

          {/* Payment Schedule */}
          {hasPayments && allPayments.length > 0 ? (
            <div className='space-y-4'>
              {/* Payment Schedule Summary */}
              <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 text-center'>
                  <div>
                    <p className='text-sm text-primary-600 font-medium'>
                      Total Amount
                    </p>
                    <p className='text-lg font-bold text-primary-900'>
                      {formatCurrency(totalScheduled)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-success-600 font-medium'>Paid</p>
                    <p className='text-lg font-bold text-success-700'>
                      {formatCurrency(totalPaid)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-600 font-medium'>
                      Remaining
                    </p>
                    <p className='text-lg font-bold text-gray-900'>
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className='mt-4'>
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-sm font-medium text-primary-700'>
                      Payment Progress
                    </span>
                    <span className='text-sm font-bold text-primary-700'>
                      {Math.round((totalPaid / totalScheduled) * 100)}%
                    </span>
                  </div>
                  <div className='w-full bg-primary-200 rounded-full h-3'>
                    <div
                      className='bg-primary-600 h-3 rounded-full transition-all duration-500'
                      style={{
                        width: `${(totalPaid / totalScheduled) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Individual Payments */}
              <div>
                <div className='flex items-center mb-3'>
                  <h4 className='text-base font-semibold text-gray-900'>
                    Payment Schedule
                  </h4>
                  <div className='flex items-center space-x-2 ml-2'>
                    <button
                      type='button'
                      onClick={() => {
                        setPaymentScheduleMode('edit');
                        setShowAddPaymentSchedule(true);
                      }}
                      className='p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200'
                      title='Edit payment schedule'
                    >
                      <PencilIcon className='h-4 w-4' />
                    </button>
                    <button
                      type='button'
                      onClick={handleDeleteAllPayments}
                      className='p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200'
                      title='Remove all payments'
                    >
                      <TrashIcon className='h-4 w-4' />
                    </button>
                  </div>
                </div>
                <div className='space-y-3'>
                  {allPayments.map((payment: any) => {
                    const status = getPaymentStatus(payment);
                    const StatusIcon = status.icon;

                    return (
                      <div
                        key={payment.id}
                        className={`p-4 rounded-lg border ${status.borderClassName} ${status.bgClassName}`}
                      >
                        <div className='flex items-start justify-between'>
                          <div className='flex items-start space-x-3'>
                            <StatusIcon
                              className={`h-5 w-5 mt-0.5 flex-shrink-0 ${status.className}`}
                            />
                            <div className='flex-1'>
                              <h5 className='font-semibold text-gray-900'>
                                {payment.name || payment.description}
                              </h5>
                              {payment.name && payment.description && (
                                <p className='text-sm text-gray-600 mt-1'>
                                  {payment.description}
                                </p>
                              )}
                              <p
                                className={`text-sm ${status.className} font-medium mt-1`}
                              >
                                {status.text}
                              </p>
                              {payment.notes && (
                                <p className='text-sm text-gray-600 mt-1'>
                                  {payment.notes}
                                </p>
                              )}
                              {payment.paymentMethod && (
                                <p className='text-sm text-gray-600 mt-1'>
                                  Payment method:{' '}
                                  <span className='font-medium'>
                                    {payment.paymentMethod}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className='text-right'>
                            <span className='text-lg font-bold text-gray-900'>
                              {formatCurrency(payment.amount)}
                            </span>
                            {!payment.isPaid && (
                              <div className='mt-2'>
                                <button
                                  type='button'
                                  onClick={() =>
                                    handleMarkPaymentAsPaid(payment)
                                  }
                                  className='btn-primary text-xs px-3 py-1.5'
                                >
                                  Mark as Paid
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* No Payment Schedule - Show Payment Options */
            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <div className='flex items-start space-x-4 mb-4'>
                  <ClockIcon className='h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5' />
                  <div className='flex-1'>
                    <span className='font-semibold text-gray-700'>
                      No Payment Schedule
                    </span>
                    <p className='text-sm text-gray-600 mt-1'>
                      This expense doesn't have any payment schedule yet. You
                      can create one to break down the payment into multiple
                      installments.
                    </p>
                  </div>
                </div>
                <div className='text-center'>
                  <button
                    type='button'
                    onClick={() => {
                      setPaymentScheduleMode('create');
                      setShowAddPaymentSchedule(true);
                    }}
                    className='btn-secondary flex items-center justify-center mx-auto px-6 py-3 w-full sm:w-auto sm:min-w-[280px]'
                  >
                    <CalendarDaysIcon className='h-4 w-4 mr-2 flex-shrink-0' />
                    <span className='text-center'>
                      <span className='hidden sm:inline'>
                        Create Payment Schedule
                      </span>
                      <span className='sm:hidden'>Create Schedule</span>
                    </span>
                  </button>
                </div>
              </div>

              <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
                <div className='flex items-start space-x-4 mb-4'>
                  <CheckCircleIcon className='h-6 w-6 text-primary-500 flex-shrink-0 mt-0.5' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium text-primary-800 mb-3'>
                      Mark as Paid
                    </h4>
                    <p className='text-sm text-primary-700'>
                      If you've already paid the full amount for this expense,
                      you can mark it as paid to track your payment.
                    </p>
                  </div>
                </div>
                <div className='text-center'>
                  <button
                    type='button'
                    onClick={() => setShowMarkAsPaid(true)}
                    className='btn-primary mx-auto px-6 py-3 w-full sm:w-auto sm:min-w-[280px]'
                  >
                    Mark as Paid
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-3 flex items-center'>
            <ClockIcon className='h-5 w-5 mr-2' />
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

      {/* Modals */}
      {/* Mark as Paid Modal - Full Expense */}
      <MarkAsPaidModal
        isOpen={showMarkAsPaid}
        onClose={() => setShowMarkAsPaid(false)}
        expenseId={expenseId!}
        expenseName={expense.name}
        expenseAmount={expense.amount}
        onMarkAsPaid={handleMarkAsPaid}
      />

      {/* Mark as Paid Modal - Individual Payment */}
      <MarkAsPaidModal
        isOpen={showMarkPaymentAsPaid}
        onClose={() => {
          setShowMarkPaymentAsPaid(false);
          setSelectedPayment(null);
        }}
        expenseId={expenseId!}
        expenseName={
          selectedPayment?.name || selectedPayment?.description || 'Payment'
        }
        expenseAmount={selectedPayment?.amount || 0}
        paymentId={selectedPayment?.id}
      />

      <PaymentScheduleModal
        isOpen={showAddPaymentSchedule}
        onClose={() => setShowAddPaymentSchedule(false)}
        expenseId={expenseId!}
        expenseName={expense.name}
        totalAmount={expense.amount}
        existingPayments={expense.paymentSchedule}
        mode={paymentScheduleMode}
        onCreateSchedule={handleCreatePaymentSchedule}
      />

      <AddOrEditExpenseModal
        isOpen={showEditExpense}
        onClose={() => setShowEditExpense(false)}
        categories={categories}
        editingExpense={expense}
        isEditMode={true}
        onUpdateExpense={(expenseId, expenseData) => {
          console.log('Update expense:', expenseId, expenseData);
          setShowEditExpense(false);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeletePaymentsConfirm}
        onClose={() => setShowDeletePaymentsConfirm(false)}
        onConfirm={confirmDeleteAllPayments}
        title='Remove All Payments'
        message={
          expense.hasPaymentSchedule
            ? 'Are you sure you want to remove the entire payment schedule? This will clear all scheduled payments and cannot be undone.'
            : 'Are you sure you want to remove the payment? This will clear the payment record and cannot be undone.'
        }
        confirmText='Remove'
        type='danger'
      />
    </DashboardLayout>
  );
}
