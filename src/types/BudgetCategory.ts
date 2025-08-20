import type { Entity } from './Entity';

export interface BudgetCategory extends Entity {
  name: string;
  description: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
  icon: string;
}
