import type { UseMutationResult } from '@tanstack/react-query';
import type { User } from 'firebase/auth';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import type {
  DashboardState,
  ExpenseDetail,
} from '@/hooks/dashboard/useDashboardState';
import type {
  RecalculateEventTotalsDto,
  RecalculationResult,
} from '@/server/actions/events/recalculateEventTotals';
import type { BudgetCategory } from '@/types/BudgetCategory';
import type { Event } from '@/types/Event';

// Type alias for compatibility
type Category = BudgetCategory;

// Modal controls return type based on actual useModalControls implementation
interface ModalControls {
  openModal: (modal: keyof DashboardState['modals']) => void;
  closeModal: (modal: keyof DashboardState['modals']) => void;
  setSelectedExpense: (expense: ExpenseDetail | null) => void;
  setEditingCategory: (
    category: BudgetCategory | null,
    isEditMode?: boolean,
  ) => void;
  resetEditingState: () => void;
  setDeletingEvent: (isDeleting: boolean) => void;
  openAddExpenseModal: () => void;
  closeAddExpenseModal: () => void;
  openExpenseDetailModal: (expense: ExpenseDetail) => void;
  closeExpenseDetailModal: () => void;
  openAddCategoryModal: () => void;
  closeAddCategoryModal: () => void;
  openEditCategoryModal: (category: BudgetCategory) => void;
  openEditEventModal: () => void;
  closeEditEventModal: () => void;
  openRecalculateModal: () => void;
  closeRecalculateModal: () => void;
  openDeleteEventModal: () => void;
  closeDeleteEventModal: () => void;
  isModalOpen: (modal: keyof DashboardState['modals']) => boolean;
  selectedExpense: ExpenseDetail | null;
  editingCategory: BudgetCategory | null;
  isEditCategoryMode: boolean;
  isDeletingEvent: boolean;
}

// Dashboard actions return type based on actual useDashboardActions implementation
interface DashboardActions {
  toggleDropdown: () => void;
  closeDropdown: () => void;
  handleDropdownAction: (actionId: string) => void;
  isDropdownOpen: boolean;
  handleCategoryClick: (categoryId: string) => void;
  navigateToEvents: () => void;
  handleExpenseEdit: (expense: ExpenseDetail) => void;
  handleExpenseDelete: (expenseId: string) => void;
}

export interface UseEventDashboardReturn {
  // Data
  user: User | null;
  eventId: string;
  currentEvent: Event | null;
  categories: Category[];
  events: Event[];

  // Loading states
  isLoading: boolean;
  isEventLoading: boolean;
  eventError: string | null;

  // State
  dashboardState: DashboardState;

  // Modal controls (actual return type from useModalControls)
  modals: ModalControls;

  // Actions (actual return type from useDashboardActions)
  actions: DashboardActions;

  // Mutations
  recalculateEventTotalsMutation: UseMutationResult<
    RecalculationResult,
    Error,
    RecalculateEventTotalsDto,
    unknown
  >;
  isRecalculatingTotals: boolean;

  // Handlers
  handleRecalculateTotals: () => Promise<void>;
  confirmDeleteEvent: () => Promise<void>;

  // Navigation
  router: AppRouterInstance;
}
