export interface DashboardAction {
  id: string;
  label: string;
  icon: string;
}

export const DASHBOARD_ACTIONS: DashboardAction[] = [
  { id: 'edit-event', label: 'Edit Event', icon: '✏️' },
  { id: 'delete-event', label: 'Delete Event', icon: '🗑️' },
  { id: 'add-expense', label: 'Add Expense', icon: '💰' },
  { id: 'add-category', label: 'New Category', icon: '📊' },
  { id: 'recalculate-totals', label: 'Recalculate Totals', icon: '🔄' },
  // { id: 'import-data', label: 'Import Data', icon: '📤' },
];
