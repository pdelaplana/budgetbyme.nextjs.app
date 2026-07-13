import {
  ArrowPathIcon,
  PencilIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type React from 'react';

export interface DashboardAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DASHBOARD_ACTIONS: DashboardAction[] = [
  { id: 'edit-event', label: 'Edit Event', icon: PencilIcon },
  { id: 'delete-event', label: 'Delete Event', icon: TrashIcon },
  { id: 'add-expense', label: 'Add Expense', icon: PlusIcon },
  { id: 'add-category', label: 'New Category', icon: Squares2X2Icon },
  {
    id: 'recalculate-totals',
    label: 'Recalculate Totals',
    icon: ArrowPathIcon,
  },
  // { id: 'import-data', label: 'Import Data', icon: '📤' },
];
