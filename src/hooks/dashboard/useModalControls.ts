import type { BudgetCategory } from '@/types/BudgetCategory';
import type {
  DashboardAction,
  DashboardState,
  ExpenseDetail,
} from './useDashboardState';

export interface ModalControlsProps {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}

export function useModalControls({ state, dispatch }: ModalControlsProps) {
  const openModal = (modal: keyof DashboardState['modals']) => {
    dispatch({ type: 'OPEN_MODAL', modal });
  };

  const closeModal = (modal: keyof DashboardState['modals']) => {
    dispatch({ type: 'CLOSE_MODAL', modal });
  };

  const setSelectedExpense = (expense: ExpenseDetail | null) => {
    dispatch({ type: 'SET_SELECTED_EXPENSE', expense });
  };

  const setEditingCategory = (
    category: BudgetCategory | null,
    isEditMode = false,
  ) => {
    dispatch({ type: 'SET_EDITING_CATEGORY', category, isEditMode });
  };

  const resetEditingState = () => {
    dispatch({ type: 'RESET_EDITING_STATE' });
  };

  const setDeletingEvent = (isDeleting: boolean) => {
    dispatch({ type: 'SET_DELETING_EVENT', isDeleting });
  };

  // Convenience methods for specific modals
  const openAddExpenseModal = () => openModal('addExpense');
  const closeAddExpenseModal = () => closeModal('addExpense');

  const openExpenseDetailModal = (expense: ExpenseDetail) => {
    setSelectedExpense(expense);
    openModal('expenseDetail');
  };
  const closeExpenseDetailModal = () => {
    closeModal('expenseDetail');
    setSelectedExpense(null);
  };

  const openAddCategoryModal = () => openModal('addCategory');
  const closeAddCategoryModal = () => {
    closeModal('addCategory');
    setEditingCategory(null, false);
  };

  const openEditCategoryModal = (category: BudgetCategory) => {
    setEditingCategory(category, true);
    openModal('addCategory');
  };

  const openEditEventModal = () => openModal('editEvent');
  const closeEditEventModal = () => closeModal('editEvent');

  const openRecalculateModal = () => openModal('recalculate');
  const closeRecalculateModal = () => closeModal('recalculate');

  const openDeleteEventModal = () => openModal('deleteEventConfirm');
  const closeDeleteEventModal = () => closeModal('deleteEventConfirm');

  return {
    // Generic modal controls
    openModal,
    closeModal,
    setSelectedExpense,
    setEditingCategory,
    resetEditingState,
    setDeletingEvent,

    // Specific modal controls
    openAddExpenseModal,
    closeAddExpenseModal,
    openExpenseDetailModal,
    closeExpenseDetailModal,
    openAddCategoryModal,
    closeAddCategoryModal,
    openEditCategoryModal,
    openEditEventModal,
    closeEditEventModal,
    openRecalculateModal,
    closeRecalculateModal,
    openDeleteEventModal,
    closeDeleteEventModal,

    // State access
    isModalOpen: (modal: keyof DashboardState['modals']) => state.modals[modal],
    selectedExpense: state.editing.selectedExpense,
    editingCategory: state.editing.editingCategory,
    isEditCategoryMode: state.editing.isEditCategoryMode,
    isDeletingEvent: state.editing.isDeletingEvent,
  };
}
