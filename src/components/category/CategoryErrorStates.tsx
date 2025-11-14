'use client';

import { useRouter } from 'next/navigation';
import { CategoryErrorRecovery } from '@/components/ui/ErrorRecoveryCard';
import type { ErrorState } from '@/hooks/category/useCategoryPageState';

interface CategoryErrorStatesProps {
  eventId: string;
  categoryName?: string;
  errors: {
    categoryLoad: ErrorState;
    categoryUpdate: ErrorState;
    categoryDelete: ErrorState;
    expenseLoad: ErrorState;
  };
  isRetrying: boolean;
  onRetryLoad?: () => void;
  onRetryUpdate?: () => void;
  onRetryDelete?: () => void;
  onRetryExpenses?: () => void;
  onClearError?: (errorKey: keyof CategoryErrorStatesProps['errors']) => void;
  showInline?: boolean;
}

export default function CategoryErrorStates({
  eventId,
  categoryName,
  errors,
  isRetrying,
  onRetryLoad,
  onRetryUpdate,
  onRetryDelete,
  onRetryExpenses,
  onClearError,
  showInline = true,
}: CategoryErrorStatesProps) {
  const router = useRouter();

  // If there are no errors, don't render anything
  const hasAnyError = Object.values(errors).some((error) => error.hasError);
  if (!hasAnyError) {
    return null;
  }

  // Category load error is critical - show full page error
  if (errors.categoryLoad.hasError && !showInline) {
    return (
      <div className='text-center py-12'>
        <CategoryErrorRecovery
          operation='load'
          categoryName={categoryName}
          errorType={errors.categoryLoad.errorType || 'unknown'}
          canRetry={errors.categoryLoad.canRetry}
          isRetrying={isRetrying}
          onRetry={onRetryLoad}
          retryCount={errors.categoryLoad.retryCount}
          size='large'
          showDetails={process.env.NODE_ENV === 'development'}
          technicalDetails={errors.categoryLoad.error?.stack}
        />

        <div className='mt-6'>
          <button
            type='button'
            onClick={() => router.push(`/events/${eventId}/dashboard`)}
            className='btn-secondary'
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Inline errors for specific sections
  return (
    <div className='space-y-4'>
      {errors.categoryLoad.hasError && showInline && (
        <CategoryErrorRecovery
          operation='load'
          categoryName={categoryName}
          errorType={errors.categoryLoad.errorType || 'unknown'}
          canRetry={errors.categoryLoad.canRetry}
          isRetrying={isRetrying}
          onRetry={onRetryLoad}
          onDismiss={() => onClearError?.('categoryLoad')}
          retryCount={errors.categoryLoad.retryCount}
          showDetails={process.env.NODE_ENV === 'development'}
          technicalDetails={errors.categoryLoad.error?.stack}
        />
      )}

      {errors.categoryUpdate.hasError && (
        <CategoryErrorRecovery
          operation='update'
          categoryName={categoryName}
          errorType={errors.categoryUpdate.errorType || 'unknown'}
          canRetry={errors.categoryUpdate.canRetry}
          isRetrying={isRetrying}
          onRetry={onRetryUpdate}
          onDismiss={() => onClearError?.('categoryUpdate')}
          retryCount={errors.categoryUpdate.retryCount}
          size='small'
        />
      )}

      {errors.categoryDelete.hasError && (
        <CategoryErrorRecovery
          operation='delete'
          categoryName={categoryName}
          errorType={errors.categoryDelete.errorType || 'unknown'}
          canRetry={errors.categoryDelete.canRetry}
          isRetrying={isRetrying}
          onRetry={onRetryDelete}
          onDismiss={() => onClearError?.('categoryDelete')}
          retryCount={errors.categoryDelete.retryCount}
          size='small'
        />
      )}

      {errors.expenseLoad.hasError && (
        <CategoryErrorRecovery
          operation='expenses'
          categoryName={categoryName}
          errorType={errors.expenseLoad.errorType || 'unknown'}
          canRetry={errors.expenseLoad.canRetry}
          isRetrying={isRetrying}
          onRetry={onRetryExpenses}
          onDismiss={() => onClearError?.('expenseLoad')}
          retryCount={errors.expenseLoad.retryCount}
        />
      )}
    </div>
  );
}

/**
 * Specialized component for expenses section error
 */
interface ExpensesSectionErrorProps {
  categoryName?: string;
  error: ErrorState;
  isRetrying: boolean;
  onRetry?: () => void;
  onClearError?: () => void;
}

export function ExpensesSectionError({
  categoryName,
  error,
  isRetrying,
  onRetry,
  onClearError,
}: ExpensesSectionErrorProps) {
  if (!error.hasError) return null;

  return (
    <div className='card-body'>
      <CategoryErrorRecovery
        operation='expenses'
        categoryName={categoryName}
        errorType={error.errorType || 'unknown'}
        canRetry={error.canRetry}
        isRetrying={isRetrying}
        onRetry={onRetry}
        onDismiss={onClearError}
        retryCount={error.retryCount}
      />
    </div>
  );
}

/**
 * Modal error component for category operations
 */
interface CategoryModalErrorProps {
  operation: 'update' | 'delete';
  categoryName?: string;
  error: ErrorState;
  isRetrying: boolean;
  onRetry?: () => void;
  onClearError?: () => void;
}

export function CategoryModalError({
  operation,
  categoryName,
  error,
  isRetrying,
  onRetry,
  onClearError,
}: CategoryModalErrorProps) {
  if (!error.hasError) return null;

  return (
    <div className='mb-4'>
      <CategoryErrorRecovery
        operation={operation}
        categoryName={categoryName}
        errorType={error.errorType || 'unknown'}
        canRetry={error.canRetry}
        isRetrying={isRetrying}
        onRetry={onRetry}
        onDismiss={onClearError}
        retryCount={error.retryCount}
        size='small'
      />
    </div>
  );
}
