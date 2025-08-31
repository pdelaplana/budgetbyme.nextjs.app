'use client';

import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export interface ErrorRecoveryCardProps {
  title: string;
  message: string;
  errorType: 'network' | 'validation' | 'permission' | 'unknown';
  canRetry: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
  maxRetries?: number;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showDetails?: boolean;
  technicalDetails?: string;
}

export default function ErrorRecoveryCard({
  title,
  message,
  errorType,
  canRetry,
  isRetrying = false,
  onRetry,
  onDismiss,
  retryCount = 0,
  maxRetries = 3,
  className = '',
  size = 'medium',
  showDetails = false,
  technicalDetails,
}: ErrorRecoveryCardProps) {
  
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return '🌐';
      case 'validation':
        return '⚠️';
      case 'permission':
        return '🔒';
      default:
        return '❌';
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'network':
        return 'border-blue-200 bg-blue-50';
      case 'validation':
        return 'border-yellow-200 bg-yellow-50';
      case 'permission':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTextColor = () => {
    switch (errorType) {
      case 'network':
        return 'text-blue-800';
      case 'validation':
        return 'text-yellow-800';
      case 'permission':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const getSecondaryTextColor = () => {
    switch (errorType) {
      case 'network':
        return 'text-blue-600';
      case 'validation':
        return 'text-yellow-600';
      case 'permission':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getButtonColor = () => {
    switch (errorType) {
      case 'network':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'validation':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      case 'permission':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getRecoveryAction = () => {
    switch (errorType) {
      case 'network':
        return 'Check your internet connection and try again.';
      case 'validation':
        return 'Please refresh the page or contact support if this persists.';
      case 'permission':
        return 'Contact your administrator for access to this resource.';
      default:
        return 'Please try again or contact support if this continues.';
    }
  };

  return (
    <div className={`border rounded-lg ${getErrorColor()} ${getSizeClasses()} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0 mt-0.5">
          {getErrorIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold ${getTextColor()}`}>
              {title}
            </h3>
            
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className={`text-sm ${getSecondaryTextColor()} hover:opacity-70 ml-2`}
              >
                ✕
              </button>
            )}
          </div>
          
          <p className={`mt-1 text-sm ${getSecondaryTextColor()}`}>
            {message}
          </p>
          
          <p className={`mt-2 text-xs ${getSecondaryTextColor()} opacity-75`}>
            {getRecoveryAction()}
          </p>

          {canRetry && retryCount > 0 && (
            <p className={`mt-1 text-xs ${getSecondaryTextColor()}`}>
              Retry attempts: {retryCount} / {maxRetries}
            </p>
          )}

          {showDetails && technicalDetails && (
            <details className="mt-2">
              <summary className={`cursor-pointer text-xs ${getSecondaryTextColor()} hover:opacity-70`}>
                Technical Details
              </summary>
              <pre className="mt-1 text-xs bg-black bg-opacity-10 p-2 rounded overflow-auto">
                {technicalDetails}
              </pre>
            </details>
          )}

          <div className="flex items-center space-x-2 mt-3">
            {canRetry && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium ${getButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Retrying...' : 'Try Again'}</span>
              </button>
            )}
            
            {!canRetry && (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-sm font-medium ${getButtonColor()}`}
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Refresh Page</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Specialized error recovery card for category operations
 */
interface CategoryErrorRecoveryProps extends Omit<ErrorRecoveryCardProps, 'title' | 'message'> {
  operation: 'load' | 'update' | 'delete' | 'expenses';
  categoryName?: string;
}

export function CategoryErrorRecovery({
  operation,
  categoryName,
  ...props
}: CategoryErrorRecoveryProps) {
  
  const getOperationText = () => {
    switch (operation) {
      case 'load':
        return {
          title: `Unable to Load ${categoryName ? `"${categoryName}"` : 'Category'}`,
          message: 'The category data could not be retrieved at this time.',
        };
      case 'update':
        return {
          title: `Unable to Save Changes`,
          message: `Changes to ${categoryName ? `"${categoryName}"` : 'the category'} could not be saved.`,
        };
      case 'delete':
        return {
          title: `Unable to Delete Category`,
          message: `${categoryName ? `"${categoryName}"` : 'The category'} could not be deleted at this time.`,
        };
      case 'expenses':
        return {
          title: 'Unable to Load Expenses',
          message: `Expenses for ${categoryName ? `"${categoryName}"` : 'this category'} could not be loaded.`,
        };
      default:
        return {
          title: 'Operation Failed',
          message: 'The requested operation could not be completed.',
        };
    }
  };

  const { title, message } = getOperationText();

  return (
    <ErrorRecoveryCard
      title={title}
      message={message}
      {...props}
    />
  );
}