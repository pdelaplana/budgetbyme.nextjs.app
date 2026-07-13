import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ErrorRecoveryCard, { CategoryErrorRecovery } from './ErrorRecoveryCard';

describe('ErrorRecoveryCard', () => {
  it('renders title and message', () => {
    render(
      <ErrorRecoveryCard
        title='Failed to load'
        message='Something went wrong.'
        errorType='network'
        canRetry
      />,
    );

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('shows a retry button and calls onRetry when clicked', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <ErrorRecoveryCard
        title='Failed to load'
        message='Something went wrong.'
        errorType='network'
        canRetry
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows a refresh button when retry is not allowed', () => {
    render(
      <ErrorRecoveryCard
        title='Failed to load'
        message='Something went wrong.'
        errorType='permission'
        canRetry={false}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Refresh Page/i }),
    ).toBeInTheDocument();
  });

  it('calls onDismiss when the dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <ErrorRecoveryCard
        title='Failed to load'
        message='Something went wrong.'
        errorType='validation'
        canRetry={false}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole('button', { name: '✕' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders retry attempts when canRetry and retryCount are set', () => {
    render(
      <ErrorRecoveryCard
        title='Failed to load'
        message='Something went wrong.'
        errorType='network'
        canRetry
        retryCount={2}
        maxRetries={3}
      />,
    );

    expect(screen.getByText('Retry attempts: 2 / 3')).toBeInTheDocument();
  });
});

describe('CategoryErrorRecovery', () => {
  it('renders operation-specific title and message for load errors', () => {
    render(
      <CategoryErrorRecovery
        operation='load'
        categoryName='Venue'
        errorType='network'
        canRetry
      />,
    );

    expect(screen.getByText('Unable to Load "Venue"')).toBeInTheDocument();
  });

  it('renders operation-specific title for delete errors without a category name', () => {
    render(
      <CategoryErrorRecovery
        operation='delete'
        errorType='unknown'
        canRetry={false}
      />,
    );

    expect(screen.getByText('Unable to Delete Category')).toBeInTheDocument();
  });
});
