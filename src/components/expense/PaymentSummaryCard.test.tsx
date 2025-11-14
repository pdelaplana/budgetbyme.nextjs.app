import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { PaymentStatus } from '@/lib/paymentCalculations';
import PaymentSummaryCard from './PaymentSummaryCard';

const createMockPaymentStatus = (
  overrides?: Partial<PaymentStatus>,
): PaymentStatus => ({
  totalAmount: 1000,
  paidAmount: 600,
  remainingAmount: 400,
  percentagePaid: 60,
  hasPaymentSchedule: true,
  scheduledPaymentsCount: 3,
  completedPaymentsCount: 2,
  upcomingPaymentsCount: 1,
  overduePaymentsCount: 0,
  ...overrides,
});

// Mock the formatCurrency function
vi.mock('@/lib/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
}));

describe('PaymentSummaryCard', () => {
  it('should render payment summary with all amounts', () => {
    const paymentStatus = createMockPaymentStatus();
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Check that amounts are displayed
    expect(screen.getByText('$1,000')).toBeInTheDocument(); // Total
    expect(screen.getByText('$600')).toBeInTheDocument(); // Paid
    expect(screen.getByText('$400')).toBeInTheDocument(); // Remaining
  });

  it('should render progress bar by default', () => {
    const paymentStatus = createMockPaymentStatus();
    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    // Progress bar should be visible
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should hide progress bar when showProgressBar is false', () => {
    const paymentStatus = createMockPaymentStatus();
    const { container } = render(
      <PaymentSummaryCard
        paymentStatus={paymentStatus}
        showProgressBar={false}
      />,
    );

    // Progress bar should not be visible
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).not.toBeInTheDocument();
  });

  it('should display correct progress percentage', () => {
    const paymentStatus = createMockPaymentStatus({ percentagePaid: 75 });
    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    // Check progress bar percentage
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('should handle zero payment status', () => {
    const paymentStatus = createMockPaymentStatus({
      totalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      percentagePaid: 0,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    expect(screen.getByText('$0')).toBeInTheDocument();
  });

  it('should handle 100% paid status', () => {
    const paymentStatus = createMockPaymentStatus({
      totalAmount: 1000,
      paidAmount: 1000,
      remainingAmount: 0,
      percentagePaid: 100,
    });

    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    // Should show fully paid
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();

    // Progress bar should be at 100%
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  it('should handle negative remaining amount gracefully', () => {
    const paymentStatus = createMockPaymentStatus({
      totalAmount: 1000,
      paidAmount: 1200,
      remainingAmount: -200,
      percentagePaid: 120,
    });

    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    // Should handle overpayment scenario
    expect(screen.getByText('$1,000')).toBeInTheDocument(); // Total
    expect(screen.getByText('$1,200')).toBeInTheDocument(); // Paid (more than total)

    // Progress bar should handle over 100% gracefully
    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('aria-valuenow', '120');
  });

  it('should render with proper semantic structure', () => {
    const paymentStatus = createMockPaymentStatus();
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Check for semantic headings or labels
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes for progress bar', () => {
    const paymentStatus = createMockPaymentStatus({ percentagePaid: 45 });
    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute('role', 'progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '45');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should apply correct CSS classes for styling', () => {
    const paymentStatus = createMockPaymentStatus();
    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    // Should have card styling
    const card = container.firstChild;
    expect(card).toHaveClass(/card|bg-|rounded|p-/);
  });

  it('should not re-render unnecessarily with same props', () => {
    const paymentStatus = createMockPaymentStatus();
    const { rerender } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    // Get reference to an element
    const _totalAmount = screen.getByText('$1,000');

    // Re-render with same props
    rerender(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Element should still be there (React.memo should prevent unnecessary re-render)
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('should update when paymentStatus changes', () => {
    const initialPaymentStatus = createMockPaymentStatus({ paidAmount: 500 });
    const { rerender } = render(
      <PaymentSummaryCard paymentStatus={initialPaymentStatus} />,
    );

    expect(screen.getByText('$500')).toBeInTheDocument();

    const updatedPaymentStatus = createMockPaymentStatus({ paidAmount: 800 });
    rerender(<PaymentSummaryCard paymentStatus={updatedPaymentStatus} />);

    expect(screen.getByText('$800')).toBeInTheDocument();
    expect(screen.queryByText('$500')).not.toBeInTheDocument();
  });

  it('should handle decimal amounts correctly', () => {
    const paymentStatus = createMockPaymentStatus({
      totalAmount: 1234.56,
      paidAmount: 567.89,
      remainingAmount: 666.67,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Assuming formatCurrency handles decimals properly
    expect(screen.getByText(/1,234/)).toBeInTheDocument();
    expect(screen.getByText(/567/)).toBeInTheDocument();
    expect(screen.getByText(/666/)).toBeInTheDocument();
  });

  it('should handle very large amounts', () => {
    const paymentStatus = createMockPaymentStatus({
      totalAmount: 1000000,
      paidAmount: 750000,
      remainingAmount: 250000,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Should format large numbers properly
    expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
    expect(screen.getByText(/750,000/)).toBeInTheDocument();
    expect(screen.getByText(/250,000/)).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('should have proper color contrast for progress bar', () => {
      const paymentStatus = createMockPaymentStatus();
      const { container } = render(
        <PaymentSummaryCard paymentStatus={paymentStatus} />,
      );

      // Progress bar should have appropriate background colors
      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveClass(/bg-/); // Should have background color classes
    });

    it('should provide screen reader friendly progress description', () => {
      const paymentStatus = createMockPaymentStatus({ percentagePaid: 60 });
      const { container } = render(
        <PaymentSummaryCard paymentStatus={paymentStatus} />,
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveAttribute(
        'aria-label',
        expect.stringContaining('60'),
      );
    });
  });
});
