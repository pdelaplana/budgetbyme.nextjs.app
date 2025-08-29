'use client';

import AddOrEditCategoryModal from '@/components/modals/AddOrEditCategoryModal';
import AddOrEditEventModal from '@/components/modals/AddOrEditEventModal';
import AddOrEditExpenseModal from '@/components/modals/AddOrEditExpenseModal';
import ConfirmDialog from '@/components/modals/ConfirmDialog';
import ConfirmRecalculateModal from '@/components/modals/ConfirmRecalculateModal';
import ExpenseDetailModal from '@/components/modals/ExpenseDetailModal';
import type { useEventDashboard } from '@/hooks/dashboard';

export interface ModalManagerProps {
  // Event data
  currentEvent: NonNullable<
    ReturnType<typeof useEventDashboard>['currentEvent']
  >;
  categories: ReturnType<typeof useEventDashboard>['categories'];

  // From useEventDashboard hook
  modals: ReturnType<typeof useEventDashboard>['modals'];
  actions: ReturnType<typeof useEventDashboard>['actions'];
  isRecalculatingTotals: ReturnType<
    typeof useEventDashboard
  >['isRecalculatingTotals'];
  handleRecalculateTotals: ReturnType<
    typeof useEventDashboard
  >['handleRecalculateTotals'];
  confirmDeleteEvent: ReturnType<
    typeof useEventDashboard
  >['confirmDeleteEvent'];
}

export default function ModalManager({
  currentEvent,
  categories,
  modals,
  actions,
  isRecalculatingTotals,
  handleRecalculateTotals,
  confirmDeleteEvent,
}: ModalManagerProps) {
  return (
    <>
      {/* Add Expense Modal */}
      <AddOrEditExpenseModal
        isOpen={modals.isModalOpen('addExpense')}
        onClose={modals.closeAddExpenseModal}
        categories={categories}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        isOpen={modals.isModalOpen('expenseDetail')}
        onClose={modals.closeExpenseDetailModal}
        expense={modals.selectedExpense}
        onEdit={actions.handleExpenseEdit}
        onDelete={actions.handleExpenseDelete}
      />

      {/* Add/Edit Category Modal */}
      <AddOrEditCategoryModal
        isOpen={modals.isModalOpen('addCategory')}
        onClose={modals.closeAddCategoryModal}
        editingCategory={modals.editingCategory}
        isEditMode={modals.isEditCategoryMode}
      />

      {/* Edit Event Modal */}
      <AddOrEditEventModal
        isOpen={modals.isModalOpen('editEvent')}
        onClose={modals.closeEditEventModal}
        editingEvent={currentEvent}
        isEditMode={true}
      />

      {/* Confirm Recalculate Modal */}
      <ConfirmRecalculateModal
        isOpen={modals.isModalOpen('recalculate')}
        onClose={modals.closeRecalculateModal}
        onConfirm={handleRecalculateTotals}
        isLoading={isRecalculatingTotals}
      />

      {/* Delete Event Confirmation Modal */}
      <ConfirmDialog
        isOpen={modals.isModalOpen('deleteEventConfirm')}
        onClose={modals.closeDeleteEventModal}
        onConfirm={confirmDeleteEvent}
        title='Delete Event'
        message={`Are you sure you want to delete "${currentEvent?.name}"? This action cannot be undone. All expenses, categories, payments, and associated data will be permanently removed.`}
        confirmText='Delete Event'
        cancelText='Keep Event'
        type='danger'
        isLoading={modals.isDeletingEvent}
      />
    </>
  );
}
