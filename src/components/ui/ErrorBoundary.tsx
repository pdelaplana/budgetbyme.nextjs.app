'use client';

import type React from 'react';
import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error state when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some(
        (key, idx) => prevProps.resetKeys![idx] !== key,
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Reset error state when any prop changes (if enabled)
    if (hasError && resetOnPropsChange) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    // Clear any existing timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    // Reset state immediately
    this.setState({
      hasError: false,
      error: null,
      errorId: '',
    });
  };

  handleRetry = () => {
    this.resetErrorBoundary();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          errorId={this.state.errorId}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
interface ErrorFallbackProps {
  error: Error | null;
  onRetry: () => void;
  errorId: string;
}

function ErrorFallback({ error, onRetry, errorId }: ErrorFallbackProps) {
  return (
    <div className='text-center py-12'>
      <div className='text-6xl mb-4'>⚠️</div>
      <h2 className='text-2xl font-semibold text-gray-900 mb-2'>
        Something went wrong
      </h2>
      <p className='text-gray-600 mb-4'>
        We encountered an unexpected error. Please try again.
      </p>

      {/* Error details for development */}
      {process.env.NODE_ENV === 'development' && error && (
        <details className='mb-4 text-left max-w-md mx-auto'>
          <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
            Error Details
          </summary>
          <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto'>
            {error.message}
            {error.stack && '\n\nStack trace:\n' + error.stack}
          </pre>
          <p className='text-xs text-gray-400 mt-1'>Error ID: {errorId}</p>
        </details>
      )}

      <div className='space-x-3'>
        <button type='button' onClick={onRetry} className='btn-primary'>
          Try Again
        </button>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='btn-secondary'
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
