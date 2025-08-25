# Query Invalidation and Mutation Strategy - Product Requirements Document

## Executive Summary

The current BudgetByMe application has inconsistent and inefficient query invalidation patterns across mutation hooks. This PRD outlines the strategy to standardize mutation handling, optimize query invalidation, and improve application performance while maintaining data consistency.

## Problem Statement

### Current Issues
1. **Automatic Query Invalidation**: All mutation hooks automatically invalidate queries in their `onSuccess` callbacks, leading to unnecessary network requests
2. **Inconsistent Patterns**: Different mutations handle invalidation differently - some invalidate specific queries, others invalidate broadly
3. **Performance Impact**: Every mutation triggers multiple query refetches, even when the UI doesn't need the updated data immediately
4. **Poor User Experience**: Category spent amounts don't update immediately after payment mutations due to missing invalidations
5. **Maintenance Burden**: Query invalidation logic is scattered across multiple hooks, making it hard to maintain and debug

### Specific Examples
- `useCreateSinglePaymentMutation` was missing category query invalidation
- `useMarkPaymentAsPaidMutation` invalidates both expenses and categories on every call
- Some hooks use incorrect query keys (e.g., `['expenses']` instead of `['expenses', userId, eventId]`)

## Goals and Objectives

### Primary Goals
1. **Standardize Mutation Patterns**: Establish consistent patterns for all mutations across the application
2. **Optimize Performance**: Reduce unnecessary query refetches while maintaining data consistency
3. **Improve UX**: Ensure UI updates immediately when data changes (e.g., category spent amounts)
4. **Enhance Maintainability**: Centralize query invalidation logic for easier maintenance

### Success Metrics
- Reduce number of unnecessary API calls by 60%
- Achieve sub-200ms UI updates for critical data changes
- 100% consistency in mutation hook patterns
- Zero data inconsistency issues in production

## Technical Requirements

### 1. Mutation Hook Strategy

#### Option A: Pure Mutations (Recommended)
```typescript
// Mutations only perform server actions, no automatic invalidation
export const useMarkPaymentAsPaidMutation = (options?: MutationOptions) => {
  return useMutation({
    mutationFn: markPaymentAsPaidInExpense,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
    // NO automatic query invalidation
  });
};
```

#### Option B: Configurable Invalidation
```typescript
// Mutations accept invalidation configuration
export const useMarkPaymentAsPaidMutation = (options?: {
  invalidateQueries?: boolean;
  onSuccess?: () => void;
}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markPaymentAsPaidInExpense,
    onSuccess: (_, variables) => {
      if (options?.invalidateQueries) {
        queryClient.invalidateQueries(['expenses', variables.userId, variables.eventId]);
        queryClient.invalidateQueries(['categories', variables.eventId]);
      }
      options?.onSuccess?.();
    },
  });
};
```

### 2. Query Invalidation Patterns

#### Centralized Invalidation Service
```typescript
// lib/queryInvalidation.ts
export class QueryInvalidationService {
  constructor(private queryClient: QueryClient) {}

  invalidateExpenseRelatedQueries(userId: string, eventId: string) {
    this.queryClient.invalidateQueries(['expenses', userId, eventId]);
    this.queryClient.invalidateQueries(['categories', eventId]);
    this.queryClient.invalidateQueries(['userWorkspace', userId]);
  }

  invalidateCategoryRelatedQueries(eventId: string) {
    this.queryClient.invalidateQueries(['categories', eventId]);
    this.queryClient.invalidateQueries(['expenses', eventId]);
  }
}
```

#### Component-Level Invalidation
```typescript
// Components explicitly handle invalidation when needed
const ExpenseDetailPage = () => {
  const queryClient = useQueryClient();
  const markAsPaidMutation = useMarkPaymentAsPaidMutation({
    onSuccess: () => {
      // Component decides what to invalidate
      queryClient.invalidateQueries(['expenses', userId, eventId]);
      queryClient.invalidateQueries(['categories', eventId]);
    }
  });
};
```

### 3. Optimistic Updates Strategy

#### Critical Data (Immediate UI Feedback Required)
- Payment status changes
- Category spent amounts
- Expense amounts

#### Non-Critical Data (Can Wait for Refetch)
- Metadata (created dates, updated dates)
- Audit logs
- Secondary calculations

### 4. Query Key Standardization

#### Current Inconsistent Patterns
```typescript
// ❌ Inconsistent
['expenses'] // Too broad
['categories', eventId] // Missing userId
['expenses', userId, eventId] // Correct but not standardized
```

#### Proposed Standard Patterns
```typescript
// ✅ Standardized query keys
const QUERY_KEYS = {
  expenses: (userId: string, eventId: string) => ['expenses', userId, eventId],
  categories: (userId: string, eventId: string) => ['categories', userId, eventId],
  userWorkspace: (userId: string) => ['userWorkspace', userId],
  events: (userId: string) => ['events', userId],
} as const;
```

## Implementation Plan

### Phase 1: Foundation (Week 1)
1. Create query key constants file
2. Implement QueryInvalidationService
3. Update all existing query hooks to use standardized keys
4. Create mutation pattern documentation

### Phase 2: Mutation Hook Refactoring (Week 2)
1. Remove automatic invalidation from all payment mutations
2. Update mutation hooks to follow pure mutation pattern
3. Create helper hooks for common invalidation patterns
4. Update tests to reflect new patterns

### Phase 3: Component Updates (Week 3)
1. Update all components using payment mutations
2. Implement explicit invalidation where needed
3. Add optimistic updates for critical user interactions
4. Performance testing and optimization

### Phase 4: Validation & Cleanup (Week 4)
1. End-to-end testing of all payment flows
2. Performance benchmarking
3. Documentation updates
4. Code review and cleanup

## Affected Components

### High Priority (Critical User Flows)
- `MarkAsPaidModal.tsx`
- `ExpenseDetailPage.tsx`
- `CategoryPage.tsx`
- `DashboardPage.tsx`

### Medium Priority
- `AddOrEditExpenseModal.tsx`
- `PaymentScheduleModal.tsx`
- All category-related components

### Low Priority
- Reporting components
- Export functionality
- Admin interfaces

## Migration Strategy

### Backward Compatibility
1. Keep existing mutation hooks during transition period
2. Create new hooks with `_v2` suffix for new pattern
3. Gradually migrate components one by one
4. Remove old hooks after full migration

### Testing Strategy
1. Unit tests for each mutation hook pattern
2. Integration tests for critical user flows
3. Performance tests comparing before/after metrics
4. Manual testing of all payment scenarios

## Risk Assessment

### High Risk
- **Data Inconsistency**: Improper invalidation could lead to stale data
- **Performance Regression**: Incorrect implementation could worsen performance

### Medium Risk
- **Development Velocity**: Large refactoring may slow feature development
- **Bug Introduction**: Changes to core mutation logic could introduce bugs

### Mitigation Strategies
1. Comprehensive testing at each phase
2. Feature flags for gradual rollout
3. Monitoring and alerting for performance metrics
4. Rollback plan for each phase

## Success Criteria

### Performance Metrics
- [ ] Reduce unnecessary API calls by 60%
- [ ] Category spent amounts update within 200ms of payment mutations
- [ ] No increase in overall page load times

### Code Quality Metrics
- [ ] 100% of mutation hooks follow consistent patterns
- [ ] All query keys use standardized format
- [ ] Zero TypeScript errors related to query patterns

### User Experience Metrics
- [ ] Zero reported issues of stale data in UI
- [ ] Payment status updates appear immediately
- [ ] Category totals reflect payments instantly

## Monitoring and Rollback

### Monitoring
- Query cache hit/miss ratios
- Network request frequency per user session
- Time-to-update for critical UI elements
- Error rates for mutation operations

### Rollback Triggers
- > 10% increase in API error rates
- > 20% increase in page load times  
- Any critical data inconsistency reports
- Performance degradation beyond acceptable thresholds

## Detailed Technical Specifications

### Query Key Architecture

#### Hierarchical Query Key Structure
```typescript
// lib/queryKeys.ts
export const queryKeys = {
  // User-scoped queries
  user: (userId: string) => ['user', userId] as const,
  
  // Workspace-scoped queries  
  userWorkspace: (userId: string) => ['userWorkspace', userId] as const,
  events: (userId: string) => ['events', userId] as const,
  
  // Event-scoped queries
  event: (userId: string, eventId: string) => ['event', userId, eventId] as const,
  categories: (userId: string, eventId: string) => ['categories', userId, eventId] as const,
  expenses: (userId: string, eventId: string) => ['expenses', userId, eventId] as const,
  
  // Expense-scoped queries
  expense: (userId: string, eventId: string, expenseId: string) => 
    ['expense', userId, eventId, expenseId] as const,
  payments: (userId: string, eventId: string, expenseId: string) => 
    ['payments', userId, eventId, expenseId] as const,
} as const;
```

#### Query Key Validation
```typescript
// utils/queryKeyValidator.ts
export function validateQueryKey(key: unknown[]): boolean {
  if (!Array.isArray(key) || key.length < 2) return false;
  
  const [resource, userId, eventId, ...rest] = key;
  
  // Validate resource type
  const validResources = ['user', 'userWorkspace', 'events', 'event', 'categories', 'expenses', 'expense', 'payments'];
  if (!validResources.includes(resource as string)) return false;
  
  // Validate userId format
  if (typeof userId !== 'string' || userId.length === 0) return false;
  
  return true;
}
```

### Mutation Hook Patterns

#### Standard Mutation Hook Template
```typescript
// hooks/templates/mutationTemplate.ts
interface StandardMutationOptions<TData = unknown, TVariables = unknown> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void;
}

export function createStandardMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: StandardMutationOptions<TData, TVariables> = {}
) {
  return useMutation({
    mutationFn,
    onSuccess: options.onSuccess,
    onError: options.onError,
    onSettled: options.onSettled,
    // NO automatic side effects
  });
}
```

#### Payment Mutation Hooks (Refactored)
```typescript
// hooks/payments/useMarkPaymentAsPaidMutation.ts (New Version)
export const useMarkPaymentAsPaidMutation = (options: StandardMutationOptions = {}) => {
  return createStandardMutation(
    ({ userId, eventId, expenseId, paymentId, markAsPaidData }: MarkPaymentAsPaidVariables) =>
      markPaymentAsPaidInExpense(userId, eventId, expenseId, paymentId, markAsPaidData),
    options
  );
};

// hooks/payments/useCreateSinglePaymentMutation.ts (New Version)
export const useCreateSinglePaymentMutation = (options: StandardMutationOptions = {}) => {
  return createStandardMutation(
    (data: CreateSinglePaymentMutationData) => createSinglePayment(data),
    options
  );
};
```

### Optimistic Update Patterns

#### Optimistic Update Helper
```typescript
// lib/optimisticUpdates.ts
export class OptimisticUpdateManager {
  constructor(private queryClient: QueryClient) {}

  updateExpensePaymentStatus(
    userId: string, 
    eventId: string, 
    expenseId: string, 
    paymentId: string, 
    isPaid: boolean
  ) {
    const queryKey = queryKeys.expenses(userId, eventId);
    
    this.queryClient.setQueryData(queryKey, (oldData: Expense[] | undefined) => {
      if (!oldData) return oldData;
      
      return oldData.map(expense => {
        if (expense.id !== expenseId) return expense;
        
        // Update payment schedule
        if (expense.paymentSchedule) {
          expense.paymentSchedule = expense.paymentSchedule.map(payment => 
            payment.id === paymentId ? { ...payment, isPaid } : payment
          );
        }
        
        // Update one-off payment
        if (expense.oneOffPayment?.id === paymentId) {
          expense.oneOffPayment = { ...expense.oneOffPayment, isPaid };
        }
        
        return expense;
      });
    });
  }

  updateCategorySpentAmount(userId: string, eventId: string, categoryId: string, amountDelta: number) {
    const queryKey = queryKeys.categories(userId, eventId);
    
    this.queryClient.setQueryData(queryKey, (oldData: BudgetCategory[] | undefined) => {
      if (!oldData) return oldData;
      
      return oldData.map(category =>
        category.id === categoryId 
          ? { ...category, spentAmount: category.spentAmount + amountDelta }
          : category
      );
    });
  }
}
```

#### Usage in Components
```typescript
// components/modals/MarkAsPaidModal.tsx (Updated)
export default function MarkAsPaidModal({ ... }) {
  const queryClient = useQueryClient();
  const optimisticUpdates = new OptimisticUpdateManager(queryClient);
  
  const markPaymentMutation = useMarkPaymentAsPaidMutation({
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(queryKeys.expenses(variables.userId, variables.eventId));
      await queryClient.cancelQueries(queryKeys.categories(variables.userId, variables.eventId));
      
      // Optimistically update UI
      optimisticUpdates.updateExpensePaymentStatus(
        variables.userId, 
        variables.eventId, 
        variables.expenseId, 
        variables.paymentId, 
        true
      );
      
      // Get payment amount for category update
      const paymentAmount = getPaymentAmount(variables);
      optimisticUpdates.updateCategorySpentAmount(
        variables.userId, 
        variables.eventId, 
        variables.categoryId, 
        paymentAmount
      );
      
      // Return snapshot for rollback
      return {
        previousExpenses: queryClient.getQueryData(queryKeys.expenses(variables.userId, variables.eventId)),
        previousCategories: queryClient.getQueryData(queryKeys.categories(variables.userId, variables.eventId)),
      };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousExpenses) {
        queryClient.setQueryData(queryKeys.expenses(variables.userId, variables.eventId), context.previousExpenses);
      }
      if (context?.previousCategories) {
        queryClient.setQueryData(queryKeys.categories(variables.userId, variables.eventId), context.previousCategories);
      }
      
      toast.error('Failed to mark payment as paid');
    },
    onSettled: (data, error, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries(queryKeys.expenses(variables.userId, variables.eventId));
      queryClient.invalidateQueries(queryKeys.categories(variables.userId, variables.eventId));
    }
  });
}
```

## Error Handling Strategy

### Mutation Error Types
```typescript
// types/mutationErrors.ts
export enum MutationErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  DATA_CONFLICT = 'DATA_CONFLICT',
  SERVER_ERROR = 'SERVER_ERROR',
}

export interface MutationError extends Error {
  type: MutationErrorType;
  code: string;
  details?: Record<string, unknown>;
}
```

### Error Handling Patterns
```typescript
// lib/errorHandling.ts
export function handleMutationError(error: MutationError, context: string) {
  // Log to monitoring service
  console.error(`Mutation error in ${context}:`, error);
  
  // Show user-friendly message based on error type
  switch (error.type) {
    case MutationErrorType.NETWORK_ERROR:
      toast.error('Connection problem. Please check your internet and try again.');
      break;
    case MutationErrorType.VALIDATION_ERROR:
      toast.error(error.message || 'Please check your input and try again.');
      break;
    case MutationErrorType.PERMISSION_ERROR:
      toast.error('You don\'t have permission to perform this action.');
      break;
    default:
      toast.error('Something went wrong. Please try again.');
  }
}
```

## Performance Monitoring

### Metrics Collection
```typescript
// lib/performanceMonitoring.ts
export class MutationPerformanceMonitor {
  private static instance: MutationPerformanceMonitor;
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new MutationPerformanceMonitor();
    }
    return this.instance;
  }
  
  trackMutation(mutationType: string, startTime: number, endTime: number, success: boolean) {
    const duration = endTime - startTime;
    
    // Send to analytics service
    analytics.track('mutation_performance', {
      type: mutationType,
      duration,
      success,
      timestamp: new Date().toISOString(),
    });
    
    // Log slow mutations
    if (duration > 2000) {
      console.warn(`Slow mutation detected: ${mutationType} took ${duration}ms`);
    }
  }
  
  trackQueryInvalidation(queryKey: string[], count: number) {
    analytics.track('query_invalidation', {
      queryKey: JSON.stringify(queryKey),
      invalidationCount: count,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### Usage in Hooks
```typescript
// Enhanced mutation hook with monitoring
export const useMarkPaymentAsPaidMutation = (options: StandardMutationOptions = {}) => {
  const monitor = MutationPerformanceMonitor.getInstance();
  
  return useMutation({
    mutationFn: async (variables: MarkPaymentAsPaidVariables) => {
      const startTime = performance.now();
      
      try {
        const result = await markPaymentAsPaidInExpense(
          variables.userId,
          variables.eventId,
          variables.expenseId,
          variables.paymentId,
          variables.markAsPaidData
        );
        
        monitor.trackMutation('markPaymentAsPaid', startTime, performance.now(), true);
        return result;
      } catch (error) {
        monitor.trackMutation('markPaymentAsPaid', startTime, performance.now(), false);
        throw error;
      }
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
};
```

## Testing Strategy

### Unit Tests for Mutation Hooks
```typescript
// hooks/payments/__tests__/useMarkPaymentAsPaidMutation.test.ts
describe('useMarkPaymentAsPaidMutation', () => {
  it('should call server action with correct parameters', async () => {
    const mockMarkPaymentAsPaid = jest.fn().mockResolvedValue('payment-id');
    jest.mocked(markPaymentAsPaidInExpense).mockImplementation(mockMarkPaymentAsPaid);
    
    const { result } = renderHook(() => useMarkPaymentAsPaidMutation(), {
      wrapper: QueryClientProvider,
    });
    
    const variables = {
      userId: 'user-1',
      eventId: 'event-1',
      expenseId: 'expense-1',
      paymentId: 'payment-1',
      markAsPaidData: { /* test data */ },
    };
    
    await act(async () => {
      result.current.mutate(variables);
    });
    
    expect(mockMarkPaymentAsPaid).toHaveBeenCalledWith(
      'user-1',
      'event-1', 
      'expense-1',
      'payment-1',
      variables.markAsPaidData
    );
  });
  
  it('should NOT automatically invalidate queries', async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
    
    const { result } = renderHook(() => useMarkPaymentAsPaidMutation(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });
    
    await act(async () => {
      result.current.mutate(mockVariables);
    });
    
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
```

### Integration Tests for Components
```typescript
// components/modals/__tests__/MarkAsPaidModal.integration.test.tsx
describe('MarkAsPaidModal Integration', () => {
  it('should update category spent amount immediately after payment', async () => {
    const queryClient = new QueryClient();
    
    // Set initial data
    queryClient.setQueryData(queryKeys.categories('user-1', 'event-1'), [
      { id: 'cat-1', name: 'Venue', spentAmount: 100 }
    ]);
    
    const { getByRole, getByDisplayValue } = render(
      <QueryClientProvider client={queryClient}>
        <MarkAsPaidModal
          isOpen={true}
          expenseId="expense-1"
          expenseName="Venue Payment"
          expenseAmount={500}
          onClose={jest.fn()}
        />
      </QueryClientProvider>
    );
    
    // Fill form and submit
    fireEvent.change(getByDisplayValue('500'), { target: { value: '200' } });
    fireEvent.click(getByRole('button', { name: /mark as paid/i }));
    
    // Verify optimistic update
    await waitFor(() => {
      const categoryData = queryClient.getQueryData(queryKeys.categories('user-1', 'event-1'));
      expect(categoryData[0].spentAmount).toBe(300); // 100 + 200
    });
  });
});
```

### Performance Tests
```typescript
// __tests__/performance/mutationPerformance.test.ts
describe('Mutation Performance', () => {
  it('should not exceed query invalidation limits', async () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
    
    // Perform multiple mutations
    const mutations = Array(10).fill(null).map(() => 
      useMarkPaymentAsPaidMutation()
    );
    
    for (const mutation of mutations) {
      await mutation.mutateAsync(mockVariables);
    }
    
    // Should not exceed reasonable invalidation count
    expect(invalidateQueriesSpy).toHaveBeenCalledTimes(0); // Pure mutations don't invalidate
  });
  
  it('should complete mutations within performance budget', async () => {
    const startTime = performance.now();
    
    const mutation = useMarkPaymentAsPaidMutation();
    await mutation.mutateAsync(mockVariables);
    
    const duration = performance.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

## Documentation Updates

### Developer Guidelines
```markdown
# Mutation Hook Guidelines

## Do's
✅ Keep mutations pure - only perform server actions
✅ Use standardized query keys from `lib/queryKeys.ts`
✅ Implement optimistic updates for critical UI feedback
✅ Handle errors gracefully with user-friendly messages
✅ Add performance monitoring for mutation timing

## Don'ts
❌ Don't automatically invalidate queries in mutation hooks
❌ Don't use inconsistent query key patterns
❌ Don't perform side effects in mutation functions
❌ Don't ignore error handling
❌ Don't skip rollback logic for optimistic updates

## Examples

### ✅ Good: Pure Mutation Hook
```typescript
export const useUpdateExpenseMutation = () => {
  return useMutation({
    mutationFn: updateExpense,
    // No automatic side effects
  });
};
```

### ❌ Bad: Mutation with Automatic Invalidation  
```typescript
export const useUpdateExpenseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      // Don't do this!
      queryClient.invalidateQueries(['expenses']);
    },
  });
};
```
```

## Conclusion

This comprehensive PRD outlines a complete strategy to fix query invalidation issues and establish sustainable mutation patterns for the BudgetByMe application. The solution emphasizes:

1. **Pure mutations** that only perform server actions
2. **Explicit invalidation** controlled by components
3. **Optimistic updates** for critical user interactions
4. **Standardized patterns** for maintainability
5. **Performance monitoring** for continuous improvement

The phased implementation approach allows for careful validation at each step, minimizing risk while delivering incremental improvements to the user experience. With comprehensive testing, monitoring, and documentation, this strategy provides a solid foundation for scalable and performant data management in the application.