# @budgetbyme/ui

A standalone presentational UI component library extracted from the BudgetByMe application. Built with TypeScript, React 19, and styled with Tailwind CSS. This package contains reusable components for budgeting, expense tracking, charts, and forms.

## Installation & Usage

This package is consumed by the BudgetByMe app as an npm workspace dependency. To use components:

```typescript
import { ActionDropdown, ExpenseListItem, BudgetGaugeChart } from '@budgetbyme/ui';
```

See `tech-stack.md` for architectural decisions and build details.

## Exported Components

### Base UI Components
- **ActionDropdown** — Unified dropdown menu (HeadlessUI-based, replaces legacy duplicates)
- **Logo** — Application logo component
- **LoadingSpinner** — Loading indicator
- **Breadcrumbs** — Navigation breadcrumbs with callback routing
- **ExpenseHeader** — Expense page header with integrated breadcrumbs

### Chart Components
- **BudgetGaugeChart** — Budget vs actual gauge visualization
- **CategoryBreakdownChart** — Expense breakdown by category (pie chart)
- **PaymentTimelineChart** — Payment forecast line chart
- **QuickStatsChart** — Summary statistics dashboard

### Expense & Data Display
- **ExpenseBasicInfo** — Basic expense details (name, dates, amounts)
- **ExpenseListItem** — Expense row for lists
- **AttachmentCard** — Document/receipt display
- **BudgetOverviewCard** — Budget summary with helper function `createBudgetData`
- **PaymentSummaryCard** — Payment totals and status
- **VendorInformation** — Vendor details display
- **ErrorRecoveryCard** — Error state with recovery UI (includes `CategoryErrorRecovery` variant)

### Forms & Input
- **CategorySelector** — Category picker dropdown
- **IconSelector** — Icon selection component
- **FileUpload** — File upload handler
- **ImageCropModal** — Image cropping tool

### Dialogs & Error Handling
- **ConfirmDialog** — Confirmation modal for destructive actions
- **ErrorBoundary** — React error boundary component
- **NotFoundState** — 404/empty state display

### Utilities & Types

**Formatters** (from `utils/formatters`):
- `formatCurrency(amount)` — Format as currency (e.g., "$1,234")
- `formatCurrencyWithCents(amount)` — Format with decimals (e.g., "$1,234.56")
- `sanitizeCurrencyInput(value)` — Clean user input
- `formatDate(date)` — Short date format (e.g., "Mar 15, 2024")
- `formatDateLong(date)` — Long format (e.g., "Friday, March 15, 2024")
- `formatDateTime(date)` — Date with time
- `formatPercentage(value)` — Percentage format (e.g., "45%")

**Text Utilities** (from `utils/textUtils`):
- `truncateText(text, options?)` — Core truncation with word boundary preservation
- `truncateForMobile(text, maxLength?)` — Mobile-optimized truncation
- `truncateForBreadcrumb(text, maxLength?)` — Breadcrumb-optimized truncation

**Domain Types** (package-local, type-only):
- `Event`, `EventType`
- `Expense`, `ExpenseCategory`, `ExpenseVendor`, `ExpensePaymentScheduleItem`
- `PaymentStatus`

## Notable API Decisions

### Routing Callback Pattern
`Breadcrumbs` and `ExpenseHeader` require an `onNavigate: (href: string) => void` prop instead of performing routing internally. This keeps components framework-agnostic and lets consumers wire up their own router (Next.js `useRouter`, etc.).

```typescript
<Breadcrumbs items={[...]} onNavigate={(href) => router.push(href)} />
<ExpenseHeader onNavigate={handleNavigation} />
```

## Peer Dependencies

This package requires a consuming app to provide:
- **react** ^19.1.1
- **react-dom** ^19.1.1

## Styling

Components use **Tailwind CSS utility classes** for styling. The consumer's Tailwind CSS setup must be active for styling to apply. Tailwind is not bundled into the package—configure it in your consuming application.

## Bundled Dependencies

The following packages are bundled (not peer dependencies):
- `@headlessui/react` — Unstyled accessible components
- `@heroicons/react` — Icon library
- `recharts` — Chart library
- `react-easy-crop` — Image cropping
- `sonner` — Toast notifications

For architecture rationale and build details, see `tech-stack.md`.
