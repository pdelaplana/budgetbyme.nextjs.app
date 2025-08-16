'use client';

import {
  ArrowLeftIcon,
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
  PhotoIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
  XMarkIcon as XMarkIconSolid,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import AddPaymentModal from '@/components/modals/AddPaymentModal';
import AddPaymentScheduleModal from '@/components/modals/AddPaymentScheduleModal';
import MarkAsPaidModal from '@/components/modals/MarkAsPaidModal';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { useEvents } from '@/contexts/EventsContext';

// Mock expense data - in real app this would come from API based on event ID and expense ID
const mockExpenseData = {
  'exp-1-1': {
    id: 'exp-1-1',
    name: 'Venue Booking Package',
    amount: 4000,
    category: 'Venue & Reception',
    categoryColor: '#059669',
    date: '2024-01-15',
    description:
      'Full venue booking with multiple payment schedule including ceremony space, reception hall, and basic decorations.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T15:30:00Z',
    tags: ['venue', 'package', 'ceremony'],
    vendor: {
      name: 'Golden Gate Gardens',
      address: '123 Wedding Lane, San Francisco, CA 94102',
      website: 'https://goldengategardens.com',
    },
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
  'exp-2-1': {
    id: 'exp-2-1',
    name: 'Catering Service Package',
    amount: 3200,
    category: 'Catering & Beverages',
    categoryColor: '#10b981',
    date: '2024-01-20',
    description:
      'Full catering service with payment plan for 80 guests including appetizers, main course, dessert, and beverages.',
    createdAt: '2024-01-20T16:20:00Z',
    updatedAt: '2024-02-15T09:45:00Z',
    tags: ['catering', 'package', '80-guests'],
    vendor: {
      name: 'Savory Celebrations Catering',
      address: '456 Culinary Ave, San Francisco, CA 94103',
      website: 'https://savorycelebrations.com',
    },
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
      {
        id: 'pay-2-2',
        description: 'Menu Confirmation',
        amount: 1200,
        dueDate: '2024-05-15',
        isPaid: false,
        notes: 'Final headcount and menu selection',
      },
      {
        id: 'pay-2-3',
        description: 'Service Balance',
        amount: 500,
        dueDate: '2024-06-10',
        isPaid: false,
        notes: 'Final payment before event',
      },
    ],
  },
  'exp-1-2': {
    id: 'exp-1-2',
    name: 'Additional Reception Hours',
    amount: 800,
    category: 'Venue & Reception',
    categoryColor: '#059669',
    date: '2024-02-20',
    description:
      'Extended reception time from 10pm to 1am for additional dancing and celebration.',
    createdAt: '2024-02-20T14:30:00Z',
    tags: ['reception', 'overtime'],
    isPaid: false,
    dueDate: '2024-05-15',
  },
};

export default function ExpenseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const expenseId = params?.expenseId as string;
  const { events } = useEvents();

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddPaymentSchedule, setShowAddPaymentSchedule] = useState(false);
  const [showMarkAsPaid, setShowMarkAsPaid] = useState(false);
  const [showMarkPaymentAsPaid, setShowMarkPaymentAsPaid] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Find the current event
  const currentEvent = events.find((event) => event.id === eventId);
  const expense = mockExpenseData[expenseId as keyof typeof mockExpenseData];

  // Initialize tags when expense is loaded
  React.useEffect(() => {
    if (expense?.tags) {
      setTags(expense.tags);
    }
  }, [expense]);

  if (!currentEvent || !expense) {
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Venue & Reception': '🏛️',
      'Catering & Beverages': '🍰',
      'Photography & Video': '📸',
      Attire: '👗',
      'Flowers & Decorations': '💐',
      'Music & Entertainment': '🎵',
    };
    return icons[category] || '🎉';
  };

  const getPaymentStatus = (payment: any) => {
    if (payment.isPaid) {
      return {
        icon: CheckCircleIcon,
        text: `Paid ${formatDate(payment.paidDate)}`,
        className: 'text-success-600',
        bgClassName: 'bg-success-50',
        borderClassName: 'border-success-200',
      };
    } else {
      const today = new Date();
      const dueDate = new Date(payment.dueDate);
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
          text: `Due ${formatDate(payment.dueDate)}`,
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

  // Calculate payment schedule totals
  const totalScheduled =
    'hasPaymentSchedule' in expense && expense.hasPaymentSchedule
      ? expense.paymentSchedule?.reduce(
          (sum: number, payment: any) => sum + payment.amount,
          0,
        ) || 0
      : expense.amount;

  const totalPaid =
    'hasPaymentSchedule' in expense && expense.hasPaymentSchedule
      ? expense.paymentSchedule
          ?.filter((p: any) => p.isPaid)
          .reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0
      : 'isPaid' in expense && expense.isPaid
        ? expense.amount
        : 0;

  const remainingBalance = totalScheduled - totalPaid;

  // Category ID mapping for breadcrumbs
  const categoryIdMap: Record<string, string> = {
    'Venue & Reception': '1',
    'Catering & Beverages': '2',
    'Photography & Video': '3',
    Attire: '4',
    'Flowers & Decorations': '5',
    'Music & Entertainment': '6',
  };

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: currentEvent.name,
      href: `/events/${eventId}/dashboard`,
      icon: HomeIcon,
    },
    {
      label: expense.category,
      href: `/events/${eventId}/category/${categoryIdMap[expense.category] || '1'}`,
    },
    {
      label: expense.name,
      current: true,
    },
  ];

  return (
    <DashboardLayout>
      {/* Breadcrumbs */}
      <div className='mb-3 sm:mb-4'>
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className='mb-4 sm:mb-6'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0'>
          <div className='flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0'>
            <span className='text-3xl sm:text-4xl flex-shrink-0'>
              {getCategoryIcon(expense.category)}
            </span>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-3'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight'>
                  {expense.name}
                </h1>

                {/* Action Dropdown - Inline with title on mobile */}
                <div className='relative flex-shrink-0 overflow-visible sm:hidden'>
                  <button
                    onClick={() => setShowActionDropdown(!showActionDropdown)}
                    className='btn-secondary flex items-center justify-center px-3 py-2 min-w-[44px] min-h-[44px]'
                  >
                    <EllipsisVerticalIcon className='h-5 w-5' />
                  </button>

                  {/* Dropdown Menu */}
                  {showActionDropdown && (
                    <div className='absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right'>
                      <div className='py-1'>
                        <button
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
                          onClick={() => {
                            handleDelete();
                            setShowActionDropdown(false);
                          }}
                          className='flex items-center gap-3 w-full px-4 py-4 text-base text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 min-h-[48px]'
                        >
                          <TrashIcon className='h-5 w-5 flex-shrink-0' />
                          <span>Delete Expense</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Backdrop */}
                  {showActionDropdown && (
                    <div
                      className='fixed inset-0 z-40'
                      onClick={() => setShowActionDropdown(false)}
                    />
                  )}
                </div>
              </div>
              <p className='text-sm sm:text-base text-gray-600 mt-1'>
                {expense.category} • {formatDate(expense.date)}
              </p>
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className='hidden sm:flex relative flex-shrink-0 overflow-visible'>
            <div className='flex'>
              <button
                onClick={handleEdit}
                className='btn-secondary flex items-center rounded-r-none border-r-0'
              >
                <PencilIcon className='h-4 w-4 mr-2' />
                Edit
              </button>
              <button
                onClick={() => setShowActionDropdown(!showActionDropdown)}
                className='btn-secondary px-2 rounded-l-none border-l border-gray-300 hover:border-gray-400'
              >
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${showActionDropdown ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Desktop Dropdown Menu */}
            {showActionDropdown && (
              <div className='absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 origin-top-right'>
                <div className='py-1'>
                  <button
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
              <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Expense Name
              </label>
              <p className='mt-1 text-base font-medium text-gray-900'>
                {expense.name}
              </p>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Category
              </label>
              <div className='mt-1 flex items-center'>
                <div
                  className='w-3 h-3 rounded-full mr-2'
                  style={{ backgroundColor: expense.categoryColor }}
                />
                <p className='text-base font-medium text-gray-900'>
                  {expense.category}
                </p>
              </div>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Date
              </label>
              <div className='mt-1 flex items-center'>
                <CalendarIcon className='h-4 w-4 text-gray-400 mr-2' />
                <p className='text-base text-gray-900'>
                  {formatDate(expense.date)}
                </p>
              </div>
            </div>

            <div>
              <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                Amount
              </label>
              <p className='mt-1 text-base font-semibold text-gray-900'>
                {formatCurrency(expense.amount)}
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

        {/* Tags */}
        <div className='card'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 flex items-center'>
              <TagIcon className='h-5 w-5 mr-2' />
              Tags
            </h3>
            <button
              onClick={() => setIsEditingTags(!isEditingTags)}
              className='btn-secondary text-sm px-3 py-1.5 flex items-center'
            >
              <PlusIcon className='h-4 w-4 mr-1' />
              <span className='hidden sm:inline'>
                {isEditingTags ? 'Cancel' : 'Manage Tags'}
              </span>
              <span className='sm:hidden'>
                {isEditingTags ? 'Cancel' : 'Edit'}
              </span>
            </button>
          </div>

          {/* Add Tag Input */}
          {isEditingTags && (
            <div className='mb-4'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder='Enter new tag...'
                  className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
                  maxLength={20}
                />
                <button
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim())}
                  className='btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Add
                </button>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                Press Enter to add tag, Escape to cancel
              </p>
            </div>
          )}

          {/* Tags Display */}
          {tags.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className={`inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full transition-colors duration-200 ${
                    isEditingTags ? 'pr-1.5 hover:bg-gray-200' : ''
                  }`}
                >
                  <span>{tag}</span>
                  {isEditingTags && (
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className='ml-1.5 p-0.5 hover:bg-red-100 rounded-full text-red-600 hover:text-red-700 transition-colors duration-200'
                      aria-label={`Remove ${tag} tag`}
                    >
                      <XMarkIconSolid className='h-3 w-3' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8'>
              <TagIcon className='h-12 w-12 text-gray-300 mx-auto mb-3' />
              <p className='text-gray-500 text-sm'>No tags added yet</p>
              {!isEditingTags && (
                <button
                  onClick={() => setIsEditingTags(true)}
                  className='text-primary-600 hover:text-primary-700 text-sm font-medium mt-2'
                >
                  Add your first tag
                </button>
              )}
            </div>
          )}
        </div>

        {/* Vendor Information */}
        {(expense as any).vendor && (
          <div className='card'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
              <BuildingOfficeIcon className='h-5 w-5 mr-2' />
              Vendor Information
            </h3>

            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                  Vendor Name
                </label>
                <p className='mt-1 text-base font-semibold text-gray-900'>
                  {(expense as any).vendor.name}
                </p>
              </div>

              {(expense as any).vendor.address && (
                <div>
                  <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                    Address
                  </label>
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
                  <label className='text-sm font-medium text-gray-500 uppercase tracking-wide'>
                    Website
                  </label>
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
          {'hasPaymentSchedule' in expense &&
          expense.hasPaymentSchedule &&
          expense.paymentSchedule ? (
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
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          'Are you sure you want to remove the payment schedule? This will convert the expense back to a single payment and cannot be undone.',
                        )
                      ) {
                        console.log(
                          'Remove payment schedule for expense:',
                          expense.id,
                        );
                        // In real app, this would update the expense to remove the payment schedule
                      }
                    }}
                    className='ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200'
                    title='Remove payment schedule'
                  >
                    <TrashIcon className='h-4 w-4' />
                  </button>
                </div>
                <div className='space-y-3'>
                  {expense.paymentSchedule.map((payment: any) => {
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
                                {payment.description}
                              </h5>
                              <p
                                className={`text-sm ${status.className} font-medium`}
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
          ) : 'isPaid' in expense && expense.isPaid ? (
            /* Single Payment - Completed */
            <div className='flex items-start space-x-4 p-4 bg-success-50 rounded-lg border border-success-200'>
              <CheckCircleIcon className='h-6 w-6 text-success-600 flex-shrink-0 mt-0.5' />
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='font-semibold text-success-800'>
                    Payment Completed
                  </span>
                  <span className='text-sm text-success-700 font-medium'>
                    {formatDate((expense as any).paidDate!)}
                  </span>
                </div>
                {(expense as any).paymentMethod && (
                  <p className='text-sm text-success-700'>
                    Payment method:{' '}
                    <span className='font-medium'>
                      {(expense as any).paymentMethod}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Single Payment - Pending */
            <div className='space-y-4'>
              <div className='flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <ClockIcon className='h-6 w-6 text-gray-500 flex-shrink-0 mt-0.5' />
                <div className='flex-1'>
                  <span className='font-semibold text-gray-700'>
                    Payment Pending
                  </span>
                  {(expense as any).dueDate && (
                    <div className='mt-1'>
                      <span className='text-sm text-gray-600'>
                        Due date:{' '}
                        <span className='font-medium'>
                          {formatDate((expense as any).dueDate)}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className='bg-primary-50 border border-primary-200 rounded-lg p-4'>
                <h4 className='text-sm font-medium text-primary-800 mb-3'>
                  Payment Options
                </h4>
                <div className='flex flex-col sm:flex-row gap-3'>
                  <button
                    onClick={() => setShowMarkAsPaid(true)}
                    className='btn-primary flex-1'
                  >
                    Mark as Paid
                  </button>
                  <button
                    onClick={() => setShowAddPaymentSchedule(true)}
                    className='btn-secondary flex-1 flex items-center justify-center'
                  >
                    <CalendarDaysIcon className='h-4 w-4 mr-2' />
                    Create Payment Schedule
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
              <label className='font-medium text-gray-500 uppercase tracking-wide'>
                Created
              </label>
              <p className='mt-1 text-gray-900'>
                {formatDateTime(expense.createdAt)}
              </p>
            </div>

            {(expense as any).updatedAt && (
              <div>
                <label className='font-medium text-gray-500 uppercase tracking-wide'>
                  Last Updated
                </label>
                <p className='mt-1 text-gray-900'>
                  {formatDateTime((expense as any).updatedAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MarkAsPaidModal
        isOpen={showMarkAsPaid}
        onClose={() => setShowMarkAsPaid(false)}
        expenseId={expense.id}
        expenseName={expense.name}
        expenseAmount={expense.amount}
        onMarkAsPaid={handleMarkAsPaid}
      />

      <AddPaymentScheduleModal
        isOpen={showAddPaymentSchedule}
        onClose={() => setShowAddPaymentSchedule(false)}
        expenseId={expense.id}
        expenseName={expense.name}
        totalAmount={expense.amount}
        onCreateSchedule={handleCreatePaymentSchedule}
      />

      <AddExpenseModal
        isOpen={showEditExpense}
        onClose={() => setShowEditExpense(false)}
        categories={currentEvent.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
        }))}
        editingExpense={expense}
        isEditMode={true}
        onUpdateExpense={(expenseId, expenseData) => {
          console.log('Update expense:', expenseId, expenseData);
          setShowEditExpense(false);
        }}
      />
    </DashboardLayout>
  );
}
