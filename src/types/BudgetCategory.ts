import type { Entity } from './Entityntity';

export interface BudgetCategory extends Entity {
  name: string;
  budgettedAmount: number;
  spentAmount: number;
  color: string;
}
