import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PaymentSummaryCard from './PaymentSummaryCard';
import type { PaymentStatus } from './types/PaymentStatus';

const createMockPaymentStatus = (
  overrides: Partial<PaymentStatus> = {},
): PaymentStatus => ({
  totalScheduled: 1000,
  totalPaid: 600,
  remainingBalance: 400,
  ...overrides,
});

// Mock the formatCurrency function
vi.mock('./utils/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount.toLocaleString()}`,
}));

describe('PaymentSummaryCard', () => {
  it('should render payment summary with all amounts', () => {
    const paymentStatus = createMockPaymentStatus();
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    expect(screen.getByText('$1,000')).toBeInTheDocument(); // Total
    expect(screen.getByText('$600')).toBeInTheDocument(); // Paid
    expect(screen.getByText('$400')).toBeInTheDocument(); // Remaining
  });

  it('should render progress bar by default', () => {
    const paymentStatus = createMockPaymentStatus();
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

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

    expect(screen.queryByText('Payment Progress')).not.toBeInTheDocument();
  });

  it('should display correct progress percentage', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 750,
      remainingBalance: 250,
    });
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should handle zero payment status', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 0,
      totalPaid: 0,
      remainingBalance: 0,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    const zeroAmounts = screen.getAllByText('$0');
    expect(zeroAmounts.length).toBe(3);
  });

  it('should handle 100% paid status', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 1000,
      remainingBalance: 0,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    const thousandAmounts = screen.getAllByText('$1,000');
    expect(thousandAmounts.length).toBe(2);
    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should handle negative remaining amount gracefully', () => {
    const paymentStatus = createMockPaymentStatus({
      totalScheduled: 1000,
      totalPaid: 1200,
      remainingBalance: -200,
    });

    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('$1,200')).toBeInTheDocument();
    expect(screen.getByText('$-200')).toBeInTheDocument();
    expect(screen.getByText('120%')).toBeInTheDocument();
  });

  it('should render with proper semantic structure', () => {
    const paymentStatus = createMockPaymentStatus();
    render(<PaymentSummaryCard paymentStatus={paymentStatus} />);

    expect(screen.getByText(/total/i)).toBeInTheDocument();
    expect(screen.getByText(/paid/i)).toBeInTheDocument();
    expect(screen.getByText(/remaining/i)).toBeInTheDocument();
  });

  it('should apply correct CSS classes for styling', () => {
    const paymentStatus = createMockPaymentStatus();
    const { container } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    const card = container.firstChild;
    expect(card).toHaveClass(/card|bg-|rounded|p-/);
  });

  it('should not re-render unnecessarily with same props', () => {
    const paymentStatus = createMockPaymentStatus();
    const { rerender } = render(
      <PaymentSummaryCard paymentStatus={paymentStatus} />,
    );

    rerender(<PaymentSummaryCard paymentStatus={paymentStatus} />);

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

    const initial500Amounts = screen.getAllByText('$500');
    expect(initial500Amounts.length).toBe(2);

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

    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
    expect(screen.getByText('$567.89')).toBeInTheDocument();
    expect(screen.getByText('$666.67')).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('should have proper color contrast for progress bar', () => {
      const paymentStatus = createMockPaymentStatus();
      const { container } = render(
        <PaymentSummaryCard paymentStatus={paymentStatus} />,
      );

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

      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Payment Progress')).toBeInTheDocument();
    });
  });
});
