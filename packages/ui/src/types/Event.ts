/**
 * Minimal, package-local Event type shape consumed by presentational
 * components (CategorySelector, which only needs the `EventType` union;
 * ExpenseHeader, which only needs the `name` field off a full event).
 *
 * Structurally compatible with, but not imported from, the app's
 * `Event`/`EventType` in `src/types/Event.ts`.
 */
export type EventType =
  | 'wedding'
  | 'graduation'
  | 'birthday'
  | 'anniversary'
  | 'baby-shower'
  | 'retirement'
  | 'other';

export interface Event {
  name: string;
}
