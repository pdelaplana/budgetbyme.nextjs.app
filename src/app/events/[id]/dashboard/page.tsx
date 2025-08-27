'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import NotFoundState from '@/components/ui/NotFoundState';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import PaymentsSection from '@/components/dashboard/PaymentsSection';
import BudgetCategoriesSection from '@/components/dashboard/BudgetCategoriesSection';
import AddOrEditCategoryModal from '@/components/modals/AddOrEditCategoryModal';
import AddOrEditEventModal from '@/components/modals/AddOrEditEventModal';
import AddOrEditExpenseModal from '@/components/modals/AddOrEditExpenseModal';
import ExpenseDetailModal from '@/components/modals/ExpenseDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useEventDetails } from '@/contexts/EventDetailsContext';
import { useEvents } from '@/contexts/EventsContext';
import { useRecalculateEventTotalsMutation } from '@/hooks/events/useRecalculateEventTotalsMutation';



export default function EventDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const { user } = useAuth();
  const { events, isLoading, selectEventById } = useEvents();
  const { 
    event: currentEvent,
    isEventLoading,
    eventError,
    categories,
    expenses
  } = useEventDetails();

  // Recalculate totals mutation
  const recalculateEventTotalsMutation = useRecalculateEventTotalsMutation({
    onSuccess: () => {
      toast.success('Event totals recalculated successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to recalculate event totals');
    },
  });

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
        <LoadingSpinner 
          title="Loading Event..."
          message="Please wait while we load your event data"
        />
      </DashboardLayout>
    );
  }

  const dropdownItems = [
    { id: 'edit-event', label: 'Edit Event', icon: '✏️' },
    { id: 'add-expense', label: 'Add Expense', icon: '💰' },
    { id: 'add-payment', label: 'Record Payment', icon: '💳' },
    { id: 'add-category', label: 'New Category', icon: '📊' },
    { id: 'recalculate-totals', label: 'Recalculate Totals', icon: '🔄' },
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
      case 'recalculate-totals':
        handleRecalculateTotals();
        break;
      case 'import-data':
        console.log('Import Data clicked');
        break;
      default:
        console.log(`Unknown action: ${actionId}`);
    }
  };

  const handleRecalculateTotals = async () => {
    if (!user?.uid || !eventId) {
      toast.error('Unable to recalculate totals: missing user or event information');
      return;
    }

    try {
      await recalculateEventTotalsMutation.mutateAsync({
        userId: user.uid,
        eventId: eventId,
      });
    } catch (error) {
      // Error is already handled by the mutation's onError callback
      console.error('Recalculate totals error:', error);
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
        <LoadingSpinner 
          title="Loading Event..."
          message="Please wait while we load your event data"
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
        <NotFoundState
          title="Event Not Found"
          message="The event you're looking for doesn't exist or you don't have access to it."
          buttonText="Back to Events"
          onButtonClick={() => router.push('/events')}
          icon="📅"
          className="flex items-center justify-center"
        />
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
      <BudgetOverview event={currentEvent} categories={categories} />

      {/* Upcoming Payments Widget - Compact */}
      <PaymentsSection onGetStarted={() => setShowAddCategoryModal(true)} />

      {/* Budget Categories List */}
      <BudgetCategoriesSection 
        categories={categories}
        onCategoryClick={handleCategoryClick}
        onCreateFirstCategory={() => setShowAddCategoryModal(true)}
      />

      {/* Add Expense Modal */}
      <AddOrEditExpenseModal
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
      <AddOrEditCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setEditingCategory(null);
          setIsEditCategoryMode(false);
        }}
        editingCategory={editingCategory}
        isEditMode={isEditCategoryMode}
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
