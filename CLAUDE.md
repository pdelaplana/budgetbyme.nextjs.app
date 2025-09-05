# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Remember to consult and update this file whenever you are asked to plan/implement a feature, debug an error, or add or upgrade a library

## Project Overview

BudgetByMe is a budgeting and expense tracking web application for life's major events (weddings, graduations, honeymoons, celebrations). Users can create events, set up budgets with expenses, track payments, and monitor spending through dashboards and charts.

## Tech Stack

- **Frontend**: Next.js 15.4.6 with React 19.1.1
- **Build Tool**: Turbopack (stable, enabled in development)
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Backend Jobs**: Firebase Cloud Functions
- **Logging and Monitoring**: Sentry
- **Deployment**: (TBD - likely Vercel for Next.js)

## Architecture

### Core Data Models
- **Users**: Firebase Auth users with profile data in Firestore
- **Worskpacaes**: Top-level containers for our events 
- **Events**: Events (name, description, dates)
- **Expenses**: Budgeted items with categories, vendor info, documents
- **Payment Schedules**: Optional payment plans for expenses
- **Payments**: Actual payments made against expenses or schedules
- **Categories**: Budget categorization system

### Key Features
- Authentication flow (sign up/sign in required)
- Event creation and management
- Expense budgeting with categories and tags
- Payment scheduling (ASAP, On The Day, specific dates)
- Payment tracking with receipts
- Unplanned expense handling
- Dashboard with multiple chart views
- Data export (background jobs)
- Account deletion

### Firebase Security Rules
Implement Firestore rules ensuring users can only access their own events and related data.

## Development Commands

- `npm run dev` - Development server with Turbopack (fast builds)
- `npm run build` - Production build
- `npm run start` - Production server
- `npm run lint` - ESLint
- `npm run check` - Biome linter check
- `npm run biome:fix` - Biome auto-fix issues
- `npm run format` - Biome format code
- `npm test` - Run Vitest tests
- `npm test formatters` - Run specific formatter tests
- `npm test -- --watch` - Run tests in watch mode

## Recent Updates

### Next.js 15 Upgrade (August 2025)
- **Upgraded from**: Next.js 14.0.4 + React 18 → Next.js 15.4.6 + React 19.1.1
- **Turbopack**: Now stable and enabled in development (`--turbo` flag)
- **Performance**: Significantly faster development builds and HMR
- **Compatibility**: All existing components work without changes (using client components with useParams)
- **Breaking Changes Handled**: 
  - Fixed caching behavior changes
  - Updated TypeScript types for React 19
  - Corrected async params handling where needed

### PWA Implementation Plan
- **Document**: See `PWA_IMPLEMENTATION_PRD.md` for comprehensive implementation roadmap
- **Timeline**: 6-week implementation plan with 4 phases
- **Dependencies**: next-pwa, web-push for notifications
- **Features**: Offline support, installability, push notifications, background sync

## Key Implementation Notes

### Authentication Flow
All routes except auth pages should redirect unauthenticated users to sign in.

### Data Structure
```
/workspaces/{userId}/events/{eventId}/expenses/{expenseId}
/workspaces/{userId}/events/{eventId}/categories/{paymentId}

```

### TanStack Query Usage
- Use query hooks for data fetching (events, expenses, payments)
- Use mutation hooks for write operations (create/update/delete)
- Implement optimistic updates where appropriate

### File Uploads
Use Firebase Storage for receipts, documents, and images with proper security rules.

### Background Jobs
Firebase Cloud Functions for:
- Data export processing
- Email notifications
- Payment due alerts

### Charts Implementation
Using Recharts library for:
- Budget vs Actual gauge (implemented)
- Payment forecast line chart (implemented)
- Category breakdown pie chart (implemented)
- Quick stats dashboard (implemented)

### Utility Libraries

#### Formatters (`/src/lib/formatters.ts`)
Centralized formatting utilities for consistent data display across the application:

**Currency Formatting:**
- `formatCurrency(amount: number)` - Formats currency without cents (e.g., "$1,234")
- `formatCurrencyWithCents(amount: number)` - Formats currency with cents (e.g., "$1,234.56")
- `sanitizeCurrencyInput(value: string)` - Cleans user input for currency fields

**Date Formatting:**
- `formatDate(dateValue: Date)` - Short date format (e.g., "Mar 15, 2024")
- `formatDateLong(dateValue: Date)` - Long date format (e.g., "Friday, March 15, 2024")
- `formatDateTime(dateValue: Date)` - Date with time (e.g., "Mar 15, 2024, 2:30 PM")

**Usage Guidelines:**
- Always import from `@/lib/formatters` instead of creating local formatting functions
- Use `formatCurrency` for display purposes, `sanitizeCurrencyInput` for form processing
- Prefer `formatDate` for compact displays, `formatDateLong` for detailed views
- All functions handle edge cases (null, undefined, invalid inputs) gracefully
- Comprehensive unit tests ensure reliability across different scenarios

#### Text Utilities (`/src/lib/textUtils.ts`)
Centralized text manipulation utilities for consistent text handling across the application:

**Text Truncation:**
- `truncateText(text, options)` - Core truncation function with intelligent word boundary preservation
- `truncateForMobile(text, maxLength = 20)` - Mobile-optimized truncation with word preservation
- `truncateForBreadcrumb(text, maxLength = 15)` - Breadcrumb-optimized truncation

**Features:**
- Intelligent word boundary preservation to avoid breaking words mid-text
- Customizable suffix (default: "...")
- Fallback to character truncation when word preservation isn't feasible
- Comprehensive unit tests covering edge cases

**Usage Guidelines:**
- Always import from `@/lib/textUtils` instead of creating local truncation functions
- Use `truncateForMobile` for general mobile-friendly text display
- Use `truncateForBreadcrumb` for navigation breadcrumbs
- Use `truncateText` directly for custom truncation requirements

## AI Enhancement Opportunities

### Budget Setup Assistant
- Event type detection (wedding, graduation, etc.)
- Suggested expense categories based on event type
- Cost estimation using historical data or market research
- Vendor recommendations by location and budget

### Smart Categorization
- Auto-categorize expenses based on description
- Suggest payment schedules based on vendor type
- Flag potential budget overruns

### Spending Insights
- Pattern recognition in spending behavior
- Budget optimization suggestions
- Seasonal cost variations for different event types

## UI/UX Guidelines

- Clean, minimalist design focused on clarity
- Mobile-first responsive approach
- Progress indicators for multi-step processes
- Clear visual hierarchy in dashboard charts
- Accessible color palette suitable for financial data
- Intuitive navigation between events and expense management

### Modal Progress Indicators
For consistent progress indicator implementation in confirmation modals, follow the standardized pattern documented in `docs/PROGRESS_INDICATOR_PATTERN.md`. This pattern ensures:
- Visual feedback during async operations (delete, create, update)
- Proper button layout with spinners that don't cause text wrapping
- Consistent disabled states and error handling
- Standardized navigation handling after operations complete

## Development Best Practices

### Next.js 15 Considerations
- Use client components (`'use client'`) for interactive UI with useParams/useRouter
- Server components handle async params automatically (await params)
- Turbopack provides faster development experience
- React 19 features available (new hooks, concurrent features)

### Code Quality
- Biome for linting and formatting (configured)
- TypeScript strict mode enabled
- Component-based architecture with clear separation of concerns
- Consistent file structure following Next.js 15 app directory conventions

### Testing Framework
- **Vitest** for unit and integration tests
- **@testing-library/react** for component testing
- **jsdom** environment for DOM testing
- Firebase Admin SDK mocks included in test setup
- Test files follow `.test.ts` or `.spec.ts` naming convention
- Comprehensive test coverage for utility functions and critical business logic

### Performance
- Turbopack for development builds (~5x faster)
- TanStack Query for efficient data fetching and caching
- Optimistic updates for better UX
- Lazy loading for charts and modals

## Task Management

### Task Documentation
- **All refactoring and development tasks** should be documented in the `docs/tasks/` directory
- Each major project or refactoring effort gets its own markdown file (e.g., `expense-detail-page-refactoring.md`)
- Task files should include detailed specifications, implementation phases, success criteria, and progress tracking

### Task Progress Tracking
- **When completing any task**, always update the corresponding task document in `docs/tasks/`
- Mark completed tasks with checkboxes: `- [x] Task completed`
- Add completion dates and any relevant notes about the implementation
- Update success criteria and progress indicators as work is completed

### Task File Structure
Task documents should follow this structure:
- **Overview** - Problem statement and goals
- **Implementation Phases** - Organized by priority and dependencies  
- **Detailed Task Breakdown** - Specific, actionable items with acceptance criteria
- **Success Criteria** - Measurable goals and completion metrics
- **Dependencies** - Task relationships and implementation order
- **Progress Tracking** - Real-time status updates as work is completed

This ensures task continuity across different development sessions and provides clear documentation of all refactoring and development work.


## Running commands

Always use powershell commands first as we are running on a windows environment