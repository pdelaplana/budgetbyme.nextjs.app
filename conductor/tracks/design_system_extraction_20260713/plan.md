# Plan: Design System Extraction

## Phase 1: Package Scaffolding

- [ ] Task: Decide and document workspace layout
    - [ ] Choose `packages/ui` (npm/pnpm workspace) vs. a decoupled `src/design-system` folder; record the decision and rationale in `tech-stack.md`.
    - [ ] Scaffold the package: `package.json` (name, peer deps on `react`/`react-dom`, own deps for `@heroicons/react`, `@headlessui/react`, `recharts`, `react-easy-crop`, `sonner`), `tsconfig.json`, `tsup.config.ts` emitting `dist/index.js` (ESM) + `dist/index.d.ts`.
    - [ ] Add a barrel `src/index.ts` (empty export list to start).
    - [ ] Wire a `build` script (`tsup`) and confirm `npm run build` in the package produces `dist/` with no errors on an empty barrel.
- [ ] Task: Conductor - User Manual Verification 'Package Scaffolding' (Protocol in workflow.md)

## Phase 2: Extract Tier 1 (zero-dependency) Components

- [ ] Task: Move `LoadingSpinner`, `Logo`, `NotFoundState`, `ErrorBoundary`, `ErrorRecoveryCard`, `IconSelector` into the package
    - [ ] Write/port unit tests for each into the package's test suite before moving (Red phase), confirm they fail against the empty barrel.
    - [ ] Move the component source, make tests pass (Green phase), export each from `src/index.ts`.
    - [ ] Update all `src/components` call sites in the app to import from the new package; delete the old files.
- [ ] Task: Move `ConfirmDialog`, `ImageCropModal`, `FileUpload` into the package
    - [ ] Same Red/Green process as above.
    - [ ] Update call sites (`modals/ConfirmDialog` usages, `modals/ImageCropModal` usages, `ui/FileUpload` usages) and delete the old files.
- [ ] Task: Conductor - User Manual Verification 'Tier 1 Extraction' (Protocol in workflow.md)

## Phase 3: Consolidate ActionDropdown

- [ ] Task: Design one shared `ActionDropdown` on HeadlessUI `Menu`
    - [ ] Write tests covering: keyboard nav (Tab/Arrow/Enter/Escape), focus trap, click-outside close, and the union of props needed by all three existing call sites (`ui/ActionDropdown.tsx`, `dashboard/DashboardHeader/ActionDropdown.tsx`, `expense/ActionDropdown.tsx`).
    - [ ] Implement the component in the package to pass those tests.
- [ ] Task: Replace all three call sites with the new shared component
    - [ ] Update `src/components/dashboard/DashboardHeader/DashboardHeader.tsx` and `src/components/expense/ExpenseHeader.tsx` (and any other consumers) to import the package's `ActionDropdown`.
    - [ ] Delete the three duplicate implementations.
    - [ ] Manually confirm no regression in dropdown behavior on Dashboard header and Expense detail page action menus.
- [ ] Task: Conductor - User Manual Verification 'ActionDropdown Consolidation' (Protocol in workflow.md)

## Phase 4: Extract Tier 2 (domain-typed) Components

- [ ] Task: Move shared pure utilities and minimal types into the package
    - [ ] Port `formatCurrency`/`formatDate`/etc. from `src/lib/formatters.ts` and `truncateForBreadcrumb`/etc. from `src/lib/textUtils.ts` into package-local `src/utils/` (keep the app's originals re-exporting from the package to avoid breaking other app code, or update all app call sites — decide and document which).
    - [ ] Port the minimal `Expense`, `Event`, `PaymentStatus` type shapes actually consumed by these components into package-local `src/types/` (type-only, no runtime coupling to `src/types/Expense.ts` etc. in the app).
- [ ] Task: Move `ExpenseListItem`, `BudgetOverviewCard`, `AttachmentCard`, `CategorySelector`
    - [ ] Red/Green test-first move per component.
    - [ ] Update call sites, delete old files.
- [ ] Task: Move chart components — `BudgetGaugeChart`, `CategoryBreakdownChart`, `PaymentTimelineChart`, `QuickStatsChart`
    - [ ] Red/Green test-first move per component (cover the `useMemo` fix noted in the SaaS review for `CategoryBreakdownChart`'s `pieData`/`totalBudget` recompute-on-hover issue as part of this move).
    - [ ] Update call sites in `dashboard/TabbedCharts.tsx` and elsewhere, delete old files.
- [ ] Task: Move `ExpenseBasicInfo`, `ExpenseHeader`, `VendorInformation`, `PaymentSummaryCard`
    - [ ] Red/Green test-first move per component (note: `ExpenseHeader` also depends on `ui/Breadcrumbs` — move that too or confirm it's already covered).
    - [ ] Update call sites in the expense detail page, delete old files.
- [ ] Task: Conductor - User Manual Verification 'Tier 2 Extraction' (Protocol in workflow.md)

## Phase 5: Close-out

- [ ] Task: Full regression pass
    - [ ] Run `npm run check` and `npm run test:run` at the repo root and inside the package; fix any fallout.
    - [ ] Manually walk Dashboard, Expense Detail, and Category pages to confirm no visual/behavioral regressions from the extraction.
- [ ] Task: Document the new package
    - [ ] Add a short `README.md` to the package listing exported components and how the app consumes them.
    - [ ] Update root `CLAUDE.md` with the new package's location and its role, per the project's stated convention of documenting architecture changes.
- [ ] Task: Conductor - User Manual Verification 'Design System Extraction Complete' (Protocol in workflow.md)
