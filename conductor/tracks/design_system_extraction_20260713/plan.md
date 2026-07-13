# Plan: Design System Extraction

## Phase 1: Package Scaffolding

### Task 1: Decide and document workspace layout, scaffold package, prove app-consumption
- Use `packages/ui` (npm workspace) as a full standalone package: `package.json` (name, peer deps on `react`/`react-dom`, own deps for `@heroicons/react`, `@headlessui/react`, `recharts`, `react-easy-crop`, `sonner`), `tsconfig.json`, `tsup.config.ts` emitting `dist/index.js` (ESM) + `dist/index.d.ts`. Record the decision and rationale in a `tech-stack.md` file in the package.
- Add a barrel `src/index.ts`.
- Wire a `build` script (`tsup`) and confirm `npm run build` in the package produces `dist/` with no errors on an empty barrel.
- Wire the app to consume the package as a workspace dependency (npm workspaces: add `packages/*` to root `package.json` `workspaces`, add `"@budgetbyme/ui": "*"` — or whatever the package is named — as an app dependency).
- **Walking skeleton (do this before moving on to Phase 2):** move exactly one real component, `LoadingSpinner`, into the package end-to-end: write/port its test into the package, make it pass, export it from `src/index.ts`, build the package, update the one app call site that currently imports `src/components/.../LoadingSpinner` to import it from the new package instead, delete the old file, and confirm `npm run dev` in the app renders a page using it with no build/HMR errors. This proves the Next.js 15 + Turbopack app can actually consume a tsup-built workspace package before any batch extraction happens — if this step fails or surfaces integration problems, stop and report back (status BLOCKED with details) rather than proceeding to Task 3.

### Task 2: Conductor - User Manual Verification 'Package Scaffolding' (Protocol in workflow.md)
- Deferred to the end: browser walkthrough confirming `LoadingSpinner` renders correctly wherever it's used in the app. No implementer/reviewer dispatch for this task — it is a human checkpoint batched with Tasks 5, 8, 13, 16 at the end of the run.

## Phase 2: Extract Tier 1 (zero-dependency) Components

### Task 3: Move `Logo`, `NotFoundState`, `ErrorBoundary`, `ErrorRecoveryCard`, `IconSelector` into the package
- Write/port unit tests for each into the package's test suite before moving (Red phase), confirm they fail against the current barrel.
- Move the component source, make tests pass (Green phase), export each from `src/index.ts`.
- Update all `src/components` call sites in the app to import from the new package; delete the old files.
- `LoadingSpinner` was already moved in Task 1 as the walking skeleton — do not redo it here.

### Task 4: Move `ConfirmDialog`, `ImageCropModal`, `FileUpload` into the package
- Same Red/Green process as above.
- Update call sites (`modals/ConfirmDialog` usages, `modals/ImageCropModal` usages, `ui/FileUpload` usages) and delete the old files.

### Task 5: Conductor - User Manual Verification 'Tier 1 Extraction' (Protocol in workflow.md)
- Deferred to the end (human checkpoint, no dispatch).

## Phase 3: Consolidate ActionDropdown

### Task 6: Design one shared `ActionDropdown` on HeadlessUI `Menu`
- Write tests covering: keyboard nav (Tab/Arrow/Enter/Escape), focus trap, click-outside close, and the union of props needed by all three existing call sites (`ui/ActionDropdown.tsx`, `dashboard/DashboardHeader/ActionDropdown.tsx`, `expense/ActionDropdown.tsx`).
- Implement the component in the package to pass those tests.

### Task 7: Replace all three call sites with the new shared component
- Update `src/components/dashboard/DashboardHeader/DashboardHeader.tsx` and `src/components/expense/ExpenseHeader.tsx` (and any other consumers) to import the package's `ActionDropdown`.
- Delete the three duplicate implementations.
- Automated tests must pass now; manual browser confirmation of no dropdown regression is deferred to the end.

### Task 8: Conductor - User Manual Verification 'ActionDropdown Consolidation' (Protocol in workflow.md)
- Deferred to the end (human checkpoint, no dispatch).

## Phase 4: Extract Tier 2 (domain-typed) Components

### Task 9: Move shared pure utilities and minimal types into the package
- Port `formatCurrency`/`formatDate`/etc. from `src/lib/formatters.ts` and `truncateForBreadcrumb`/etc. from `src/lib/textUtils.ts` into package-local `src/utils/` (keep the app's originals re-exporting from the package to avoid breaking other app code, or update all app call sites — decide and document which, in the package's `tech-stack.md`).
- Port the minimal `Expense`, `Event`, `PaymentStatus` type shapes actually consumed by these components into package-local `src/types/` (type-only, no runtime coupling to `src/types/Expense.ts` etc. in the app).

### Task 10: Move `ExpenseListItem`, `BudgetOverviewCard`, `AttachmentCard`, `CategorySelector`
- Red/Green test-first move per component.
- Update call sites, delete old files.

### Task 11: Move chart components — `BudgetGaugeChart`, `CategoryBreakdownChart`, `PaymentTimelineChart`, `QuickStatsChart`
- Red/Green test-first move per component (cover the `useMemo` fix noted in the SaaS review for `CategoryBreakdownChart`'s `pieData`/`totalBudget` recompute-on-hover issue as part of this move).
- Update call sites in `dashboard/TabbedCharts.tsx` and elsewhere, delete old files.

### Task 12: Move `ExpenseBasicInfo`, `ExpenseHeader`, `VendorInformation`, `PaymentSummaryCard`
- Red/Green test-first move per component (note: `ExpenseHeader` also depends on `ui/Breadcrumbs` — move that too or confirm it's already covered).
- Update call sites in the expense detail page, delete old files.

### Task 13: Conductor - User Manual Verification 'Tier 2 Extraction' (Protocol in workflow.md)
- Deferred to the end (human checkpoint, no dispatch).

## Phase 5: Close-out

### Task 14: Full regression pass
- Run `npm run check` and `npm run test:run` (or `npm test`) at the repo root and inside the package; fix any fallout.
- Manual page walkthroughs are deferred to the end, batched with the other Conductor verification gates (Tasks 2, 5, 8, 13, 16).

### Task 15: Document the new package
- Add a short `README.md` to the package listing exported components and how the app consumes them.
- Update root `CLAUDE.md` with the new package's location and its role, per the project's stated convention of documenting architecture changes.

### Task 16: Conductor - User Manual Verification 'Design System Extraction Complete' (Protocol in workflow.md)
- Deferred to the end: walk Dashboard, Expense Detail, and Category pages to confirm no visual/behavioral regressions from the extraction, alongside the deferred gates from Tasks 2, 5, 8, and 13.
