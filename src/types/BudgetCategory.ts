import type { Entity } from './Entity';

export interface BudgetCategory extends Entity {
  name: string;
  description: string;
  budgetedAmount: number;
  scheduledAmount: number; // Total amount of all expenses in this category (regardless of payment status)
  spentAmount: number; // Total amount actually paid for expenses in this category
  color: string;
  icon: string;
  // Computed properties
  spentPercentage: number;
  remainingAmount: number;
  isOverBudget: boolean;
}
