import type { Entity } from './entity';

export interface BudgetCategory extends Entity {
  name: string;
  budgetedAmount: number;
  spentAmount: number;
  color: string;
}
