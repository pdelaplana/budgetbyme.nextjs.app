import type { DashboardState } from '@/hooks/dashboard/useDashboardState';

/**
 * Dashboard state utility functions for enhanced state management
 * These are optional utilities that can be used alongside the existing state hook
 */

/**
 * Checks if any modal is currently open
 * @param state - Dashboard state
 * @returns true if any modal is open
 */
export const hasOpenModal = (state: DashboardState): boolean => {
  return Object.values(state.modals).some((isOpen) => isOpen);
};

/**
 * Gets the currently open modal(s)
 * @param state - Dashboard state
 * @returns array of open modal names
 */
export const getOpenModals = (state: DashboardState): string[] => {
  return Object.entries(state.modals)
    .filter(([_, isOpen]) => isOpen)
    .map(([modalName]) => modalName);
};

/**
 * Checks if the dashboard is in editing mode (any editing state active)
 * @param state - Dashboard state
 * @returns true if any editing state is active
 */
export const isInEditingMode = (state: DashboardState): boolean => {
  const { editing } = state;
  return !!(
    editing.selectedExpense ||
    editing.editingCategory ||
    editing.isEditCategoryMode ||
    editing.isDeletingEvent
  );
};

/**
 * Gets a summary of the current dashboard UI state
 * @param state - Dashboard state
 * @returns object with UI state summary
 */
export const getDashboardUIState = (state: DashboardState) => {
  return {
    hasDropdownOpen: state.ui.dropdownOpen,
    hasOpenModal: hasOpenModal(state),
    openModals: getOpenModals(state),
    isEditing: isInEditingMode(state),
    editingType: state.editing.selectedExpense
      ? 'expense'
      : state.editing.editingCategory
        ? 'category'
        : state.editing.isDeletingEvent
          ? 'deleting-event'
          : null,
  };
};

/**
 * Type guard to check if a specific modal is open
 * @param state - Dashboard state
 * @param modalName - Name of the modal to check
 * @returns true if the specified modal is open
 */
export const isModalOpen = (
  state: DashboardState,
  modalName: keyof DashboardState['modals'],
): boolean => {
  return state.modals[modalName];
};

/**
 * Creates a selector function for dashboard state
 * @param selector - Function to extract specific state slice
 * @returns the selected state slice
 */
export const createDashboardSelector = <T>(
  selector: (state: DashboardState) => T,
) => {
  return (state: DashboardState): T => selector(state);
};

// Pre-built selectors for common use cases
export const selectUI = createDashboardSelector((state) => state.ui);
export const selectModals = createDashboardSelector((state) => state.modals);
export const selectEditing = createDashboardSelector((state) => state.editing);
