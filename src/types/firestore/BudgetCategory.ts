import type { Timestamp } from 'firebase/firestore';
import type { BudgetCategory } from '../BudgetCategory';

export interface BudgetCategoryDocument {
  name: string;
  description: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
  _createdDate: Timestamp;
  _createdBy: string;
  _updatedDate: Timestamp;
  _updatedBy: string;
}

export interface CreateBudgetCategoryData {
  name: string;
  description: string;
  budgetedAmount: number;
  color: string;
  icon: string;
}

export interface UpdateBudgetCategoryData {
  name?: string;
  description?: string;
  budgetedAmount?: number;
  color?: string;
  icon?: string;
}

export { type BudgetCategory };