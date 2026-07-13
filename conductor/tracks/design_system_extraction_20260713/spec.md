# Specification: Design System Extraction

## Problem Statement
BudgetByMe has no standalone, syncable design system — `src/components` is a flat mix of pure presentational pieces and app-coupled containers (Firebase Auth, TanStack Query, `next/navigation`, `@/contexts`). This blocks two things:
1. **Tooling** (e.g. claude.ai/design's design-sync) needs a package with a real build entry (`dist/` + `.d.ts`) and components that render standalone — neither exists today (`package.json` is `"private": true` with no `main`/`module`/`exports`, and `build` runs `next build`, not a library build).
2. **Reuse/maintainability** — a code review of this repo (see `docs/saas-review-2026-07-12.md`) found three separate, duplicated `ActionDropdown` implementations (`src/components/ui/ActionDropdown.tsx`, `src/components/dashboard/DashboardHeader/ActionDropdown.tsx`, `src/components/expense/ActionDropdown.tsx`) with no shared source and no accessibility (no focus trap, arrow-key nav, or Escape handling), plus god-component modals and inconsistent formatting-convention usage.

An audit of `src/components` (78 files) found 49 components with no import of Firebase/TanStack Query/`next/navigation`/`@/contexts`/`@/hooks`/`@/server` — i.e. already presentational or only typed against domain shapes via `type`-only imports. These are extraction candidates.

## Goals
1. Scaffold a standalone, independently buildable UI package (own `package.json`, build via `tsup` emitting `dist/` + `.d.ts`) decoupled from Firebase/TanStack Query/routing.
2. Extract the **Tier 1** zero-dependency presentational components as-is: `LoadingSpinner`, `Logo`, `NotFoundState`, `ErrorBoundary`, `ErrorRecoveryCard`, `IconSelector`, `ConfirmDialog`, `ImageCropModal`, `FileUpload`.
3. Consolidate the three duplicate `ActionDropdown` implementations into one shared, HeadlessUI-`Menu`-based component with proper keyboard/focus/Escape handling, and update all three call sites to use it.
4. Extract the **Tier 2** components that are presentational but typed against domain shapes (`Expense`, `Event`, `PaymentStatus`) — `ExpenseListItem`, `BudgetOverviewCard`, `AttachmentCard`, `CategorySelector`, `BudgetGaugeChart`, `CategoryBreakdownChart`, `PaymentTimelineChart`, `QuickStatsChart`, `ExpenseBasicInfo`, `ExpenseHeader`, `VendorInformation`, `PaymentSummaryCard` — bringing the pure `formatters.ts`/`textUtils.ts` utilities and the minimal type definitions they depend on along as package-local modules (not a rewrite — move already-pure code).
5. Update every app call site to import from the new package instead of `src/components`, with no behavior change.
6. Leave every app-coupled component (modals with mutations, layouts, auth, dashboard containers — the other 29 files) in place in `src/components`; this track does not touch them.

## Non-Goals
- No visual/behavioral redesign of any component — this is an extraction, not a restyle.
- No Storybook or claude.ai/design sync in this track — those are natural follow-ups once the package exists, tracked separately.
- No changes to Firestore/Storage security rules or other findings from `docs/saas-review-2026-07-12.md` — those belong to `security_hardening_20260713` and future tracks.

## Tech Stack
- New package: TypeScript + `tsup` (build), React 19 peer dependency, Tailwind CSS (consumer-provided, not bundled), `@heroicons/react`, `@headlessui/react`, `recharts`, `react-easy-crop`, `sonner` — all already used by the app, moved to the package's own `package.json` as peer/direct deps as appropriate.
- Existing app continues on Next.js 15.4 / React 19; consumes the new package via a workspace reference (npm/pnpm workspaces) or relative path if a full workspace isn't set up in this track.
- Vitest + Testing Library for the package's own unit tests (matches the app's existing test stack).
