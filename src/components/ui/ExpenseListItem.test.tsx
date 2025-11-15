import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExpenseListItemProps } from './ExpenseListItem';
import ExpenseListItem from './ExpenseListItem';

// Mock the formatters
vi.mock('@/lib/formatters', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(0)}`,
  formatDate: (_date: string | Date) => 'Jan 15, 2025',
}));

// Mock the payment calculations
vi.mock('@/lib/paymentCalculations', () => ({
  calculatePaymentStatus: () => ({
    hasPayments: true,
    totalScheduled: 1000,
    totalPaid: 500,
    remainingBalance: 500,
    progressPercentage: 50,
    isFullyPaid: false,
    allPayments: [],
    nextDuePayment: { dueDate: '2025-01-15' },
    overduePayments: [],
    upcomingPayments: [],
  }),
  getPaymentStatusText: () => ({
    text: 'Next due: Jan 15, 2025',
    variant: 'warning' as const,
  }),
}));

describe('ExpenseListItem', () => {
  const mockExpense: ExpenseListItemProps['expense'] = {
    id: '1',
    name: 'Test Expense',
    description: 'A test expense',
    amount: 1000,
    currency: { code: 'USD', symbol: '$' },
    date: new Date('2025-01-15'),
    notes: '',
    tags: [],
    attachments: [],
    category: {
      id: 'cat-1',
      name: 'Test Category',
      color: '#3B82F6',
      icon: 'ShoppingBag',
    },
    vendor: { name: '', address: '', website: '', email: '' },
    hasPaymentSchedule: false,
    _createdDate: new Date(),
    _createdBy: 'user123',
    _updatedDate: new Date(),
    _updatedBy: 'user123',
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders expense information correctly', () => {
    render(<ExpenseListItem expense={mockExpense} onClick={mockOnClick} />);

    expect(screen.getByText('Test Expense')).toBeInTheDocument();
    expect(screen.getByText('A test expense')).toBeInTheDocument();
    expect(screen.getByText('$1000')).toBeInTheDocument();
    expect(screen.getByText('Jan 15, 2025')).toBeInTheDocument();
  });

  it('displays payment status information', () => {
    render(<ExpenseListItem expense={mockExpense} onClick={mockOnClick} />);

    expect(screen.getByText('Next due: Jan 15, 2025')).toBeInTheDocument();
    expect(screen.getByText('$500 remaining')).toBeInTheDocument();
    expect(screen.getByText('Payment Progress')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('$500 of $1000 paid')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<ExpenseListItem expense={mockExpense} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledWith(mockExpense);
  });

  it('calls onClick when Enter key is pressed', () => {
    render(<ExpenseListItem expense={mockExpense} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockOnClick).toHaveBeenCalledWith(mockExpense);
  });

  it('calls onClick when Space key is pressed', () => {
    render(<ExpenseListItem expense={mockExpense} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockOnClick).toHaveBeenCalledWith(mockExpense);
  });

  it('applies custom className', () => {
    const { container } = render(
      <ExpenseListItem
        expense={mockExpense}
        onClick={mockOnClick}
        className='custom-class'
      />,
    );

    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  it('handles missing description gracefully', () => {
    const expenseWithoutDescription = {
      ...mockExpense,
      description: undefined,
    };
    render(
      <ExpenseListItem
        expense={expenseWithoutDescription}
        onClick={mockOnClick}
      />,
    );

    expect(screen.getByText('Test Expense')).toBeInTheDocument();
  });
});
