# Event-Level Budget Aggregation PRD

## Executive Summary

Currently, BudgetByMe updates category-level budget totals (budgeted, scheduled, and spent amounts) when expenses and payments change, but event-level aggregation totals are not being updated. This creates data inconsistencies and requires expensive real-time calculations for dashboard displays.

This PRD outlines the implementation of automatic event-level budget aggregation to ensure data integrity and improve performance.

## Problem Statement

### Current Issues
1. **Missing Updates**: Event totals (`totalBudgetedAmount`, `totalScheduledAmount`, `totalSpentAmount`) are not updated when:
   - Expenses are added/updated/deleted
   - Payments are made/cleared
   - Categories are modified/deleted
   - Payment schedules change

2. **Data Inconsistency**: Event dashboards and charts may show incorrect data because totals are calculated at read-time rather than maintained automatically

3. **Performance Impact**: Dashboard queries require expensive aggregation operations across all categories and expenses

4. **Code Bug**: `fetchEvents.ts` is missing `totalScheduledAmount` in the data transformation (line 70-71)

## Solution Overview

Implement a comprehensive event-level aggregation system that automatically maintains accurate totals whenever underlying data changes.

## Technical Requirements

### Phase 1: Fix Current Bugs
**Timeline: 1-2 hours**

#### 1.1 Fix Missing Field in fetchEvents.ts
- Add `totalScheduledAmount: data.totalScheduledAmount` to the Event transformation
- Verify `fetchEvent.ts` has the same field

#### 1.2 Data Validation
- Audit existing events to ensure `totalScheduledAmount` field exists in Firestore documents

### Phase 2: Create Event Aggregation Utilities
**Timeline: 4-6 hours**

#### 2.1 Core Aggregation Library (`/src/server/lib/eventAggregation.ts`)

**Functions:**
```typescript
// Recalculates all totals from scratch by querying categories
updateEventTotals(userId: string, eventId: string): Promise<void>

// Incremental updates (more performant)
addToEventTotals(userId: string, eventId: string, amounts: {
  budgeted?: number,
  scheduled?: number,
  spent?: number
}): Promise<void>

subtractFromEventTotals(userId: string, eventId: string, amounts: {
  budgeted?: number,
  scheduled?: number,
  spent?: number
}): Promise<void>

// Helper to calculate status and percentage
calculateEventStatus(totalBudgeted: number, totalSpent: number): EventStatus
```

#### 2.2 Error Handling & Monitoring
- Comprehensive Sentry logging for aggregation operations
- Rollback mechanisms for failed updates
- Data validation before writes

### Phase 3: Integrate Into Existing Actions
**Timeline: 6-8 hours**

Update the following server actions to maintain event totals:

#### 3.1 Expense Operations
**File: `addExpense.ts`**
- After updating category `scheduledAmount`, call `addToEventTotals()` with scheduled amount
- Use batch transactions to ensure atomicity

**File: `updateExpense.ts`**
- Calculate difference in amounts (old vs new)
- Handle category changes (subtract from old, add to new)
- Update event totals with net changes

**File: `deleteExpense.ts`**
- After updating category amounts, call `subtractFromEventTotals()`
- Account for both scheduled and spent amounts being removed

#### 3.2 Payment Operations
**File: `markPaymentAsPaidInExpense.ts`**
- When payment is marked as paid, call `addToEventTotals()` for spent amount
- Update category's `spentAmount` AND event's `totalSpentAmount`

**File: `clearAllPayments.ts`**
- Subtract all previously spent amounts from event totals
- Reset event's `totalSpentAmount` portion for that expense

**File: `createSinglePayment.ts`**
- If payment is immediately marked as paid, update event `totalSpentAmount`

#### 3.3 Category Operations
**File: `addCategory.ts`**
- Add `budgetedAmount` to event's `totalBudgetedAmount`

**File: `updateCategory.ts`**
- Calculate difference in `budgetedAmount` and update event totals
- Handle currency conversion if needed

**File: `deleteCategory.ts`**
- Subtract all category amounts from event totals
- Ensure dependent expenses are handled first

### Phase 4: Data Migration & Validation
**Timeline: 2-3 hours**

#### 4.1 Migration Script
Create a one-time migration to recalculate existing event totals:
```typescript
// /src/scripts/migrateEventTotals.ts
async function migrateAllEventTotals()
```

#### 4.2 Validation Tools
- Script to audit data consistency between categories and events
- Dashboard warnings for data discrepancies

## Data Flow

```
Expense/Payment Change
         ↓
Update Category Totals (existing)
         ↓
Update Event Totals (NEW)
         ↓
Transaction Commit
         ↓
UI Reflects Changes
```

## Implementation Strategy

### Atomic Operations
- Use Firestore batch transactions to ensure category and event updates happen atomically
- Implement proper rollback mechanisms

### Performance Considerations
- Prefer incremental updates (`addToEventTotals`) over full recalculation
- Use `updateEventTotals` only for data repair/migration scenarios
- Index frequently queried fields

### Testing Strategy
- Unit tests for aggregation utility functions
- Integration tests for each server action
- End-to-end tests for complete user workflows
- Performance benchmarks for batch operations

## Success Criteria

### Functional Requirements
- [ ] Event totals are automatically updated when expenses/payments change
- [ ] Data consistency between category totals and event totals
- [ ] Dashboard displays accurate real-time data
- [ ] All existing functionality continues to work

### Performance Requirements
- [ ] Aggregation operations complete within 500ms
- [ ] No degradation in existing operation response times
- [ ] Dashboard load times improve due to pre-calculated totals

### Data Integrity Requirements
- [ ] Transaction atomicity maintained
- [ ] No data loss during migration
- [ ] Audit trail for all aggregation changes

## Risk Assessment

### High Risk
- **Data Corruption**: Batch operations could fail partially
- **Performance Degradation**: Additional writes on every expense/payment operation

### Medium Risk
- **Migration Complexity**: Recalculating existing events
- **Concurrent Updates**: Multiple users modifying same event

### Mitigation Strategies
- Comprehensive testing in development environment
- Gradual rollout starting with new events
- Monitoring and alerting for data discrepancies
- Backup/restore procedures

## Dependencies

### Technical Dependencies
- Firebase Admin SDK batch operations
- Existing Sentry monitoring setup
- Current server action architecture

### Business Dependencies
- No breaking changes to existing user workflows
- Backward compatibility with existing data

## Timeline

**Week 1:**
- Phase 1: Fix current bugs
- Phase 2: Create aggregation utilities
- Unit testing

**Week 2:**
- Phase 3: Integrate into server actions
- Integration testing
- Performance testing

**Week 3:**
- Phase 4: Migration and validation
- End-to-end testing
- Documentation updates

**Total Estimated Effort: 15-20 hours over 3 weeks**

## Future Enhancements

- Real-time event total subscriptions for multiple users
- Historical tracking of budget changes over time
- Advanced analytics and forecasting based on aggregated data
- Export functionality for event financial summaries