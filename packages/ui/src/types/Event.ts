/**
 * Minimal, package-local Event type shape consumed by presentational
 * components (CategorySelector, which only needs the `EventType` union).
 *
 * None of the 11 components examined for this extraction destructure
 * fields off a full `Event` object, so no `Event` interface is defined
 * here yet — only the piece actually consumed. Add fields (or a full
 * `Event` interface) when a future component needs them.
 *
 * Structurally compatible with, but not imported from, the app's
 * `EventType` in `src/types/Event.ts`.
 */
export type EventType =
  | 'wedding'
  | 'graduation'
  | 'birthday'
  | 'anniversary'
  | 'baby-shower'
  | 'retirement'
  | 'other';
