'use client';

import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddCategoryModal from '@/components/modals/AddCategoryModal';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import PaymentScheduleModal from '@/components/modals/PaymentScheduleModal';
import ActionDropdown, {
  ActionDropdownOption,
} from '@/components/ui/ActionDropdown';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useEvents } from '@/contexts/EventsContext';

// Mock data - in real app this would come from API based on event ID and category ID
const mockCategories = {
  '1': {
    id: '1',
    name: 'Venue & Reception',
    budgeted: 4800,
    spent: 4000,
    percentage: 83,
    color: '#059669',
    description:
      'All costs related to the wedding venue and reception facilities',
  },
  '2': {
    id: '2',
    name: 'Catering & Beverages',
    budgeted: 3600,
    spent: 2800,
    percentage: 78,
    color: '#10b981',
    description: 'Food, drinks, and catering services for the event',
  },
  '3': {
    id: '3',
    name: 'Photography & Video',
    budgeted: 1200,
    spent: 900,
    percentage: 75,
    color: '#7C3AED',
    description: 'Professional photography and videography services',
  },
  '4': {
    id: '4',
    name: 'Attire',
    budgeted: 960,
    spent: 800,
    percentage: 83,
    color: '#EC4899',
    description: 'Wedding dress, suits, shoes, and accessories',
  },
  '5': {
    id: '5',
    name: 'Flowers & Decorations',
    budgeted: 840,
    spent: 200,
    percentage: 24,
    color: '#34d399',
    description: 'Floral arrangements, centerpieces, and decorative items',
  },
  '6': {
    id: '6',
    name: 'Music & Entertainment',
    budgeted: 600,
    spent: 0,
    percentage: 0,
    color: '#EA580C',
    description: 'DJ, band, sound system, and entertainment services',
  },
};

// Mock expenses for each category (simplified for demo)
const mockExpenses = {
  '1': [
    {
      id: 'exp-1-1',
      name: 'Venue Booking Package',
      amount: 4000,
      date: '2024-01-15',
      description: 'Full venue booking with multiple payment schedule',
      createdAt: '2024-01-15T10:00:00Z',
      tags: ['deposit', 'venue'],
      hasPaymentSchedule: true,
      paymentSchedule: [
        {
          id: 'pay-1-1',
          description: 'Initial Deposit',
          amount: 2000,
          dueDate: '2024-01-15',
          isPaid: true,
          paidDate: '2024-01-15',
          paymentMethod: 'Credit Card',
          notes: 'Booking confirmation deposit',
        },
        {
          id: 'pay-1-2',
          description: 'Second Payment',
          amount: 1500,
          dueDate: '2024-04-15',
          isPaid: false,
          notes: '60 days before event',
        },
        {
          id: 'pay-1-3',
          description: 'Final Payment',
          amount: 500,
          dueDate: '2024-06-01',
          isPaid: false,
          notes: 'Two weeks before wedding',
        },
      ],
    },
  ],
  '2': [
    {
      id: 'exp-2-1',
      name: 'Catering Service Package',
      amount: 3200,
      date: '2024-01-20',
      description: 'Full catering service with payment plan',
      createdAt: '2024-01-20T16:20:00Z',
      tags: ['catering', 'package'],
      hasPaymentSchedule: true,
      paymentSchedule: [
        {
          id: 'pay-2-1',
          description: 'Booking Deposit',
          amount: 1500,
          dueDate: '2024-01-20',
          isPaid: true,
          paidDate: '2024-01-21',
          paymentMethod: 'Check',
          notes: 'Service booking confirmation',
        },
      ],
    },
  ],
  '3': [],
  '4': [],
  '5': [
    {
      id: 'exp-5-1',
      name: 'Bridal Bouquet',
      amount: 250,
      date: '2024-03-10',
      description: "Custom bridal bouquet with white roses and baby's breath",
      createdAt: '2024-03-10T14:30:00Z',
      tags: ['flowers', 'bridal'],
      hasPaymentSchedule: false,
      isPaid: false,
      dueDate: '2024-05-01',
    },
  ],
  '6': [],
};

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const categoryId = params?.categoryId as string;
  const { events } = useEvents();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);

  // Find the current event
  const currentEvent = events.find((event) => event.id === eventId);
  const category = mockCategories[categoryId as keyof typeof mockCategories];
  const expenses = mockExpenses[categoryId as keyof typeof mockExpenses] || [];

  if (!currentEvent || !category) {
    return (
      <DashboardLayout>
        <div className='text-center py-12'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            Category Not Found
          </h1>
          <p className='text-gray-600 mb-6'>
            The requested budget category could not be found.
          </p>
          <button
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      'Venue & Reception': '🏛️',
      'Catering & Beverages': '🍰',
      'Photography & Video': '📸',
      Attire: '👗',
      'Flowers & Decorations': '💐',
      'Music & Entertainment': '🎵',
    };
    return icons[name] || '🎉';
  };

  const handleExpenseClick = (expense: any) => {
    router.push(`/events/${eventId}/expense/${expense.id}`);
  };

  const handleEditCategory = () => {
    setIsEditCategoryMode(true);
    setShowAddCategoryModal(true);
  };

  const handleDeleteCategory = () => {
    if (
      confirm(
        'Are you sure you want to delete this category? This action cannot be undone and will remove all associated expenses.',
      )
    ) {
      console.log('Delete category:', categoryId);
      router.push(`/events/${eventId}/dashboard`);
    }
  };

  const remaining = category.budgeted - category.spent;

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: currentEvent.name,
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: category.name,
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
              {getCategoryIcon(category.name)}
            </span>
            <div className='flex-1 min-w-0'>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
                {category.name}
              </h1>
              <p className='text-sm sm:text-base text-gray-600 mt-1'>
                {category.description}
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
                  {formatCurrency(category.budgeted)}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm sm:text-base text-gray-600'>
                  Spent:
                </span>
                <span className='font-semibold text-sm sm:text-base'>
                  {formatCurrency(category.spent)}
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
                  {category.percentage}%
                </div>
                <div className='w-24 sm:w-32 bg-gray-200 rounded-full h-2 sm:h-3'>
                  <div
                    className='h-2 sm:h-3 rounded-full transition-all duration-500'
                    style={{
                      width: `${Math.min(category.percentage, 100)}%`,
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
            Expenses ({expenses.length})
          </h2>
        </div>

        {expenses.length === 0 ? (
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
            <button
              onClick={() => setShowAddExpense(true)}
              className='btn-primary w-full sm:w-auto'
            >
              <PlusIcon className='h-4 w-4 mr-2' />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className='space-y-2 sm:space-y-3'>
            {expenses.map((expense) => {
              // Calculate payment status and progress
              const hasPaymentSchedule =
                expense.hasPaymentSchedule &&
                'paymentSchedule' in expense &&
                expense.paymentSchedule;
              const totalScheduled = hasPaymentSchedule
                ? (expense as any).paymentSchedule.reduce(
                    (sum: number, payment: any) => sum + payment.amount,
                    0,
                  )
                : expense.amount;
              const totalPaid = hasPaymentSchedule
                ? (expense as any).paymentSchedule
                    .filter((p: any) => p.isPaid)
                    .reduce(
                      (sum: number, payment: any) => sum + payment.amount,
                      0,
                    )
                : 0;
              const remainingBalance = totalScheduled - totalPaid;
              const progressPercentage =
                totalScheduled > 0 ? (totalPaid / totalScheduled) * 100 : 0;
              const isFullyPaid = remainingBalance === 0;

              // Find next due payment
              const nextDuePayment = hasPaymentSchedule
                ? (expense as any).paymentSchedule
                    .filter((p: any) => !p.isPaid)
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.dueDate).getTime() -
                        new Date(b.dueDate).getTime(),
                    )[0]
                : null;

              return (
                <div
                  key={expense.id}
                  onClick={() => handleExpenseClick(expense)}
                  className='group p-3 sm:p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md hover:bg-gray-50/50 transition-all duration-200 cursor-pointer'
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

                      {/* Progress Bar (only show if has payment schedule) */}
                      {hasPaymentSchedule && (
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        categories={[
          {
            id: category.id,
            name: category.name,
            color: category.color,
          },
        ]}
      />

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setIsEditCategoryMode(false);
        }}
        editingCategory={
          isEditCategoryMode
            ? {
                id: category.id,
                name: category.name,
                budget: category.budgeted,
                description: category.description,
                color: category.color,
              }
            : null
        }
        isEditMode={isEditCategoryMode}
        onUpdateCategory={(categoryId, categoryData) => {
          console.log('Update category:', categoryId, categoryData);
        }}
        onAddCategory={(categoryData) => {
          console.log('Add new category:', categoryData);
        }}
      />
    </DashboardLayout>
  );
}
