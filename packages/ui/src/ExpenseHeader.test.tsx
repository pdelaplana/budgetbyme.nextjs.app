import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import ExpenseHeader from './ExpenseHeader';
import type { Event } from './types/Event';
import type { Expense } from './types/Expense';

// HeadlessUI's Menu observes its layout via ResizeObserver, which jsdom does
// not implement. Provide a no-op stub so the component can mount in tests.
beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {
        // no-op
      }
      unobserve() {
        // no-op
      }
      disconnect() {
        // no-op
      }
    },
  );
});

const mockExpense: Expense = {
  id: 'expense-1',
  name: 'Test Expense',
  description: 'Test expense',
  amount: 100,
  date: new Date('2024-01-01'),
  notes: '',
  category: {
    id: 'cat-1',
    name: 'Test Category',
    color: '#3B82F6',
    icon: 'ShoppingBag',
  },
  vendor: { name: '', address: '', website: '', email: '' },
  hasPaymentSchedule: false,
};

const mockEvent: Event = {
  name: 'Test Event',
};

describe('ExpenseHeader', () => {
  const defaultProps = {
    expense: mockExpense,
    currentEvent: mockEvent,
    eventId: 'event-1',
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render breadcrumbs correctly', () => {
    render(<ExpenseHeader {...defaultProps} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
    expect(screen.getAllByText(/Test Expense/).length).toBeGreaterThan(0);
  });

  it('should render expense title', () => {
    render(<ExpenseHeader {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Expense',
    );
  });

  it('should render edit and more actions buttons on desktop', () => {
    render(<ExpenseHeader {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /more actions/i }),
    ).toBeInTheDocument();
  });

  it('should render mobile menu button', () => {
    render(<ExpenseHeader {...defaultProps} />);

    const mobileButton = screen.getByRole('button', {
      name: /toggle actions menu/i,
    });
    expect(mobileButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<ExpenseHeader {...defaultProps} />);

    const editButton = screen.getByRole('button', { name: 'Edit' });
    await user.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete option is clicked from desktop dropdown', async () => {
    const user = userEvent.setup();
    render(<ExpenseHeader {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /more actions/i }));
    const deleteButton = screen.getByRole('menuitem', {
      name: /delete expense/i,
    });
    await user.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('should call onNavigate with the dashboard href when the event breadcrumb is clicked', async () => {
    const user = userEvent.setup();
    render(<ExpenseHeader {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Test Event/ }));

    expect(defaultProps.onNavigate).toHaveBeenCalledTimes(1);
    expect(defaultProps.onNavigate).toHaveBeenCalledWith(
      '/events/event-1/dashboard',
    );
  });

  it('should call onNavigate with the category href when the category breadcrumb is clicked', async () => {
    const user = userEvent.setup();
    render(<ExpenseHeader {...defaultProps} />);

    // Category label is truncated at 12 chars by truncateForBreadcrumb, so
    // "Test Category" renders as "Test...". Query via title attribute
    // (set to the truncated label) rather than an untruncated name match.
    const categoryButton = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('title')?.startsWith('Test...'));
    expect(categoryButton).toBeDefined();

    await user.click(categoryButton as HTMLElement);

    expect(defaultProps.onNavigate).toHaveBeenCalledWith(
      '/events/event-1/category/cat-1',
    );
  });

  it('should not call onNavigate on render without interaction', () => {
    render(<ExpenseHeader {...defaultProps} />);

    expect(defaultProps.onNavigate).not.toHaveBeenCalled();
  });

  it('should handle long expense names in breadcrumbs', () => {
    const longNameExpense = {
      ...mockExpense,
      name: 'This is a very long expense name that should be truncated in the breadcrumb navigation',
    };

    render(<ExpenseHeader {...defaultProps} expense={longNameExpense} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      longNameExpense.name,
    );

    const breadcrumbExpenseName = screen.getByText(longNameExpense.name);
    expect(breadcrumbExpenseName).toBeInTheDocument();
  });

  it('should render with proper ARIA labels and semantic structure', () => {
    render(<ExpenseHeader {...defaultProps} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /more actions/i }),
    ).toHaveAttribute('aria-label');
    expect(
      screen.getByRole('button', { name: /toggle actions menu/i }),
    ).toHaveAttribute('aria-label');
  });

  it('should update when expense changes', () => {
    const { rerender } = render(<ExpenseHeader {...defaultProps} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Expense',
    );

    const updatedExpense = { ...mockExpense, name: 'Updated Expense Name' };
    rerender(<ExpenseHeader {...defaultProps} expense={updatedExpense} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Updated Expense Name',
    );
  });

  it('should update when event changes', () => {
    const { rerender } = render(<ExpenseHeader {...defaultProps} />);

    expect(screen.getByText(/Test Event/)).toBeInTheDocument();

    const updatedEvent = { ...mockEvent, name: 'Updated Name' };
    rerender(<ExpenseHeader {...defaultProps} currentEvent={updatedEvent} />);

    expect(screen.getByText(/Updated Name/)).toBeInTheDocument();
  });
});
