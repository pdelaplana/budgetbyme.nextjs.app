# Tech Stack: BudgetByMe

This document outlines the technology stack and architectural guidelines of the BudgetByMe application.

## Core Language & Runtime
- **TypeScript**: Enforces static type safety across both frontend and backend directories.
- **Node.js**: The Javascript runtime execution environment.

## Frameworks & Build Tools
- **Next.js 15.4 (App Router)**: The main full-stack web framework, utilizing:
  - React 19.1
  - Turbopack for lightning-fast developer builds and hot-reloads
  - React Server Actions for server-side endpoints
- **Tailwind CSS**: Core style system utility class libraries.

## Database & Authentication
- **Firebase Authentication**: Client and server-side verification.
- **Firebase Firestore**: Dynamic document database storing event budgets, categories, expenses, and payments.
- **Firebase Storage**: Object storage for receipts and image uploads.
- **Firebase Admin SDK**: Executes high-privileged queries within Next.js Server Actions, bypassing Firestore security rules to run administrative actions.

## State Management & Forms
- **TanStack Query (React Query v5)**: Manages caching, query state, optimistic UI updates, and synchronization.
- **React Hook Form**: Simplifies form validation and fields state.

## Observability & Quality Assurance
- **Sentry**: Application telemetry, error logging, and user breadcrumb capture.
- **Biome**: Linter and formatter replacing ESLint and Prettier.
- **Vitest**: Testing framework integrated with jsdom and testing-library.
