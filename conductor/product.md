# Product Guide: BudgetByMe

## Initial Concept
BudgetByMe is a budgeting and expense tracking web application for life's major events (weddings, graduations, honeymoons, celebrations).

## Product Vision
BudgetByMe is a premium, mobile-first budgeting and expense tracking web application tailored specifically for life's major events. It empowers users to transition from disorganized spreadsheets to a structured, visual, and collaborative planning ecosystem.

## Target Audience
- Couples planning weddings or honeymoons.
- Families organizing graduations, large celebrations, or family reunions.
- Event planners seeking a clean client-facing tracking interface.

## Core Features
1. **Event Customization & Templates**: Set up events with specific dates, currencies, and pre-seeded expense categories matching the event type.
2. **Dynamic Dashboard & Visual Reports**: 
   - Budget vs. Actual spending gauges.
   - Payment forecast line charts showing scheduled vs. paid trajectories.
   - Category breakdowns with beautiful Recharts pie charts.
3. **Granular Expense Management**: Track vendor details, due dates, categories, tags, and physical attachments (invoices, receipts).
4. **Flexible Payment Schedules**: Support for single flat-rate payments, multi-stage installments, and payment terms (ASAP, On the Day, Fixed Dates).
5. **Background Data Processing**: Export budgeting reports and run asynchronous batch jobs.

## Architecture & Integration
- Fully client-side interaction with responsive state transitions.
- Secure, server-side data mutations via Next.js Server Actions backed by Firebase Admin SDK.
- Fine-grained Firebase Storage rules to ensure strict data privacy.
