'use client';

import { useRouter } from 'next/navigation';
import type React from 'react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

interface CategoryErrorBoundaryProps {
  children: React.ReactNode;
  eventId: string;
  categoryId?: string;
  fallbackLevel?: 'page' | 'section' | 'component';
}

export default function CategoryErrorBoundary({
  children,
  eventId,
  categoryId,
  fallbackLevel = 'section',
}: CategoryErrorBoundaryProps) {
  const router = useRouter();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log category-specific error context
    console.error('Category Error:', {
      error: error.message,
      eventId,
      categoryId,
      fallbackLevel,
      component: errorInfo.componentStack,
    });

    // TODO: Send to error reporting service (Sentry)
    // Sentry.captureException(error, {
    //   tags: {
    //     component: 'CategoryPage',
    //     eventId,
    //     categoryId,
    //     fallbackLevel,
    //   },
    //   extra: errorInfo,
    // });
  };

  const getErrorFallback = () => {
    switch (fallbackLevel) {
      case 'page':
        return (
          <CategoryPageError
            eventId={eventId}
            categoryId={categoryId}
            onNavigateBack={() => router.push(`/events/${eventId}/dashboard`)}
          />
        );

      case 'section':
        return (
          <CategorySectionError onRetry={() => window.location.reload()} />
        );

      case 'component':
        return <CategoryComponentError />;

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary
      fallback={getErrorFallback()}
      onError={handleError}
      resetKeys={categoryId ? [eventId, categoryId] : [eventId]}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  );
}

// Page-level error fallback
function CategoryPageError({
  eventId: _eventId,
  categoryId: _categoryId,
  onNavigateBack,
}: {
  eventId: string;
  categoryId?: string;
  onNavigateBack: () => void;
}) {
  return (
    <div className='text-center py-12'>
      <div className='text-6xl mb-4'>📊</div>
      <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
        Category Unavailable
      </h2>
      <p className='text-gray-600 mb-4'>
        We're unable to load this budget category right now. The data might be
        temporarily unavailable.
      </p>

      <div className='space-x-3'>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='btn-primary'
        >
          Try Again
        </button>
        <button
          type='button'
          onClick={onNavigateBack}
          className='btn-secondary'
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

// Section-level error fallback
function CategorySectionError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-center'>
      <div className='text-red-600 mb-2'>
        <svg
          className='w-8 h-8 mx-auto'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          role='img'
          aria-label='Error icon'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
          />
        </svg>
      </div>
      <h3 className='text-red-800 font-medium mb-1'>Section Error</h3>
      <p className='text-red-600 text-sm mb-3'>
        This section encountered an error and couldn't load properly.
      </p>
      <button
        type='button'
        onClick={onRetry}
        className='text-red-700 hover:text-red-800 underline text-sm'
      >
        Try loading again
      </button>
    </div>
  );
}

// Component-level error fallback
function CategoryComponentError() {
  return (
    <div className='bg-yellow-50 border border-yellow-200 rounded p-3 text-center'>
      <div className='text-yellow-600 text-sm'>
        <svg
          className='w-5 h-5 inline mr-1'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          role='img'
          aria-label='Warning icon'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
        Component temporarily unavailable
      </div>
    </div>
  );
}
