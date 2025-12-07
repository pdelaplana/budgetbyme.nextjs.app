import { useRouter } from 'next/navigation';
import type { ModalControlsProps } from './useModalControls';

export interface DashboardActionsProps extends ModalControlsProps {
  eventId: string;
}

export function useDashboardActions({
  state,
  dispatch,
  eventId,
}: DashboardActionsProps) {
  const router = useRouter();

  const toggleDropdown = () => {
    dispatch({ type: 'TOGGLE_DROPDOWN' });
  };

  const closeDropdown = () => {
    dispatch({ type: 'CLOSE_DROPDOWN' });
  };

  const handleDropdownAction = (actionId: string) => {
    switch (actionId) {
      case 'edit-event':
        dispatch({ type: 'OPEN_MODAL', modal: 'editEvent' });
        break;
      case 'add-expense':
        dispatch({ type: 'OPEN_MODAL', modal: 'addExpense' });
        break;
      case 'add-payment':
        dispatch({ type: 'CLOSE_DROPDOWN' });
        console.log('Record Payment clicked');
        break;
      case 'add-category':
        dispatch({ type: 'OPEN_MODAL', modal: 'addCategory' });
        break;
      case 'recalculate-totals':
        dispatch({ type: 'OPEN_MODAL', modal: 'recalculate' });
        break;
      case 'import-data':
        dispatch({ type: 'CLOSE_DROPDOWN' });
        console.log('Import Data clicked');
        break;
      case 'delete-event':
        dispatch({ type: 'OPEN_MODAL', modal: 'deleteEventConfirm' });
        break;
      default:
        dispatch({ type: 'CLOSE_DROPDOWN' });
        console.log(`Unknown action: ${actionId}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/events/${eventId}/category/${categoryId}`);
  };

  const handleExpenseEdit = (expense: any) => {
    dispatch({ type: 'CLOSE_MODAL', modal: 'expenseDetail' });
    // Here you could open an edit modal or navigate to edit page
    console.log('Edit expense:', expense);
  };

  const handleExpenseDelete = (expenseId: string) => {
    // Here you would delete the expense from your data store
    console.log('Delete expense:', expenseId);
  };

  const navigateToEvents = () => {
    router.push('/events');
  };

  return {
    // Dropdown controls
    toggleDropdown,
    closeDropdown,
    handleDropdownAction,
    isDropdownOpen: state.ui.dropdownOpen,

    // Navigation
    handleCategoryClick,
    navigateToEvents,

    // Expense actions
    handleExpenseEdit,
    handleExpenseDelete,
  };
}
