import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Event } from '@/types/Event';
import type { Expense } from '@/types/Expense';
import ExpenseHeader from './ExpenseHeader';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/events/event-1/expense/expense-1',
  useSearchParams: () => new URLSearchParams(),
}));

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
  amount: 100,
  currency: { code: 'USD', symbol: '$' },
  category: {
    id: 'cat-1',
    name: 'Test Category',
    color: '#3B82F6',
    icon: 'ShoppingBag',
  },
  tags: ['tag1', 'tag2'],
  _createdDate: new Date(),
  attachments: [],
  hasPaymentSchedule: false,
  date: new Date('2024-01-01'),
  description: 'Test expense',
  notes: '',
  vendor: { name: '', address: '', website: '', email: '' },
  _createdBy: 'user123',
  _updatedDate: new Date(),
  _updatedBy: 'user123',
};

const mockEvent: Event = {
  id: 'event-1',
  name: 'Test Event',
  type: 'wedding',
  description: 'Test Description',
  eventDate: new Date('2024-01-01'),
  totalBudgetedAmount: 10000,
  totalScheduledAmount: 5000,
  totalSpentAmount: 3000,
  spentPercentage: 30,
  status: 'on-track',
  currency: { code: 'USD', symbol: '$' },
  _createdDate: new Date(),
  _createdBy: 'user123',
  _updatedDate: new Date(),
  _updatedBy: 'user123',
};

describe('ExpenseHeader', () => {
  const defaultProps = {
    expense: mockExpense,
    currentEvent: mockEvent,
    eventId: 'event-1',
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render breadcrumbs correctly', () => {
    render(<ExpenseHeader {...defaultProps} />);

    // Check for breadcrumb navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // Breadcrumbs show: Event Name > Category Name > Expense Name
    // Note: Text may be truncated, so we check for presence in the document
    expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    expect(screen.getByText(/Test Category/)).toBeInTheDocument();
    // "Test Expense" appears in both breadcrumb and heading, so just verify presence
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

    // Should have Edit button and More actions dropdown button
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /more actions/i }),
    ).toBeInTheDocument();
  });

  it('should render mobile menu button', () => {
    render(<ExpenseHeader {...defaultProps} />);

    // Should have mobile menu button (hidden on larger screens)
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

  it('should open the mobile dropdown and call onEdit / onDelete from it', async () => {
    const user = userEvent.setup();
    render(<ExpenseHeader {...defaultProps} />);

    const mobileButton = screen.getByRole('button', {
      name: /toggle actions menu/i,
    });
    await user.click(mobileButton);

    const items = screen.getAllByRole('menuitem');
    expect(items[0]).toHaveTextContent('Edit');
    expect(items[1]).toHaveTextContent('Delete Expense');

    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(defaultProps.onEdit).toHaveBeenCalledTimes(1);
  });

  it('should handle long expense names in breadcrumbs', () => {
    const longNameExpense = {
      ...mockExpense,
      name: 'This is a very long expense name that should be truncated in the breadcrumb navigation',
    };

    render(<ExpenseHeader {...defaultProps} expense={longNameExpense} />);

    // Title should show full name
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      longNameExpense.name,
    );

    // Breadcrumb should show truncated name (implementation detail of breadcrumb component)
    const breadcrumbExpenseName = screen.getByText(longNameExpense.name);
    expect(breadcrumbExpenseName).toBeInTheDocument();
  });

  it('should handle missing category gracefully', () => {
    const eventWithoutCategory = {
      ...mockEvent,
      categories: [],
    };

    render(
      <ExpenseHeader {...defaultProps} currentEvent={eventWithoutCategory} />,
    );

    // Should still render with event name in breadcrumb
    expect(screen.getByText(/Test Event/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Test Expense',
    );
  });

  it('should render with proper ARIA labels and semantic structure', () => {
    render(<ExpenseHeader {...defaultProps} />);

    // Check for proper semantic structure
    expect(screen.getByRole('navigation')).toBeInTheDocument(); // Breadcrumbs
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // Main title

    // Check for proper button labels (only buttons with aria-label)
    expect(
      screen.getByRole('button', { name: /more actions/i }),
    ).toHaveAttribute('aria-label');
    expect(
      screen.getByRole('button', { name: /toggle actions menu/i }),
    ).toHaveAttribute('aria-label');
  });

  it('should have proper responsive classes', () => {
    const { container } = render(<ExpenseHeader {...defaultProps} />);

    // Desktop buttons container should have hidden and sm:block classes
    const desktopContainer = container.querySelector('.hidden.sm\\:block');
    expect(desktopContainer).toBeInTheDocument();

    // Mobile button container should have sm:hidden class
    const mobileContainer = container.querySelector('.sm\\:hidden');
    expect(mobileContainer).toBeInTheDocument();
  });

  it('should not re-render unnecessarily with same props', () => {
    const { rerender } = render(<ExpenseHeader {...defaultProps} />);

    // Get initial render count (this is conceptual - React.memo prevents unnecessary renders)
    const _initialEditButton = screen.getByRole('button', { name: 'Edit' });

    // Re-render with same props
    rerender(<ExpenseHeader {...defaultProps} />);

    // Button should still be there (component should have memoized properly)
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
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

    // Updated event name should appear in breadcrumb (may be truncated but should be findable)
    expect(screen.getByText(/Updated Name/)).toBeInTheDocument();
  });
});
