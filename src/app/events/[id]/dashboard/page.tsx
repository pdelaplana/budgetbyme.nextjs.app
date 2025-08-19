'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExpensesList from '@/components/dashboard/ExpensesList';
import TabbedCharts from '@/components/dashboard/TabbedCharts';
import UpcomingPayments from '@/components/dashboard/UpcomingPayments';
import AddCategoryModal from '@/components/modals/AddCategoryModal';
import AddOrEditEventModal from '@/components/modals/AddOrEditEventModal';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import ExpenseDetailModal from '@/components/modals/ExpenseDetailModal';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';

// Mock payments data
const mockPayments = [
  {
    id: '1',
    name: 'Venue Balance',
    amount: 2500,
    dueDate: '2024-03-15',
    daysUntilDue: 3,
    category: 'Venue & Reception',
    priority: 'high' as const,
  },
  {
    id: '2',
    name: 'Catering Deposit',
    amount: 1800,
    dueDate: '2024-03-20',
    daysUntilDue: 8,
    category: 'Catering & Beverages',
    priority: 'medium' as const,
  },
  {
    id: '3',
    name: 'Photography Session',
    amount: 500,
    dueDate: '2024-03-25',
    daysUntilDue: 13,
    category: 'Photography & Video',
    priority: 'low' as const,
  },
];

const mockTimelineData = [
  { date: '2024-01', budgeted: 1000, actual: 800 },
  { date: '2024-02', budgeted: 2500, actual: 2200 },
  { date: '2024-03', budgeted: 4000, actual: 3800 },
  { date: '2024-04', budgeted: 6000, actual: 0 },
  { date: '2024-05', budgeted: 8000, actual: 0 },
  { date: '2024-06', budgeted: 12000, actual: 0 },
];

export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { events, isLoading, selectEventById } = useEvents();
  const { 
    event: currentEvent,
    isEventLoading,
    eventError,
    categories,
    expenses
  } = useEventDetails();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);
  const [showEditEventModal, setShowEditEventModal] = useState(false);

  // Set the selected event when events are loaded and we have an eventId
  useEffect(() => {
    if (eventId && events.length > 0 && !isLoading) {
      selectEventById(eventId);
    }
  }, [eventId, events.length, isLoading, selectEventById]);

  // Safety check - don't render if currentEvent is null
  if (!currentEvent) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading event...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const dropdownItems = [
    { id: 'edit-event', label: 'Edit Event', icon: '✏️' },
    { id: 'add-expense', label: 'Add Expense', icon: '💰' },
    { id: 'add-payment', label: 'Record Payment', icon: '💳' },
    { id: 'add-category', label: 'New Category', icon: '📊' },
    { id: 'import-data', label: 'Import Data', icon: '📤' },
  ];

  const handleDropdownAction = (actionId: string) => {
    setDropdownOpen(false);

    switch (actionId) {
      case 'edit-event':
        setShowEditEventModal(true);
        break;
      case 'add-expense':
        setShowAddExpenseModal(true);
        break;
      case 'add-payment':
        console.log('Record Payment clicked');
        break;
      case 'add-category':
        setShowAddCategoryModal(true);
        break;
      case 'import-data':
        console.log('Import Data clicked');
        break;
      default:
        console.log(`Unknown action: ${actionId}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/events/${eventId}/category/${categoryId}`);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsEditCategoryMode(true);
    setShowAddCategoryModal(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (
      confirm(
        'Are you sure you want to delete this category? This action cannot be undone.',
      )
    ) {
      console.log('Delete category:', categoryId);
      // In real app, this would call the delete API
    }
  };

  const handleUpdateCategory = (categoryId: string, categoryData: any) => {
    console.log('Update category:', categoryId, categoryData);
    // In real app, this would update the category via API
    setEditingCategory(null);
    setIsEditCategoryMode(false);
  };

  const handleAddCategory = (categoryData: any) => {
    console.log('Add new category:', categoryData);
    // In real app, this would add the category via API
  };

  const handleExpenseEdit = (expense: any) => {
    setShowExpenseDetailModal(false);
    // Here you could open an edit modal or navigate to edit page
    console.log('Edit expense:', expense);
  };

  const handleExpenseDelete = (expenseId: string) => {
    // Here you would delete the expense from your data store
    console.log('Delete expense:', expenseId);
  };

  // Show loading state while events list or individual event is being loaded
  if (isLoading || isEventLoading) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading event...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state if there's an error
  if (eventError) {
    return (
      <DashboardLayout>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Error Loading Event</h2>
            <p className='text-gray-600 mb-4'>{eventError}</p>
            <button
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
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>Event Not Found</h2>
            <p className='text-gray-600 mb-4'>The event you're looking for doesn't exist or you don't have access to it.</p>
            <button
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

  return (
    <DashboardLayout>
      {/* Dashboard Title Row - Static */}
      <div className='bg-slate-100 border-b border-gray-200 mb-4'>
        <div className='py-4'>
          <div className='flex items-start justify-between'>
            <div className='text-left'>
              <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2'>
                Dashboard
              </h1>
              <p className='text-sm sm:text-base text-gray-600'>
                Track your progress and manage your budget
              </p>
            </div>

            {/* Dropdown Menu */}
            <div className='relative'>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className='btn-primary flex items-center gap-2 px-3 sm:px-4 py-2'
              >
                <span className='hidden sm:inline'>Actions</span>
                <span className='sm:hidden'>Actions</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                  <div className='py-1'>
                    {dropdownItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleDropdownAction(item.id)}
                        className='flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200'
                      >
                        <span className='text-base'>{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropdown Backdrop */}
              {dropdownOpen && (
                <div
                  className='fixed inset-0 z-40'
                  onClick={() => setDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section - Responsive */}
      <div className='mb-6 sm:mb-8'>
        <TabbedCharts
          budgetData={{
            totalBudget: currentEvent.totalBudgetedAmount,
            totalSpent: currentEvent.totalSpentAmount,
            percentage: currentEvent.spentPercentage,
            status:
              currentEvent.status === 'completed'
                ? 'on-track'
                : currentEvent.status === 'under-budget'
                  ? 'under-budget'
                  : (currentEvent.status as any),
          }}
          timelineData={mockTimelineData}
          categoryData={categories}
          quickStatsData={{
            totalBudget: currentEvent.totalBudgetedAmount,
            totalSpent: currentEvent.totalSpentAmount,
            categories: categories.length,
            paymentsDue: mockPayments.length,
            eventDate: currentEvent.eventDate,
          }}
        />
      </div>

      {/* Upcoming Payments Widget - Compact */}
      <div className='mb-4 sm:mb-6'>
        <div className='card'>
          <div className='border-b border-gray-200 pb-3 mb-4'>
            <h2 className='text-base sm:text-lg font-semibold text-gray-900'>
              Due Soon ({mockPayments.length})
            </h2>
          </div>
          <UpcomingPayments payments={mockPayments} />
        </div>
      </div>

      {/* Budget Categories List */}
      <div className='card'>
        <div className='card-header'>
          <h2 className='text-heading font-semibold text-gray-900'>
            Budget Categories
          </h2>
        </div>
        
        {/* Empty state for categories */}
        <div className='p-6 text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4'>
            <svg className='h-6 w-6 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Budget Categories Yet
          </h3>
          <p className='text-gray-600 mb-6 max-w-md mx-auto'>
            Start organizing your event budget by creating categories like "Venue", "Catering", "Photography", etc. This will help you track expenses more effectively.
          </p>
          <div className='space-y-3'>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200'
            >
              <svg className='h-4 w-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
              </svg>
              Create Your First Category
            </button>
            <div className='text-xs text-gray-500'>
              Popular categories: Venue • Catering • Photography • Flowers • Music
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        categories={categories}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        isOpen={showExpenseDetailModal}
        onClose={() => {
          setShowExpenseDetailModal(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onEdit={handleExpenseEdit}
        onDelete={handleExpenseDelete}
      />

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setEditingCategory(null);
          setIsEditCategoryMode(false);
        }}
        editingCategory={editingCategory}
        isEditMode={isEditCategoryMode}
        onUpdateCategory={handleUpdateCategory}
        onAddCategory={handleAddCategory}
      />

      {/* Edit Event Modal */}
      <AddOrEditEventModal
        isOpen={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        editingEvent={currentEvent}
        isEditMode={true}
      />
    </DashboardLayout>
  );
}
