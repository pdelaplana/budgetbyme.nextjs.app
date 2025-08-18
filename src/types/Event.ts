// Remove Currency class import to avoid serialization issues
import type { Currency } from './currencies';
import type { Entity } from './Entity';

export type EventType =
  | 'wedding'
  | 'graduation'
  | 'birthday'
  | 'anniversary'
  | 'baby-shower'
  | 'retirement'
  | 'other';

export type EventStatus =
  | 'on-track'
  | 'over-budget'
  | 'under-budget'
  | 'completed';

export interface Event extends Entity {
  id: string;
  name: string;
  type: EventType;
  description?: string;
  eventDate: Date;
  totalBudgetedAmount: number;
  totalSpentAmount: number;
  spentPercentage: number;
  status: EventStatus;
  currency: Currency;
}
