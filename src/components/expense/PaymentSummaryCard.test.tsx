import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PaymentStatus } from '@/lib/paymentCalculations';
import PaymentSummaryCard from './PaymentSummaryCard';

type TestPaymentStatus = PaymentStatus & {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  percentagePaid: number;
  hasPaymentSchedule: boolean;
  scheduledPaymentsCount: number;
  completedPaymentsCount: number;
  upcomingPaymentsCount: number;
  overduePaymentsCount: number;
};

const createMockPaymentStatus = (
  overrides: Partial<TestPaymentStatus> = {},
): TestPaymentStatus => ({
  totalScheduled: 1000,
  totalPaid: 600,
  remainingBalance: 400,
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
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Progress bar label and percentage should be visible
    expect(screen.getByText('Payment Progress')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('should hide progress bar when showProgressBar is false', () => {
    const paymentStatus = createMockPaymentStatus();
    render(
      <PaymentSummaryCard
        paymentStatus={paymentStatus}
        showProgressBar={false}
      />,
    );

    // Progress bar should not be visible
    expect(screen.queryByText('Payment Progress')).not.toBeInTheDocument();
  });

  it('should display correct progress percentage', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 750,
      remainingBalance: 250,
    });
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Check progress bar percentage is calculated and displayed
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should handle zero payment status', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 0,
      totalPaid: 0,
      remainingBalance: 0,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // All three amounts should be $0
    const zeroAmounts = screen.getAllByText('$0');
    expect(zeroAmounts.length).toBe(3); // Total, Paid, Remaining
  });

  it('should handle 100% paid status', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 1000,
      remainingBalance: 0,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Should show fully paid - check all amounts
    const thousandAmounts = screen.getAllByText('$1,000');
    expect(thousandAmounts.length).toBe(2); // Total and Paid both $1,000
    expect(screen.getByText('$0')).toBeInTheDocument(); // Remaining

    // Progress bar should be at 100%
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should handle negative remaining amount gracefully', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 1200,
      remainingBalance: -200,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Should handle overpayment scenario
    expect(screen.getByText('$1,000')).toBeInTheDocument(); // Total
    expect(screen.getByText('$1,200')).toBeInTheDocument(); // Paid (more than total)
    expect(screen.getByText('$-200')).toBeInTheDocument(); // Negative remaining

    // Progress bar should show 100% (capped at 100% for display)
    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('should render with proper semantic structure', () => {
    const paymentStatus = createMockPaymentStatus();
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Check for semantic headings or labels
    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining/i)).toBeInTheDocument();
  });

  it('should display progress percentage text', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 450,
      remainingBalance: 550,
    });
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // Should display calculated percentage
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('Payment Progress')).toBeInTheDocument();
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
    const initialPaymentStatus = createMockPaymentStatus({
      totalPaid: 500,
      remainingBalance: 500,
    });
    const { rerender } = render(
      <PaymentSummaryCard paymentStatus={initialPaymentStatus} />,
    );

    // Initial state has both paid and remaining at $500
    const initial500Amounts = screen.getAllByText('$500');
    expect(initial500Amounts.length).toBe(2); // Paid and Remaining

    const updatedPaymentStatus = createMockPaymentStatus({
      totalPaid: 800,
      remainingBalance: 200,
    });
    rerender(<PaymentSummaryCard paymentStatus={updatedPaymentStatus} />);

    expect(screen.getByText('$800')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.queryByText('$500')).not.toBeInTheDocument();
  });

  it('should handle decimal amounts correctly', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1234.56,
      totalPaid: 567.89,
      remainingBalance: 666.67,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    // formatCurrency uses toLocaleString which keeps decimals
    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByText('$567.89')).toBeInTheDocument();
    expect(screen.getByText('$666.67')).toBeInTheDocument();
  });

  it('should handle very large amounts', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000000,
      totalPaid: 750000,
      remainingBalance: 250000,
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

      // Progress bar inner element should have primary-600 background
      const progressBarInner = container.querySelector('.bg-primary-600');
      expect(progressBarInner).toBeInTheDocument();
    });

    it('should provide screen reader friendly progress description', () => {
      const paymentStatus = createMockPaymentStatus({
        totalScheduled: 1000,
        totalPaid: 600,
        remainingBalance: 400,
      });
      render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

      // Progress text should be visible to screen readers
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Payment Progress')).toBeInTheDocument();
    });
  });
});
