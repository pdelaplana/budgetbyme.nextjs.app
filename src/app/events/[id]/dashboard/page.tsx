'use client';

import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ExpensesList from '@/components/dashboard/ExpensesList';
import TabbedCharts from '@/components/dashboard/TabbedCharts';
import UpcomingPayments from '@/components/dashboard/UpcomingPayments';
import AddCategoryModal from '@/components/modals/AddCategoryModal';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import ExpenseDetailModal from '@/components/modals/ExpenseDetailModal';
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
  const { events } = useEvents();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showExpenseDetailModal, setShowExpenseDetailModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isEditCategoryMode, setIsEditCategoryMode] = useState(false);

  // Find the current event
  const currentEvent = events.find((event) => event.id === eventId);

  const dropdownItems = [
    { id: 'add-expense', label: 'Add Expense', icon: '💰' },
    { id: 'add-payment', label: 'Record Payment', icon: '💳' },
    { id: 'add-category', label: 'New Category', icon: '📊' },
    { id: 'import-data', label: 'Import Data', icon: '📤' },
  ];

  const handleDropdownAction = (actionId: string) => {
    setDropdownOpen(false);

    switch (actionId) {
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

  // Show loading state if event not found
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
                <span className='hidden sm:inline'>Add Expense</span>
                <span className='sm:hidden'>Add</span>
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
            totalBudget: currentEvent.totalBudget,
            totalSpent: currentEvent.totalSpent,
            percentage: currentEvent.spentPercentage,
            status:
              currentEvent.status === 'completed'
                ? 'on-track'
                : currentEvent.status === 'under-budget'
                  ? 'under-budget'
                  : (currentEvent.status as any),
          }}
          timelineData={mockTimelineData}
          categoryData={currentEvent.categories}
          quickStatsData={{
            totalBudget: currentEvent.totalBudget,
            totalSpent: currentEvent.totalSpent,
            categories: currentEvent.categories.length,
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
        <ExpensesList
          categories={currentEvent.categories}
          onCategoryClick={handleCategoryClick}
        />
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        categories={currentEvent.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          color: cat.color,
        }))}
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
    </DashboardLayout>
  );
}
