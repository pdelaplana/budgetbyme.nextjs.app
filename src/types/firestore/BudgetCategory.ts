import type { Timestamp } from 'firebase/firestore';

// Base entity for all Firestore documents
export interface FirestoreEntity {
  id: string;
  createdAt: Timestamp;
  createdBy: string;
  updatedAt: Timestamp;
}

// Raw document data as stored in Firestore
export interface BudgetCategoryDocument extends FirestoreEntity {
  name: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
  eventId: string; // Reference to parent event
}

// Client-side model with converted dates
export interface BudgetCategory {
  id: string;
  name: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
  eventId: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;

  // Computed properties
  remainingAmount: number;
  spentPercentage: number;
  isOverBudget: boolean;
}

// Data for creating new documents (no timestamps/id)
export interface CreateBudgetCategoryData {
  name: string;
  budgetedAmount: number;
  spentAmount?: number;
  color: string;
  eventId: string;
}

// Data for updating documents (partial, no system fields)
export interface UpdateBudgetCategoryData {
  name?: string;
  budgetedAmount?: number;
  spentAmount?: number;
  color?: string;
}

// Collection path helper
export const BUDGET_CATEGORIES_COLLECTION = 'budgetCategories';
export const getBudgetCategoryPath = (eventId: string) =>
  `events/${eventId}/budgetCategories`;
